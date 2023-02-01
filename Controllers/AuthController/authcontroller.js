const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const ResetEmailFormat = require("../Helper/ResetEmailTemp");

module.exports = {
  // user login controller
  userlogincontroller: (req, res) => {
    const { email1, password } = req.body;
    if (!email1 || !password) {
      return res
        .status(400)
        .send({ message: "Email and Password field is required" });
    }

    const check_email_query = `select id, name, email1, password, status, roleId from  users where email1 = "${email1}" `;
    mysqlconnection.query(check_email_query, function (err, result) {
      console.log(result, "result");
      if (result) {
        bcrypt
          .compare(password, result[0].password)
          .then((responce) => {
            if (responce) {
              const loginToken = jwt.sign(
                { email1: result[0].email1, id: result[0].id },
                process.env.JWT_SECRET_KEY
              );
              res.status(200).send({
                message: "User login successfully",
                loginToken: loginToken,
                data: {
                  id: result[0].id,
                  fname: result[0].name,
                  email: result[0].email1,
                  role_id: result[0].roleId,
                },
              });
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
    const { email1 } = req.body;
    if (!email1) {
      return res.status(400).send({ message: "Email field is required" });
    }
    const check_email = `select id, email1 from users where email1 = "${email1}"`;
    mysqlconnection.query(check_email, function (err, result) {
      if (result.length > 0) {
        //create reset password token
        const resetPasswordtoken = jwt.sign(
          { email1: result[0].email1, id: result[0].id },
          process.env.JWT_SECRET_KEY
        );
        nodemailer.createTestAccount((err, account) => {
          if (err) {
            return process.exit(1);
          }
          // Create a SMTP transporter object
          let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
              user: process.env.eathEmail,
              pass: process.env.eathPass,
            },
          });
          // Message object
          let message = {
            from: process.env.emailFrom,
            to: process.env.emailTo,
            subject: "Reset Password Link From QIS✔",
            text: `Hello,`,
            html: ResetEmailFormat(resetPasswordtoken),
          };
          transporter.sendMail(message, (err, info) => {
            if (err) {
              return process.exit(1);
            }
            res
              .status(200)
              .json({ msg: "Link send successfully for reset password" });
          });
        });
      } else {
        res.status(401).json({ message: "Email Not Registred" });
      }
    });
  },

  //reset password controller
  resetpasswordcontroller: async (req, res) => {
    const { token, password } = req.body;
    if (!password || !token) {
      return res
        .status(400)
        .send({ message: "Password and Token is  Required" });
    }
    const secure_pass = await bcrypt.hash(password, 12);
    try {
      decodedtoken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decodedtoken) {
        const email1 = decodedtoken.email1;
        const id = decodedtoken.id;
        var check_email = `select id, email1 from users where email1 = "${email1}"`;
        mysqlconnection.query(check_email, function (err, result) {
          if (result.length > 0) {
            const updtsql = `update users set password ="${secure_pass}" where email1 = "${result[0].email1}" and id = ${result[0].id}`;
            mysqlconnection.query(updtsql, function (err, result) {
              if (err) throw err;
              res.status(200).json({
                message: "Password updated successfully",
              });
            });
          } else {
            res.status(400).json({ message: "Link Experied" });
          }
        });
      }
    } catch (err) {
      return res.status(400).send({ message: "Link Experied" });
    }
  },
};
