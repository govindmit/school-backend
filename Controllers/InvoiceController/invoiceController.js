const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const moment = require("moment");
const nodemailer = require("nodemailer");
const InvoiceEmailFormat = require("../Helper/InvoiceEmailTemp");
const sendmail = require("sendmail")();
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
  CreateInvoice: async (req, res) => {
    const body = req.body;
    var customerId = req.body.customerId;
    var amount = req.body.amount;
    var itemId = req.body.itemId;
    var status = req.body.status;
    var createdDate = req.body.createdDate;
    var createdBy = req.body.createdBy;
    var invoiceDate = req.body.invoiceDate;
    var isDeleted = req.body.isDeleted;
    var deletedBy = req.body.deletedBy;
    var deletedDate = req.body.deletedDate;

    if (
      !customerId ||
      !amount ||
      !itemId ||
      !status ||
      !createdDate ||
      !invoiceDate
    ) {
      return res.status(400).send({ message: "All field is required" });
    }

    var sql = `INSERT INTO invoices (customerId,amount,itemId,status,createdDate,createdBy,invoiceDate) VALUES('${customerId}','${amount}','${itemId}','${status}','${createdDate}','${createdBy}','${invoiceDate}')`;

    const invoice = await query(sql);
    var sqls = `UPDATE invoices SET  invoiceId='INV000${invoice.insertId}' WHERE id = ${invoice.insertId}`;
    const updateInvoice = await query(sqls);
    let sqld = `SELECT users.name,items.name as itemname,items.description,invoices.amount,invoices.status,invoices.invoiceId,invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices INNER JOIN users ON invoices.customerId = users.id INNER JOIN items ON invoices.itemId = items.id WHERE invoices.id = ${invoice.insertId}`;
    const Getinvoice = await query(sqld);
    // const hh = await InvoiceEmailFormat(Getinvoice);

    // if (invoice) {
    // sendmail(
    //   {
    //     from: "jaydeepc721@gmail.com",
    //     to: "qatar.school@yopmail.com",
    //     subject: "test sendmail",
    //     html: hh,
    //   },
    //   function (err, reply) {
    //     // if (err) {
    //     //   res
    //     //     .status(400)
    //     //     .json({ message: "something went wrong to send mail" });
    //     // }
    //   }
    // );
    res
      .status(200)
      .json({ message: "Invoice created successfully", data: invoice });
    // } else {
    //   res.status(400).json({ message: "something went wrong" });
    // }
  },

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
    }
  },
  updateInvoice: async (req, res) => {
    let sqls = `SELECT invoices.amount,invoices.customerId,invoices.status,invoices.createdBy,invoices.id,invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices WHERE invoices.id = ${req.params.id}`;
    const invoice = await query(sqls);

    const { user_id, amount, itemId, createdDate, invoiceDate, createdBy } =
      req.body;

    if (invoice[0].status === "paid") {
      console.log("paidddddddd");
      res.status(401).json({ message: "Already Paid" });
    } else {
      console.log("Unpaidddddddd");

      let customerId = user_id ? user_id : invoice[0].customerId;
      let amounts = amount ? amount : invoice[0].amount;
      let createdDates = createdDate ? createdDate : invoice[0].createdDate;
      let invoiceDates = invoiceDate ? invoiceDate : invoice[0].invoiceDate;
      let itemIds = itemId ? itemId : invoice[0].itemId;
      let createdBys = createdBy ? createdBy : invoice[0].createdBy;
      let status = "paid";

      var sql = `UPDATE invoices SET customerId = '${customerId}', amount='${amounts}',itemId ='${itemIds}', createdDate='${createdDates}',invoiceDate='${invoiceDates}',createdBy='${createdBys}',status='${status}' WHERE id = ${req.params.id}`;
      const invoices = await query(sql);

      res.send(invoices);
    }
  },

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
    res.status(200).json({ message: "Deleted Successfully" });
  },

  SendInvoiceEmail: async (req, res) => {
    let sqld = `SELECT users.name,users.email1,items.description,items.name,invoices.amount,invoices.status,invoices.invoiceId, invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices INNER JOIN users ON invoices.customerId = users.id INNER JOIN items ON invoices.itemId = items.id WHERE invoices.id = ${req.params.id}`;
    const Getinvoice = await query(sqld);
    const hh = await InvoiceEmailFormat(Getinvoice);

    console.log(Getinvoice[0].email1, "getInvoiceee");
    return sendmail(
      {
        from: process.env.emailFrom,
        to: process.env.emailTo,
        subject: "test sendmail",
        html: hh,
      },
      function (err, reply) {
        if (!err) {
          res.status(200).json({ message: "send invoice email successfully" });
        }
      }
    );
  },
  getInvoiceByUserId: async (req, res) => {
    console.log(req.query.key, "queryyyy");
    let date = moment(new Date()).format("DD/MM/YYYY");
    console.log(date, "dateeeeeee");
    if (req.query.key == "close") {
      let sql = `SELECT invoices.amount,invoices.invoiceId,invoices.isDeleted,invoices.customerId,invoices.status,invoices.invoiceDate,invoices.id,invoices.itemId FROM invoices WHERE customerId =${req.params.id} AND status ='paid' AND isDeleted = 0 ORDER BY invoiceDate DESC LIMIT 2 `;

      const invoice = await query(sql);

      res.send(invoice);
    } else {
      let sql = `SELECT invoices.amount,invoices.invoiceId,invoices.status,invoices.customerId,invoices.invoiceDate,invoices.id,invoices.itemId FROM invoices WHERE customerId =${req.params.id} AND isDeleted = 0 AND status = 'pending' ORDER BY invoiceDate DESC LIMIT 2`;

      const invoice = await query(sql);
      res.send(invoice);
    }
  },
};
