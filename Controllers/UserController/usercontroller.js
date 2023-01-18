const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const ResetEmailFormat = require("../Helper/ResetEmailTemp");
const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);

module.exports = {
  // Add user Controller
  addusercontroller: async (req, res) => {
    const { firstName, lastName, email, contact, status, role_id } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !contact ||
      !status ||
      !role_id ||
      !req.file
    ) {
      return res.status(400).send({ message: "All field is required" });
    }
    if (
      req.file.originalname.split(".").pop() !== "png" &&
      req.file.originalname.split(".").pop() !== "jpeg" &&
      req.file.originalname.split(".").pop() !== "jpg"
    ) {
      return res
        .status(400)
        .send({ message: "Please upload png, jpg and jpeg image formats " });
    }
    const check_email_query = `select id,email from  users where email = "${email}" `;
    var sql = `INSERT INTO users (firstName,lastName,image,email,contact,status,role_id)VALUES("${firstName}","${lastName}","${req.file.path}","${email}","${contact}",${status},${role_id})`;
    mysqlconnection.query(check_email_query, function (err, result) {
      if (result.length > 0) {
        res.status(409).send({ message: "Email already registered." });
      } else {
        mysqlconnection.query(sql, function (err, responce) {
          if (err) throw err;
          if (responce) {
            //create reset password token
            const resetPasswordtoken = jwt.sign(
              { email: email, id: responce.insertId },
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
                res.status(200).json({
                  Message: {
                    msg1: "Registration successfully.",
                    msg2: "Link send successfully for reset password plese check your registerd email ",
                  },
                });
              });
            });
          }
        });
      }
    });
  },

  //get users controller
  getusercontroller: async (req, res) => {
    //console.log(req.body);
    const { status } = req.body;
    let search_sql = "";
    if (status === 1) {
      search_sql += `and status = ${status}`;
    } else if (status === 0) {
      search_sql += `and status = ${status}`;
    } else {
      search_sql = "";
    }
    var sql = `select users.id, users.firstname, users.lastname, users.email, users.contact, users.status, roles.name as "role" from users LEFT outer join roles on roles.id = users.role_id LEFT outer join students on students.user_id = users.id where 1=1 ${search_sql}`;
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
