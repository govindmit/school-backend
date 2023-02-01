const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const ResetEmailFormat = require("../Helper/ResetEmailTemp");
const mysqlconnection = require("../../DB/db.config.connection");
const { createIntacctCustomer, deleteIntacctCustomer, updateIntacctCustomer } = require("../../SageIntacctAPIs/CustomerServices");

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
      createdBy,
      updatedBy,
    } = req.body;
    //check email query
    const check_email_query = `select id, email1 from users where email1 = "${email1}"`;
    //insert query
    const insert_query = `INSERT INTO users (name,email1,email2,phone1,phone2,printUs,contactName,status,roleId,typeId,parentId,createdBy,updatedBy)VALUES("${
      name ? name : ""
    }", "${email1}", "${email2 ? email2 : ""}",${phone1 ? phone1 : 0}, ${
      phone2 ? phone2 : 0
    }, "${contactName ? contactName : ""}", "${
      printUs ? printUs : ""
    }", ${status}, ${roleId ? roleId : 2}, ${typeId ? typeId : 0}, ${
      parentId ? parentId : 0
    }, ${createdBy ? createdBy : 1}, ${updatedBy ? updatedBy : 1})`;
    mysqlconnection.query(check_email_query, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(400).send({ message: "Email1 already registered." });
      } else {
        if (parentId > 0 || parentId === undefined) {
          //create customer
          mysqlconnection.query(insert_query, async function (err, responce) {
            if (err) throw err;
            if (responce) {

              //create customer in Instacct
              var active ;
              if(status === 1){
                active = true;
              }
              if(status === 0){
                active = false;
              }
             
              const data ={
                name,
                email1,
                email2,
                phoneNumber1:phone1,
                phoneNumber2:phone2,
                active : active,
                parentCustomerId: parentId || '10011',
              }
               const instacctCustomer = await createIntacctCustomer(data);
               const customerId = instacctCustomer._data[0]["CUSTOMERID"];
               const recordNo = parseInt(instacctCustomer.data[0]["RECORDNO"]);

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
                        // const updtCust = `update customers set customerId = "CUST-000${custResult.insertId}" where id =${custResult.insertId}`;
                        const updtCust = `update customers set customerId = "${customerId}" , record_no=${recordNo} where id =${custResult.insertId}`;
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
        } else {
          //create parent
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

    var sqlquery = `select users.id, customers.customerId, users.name, users.email1, users.email2, 
    users.phone1, users.phone2, types.name as "CustomerType", users.contactName,
    users.status, users.printUs, roles.name as "UserRole" from users 
    LEFT outer join roles on roles.id = users.roleId 
    LEFT outer join types on types.id = users.typeId 
    left outer join customers on customers.userId = users.id 
    where 1=1 and roleId = 2 ${bystatus} ${bycontactName} ${bynumber} ${type}`;

  
    mysqlconnection.query(sqlquery, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get user details controller
  getUserDetailsController: (req, res) => {
    const id = req.params.id;
    var sql = `select users.id, users.name, users.email1, users.email2, users.email2, users.phone1, users.phone2, users.contactName, users.printUs, users.status, roles.name as "role" from users LEFT outer join roles on roles.id = users.roleId where users.id = ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //edit user controller
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
      roleId,
      typeId,
      parentId,
      createdBy,
      updatedBy,
    } = req.body;
    let sql = `select id, name, email1, email2, phone1, phone2, contactName, printUs,status from users where id=${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      const updt_query = `update users set name = "${
        name ? name : result[0].name
      }", email1 = "${email1 ? email1 : result[0].email1}", email2 = "${
        email2 ? email2 : result[0].email2
      }",contactName="${
        contactName ? contactName : result[0].contactName
      }",printUs = "${
        printUs ? printUs : result[0].printUs
      }", status= ${status} where id = ${id}`;

      var sqlquery = `SELECT * FROM customers where userId = ${id}`;
      mysqlconnection.query(updt_query, function (err, result) {
        if (err) throw err;

        // update intacct customer
        mysqlconnection.query(sqlquery, function (err, result) {
          if (err) throw err;
          if(result){
                console.log("result =>",result[0].customerId);
                 const data ={
                  customerId:result[0].customerId,
                  customerName:name,
                  active:status === 1 ? true :false,
                  primaryEmailAddress:email1,
                  secondaryEmailAddress:email2,
                  primaryPhoneNo:phone1,
                  secondaryPhoneNo : phone2,
                  parentCustomerId: parentId || '10011'
                 }
           
                 updateIntacctCustomer(data);

            }
        });

        res.status(200).json({ message: "data updated successfully" });
      });
    });
  },

  //delete user controller
  deleteUserController: (req, res) => {
    const id = req.params.id;
    var sql = `delete from users where id = ${id}`;

    var sqlquery = `SELECT * FROM customers where userId = ${id}`;

 
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;

      // delete the Instacct customer
      mysqlconnection.query(sqlquery, function (err, result) {
        if (err) throw err;
        if(result){
              console.log("result =>",result[0].customerId);
              deleteIntacctCustomer({customerId:result[0].customerId})
          }
      });
      res
        .status(200)
        .json({ message: "Data deleted successfully", responce: result });
    });
  },
};
