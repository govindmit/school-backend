const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const web_url = "https://school.mangoitsol.com";

module.exports = {
  // user login controller
  userlogincontroller: (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Email and Password field is required" });
    }
    const check_email_query = `select *from  users where email = "${email}" `;
    mysqlconnection.query(check_email_query, function (err, result) {
      if (result.length > 0) {
        let verify_password = bcrypt
          .compare(password, result[0].password)
          .then((result) => {
            if (result === true) {
              res.status(200).send({ message: "User login successfully" });
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
    const { email, reset_password_page_url } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email field is required" });
    }
    var check_email = `select *from users where email = "${email}"`;
    mysqlconnection.query(check_email, function (err, result) {
      if (result.length > 0) {
        //create reset password token
        const resetPasswordtoken = jwt.sign(
          { email: result[0].email, id: result[0].id },
          process.env.JWT_SECRET_KEY
        );

        let transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: "nyah.casper33@ethereal.email",
            pass: "P6UMNmyEJjc2BFtDex",
          },
        });
        // Message object
        let message = {
          from: "sj2585097@gmail.com",
          to: "infoocean8454@gmail.com",
          subject: "Reset Password Link From Educorp✔",
          text: `Hello, ${result[0].firstName}`,
          html: `<body
                marginheight="0"
                topmargin="0"
                marginwidth="0"
                style="margin: 0px; background-color: #f2f3f8;"
                leftmargin="0"
              >
              <table
                cellspacing="0"
                border="0"
                cellpadding="0"
                width="100%"
                bgcolor="#f2f3f8"
              >
            <tr>
              <td>
                <table
                  style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;"
                  width="100%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td style="height:20px;">&nbsp;</td>
                  </tr>
                  <tr />
                  <td>
                    <table
                      width="95%"
                      border="0"
                      align="center"
                      cellpadding="0"
                      cellspacing="0"
                      style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"
                    >
                      <tr>
                        <td style="height:40px;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style="padding:0 35px;">
                          <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                            You have requested to reset your password
                          </h1>
                          <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                          <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                            We cannot simply send you your old password. A unique link
                            to reset your password has been generated for you. To reset
                            your password, click the following link and follow the
                            instructions.
                          </p>
                          <a
                            href=${web_url}/auth/resetPassword/${resetPasswordtoken}
                            style="background:#057035;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;"
                          >
                            Reset Password
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="height:40px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                  <tr>
                    <td style="height:20px;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="text-align:center;">
                      <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                        &copy; <strong>www.ourhotel.com</strong>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="height:80px;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        `,
        };
        transporter.sendMail(message, (err, info) => {
          if (err) {
            console.log("Error occurred. " + err.message);
            return process.exit(1);
          }
          res.status(200).send({ message: "Email send successfully" });
        });
      } else {
        res.status(401).json({ message: "Email Not Registred" });
      }
    });
  },

  //reset password controller
  resetpasswordcontroller: async (req, res) => {
    const id = req.params.id;
    const { token, password } = req.body;
    if (!password) {
      return res.status(400).send({ message: "Password Required" });
    }
    const decodetoken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const email = decodetoken.email;

    var check_email = `select *from users where email = "${email}"`;
    const secure_pass = await bcrypt.hash(password, 12);
    mysqlconnection.query(check_email, function (err, result) {
      if (result.length > 0) {
        const sql = `update users set password ="${secure_pass}" where id = ${result[0].id}`;
        mysqlconnection.query(sql, function (err, result) {
          if (err) throw err;
          res
            .status(200)
            .json({ message: "Password updated successfully", data: result });
        });
      }
    });
  },
};
