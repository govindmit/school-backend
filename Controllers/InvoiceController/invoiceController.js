const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const nodemailer = require("nodemailer");

const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
  CreateInvoice: async (req, res) => {
    const body = req.body;
    var customerId = req.body.customerId;
    var invoiceId = req.body.invoiceId;
    var amount = req.body.amount;
    var itemId = req.body.itemId;
    var status = req.body.status;
    var createdDate = req.body.createdDate;
    var createdBy = req.body.createdBy;
    var invoiceDate = req.body.invoiceDate;
    var isDeleted = req.body.isDeleted;
    var deletedBy = req.body.deletedBy;
    var deletedDate = req.body.deletedDate;

    var sql = `INSERT INTO invoices (customerId,invoiceId,amount,itemId,status,createdDate,createdBy,invoiceDate,isDeleted,deletedBy,deletedDate) VALUES('${customerId}','${invoiceId}','${amount}','${itemId}','${status}','${createdDate}','${createdBy}','${invoiceDate}','${isDeleted}','${deletedBy}','${deletedDate}')`;
    console.log(sql, "sql");

    const invoice = await query(sql);
    res
      .status(200)
      .json({ message: "Invoice created successfully", data: invoice });

    // mysqlconnection.query(sql, function (err, result) {
    //   if (err) throw err;
    //   res.status(200).json({
    //     Message: "invoice created successfully",
    //     result,
    //   });
    // });
  },

  // getInvoice: async (req, res) => {
  //   var invoiceData = [];
  //   var status = "";
  //   if (req.body.status == "paid") {
  //     status = `WHERE invoices.status = '${req.body.status}'`;
  //   } else if (req.body.status == "pending") {
  //     status = `WHERE invoices.status = '${req.body.status}'`;
  //   } else {
  //     var status = "";
  //   }

  //   if (!req.params.id) {
  //     let sql = `SELECT users.firstName,users.lastName,invoices.amount,invoices.status,invoices.student_id,invoices.id,invoices.item,invoices.invoice_pay_date_time,invoices.generate_date_time FROM invoices INNER JOIN users ON invoices.user_id  = users.id ${status}`;
  //     console.log(sql, "swwww");

  //     const invoice = await query(sql);
  //     for (let row of invoice) {
  //       let students = `SELECT * from students WHERE id = ${row.student_id}`;
  //       const studentRecords = await query(students);

  //       invoiceData.push({
  //         ...row,
  //         student: studentRecords ? studentRecords[0] : null,
  //       });
  //     }

  //     res.status(200).json({ data: invoiceData });
  //   } else {
  //     let sql = `SELECT users.firstName,users.lastName,invoices.amount,invoices.id,invoices.item,invoices.invoice_pay_date_time,invoices.generate_date_time FROM invoices INNER JOIN users ON invoices.user_id = users.id WHERE invoices.id = ${req.params.id}`;
  //     const invoice = await query(sql);

  //     for (let row of invoice) {
  //       let students = `SELECT * from students WHERE id = ${row.student_id}`;
  //       const studentRecords = await query(students);

  //       invoiceData.push({
  //         ...row,
  //         student: studentRecords ? studentRecords[0] : null,
  //       });
  //     }
  //     res.status(200).json({ data: invoiceData });
  //   }
  // },

  getInvoice: async (req, res) => {
    var invoiceData = [];
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var sprice = req.body.sprice;
    var eprice = req.body.eprice;

    var status = "";
    var date = "";
    var amount = "";
    if (req.body.status == "paid") {
      status = `WHERE invoices.status = '${req.body.status}'`;
    } else if (req.body.status == "pending") {
      status = `WHERE invoices.status = '${req.body.status}'`;
    } else {
      var status = "";
    }
    if (startDate && endDate) {
      date = `WHERE invoices.generate_date_time BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (startDate && endDate && req.body.status) {
      date = `AND invoices.generate_date_time BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (sprice && eprice && !startDate && !endDate && !req.body.status) {
      amount = `WHERE invoices.amount BETWEEN '${sprice}' AND '${eprice}'`;
    }
    if (sprice && eprice && startDate && endDate && req.body.status) {
      amount = `AND invoices.amount BETWEEN '${sprice}' AND '${eprice}'`;
    }
    if (sprice && eprice && startDate && endDate) {
      amount = `AND invoices.amount BETWEEN '${sprice}' AND '${eprice}'`;
    }
    if (sprice && eprice && req.body.status) {
      amount = `AND invoices.amount BETWEEN '${sprice}' AND '${eprice}'`;
    }

    if (!req.params.id) {
      let sql = `SELECT users.firstName,users.lastName,invoices.amount,invoices.status,invoices.student_id,invoices.id,invoices.item,invoices.invoice_pay_date_time,invoices.generate_date_time FROM invoices INNER JOIN users ON invoices.user_id = users.id ${status} ${date} ${amount}`;
      console.log(sql, "...................x");
      const invoice = await query(sql);
      for (let row of invoice) {
        let students = `SELECT * from students WHERE id = ${row.student_id}`;
        const studentRecords = await query(students);

        invoiceData.push({
          ...row,
          student: studentRecords ? studentRecords[0] : null,
        });
      }

      res.status(200).json({ data: invoiceData });
    } else {
      let sql = `SELECT users.firstName,users.lastName,invoices.amount,invoices.id,invoices.item,invoices.invoice_pay_date_time,invoices.generate_date_time FROM invoices INNER JOIN users ON invoices.user_id = users.id WHERE invoices.id = ${req.params.id}`;
      const invoice = await query(sql);

      for (let row of invoice) {
        let students = `SELECT * from students WHERE id = ${row.student_id}`;
        const studentRecords = await query(students);

        invoiceData.push({
          ...row,
          student: studentRecords ? studentRecords[0] : null,
        });
      }
      res.status(200).json({ data: invoiceData });
    }
  },
  updateInvoice: (req, res) => {
    const {
      user_id,
      student_id,
      amount,
      item,
      invoice_pay_date_time,
      generate_date_time,
    } = req.body;
    var sql = `UPDATE invoices SET user_id = '${user_id}', student_id ='${student_id}', amount='${amount}',item ='${item}', invoice_pay_date_time='${invoice_pay_date_time}',generate_date_time='${generate_date_time}' WHERE id = ${req.params.id}`;
    conn.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result);
    });
  },

  DeleteInvoice: (req, res) => {
    var sql = `DELETE FROM invoices WHERE id = ${req.params.id}`;
    conn.query(sql, function (err, result) {
      if (err) throw err;
      res.send(result);
    });
  },
};
