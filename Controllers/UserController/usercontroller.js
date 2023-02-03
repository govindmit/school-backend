const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const ResetEmailFormat = require("../Helper/ResetEmailTemp");
const mysqlconnection = require("../../DB/db.config.connection");

module.exports = {
  // Add user Controller
  addUserController: async (req, res) => {
    const {
      name,
      email1,
      email2,
      phone1,
      phone2,
      printUs,
      contactName,
      status,
      roleId,
      typeId,
      parentId,
      userRole,
      createdBy,
      updatedBy,
    } = req.body;

    //check email query
    const check_email_query = `select id, email1 from users where email1 = "${email1}"`;
    //insert query
    const insert_query = `INSERT INTO users (name,email1,email2,phone1,phone2,printUs,contactName,status,roleId,typeId,parentId,createdBy,updatedBy)VALUES("${name}", "${email1}",
    "${email2 ? email2 : ""}",${phone1}, ${phone2 ? phone2 : 0}, "${
      contactName ? contactName : ""
    }", "${printUs ? printUs : ""}", ${status}, ${roleId ? roleId : 2}, ${
      typeId ? typeId : 0
    }, ${parentId ? parentId : 0}, ${createdBy ? createdBy : 1}, ${
      updatedBy ? updatedBy : 1
    })`;

    mysqlconnection.query(check_email_query, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(400).send({ message: "Email1 already registered." });
      } else {
        if (parentId === 0 && userRole === "parent") {
          console.log("hii");
          mysqlconnection.query(insert_query, function (err, responce) {
            if (err) throw err;
            if (responce) {
              //create parent
              const insert_parnt = `INSERT INTO parents (userId)VALUES(${responce.insertId})`;
              mysqlconnection.query(insert_parnt, function (err, parntResult) {
                if (err) throw err;
                if (parntResult) {
                  const updtparnt = `update parents set parentId = "PARNT-000${parntResult.insertId}" where id =${parntResult.insertId}`;
                  mysqlconnection.query(updtparnt, function (err, result) {
                    if (err) throw err;
                    res.status(200).json({
                      msg1: "Parent Registration successfully.",
                    });
                  });
                }
              });
            }
          });
        }

        if ((parentId === 0 || parentId > 0) && userRole === "customer") {
          //create customer
          mysqlconnection.query(insert_query, function (err, responce) {
            if (err) throw err;
            if (responce) {
              //create customer
              const getCustuser = `select id from users where roleId = 2 and id = ${responce.insertId}`;
              mysqlconnection.query(getCustuser, function (err, result) {
                if (err) throw err;
                if (result.length > 0) {
                  const insert_cust = `INSERT INTO customers (userId)VALUES(${result[0].id})`;
                  mysqlconnection.query(
                    insert_cust,
                    function (err, custResult) {
                      if (err) throw err;
                      if (custResult) {
                        const updtCust = `update customers set customerId = "CUST-000${custResult.insertId}" where id =${custResult.insertId}`;
                        mysqlconnection.query(updtCust, function (err, result) {
                          if (err) throw err;
                          //create reset password token
                          const resetPasswordtoken = jwt.sign(
                            { email1: email1, id: responce.insertId },
                            process.env.JWT_SECRET_KEY
                          );

                          res.status(200).send({
                            message: "Customer Registration successfully.",
                          });

                          // nodemailer.createTestAccount((err, account) => {
                          //   if (err) {
                          //     return process.exit(1);
                          //   }
                          //   // Create a SMTP transporter object
                          //   let transporter = nodemailer.createTransport({
                          //     host: "smtp.ethereal.email",
                          //     port: 587,
                          //     secure: false,
                          //     auth: {
                          //       user: process.env.eathEmail,
                          //       pass: process.env.eathPass,
                          //     },
                          //   });
                          //   // Message object
                          //   let message = {
                          //     from: process.env.emailFrom,
                          //     to: process.env.emailTo,
                          //     subject: "Reset Password Link From QIS✔",
                          //     text: `Hello,`,
                          //     html: ResetEmailFormat(resetPasswordtoken),
                          //   };
                          //   transporter.sendMail(message, (err, info) => {
                          //     if (err) {
                          //       return process.exit(1);
                          //     }
                          //     res.status(201).json({
                          //       msg: "Link send successfully for reset password",
                          //       msg1: "Customer Registration successfully.",
                          //       data: responce,
                          //     });
                          //   });
                          // });
                        });
                      }
                    }
                  );
                }
              });
            }
          });
        }
      }
    });
  },

  //get users controller
  getUserController: async (req, res) => {
    const { status, customerType, contactName, number, sorting } = req.body;
    let bystatus = "";
    let bycontactName = "";
    let bynumber = "";
    let type = "";
    if (status === 1) {
      bystatus = ` and status = ${status}`;
    } else if (status === 0) {
      bystatus = ` and status = ${status}`;
    }

    if (contactName) {
      bycontactName = ` and contactName = "${contactName}"`;
    }
    if (number) {
      bynumber = ` and phone1 = ${number}`;
    }
    if (customerType) {
      type = ` and typeId = ${customerType}`;
    }

    var sqlquery = `select users.id, customers.customerId, parents.parentId, users.name, users.email1, users.email2, 
    users.phone1, users.phone2, types.name as "CustomerType", users.contactName,
    users.status, users.printUs, roles.name as "UserRole" from users 
    LEFT outer join roles on roles.id = users.roleId 
    LEFT outer join types on types.id = users.typeId 
    left outer join customers on customers.userId = users.id 
    left outer join parents on parents.userId = users.id 
    where 1=1 and roleId = 2 and users.isDeleted = 0 ${bystatus} ${bycontactName} ${bynumber} ${type}`;

    mysqlconnection.query(sqlquery, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get user details controller
  getUserDetailsController: (req, res) => {
    const id = req.params.id;
    var sql = `select users.id, users.name, users.email1, users.email2, users.phone1, users.phone2, users.typeId, users.contactName, users.printUs as printus, users.status, roles.name as "role" from users LEFT outer join roles on roles.id = users.roleId where users.id = ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  editUserController: async (req, res) => {
    const id = req.params.id;
    const {
      name,
      email1,
      email2,
      phone1,
      phone2,
      printUs,
      contactName,
      status,
      typeId,
      updatedBy,
    } = req.body;
    let sql = `select id, name, email1, email2, phone1, phone2, typeId, contactName, printUs, status from users where id=${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      const updt_query = `update users set name = "${
        name ? name : result[0].name
      }", email1 = "${email1 ? email1 : result[0].email1}", email2 = "${
        email2 ? email2 : result[0].email2
      }", phone1 = ${phone1 ? phone1 : result[0].phone1}, phone2 = ${
        phone2 ? phone2 : result[0].phone2
      }, contactName="${
        contactName ? contactName : result[0].contactName
      }",printUs = "${
        printUs ? printUs : result[0].printUs
      }", status= ${status} , typeId= ${
        typeId ? typeId : result[0].typeId
      }, updatedBy = ${
        updatedBy ? updatedBy : result[0].updatedBy
      } where id = ${id}`;
      mysqlconnection.query(updt_query, function (err, result) {
        if (err) throw err;
        res.status(200).json({ message: "data updated successfully" });
      });
    });
  },

  //delete user controller
  deleteUserController: (req, res) => {
    const id = req.params.id;
    var sql = `update users set isDeleted = 1 where id = ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      if (result.affectedRows === 1) {
        const qwery = `select id, invoiceId from invoices where customerId = ${id}`;
        mysqlconnection.query(qwery, function (err, result) {
          if (err) throw err;
          const deleteinvoice = `update invoives set isDeleted = 1 where customerId = ${id}`;
          mysqlconnection.query(deleteinvoice, function (err, result) {
            if (err) throw err;
            res
              .status(200)
              .json({ message: "Data deleted successfully", responce: result });
          });
        });
        res
          .status(200)
          .json({ message: "Data deleted successfully", responce: result });
      }
    });
  },
};
