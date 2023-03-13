const jwt = require("jsonwebtoken");
const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
  // Add credit notes Controller
  addCreditNotesController: async (req, res) => {
    const {
      userId,
      status,
      amount,
      activityId,
      salesOrderId,
      invoiceId,
      createdBy,
      message,
    } = req.body;
    //insert query
    const creditRequestsquery = `INSERT INTO creditRequests (userId,salesOrderId,invoiceId,status,amount,createdBy,activityId)VALUES(${userId},${
      salesOrderId === 0 ? 0 : salesOrderId
    },${
      invoiceId === 0 ? 0 : invoiceId
    },${status},${amount},${createdBy},"${activityId}")`;
    mysqlconnection.query(creditRequestsquery, function (err, result) {
      if (err) throw err;
      if (result) {
        const creditRequestMsgquery = `INSERT INTO creditRequestMsg (message,senderId,receiverId,creditReqId)VALUES("${message}",${userId},0,${result.insertId})`;
        mysqlconnection.query(creditRequestMsgquery, function (err, rest) {
          if (err) throw err;
          if (salesOrderId > 0) {
            const updetsales_order = `update sales_order set isRequested = 1 where sales_order.id =${salesOrderId}`;
            mysqlconnection.query(updetsales_order, function (err, result) {
              if (err) throw err;
              res.status(200).send({
                message: "credit request created successfully.",
              });
            });
          }
          if (invoiceId > 0) {
            const updetinvoices = `update invoices set isRequested = 1 where invoices.id =${invoiceId}`;
            mysqlconnection.query(updetinvoices, function (err, result) {
              if (err) throw err;
              res.status(200).send({
                message: "credit request created successfully.",
              });
            });
          }
        });
      }
    });
  },

  //get credits Notes controller
  getCreditNotesController: async (req, res) => {
    const { status, sorting, customerId, startdate, enddate } = req.body;
    let bystatus = "";
    if (status === "0" || status === "1" || status === "2" || status === "3") {
      bystatus = ` and creditRequests.status = ${status}`;
    } else {
      bystatus = "";
    }
    let bysorting = "";
    if (sorting === 0) {
      bysorting = ` ORDER BY createdAt ASC`;
    } else if (sorting === 1) {
      bysorting = ` ORDER BY createdAt DESC`;
    } else if (sorting === 2) {
      bysorting = ` ORDER BY amount ASC`;
    } else if (sorting === 3) {
      bysorting = ` ORDER BY amount DESC`;
    } else {
      bysorting = "";
    }
    let BycustomerId = "";
    if (customerId) {
      BycustomerId = ` and creditRequests.userId  = ${customerId}`;
    } else {
      BycustomerId = "";
    }

    var sqlquery = `select creditRequests.id, users.name as "customerName", users.email1, creditRequests.status, creditRequests.amount, creditRequests.salesOrderId,creditRequests.invoiceId,activites.name
    from creditRequests
    LEFT outer join users on users.id = creditRequests.userId
    LEFT outer join activites on activites.id = creditRequests.activityId
    where 1=1 ${bystatus} ${BycustomerId}`;
    mysqlconnection.query(sqlquery, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get credit notes details controller
  getCreditNotesDetailsController: async (req, res) => {
    const id = req.params.id;
    var sql = `select creditRequests.id as "creditReqId", users.name, users.email1, users.createdAt, users.id as "customerId", creditRequests.status,creditRequests.amount, creditRequests.invoiceId, creditRequests.salesOrderid, activites.name as "activityname" from creditRequests
    LEFT OUTER JOIN users on users.id = creditRequests.userId
    LEFT OUTER JOIN activites on activites.id = creditRequests.activityId
    where creditRequests.id = ${id}`;
    mysqlconnection.query(sql, async function (err, result) {
      if (err) throw err;
      const dtmsg = `select message from creditRequestMsg where creditReqId = ${id}`;
      const approvalamtauery = `select creditNotes.createdAt, creditNotes.amount from creditNotes where creditRequestId = ${id}`;
      const appramt = await query(approvalamtauery);
      mysqlconnection.query(dtmsg, function (err, results) {
        if (err) throw err;
        res
          .status(200)
          .json({ message: "ok", data: { result, results, appramt } });
      });
    });
  },

  //update/delete credit notes
  editCreditNotesController: async (req, res) => {
    const id = req.params.id;
    const {
      status,
      amount,
      message,
      updatedBy,
      customerId,
      amountMode,
      creditRequestId,
      salesOrderId,
      invoiceId,
      approvedBy,
    } = req.body;

    if (status < 4) {
      const updatecreditRequestswuery = `update creditRequests set status = ${status}, approvedBy = ${approvedBy} where id = ${id}`;
      mysqlconnection.query(updatecreditRequestswuery, function (err, result) {
        if (err) throw err;
        const creditRequestMsgquery = `INSERT INTO creditRequestMsg (message,senderId,receiverId,creditReqId)VALUES("${message}",0,${updatedBy},${id})`;
        mysqlconnection.query(creditRequestMsgquery, function (err, results) {
          if (err) throw err;
          res.status(200).json({ message: "request approved" });
        });
      });
    }
    if (status === 4) {
      const updatecreditRequestswuery = `update creditRequests set status = ${status}, is_complete = 1 where id = ${id}`;
      mysqlconnection.query(updatecreditRequestswuery, function (err, result) {
        if (err) throw err;
        const creditRequestMsgquery = `INSERT INTO creditRequestMsg (message,senderId,receiverId,creditReqId)VALUES("${message}",0,${updatedBy},${id})`;
        mysqlconnection.query(creditRequestMsgquery, function (err, result) {
          if (err) throw err;
          const sel_query = `insert into creditNotes (customerId,amount,amountMode,creditRequestId)values(${customerId},${amount},${amountMode},${creditRequestId})`;
          mysqlconnection.query(sel_query, function (err, resultt) {
            if (err) throw err;
            if (salesOrderId > 0) {
              const updetsales_order = `update sales_order set isRequested = 2 where sales_order.id =${salesOrderId}`;
              mysqlconnection.query(updetsales_order, function (err, result) {
                if (err) throw err;
                res
                  .status(200)
                  .json({ message: "credit ballance debited successfully" });
              });
            }
            if (invoiceId > 0) {
              const updetinvoices = `update invoices set isRequested = 2 where invoices.id =${invoiceId}`;
              mysqlconnection.query(updetinvoices, function (err, result) {
                if (err) throw err;
                res
                  .status(200)
                  .json({ message: "credit ballance debited successfully" });
              });
            }
          });
        });
      });
    }
  },

  //get credit ballance
  getCredirBallanceController: async (req, res) => {
    const id = req.params.id;
    const credit_ballance = `select sum(amount) as "creditAmount" from creditNotes where amountMode = 1 and  customerId = ${id}`;
    const debit_ballance = `select sum(amount) as "debitAmount" from creditNotes where amountMode = 0 and  customerId = ${id}`;
    // const getCreditRequestQuery = `select creditRequestId from creditNotes where customerId =${id}`;
    const getCreditRequestQuery = `(select * from creditNotes where amountMode = '1' and customerId = ${id}) order by id desc`;
    const creditamt = await query(credit_ballance);
    const debitamt = await query(debit_ballance);
    const getCreditRequestQueryResponse = await query(getCreditRequestQuery);
    console.log(
      "getCreditRequestQueryResponse =>",
      getCreditRequestQueryResponse
    );
    const creditAmount = creditamt[0].creditAmount;
    const debitAmount = debitamt[0].debitAmount;
    const creditBal = creditAmount - debitAmount;
    if (creditBal) {
      res.status(200).json({
        message: "ok",
        creditBal: creditBal,
        CreditRequestId: getCreditRequestQueryResponse[0].creditRequestId,
      });
    } else {
      res.status(200).json({ message: "ok", creditBal: 0 });
    }
  },

  //insert amount
  insertAmount: async (req, res) => {
    const { customerId, Amount, amountMode } = req.body;
    if (Amount > 0) {
      const query = `insert into creditNotes(customerId,amount,amountMode)values(${customerId},${Amount},${amountMode})`;
      mysqlconnection.query(query, function (err, results) {
        if (err) throw err;
        res.status(200).json({ message: "amount debited successfully" });
      });
    }
  },

  //get cedit req by user id
  getCredirBallanceByUserController: async (req, res) => {
    const query = `SELECT creditNotes.id, creditNotes.createdAt, creditNotes.amount, creditRequests.status FROM creditNotes
    left outer join creditRequests on creditRequests.id = creditNotes.creditRequestId where customerId = ${req.params.id}`;
    mysqlconnection.query(query, function (err, results) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: results });
    });
  },

  //get cedit req by user id
  getCreditReqByuserController: (req, res) => {
    const id = req.params.id;
    var sql = `select creditRequests.id, creditRequests.amount, creditRequests.status,creditRequests.salesOrderId, creditRequests.invoiceId, activites.name,
    items.name as "item_name" from creditRequests left outer join activites on activites.id = creditRequests.activityId
    left outer join items on items .id = creditRequests.activityId where userId = ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },
};
