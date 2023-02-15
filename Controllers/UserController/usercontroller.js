const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const ResetEmailFormat = require("../Helper/ResetEmailTemp");
const mysqlconnection = require("../../DB/db.config.connection");
const sendmail = require("sendmail")();
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
      previlegs,
      agegroup,
      generatedId,
      updatedBy,
    } = req.body;
    const user_permition = req.body.previlegs;
    const per = JSON.stringify({ user_permition });
    //check email query
    const check_email_query = `select id, email1 from users where email1 = "${email1}"`;
    //insert query
    const insert_query = `INSERT INTO users (name,email1,email2,phone1,phone2,printUs,contactName,status,agegroup,generatedId,roleId,typeId,parentId,createdBy,updatedBy)VALUES("${name}", "${email1}",
    "${email2 ? email2 : ""}",${phone1}, ${phone2 ? phone2 : 0}, "${
      contactName ? contactName : ""
    }", "${printUs ? printUs : ""}", ${status}, ${agegroup ? agegroup : 0}, "${
      generatedId ? generatedId : ""
    }", ${roleId ? roleId : 2}, ${typeId ? typeId : 0}, ${
      parentId ? parentId : 0
    }, ${createdBy ? createdBy : 1}, ${updatedBy ? updatedBy : 1})`;

    mysqlconnection.query(check_email_query, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(400).send({ message: "Email1 already registered." });
      } else {
        if (userRole === "user") {
          mysqlconnection.query(insert_query, function (err, responce) {
            if (err) throw err;
            if (responce) {
              const resetPasswordtoken = jwt.sign(
                { email1: email1, id: responce.insertId },
                process.env.JWT_SECRET_KEY
              );
              const dt = ResetEmailFormat(resetPasswordtoken);
              const insert_permition = `INSERT INTO metaOptions (userId,previlegs)VALUES(${responce.insertId},'${per}')`;
              mysqlconnection.query(insert_permition, function (err, responce) {
                if (err) throw err;
                sendmail(
                  {
                    from: process.env.emailFrom || "test@gmail.com",
                    to: email1 || "qatar.school@yopmail.com",
                    subject: "Reset Password Link From QIS✔",
                    html: dt,
                  },
                  function (err, reply) {
                    if (err) {
                      res.status(400).json({
                        message: "something went wrong to send this mail",
                        err,
                      });
                    } else {
                      res.status(200).send({
                        message: "User Registration successfully.",
                      });
                    }
                  }
                );
              });
            }
          });
        }
        if (parentId === 0 && userRole === "parent") {
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
                        mysqlconnection.query(
                          updtCust,
                          async function (err, result) {
                            if (err) throw err;
                            //create reset password token
                            const resetPasswordtoken = jwt.sign(
                              { email1: email1, id: responce.insertId },
                              process.env.JWT_SECRET_KEY
                            );
                            const dt = await ResetEmailFormat(
                              resetPasswordtoken
                            );
                            sendmail(
                              {
                                from: process.env.emailFrom,
                                to: email1,
                                subject: "Reset Password Link From QIS✔",
                                html: dt,
                              },
                              function (err, reply) {
                                if (err) {
                                  res.status(400).json({
                                    message:
                                      "something went wrong to send mail",
                                  });
                                } else {
                                  res.status(200).send({
                                    message:
                                      "Customer Registration successfully.",
                                  });
                                }
                              }
                            );
                          }
                        );
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
    const { status, customerType, contactName, number, sorting, ParentId } =
      req.body;

    let bystatus = "";
    if (status === 1) {
      bystatus = ` and status = ${status}`;
    } else if (status === 0) {
      bystatus = ` and status = ${status}`;
    } else {
      bystatus = "";
    }

    let bycontactName = "";
    if (contactName) {
      bycontactName = ` and contactName = "${contactName}"`;
    }

    let bynumber = "";
    if (number) {
      bynumber = ` and phone1 = ${number}`;
    }

    let bysorting = "";
    if (sorting === 0) {
      bysorting = ` ORDER BY createdAt ASC`;
    } else if (sorting === 1) {
      bysorting = ` ORDER BY createdAt DESC`;
    } else if (sorting === 2) {
      bysorting = ` ORDER BY name ASC`;
    } else if (sorting === 3) {
      bysorting = ` ORDER BY name DESC`;
    } else {
      bysorting = "";
    }

    let bycustType = "";
    if (customerType) {
      bycustType = ` and typeId = ${customerType}`;
    }

    let ByparentId = "";
    if (ParentId) {
      ByparentId = ` and users.parentId  = ${ParentId}`;
    } else {
      ByparentId = "";
    }

    var sqlquery = `select users.id, customers.customerId, parents.parentId as 'GeneratedParentId', users.parentId, users.name, users.email1, users.email2, 
    users.phone1, users.phone2, types.name as "CustomerType", users.contactName,
    users.status, users.printUs, roles.name as "UserRole" from users 
    LEFT outer join roles on roles.id = users.roleId 
    LEFT outer join types on types.id = users.typeId 
    left outer join customers on customers.userId = users.id 
    left outer join parents on parents.userId = users.id 
    where users.isDeleted = 0 ${bystatus}${bycontactName}${bynumber}${bycustType}${ByparentId}${bysorting}`;

    mysqlconnection.query(sqlquery, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get user details controller
  getUserDetailsController: (req, res) => {
    const id = req.params.id;
    var sql = `select users.id, users.parentId, users.name, users.email1, users.email2, users.phone1, users.phone2, users.typeId, users.contactName, users.printUs as printus, users.status, agegroup, generatedId, roles.name as "role", roles.id as "roleId", metaOptions.previlegs as "userPrevilegs" from users LEFT outer join roles on roles.id = users.roleId left outer join metaOptions on metaOptions.userId = users.id where users.id = ${id}`;
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
      parentId,
      previlegs,
      updatedBy,
      agegroup,
      pregeneratedid,
    } = req.body;

    const user_permition = req.body.previlegs;
    const per = JSON.stringify({ user_permition });

    let sql = `select id, name, email1, email2, phone1, phone2, typeId, parentId, contactName, printUs, status, generatedId, agegroup, updatedBy from users where id=${id}`;
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
      }", status= ${status} , agegroup = ${
        agegroup ? agegroup : result[0].agegroup
      }, generatedId = "${
        pregeneratedid ? pregeneratedid : result[0].generatedId
      }", typeId= ${typeId ? typeId : result[0].typeId}, parentId = ${
        parentId ? parentId : result[0].parentId
      }, updatedBy = ${
        updatedBy ? updatedBy : result[0].updatedBy
      } where id = ${id}`;
      mysqlconnection.query(updt_query, function (err, result) {
        if (err) throw err;
        const update_permition = `update metaOptions set previlegs ='${per}' where userId = ${id}`;
        mysqlconnection.query(update_permition, function (err, responce) {
          if (err) throw err;
          res.status(200).send({
            message: "User updated successfully.",
          });
        });
      });
    });
  },

  //delete user controller
  deleteUserController: (req, res) => {
    const id = req.params.id;
    var sql = `update users set isDeleted = 1 where id = ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res
        .status(200)
        .json({ message: "Data deleted successfully", responce: result });
      // if (result.affectedRows === 1) {
      //   const qwery = `select id, invoiceId from invoices where customerId = ${id}`;
      //   mysqlconnection.query(qwery, function (err, result) {
      //     if (err) throw err;
      //     const deleteinvoice = `update invoives set isDeleted = 1 where customerId = ${id}`;
      //     mysqlconnection.query(deleteinvoice, function (err, result) {
      //       if (err) throw err;
      //       res
      //         .status(200)
      //         .json({ message: "Data deleted successfully", responce: result });
      //     });
      //   });
      // }
    });
  },

  //get user by parent id
  GetUserByPidController: (req, res) => {
    const pid = req.params.id;
    var sql = `select id, name from users where id = ${pid}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get user by multiple ids id
  GetUserByMultipleIdController: (req, res) => {
    const ids = req.params.id;
    var sql = `select users.name, users.email1, users.email2, users.phone1, users.phone2, types.name as "CustomerType", users.contactName, users.status, users.printUs from users LEFT outer join types on types.id = users.typeId where users.id IN(${ids})`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get last insert id
  GetLastInsertIdController: (req, res) => {
    var sql = `select id from users order by id desc limit 1`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },
};
