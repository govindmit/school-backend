const bcrypt = require("bcryptjs");
const express = require("express");
const { CHAR_LEFT_ANGLE_BRACKET } = require("picomatch/lib/constants");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const nodemailer = require("nodemailer");

const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);

module.exports = {
  //add user controller
  addusercontroller: async (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const { firstName, lastName, email, contact, status, role_id } = req.body;
    if (!req.file) {
      return res.status(400).send({ message: "Image feild is required" });
    }
    // if (
    //   req.file.originalname.split(".").pop() !== "png" &&
    //   req.file.originalname.split(".").pop() !== "jpeg"
    // ) {
    //   return res
    //     .status(400)
    //     .send({ message: "Please upload png and jpeg image formats " });
    // }
    if (!firstName || !lastName || !email || !contact) {
      return res.status(400).send({ message: "All feild is required" });
    }

    const check_email_query = `select *from  users where email = "${email}" `;
    //console.log(check_email_query);
    var sql = `INSERT INTO users (firstName,lastName,image,email,contact,status,role_id)VALUES("${firstName}","${lastName}","${req.file.path}","${email}","${contact}",${status},${role_id})`;
    mysqlconnection.query(check_email_query, function (err, result) {
      if (result.length > 0) {
        res.status(409).send({ message: "Email allready registred" });
      } else {
        //console.log(sql);
        mysqlconnection.query(sql, function (err, result) {
          if (err) throw err;

          if (result) {
            nodemailer.createTestAccount((err, account) => {
              if (err) {
                console.error(
                  "Failed to create a testing account. " + err.message
                );
                return process.exit(1);
              }

              console.log("Credentials obtained, sending message...");

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
                  console.log("Error occurred. " + err.message);
                  return process.exit(1);
                }

                console.log("Message sent: %s", info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log(
                  "Preview URL: %s",
                  nodemailer.getTestMessageUrl(info)
                );
              });
            });
            res.status(200).json({
              Message: "We have send link to reset your password",
              User: result,
            });
          }
          //console.log(result);
          // res.status(201).json({ message: "data inserted", data: result });
        });
      }
    });
  },

  //get users controller
  getusercontroller: async (req, res) => {
    // const { offset, limit } = req.body;
    //console.log(offset, limit);
    var sql = `select users.id, users.firstname, users.lastname, users.email, users.contact, users.status, roles.name as "role" from users LEFT outer join roles on roles.id = users.role_id LEFT outer join students on students.user_id = users.id`;
    const rows = await query(sql);
    console.log(rows, "rowssssss");
    let g = [];
    for (let row of rows) {
      var stud = `select * from students where user_id = ${row.id}`;
      let rows = await query(stud);

      g.push({ count: rows?.length || 0, ...row });
    }
    // console.log(g);
    // if (err) throw err;
    //console.log(result);
    res.status(200).json({ message: "ok", data: g });
  },

  //get user details controller
  getuserdetailscontroller: (req, res) => {
    const id = req.params.id;
    var sql = `select users.id, users.firstname,students.firstName,students.lastName, users.lastname, users.email, users.contact, users.status, roles.name as "role" from users LEFT outer join roles on roles.id = users.role_id where users.id = ${id}`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log(result);
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //edit user controller
  editusercontroller: (req, res) => {
    const id = req.params.id;
    //console.log(id);
    //console.log(req.body);
    const { firstName, lastName, email, contact, status, role_id } = req.body;
    var sql = `select users.id, users.firstname, users.lastname, users.email, users.contact, users.role_id, roles.name as "role" from users inner join roles on roles.id = users.role_id where users.id = ${id}`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      //console.log(result);
      if (result.length > 0) {
        let new_firstname,
          new_lastname,
          new_email,
          new_contact,
          new_status,
          new_role_id;

        if (firstName !== "") {
          new_firstname = firstName;
        } else {
          new_firstname = result[0].firstname;
        }
        if (lastName !== "") {
          new_lastname = lastName;
        } else {
          new_lastname = result[0].lastname;
        }
        if (email !== "") {
          new_email = email;
        } else {
          new_email = result[0].email;
        }
        if (contact !== "") {
          new_contact = contact;
        } else {
          new_contact = result[0].contact;
        }
        const updt_query = `update users set firstname = "${new_firstname}", lastname = "${new_lastname}", email = "${new_email}", contact = "${new_contact}" where users.id = ${id}`;
        console.log(updt_query);
        mysqlconnection.query(updt_query, function (err, result) {
          //console.log(result);
          if (err) throw err;
          //console.log(result);
          res
            .status(200)
            .json({ message: "data updated successfully", data: result });
        });
      }
    });
  },

  //delete user controller
  deleteusercontroller: (req, res) => {
    const id = req.params.id;
    var sql = `delete from users where id = ${id}`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log(result);
      res
        .status(200)
        .json({ message: "data deleted successfully", responce: result });
    });
  },
};
