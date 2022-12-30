const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const mysqlconnection = require("../../DB/db.config.connection");
app.use(cookieParser());

module.exports = {
  // user login controller
  userlogincontroller: (req, res) => {
    //console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "email and password feild is required" });
    }
    const check_email_query = `select *from  users where email = "${email}" `;
    mysqlconnection.query(check_email_query, function (err, result) {
      //console.log(result);
      if (result.length > 0) {
        let verify_password = bcrypt
          .compare(password, result[0].password)
          .then((result) => {
            //console.log(result, "result");
            if (result === true) {
              res.status(200).send({ message: "user login successfully" });
            } else {
              res.status(400).send({ message: "invalid credentials" });
            }
          })
          .catch((error) => {
            res.status(400).send({ message: "invalid credentials" });
          });
      } else {
        res.status(400).send({ message: "invalid credentials" });
      }
    });
  },

  //forgot password controller
  forgotpasswordcontroller: (req, res) => {
    //console.log(req.body);
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "email feild is required" });
    }

    return false;
    var sql = `select users.firstname, users.lastname, users.email, users.contact, roles.name as "role" from users inner join roles on roles.id = users.role_id`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log(result);
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //reset password controller
  resetpasswordcontroller: (req, res) => {
    const id = req.params.id;
    var sql = `select users.firstname, users.lastname, users.email, users.contact, roles.name as "role" from users inner join roles on roles.id = users.role_id where users.id = ${id}`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log(result);
      res.status(200).json({ message: "ok", data: result });
    });
  },
};
