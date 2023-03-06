const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const moment = require("moment");
const {
  createSalesInvoice,
  deleteSalesInvoice,
  updateSalesInvoice,
  getListOfSalesInovice,
} = require("../../SageIntacctAPIs/SalesInvoiceService");
const InvoiceEmailFormat = require("../Helper/templates/InvoiceEmailTemp");
const sendEmails = require("../Helper/sendEmails");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
  //create invoice
  CreateInvoice: async (req, res) => {
    const body = req.body;
    var customerId = req.body.customerId;
    var amount = req.body.amount;
    var itemId = req.body.itemId;
    var status = req.body.status;
    var createdDate = req.body.createdDate;
    var createdBy = req.body.createdBy;
    var invoiceDate = req.body.invoiceDate;
    var invoiceNo = req.body.invoiceNo;
    var note = req.body.note;
    var quantity = req.body.quantity || ["1"];

    let sqls = `SELECT invoiceId FROM invoices WHERE isDeleted = 0 and invoiceId = '${invoiceNo}'`;

    var invoiceNos = await query(sqls);
    if (!customerId) {
      return res.status(400).send({ message: "customer field is required" });
    } else if (!amount) {
      return res.status(400).send({ message: "amount field is required" });
    } else if (!itemId) {
      return res.status(400).send({ message: "item field is required" });
    } else if (!status) {
      return res.status(400).send({ message: "status field is required" });
    } else if (!invoiceDate) {
      return res.status(400).send({ message: "invoiceDate field is required" });
    } else if (!invoiceNo) {
      return res.status(400).send({ message: "invoiceNo field is required" });
    } else if (invoiceNos.length > 0) {
      return res
        .status(400)
        .send({ message: "please enter unique invoice no" });
    } else {
      var sql = `INSERT INTO invoices (customerId,amount,itemId,status,createdDate,createdBy,invoiceDate,invoiceId) VALUES('${customerId}','${amount}','${itemId}','${status}','${createdDate}','${createdBy}','${invoiceDate}','${invoiceNo}')`;
      const getCustomerIDQuery = `select customerId from customers where userId = "${customerId}"`;
      const customerIdResponse = await query(getCustomerIDQuery);
      const invoice = await query(sql);

      // sage intacct
      let objectDate = new Date();
      let invoiceCreateDate =
        objectDate.getMonth() +
        1 +
        "/" +
        objectDate.getDate() +
        "/" +
        objectDate.getFullYear();
      let items = [];
      let quantitys = [];
      for (var i = 0; i < itemId.length; i++) {
        const getitemId = `select itemId from items where id="${itemId[i]}"`;
        const intacctItem = await query(getitemId);
        items.push(intacctItem[0].itemId);
        quantitys.push("1");
      }
      const data = {
        createDate: invoiceCreateDate,
        customerId: customerIdResponse[0].customerId,
        itemId: items,
        quantity: quantitys,
      };
      console.log("data =>", data);
      const sageIntacctSalesInvoice = await createSalesInvoice(data);
      console.log("sageIntacctSalesInvoice", sageIntacctSalesInvoice);
      const invoiceId = sageIntacctSalesInvoice._key;
      const sageIntacctInvoiceID = invoiceId.split("-")[1];
      const updateSql = `UPDATE invoices SET  invoiceId = "${sageIntacctInvoiceID}" WHERE id="${invoice.insertId}"`;
      const updateInvoice = await query(updateSql);

      // var sqls = `UPDATE invoices SET  invoiceId='INV000${invoice.insertId}' WHERE id = ${invoice.insertId}`;
      // const updateInvoice = await query(sqls);
      let sqld = `SELECT users.name, users.email1, items.name as itemname,items.description,invoices.amount,invoices.status,invoices.invoiceId,invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices INNER JOIN users ON invoices.customerId = users.id INNER JOIN items ON invoices.itemId = items.id WHERE invoices.id = ${invoice.insertId}`;
      const Getinvoice = await query(sqld);

      const hh = await InvoiceEmailFormat(Getinvoice);
      if (invoice && status === "pending") {
        sendEmails(Getinvoice[0].email1, "Invoice Details Link From QIS✔", hh);
        res
          .status(200)
          .json({ message: "Invoice created successfully", data: invoice });
      } else if (invoice && status === "draft") {
        res
          .status(200)
          .json({ message: "Invoice created successfully", data: invoice });
      } else {
        res.status(400).json({ message: "something went wrong" });
      }
    }
  },

  //get invoice
  getInvoice: async (req, res) => {
    var invoiceData = [];
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var customer = "";
    var status = "";
    var date = "";
    var amount = "";
    var order = "DESC";
    var isdeleted = "";
    if (req.body.status == "paid") {
      status = `WHERE invoices.status = '${req.body.status}'`;
    } else if (req.body.status == "pending") {
      status = `WHERE invoices.status = '${req.body.status}'`;
    } else if (req.body.status == "draft") {
      status = `WHERE invoices.status = '${req.body.status}'`;
    } else {
      var status = "";
    }
    if (startDate && endDate) {
      date = `WHERE invoices.invoiceDate BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (startDate && endDate && req.body.status) {
      date = `AND invoices.invoiceDate BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (req.body.amount) {
      amount = `AND invoices.amount = ${req.body.amount}`;
    }
    if (req.body.customer) {
      customer = `AND invoices.customerId IN (${req.body.customer})`;
    }
    if (req.body.order) {
      order = `ORDER BY id ${req.body.order}`;
    } else {
      order = `ORDER BY id DESC`;
    }
    if (
      startDate ||
      endDate ||
      req.body.status ||
      req.body.amount ||
      req.body.customer ||
      req.body.order
    ) {
      isdeleted = `AND invoices.isDeleted = 0`;
    } else {
      isdeleted = `WHERE invoices.isDeleted = 0`;
    }
    if (!req.params.id) {
      let sql = `SELECT users.name,items.name as itemname,items.description,invoices.invoiceId,invoices.amount,invoices.customerId,invoices.status,invoices.id,invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices INNER JOIN users ON invoices.customerId = users.id INNER JOIN items ON invoices.itemId = items.id ${status} ${date} ${amount} ${customer} ${isdeleted} ${order}`;
      const invoice = await query(sql);
      // for (let row of invoice) {
      //   let students = `SELECT * from students WHERE id = ${row.student_id}`;
      //   const studentRecords = await query(students);

      //   invoiceData.push({
      //     ...row,
      //     student: studentRecords ? studentRecords[0] : null,
      //   });
      // }

      res.status(200).json({ data: invoice });
    } else {
      let invoices = `SELECT users.name,invoices.invoiceId,invoices.amount,invoices.customerId,invoices.status,invoices.id,invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices INNER JOIN users ON invoices.customerId = users.id INNER JOIN items ON invoices.itemId = items.id WHERE invoices.id = ${req.params.id}`;
      const invoicess = await query(invoices);
      await getListOfSalesInovice();
      // for (let row of invoicess) {

      // const studentRecords = await query(students);

      res.status(200).json({ data: invoicess });
    }
  },

  //update invoice
  updateInvoice: async (req, res) => {
    let sqls = `SELECT invoices.amount,invoices.customerId,invoices.status,invoices.createdBy,invoices.id,invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices WHERE invoices.id = ${req.params.id}`;
    const invoice = await query(sqls);
    // const { note } = req.body;
    const { user_id, amount, itemId, createdDate, invoiceDate, createdBy } =
      req.body;
    var note = "";
    if (req.body.note) {
      note = `,note='${req.body.note}'`;
    }
    if (invoice[0].status === "paid") {
      res.status(401).json({ message: "Already Paid" });
    } else {
      let customerId = user_id ? user_id : invoice[0].customerId;
      let amounts = amount ? amount : invoice[0].amount;
      let createdDates = createdDate ? createdDate : invoice[0].createdDate;
      let invoiceDates = invoiceDate ? invoiceDate : invoice[0].invoiceDate;
      let itemIds = itemId ? itemId : invoice[0].itemId;
      let createdBys = createdBy ? createdBy : invoice[0].createdBy;
      let status = "paid";
      var sql = `UPDATE invoices SET customerId = '${customerId}', amount='${amounts}',itemId ='${itemIds}', createdDate='${createdDates}',invoiceDate='${invoiceDates}',createdBy='${createdBys}',status='${status}'${note} WHERE id = ${req.params.id}`;
      const invoices = await query(sql);

      res.send(invoices);
    }
  },

  //edit invoice
  editInvoice: async (req, res) => {
    let sqls = `SELECT invoices.amount,invoices.customerId,invoices.status,invoices.createdBy,invoices.id,invoices.createdDate,invoices.invoiceDate,invoices.itemId ,invoiceId FROM invoices WHERE isDeleted = 0 and invoices.id = ${req.params.id}`;
    const invoice = await query(sqls);
    console.log("invoice", invoice);
    if (invoice.length === 0) {
      res.status(201).send({ message: "invoice not found !" });
      return;
    }
    // const { note } = req.body;
    const {
      customerId,
      amount,
      itemId,
      createdDate,
      invoiceNo,
      invoiceDate,
      createdBy,
      updatedAt,
      updatedBy,
      status,
    } = req.body;

    let customerIds = customerId;
    let amounts = amount ? amount : invoice[0]?.amount;
    let createdDates = createdDate ? createdDate : invoice[0]?.createdDate;
    let invoiceDates = invoiceDate ? invoiceDate : invoice[0]?.invoiceDate;
    let itemIds = itemId ? itemId : invoice[0]?.itemId;
    let createdBys = createdBy ? createdBy : invoice[0]?.createdBy;
    let updatedAts = updatedAt;
    let updatedBys = updatedBy;
    let invoiceNos = invoiceNo ? invoiceNo : invoice[0].invoiceId;
    let statuss = status;
    let quantity = req.body.quantity;
    var sql = `UPDATE invoices SET customerId = '${customerIds}',invoiceId = '${invoiceNos}', amount='${amounts}',itemId ='${itemIds}', createdDate='${createdDates}',invoiceDate='${invoiceDates}',createdBy='${createdBys}',updatedAt='${updatedAts}',updatedBy='${updatedBys}',status='${statuss}' WHERE id = ${req.params.id}`;
    const invoices = await query(sql);
    const getCustomerIDQuery = `select customerId from customers where userId = "${customerId}"`;
    const customerIdResponse = await query(getCustomerIDQuery);
    console.log(
      "customerIdResponse[0].customerId =>",
      customerIdResponse[0].customerId
    );

    var InvoiceSql = `SELECT invoiceId FROM invoices where id=${req.params.id};`;
    const sageIntacctInvoiveId = await query(InvoiceSql);
    console.log("sageIntacctInvoiveId =>", sageIntacctInvoiveId);
    const invoiceID = sageIntacctInvoiveId[0]["invoiceId"];

    const data = {
      invoiceID: invoiceID,
      dueDate: req.body.dueDate ? req.body.dueDate : "02/24/2027",
      customerId: customerIdResponse[0].customerId,
      state: status === "paid" ? "Closed" : "pending",
      itemId: itemId,
      quantity: quantity,
    };
    const sageIntacctInvoice = await updateSalesInvoice(data);
    res.send(invoices);
  },

  //get invoice number
  getInvoiceNo: async (req, res) => {
    let sql = `SELECT id FROM invoices ORDER BY id DESC`;
    const invoices = await query(sql);
    let invoiceNo = `INV000${invoices[0]?.id + 1}`;
    res.status(201).json({ invoiceNo: invoiceNo });
  },

  //delete invoice
  DeleteInvoice: async (req, res) => {
    const { userId } = req.body;
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${day}/${month}/${year}`;
    if (!userId) {
      return res.status(400).send({ message: "userId is required" });
    }
    var sqls = `UPDATE invoices SET isDeleted='1',deletedBy='${userId}',deletedDate='${currentDate}' WHERE id = ${req.params.id}`;
    const updateInvoice = await query(sqls);

    var InvoiceSql = `SELECT invoiceId FROM invoices where id=${req.params.id};`;
    const sageIntacctInvoiveId = await query(InvoiceSql);
    const invoiceID = sageIntacctInvoiveId[0]["invoiceId"];
    const deletedInvoice = await deleteSalesInvoice(invoiceID);
    res.status(200).json({ message: "Deleted Successfully" });
  },

  //send invoice email
  SendInvoiceEmail: async (req, res) => {
    let sqld = `SELECT users.name,users.email1,items.description,items.name,invoices.amount,invoices.status,invoices.invoiceId, invoices.itemId , invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices INNER JOIN users ON invoices.customerId = users.id INNER JOIN items ON invoices.itemId = items.id WHERE invoices.id = ${req.params.id}`;
    const Getinvoice = await query(sqld);
    const hh = await InvoiceEmailFormat(Getinvoice);
    sendEmails(Getinvoice[0].email1, "Invoice Details From QIS✔", hh);
    res.status(200).json({ message: "send invoice email successfully" });
  },

  //get invoice by user id
  getInvoiceByUserId: async (req, res) => {
    let date = moment(new Date()).format("DD/MM/YYYY");
    if (req.query.key == "close") {
      let sql = `SELECT invoices.id as invid, invoices.amount,invoices.invoiceId,invoices.isDeleted,invoices.customerId, invoices.itemId, invoices.status, invoices.createdDate,invoices.invoiceDate,invoices.id,invoices.itemId FROM invoices WHERE customerId =${req.params.id} AND status ='paid' AND isDeleted = 0 ORDER BY invoiceDate DESC`;
      const invoice = await query(sql);
      res.send(invoice);
    } else {
      let sql = `SELECT invoices.id as invid, invoices.amount,invoices.invoiceId,invoices.status,invoices.customerId, invoices.itemId,invoices.createdDate, invoices.invoiceDate,invoices.id,invoices.itemId FROM invoices WHERE customerId =${req.params.id} AND isDeleted = 0 AND status = 'pending' ORDER BY invoiceDate DESC`;
      const invoice = await query(sql);
      res.send(invoice);
    }
  },

  //get invoice by user id
  getInvoiceByUser: async (req, res) => {
    const { status, startDate, endDate, order, amount, invoiceId } = req.body;

    let bystatus = "";
    if (status === "paid") {
      bystatus = ` and status = "${status}"`;
    } else if (status === "pending") {
      bystatus = ` and status = "${status}"`;
    } else {
      bystatus = "";
    }
    let bysorting = "";
    if (order) {
      bysorting = `ORDER BY invoiceDate ${order}`;
    } else {
      bysorting = `ORDER BY invoiceDate  DESC`;
    }
    let byamount = "";
    if (amount) {
      byamount = `AND invoices.amount = ${amount}`;
    } else {
      byamount = "";
    }
    let byinvoiceid = "";
    if (invoiceId) {
      byinvoiceid = `AND invoices.invoiceId = "${invoiceId}"`;
    } else {
      byinvoiceid = "";
    }
    let bydate = "";
    if (startDate && endDate) {
      bydate = ` and  invoiceDate  BETWEEN "${startDate}" AND "${endDate}"`;
    } else {
      bydate = "";
    }

    let sql = `SELECT invoices.id as invid, invoices.amount,invoices.invoiceId,invoices.status,invoices.customerId, invoices.itemId,invoices.createdDate, invoices.invoiceDate,invoices.id,invoices.itemId FROM invoices WHERE customerId =${req.params.id} AND isDeleted = 0 and invoices.status !='draft' ${bystatus} ${byamount} ${byinvoiceid} ${bydate} ${bysorting} `;
    const invoice = await query(sql);
    res.send(invoice);
  },
};
