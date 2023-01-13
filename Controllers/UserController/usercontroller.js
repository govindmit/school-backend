const bcrypt = require("bcryptjs");
const express = require("express");
const { CHAR_LEFT_ANGLE_BRACKET } = require("picomatch/lib/constants");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const nodemailer = require("nodemailer");

const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);

module.exports = {
  addusercontroller: async (req, res) => {
    const { firstName, lastName, email, contact, status, role_id } = req.body;

    console.log(req.body, "bodyyyyyyy");
    if (!req.file) {
      return res.status(400).send({ message: "Image field is required" });
    }

    if (!firstName || !lastName || !email || !contact || !status || !role_id) {
      return res.status(400).send({ message: "All field is required" });
    }

    const check_email_query = `select *from  users where email = "${email}" `;
    var sql = `INSERT INTO users (firstName,lastName,image,email,contact,status,role_id)VALUES("${firstName}","${lastName}","${req.file.path}","${email}","${contact}",${status},${role_id})`;
    mysqlconnection.query(check_email_query, function (err, result) {
      if (result.length > 0) {
        res.status(409).send({ message: "Email already registered." });
      } else {
        mysqlconnection.query(sql, function (err, result) {
          if (err) throw err;

          if (result) {
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
                  user: "nyah.casper33@ethereal.email",
                  pass: "P6UMNmyEJjc2BFtDex",
                },
              });

              // Message object
              let message = {
                from: "sj2585097@gmail.com",
                to: "infoocean8454@gmail.com",
                subject: "Reset Password Link From Educorp✔",
                text: `Hello,`,
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
                                   href=https://school.mangoitsol.com/auth/resetpassword/${result.insertId}
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
                  return process.exit(1);
                }
              });
            });
            res.status(200).json({
              Message: "We have send link to reset your password.",
              User: result,
            });
          }
        });
      }
    });
  },

  //get users controller
  getusercontroller: async (req, res) => {
    var sql = `select users.id, users.firstname, users.lastname, users.email, users.contact, users.status, roles.name as "role" from users LEFT outer join roles on roles.id = users.role_id LEFT outer join students on students.user_id = users.id`;
    const rows = await query(sql);
    let g = [];
    for (let row of rows) {
      var stud = `select * from students where user_id = ${row.id}`;
      let rows = await query(stud);

      g.push({ count: rows?.length || 0, ...row });
    }

    res.status(200).json({ message: "ok", data: g });
  },

  //get user details controller
  getuserdetailscontroller: (req, res) => {
    const id = req.params.id;
    var sql = `select users.id, users.firstname,users.image, users.lastname, users.email, users.contact, users.status, roles.name as "role" from users LEFT outer join roles on roles.id = users.role_id where users.id = ${id}`;
    console.log(sql, "iddddddd");
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //edit user controller
  editusercontroller: async (req, res) => {
    const id = req.params.id;
    const { firstName, lastName, email, contact, status, role_id } = req.body;

    let sql = `select * from users where id=${id}`;

    let User = await query(sql);

    var image = req.file?.path;
    if (!req.file) {
      image = User[0]?.image;
    }
    const updt_query = `update users set firstName = "${firstName}", lastName = "${lastName}", email = "${email}", contact = "${contact}",image="${image}" where users.id = ${id}`;
    let updateUser = await query(updt_query);

    res
      .status(200)
      .json({ message: "data updated successfully", data: updateUser });
  },

  //delete user controller
  deleteusercontroller: (req, res) => {
    const id = req.params.id;
    var sql = `delete from users where id = ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res
        .status(200)
        .json({ message: "data deleted successfully", responce: result });
    });
  },
};
