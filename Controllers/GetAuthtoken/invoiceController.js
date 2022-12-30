const conn = require("../database/conn");
const multer = require("multer");
const cron = require("node-cron");
const moment = require("moment");
module.exports = {
  CreateInvoice: (req, res) => {
    const body = req.body;
    var uId = req.body.user_id;
    var student_id = req.body.student_id;
    var amount = req.body.amount;
    var item = req.body.item;
    var invoicePayDateTime = req.body.invoice_pay_date_time;
    var generateDateTime = req.body.generate_date_time;

    var sql = `INSERT INTO invoices (user_id,student_id,amount,item,invoice_pay_date_time,generate_date_time) VALUES('${uId}','${student_id}','${amount}','${item}','${invoicePayDateTime}','${generateDateTime}')`;
    console.log(sql, "sql");
    conn.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({
        Message: "invoice create sucessful",
        result,
      });
    });
  },

  
  
getInvoice: (req, res) => {
  if(req.params.id){
  
      let sql = `SELECT users.email,users.first_name,users.last_name,invoices.amount,invoices.id,invoices.item,invoices.invoice_pay_date_time,invoices.generate_date_time FROM invoices INNER JOIN users ON invoices.user_id = users.id WHERE invoices.id = ${req.params.id}`;
      // let sql =
      //   "SELECT first_name,last_name,description,email,contact FROM users";
      conn.query(sql, function (err, result) {
        if (err) {
          throw err;
        }
        res.send(result);
      });
  
  }else{
  
  
     let sql = `SELECT users.email,users.first_name,users.last_name,invoices.amount,invoices.id,invoices.item,invoices.invoice_pay_date_time,invoices.generate_date_time FROM invoices INNER JOIN users ON invoices.user_id  = users.id`;
      // let sql =
      //   "SELECT first_name,last_name,description,email,contact FROM users";
      conn.query(sql, function (err, result) {
        if (err) {
          throw err;
        }
        res.send(result);
      });
  }
   
    },
    
    updateInvoice: (req, res) => {
      const { user_id, student_id, amount, item, invoice_pay_date_time, generate_date_time } = req.body;
      var sql = `UPDATE invoices SET user_id = '${user_id}', student_id ='${student_id}', amount='${amount}',item ='${item}', invoice_pay_date_time='${invoice_pay_date_time}',generate_date_time='${generate_date_time}' WHERE id = ${req.params.id}`;
            conn.query(sql, function (err, result) {
              if (err) throw err;
              res.send(result);
            });
    
    },
    // updateInvoice: (req, res) => {
    //   const { user_id, student_id, amount, item, invoice_pay_date_time, generate_date_time } = req.body;

    //   let sqls = `SELECT * FROM invoices WHERE id = '${req.params.id}'`;
  
    //   conn.query(sqls, function (err, result) {
    //     if (!err) {
    //       const userObj = result[0];
    //       user_id = user_id ? user_id : userObj.user_id;
    //       student_id = student_id ? student_id : userObj.student_id;
    //       amount = amount ? amount : userObj.amount;
    //       item = item ? item : userObj.item;
    //       invoice_pay_date_time = invoice_pay_date_time ? invoice_pay_date_time : userObj.invoice_pay_date_time;
    //       generate_date_time = generate_date_time ? generate_date_time : userObj.generate_date_time;
  
    //       var sql = `UPDATE invoices SET user_id = '${user_id}', student_id ='${student_id}', amount='${amount}',item ='${item}', invoice_pay_date_time='${invoice_pay_date_time}',generate_date_time='${generate_date_time}' WHERE id = ${req.params.id}`;
    //       conn.query(sql, function (err, result) {
    //         if (err) throw err;
    //         res.send(result);
    //       });
    //     } else {
    //       throw err;
    //     }
    //   });
    // },
     DeleteInvoice: (req, res) => {
        var sql = `DELETE FROM invoices WHERE id = ${req.params.id}`;
        conn.query(sql, function (err, result) {
          if (err) throw err;
          res.send(result);
        });
      },
 
};
