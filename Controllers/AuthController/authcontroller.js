const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const web_url = "https://school.mangoitsol.com/auth/resetpassword/";
const sendGridMail = require("@sendgrid/mail");
sendGridMail.setApiKey(
  "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"
);

module.exports = {
  // user login controller
  userlogincontroller: (req, res) => {
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
          .then((responce) => {
            if (responce) {
              const loginToken = jwt.sign(
                { email: result[0].email, id: result[0].id },
                process.env.JWT_SECRET_KEY
              );
              const update_query = `update users set loginToken = "${loginToken}" where email = "${email}"`;
              mysqlconnection.query(update_query, function (err, result) {
                if (err) throw err;
              });
              res.cookie("QIS_Login_Token", loginToken, {
                httpOnly: true,
              });
              res.status(200).send({
                message: "User login successfully",
                loginToken: loginToken,
                data: { role_id: result[0].role_id },
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
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({ message: "Email field is required" });
    }
    const check_email = `select *from users where email = "${email}"`;
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
            user: "providenci.mills@ethereal.email",
            pass: "wcVyJD51NbZQCTe5Wp",
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
                            href=${web_url}${resetPasswordtoken}
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

      let transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: "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",
        },
      });
      transporter.sendMail(
        {
          from: "sj9040797@gmail.com", // verified sender email
          to: "providenci.mills@ethereal.email", // recipient email
          subject: "Test message subject", // Subject line
          text: "Hello world!", // plain text body
          html: "<b>Hello world!</b>", // html body
        },
        function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        }
      );
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
        const email = decodedtoken.email;
        const id = decodedtoken.id;
        var check_email = `select *from users where email = "${email}"`;
        mysqlconnection.query(check_email, function (err, result) {
          if (result.length > 0) {
            const updtsql = `update users set password ="${secure_pass}" where email = "${result[0].email}"`;
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
