const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const ResetEmailFormat = require("../Helper/ResetEmailTemp");
const mysqlconnection = require("../../DB/db.config.connection");
const sendmail = require("sendmail")();

module.exports = {
  // Add user Controller
  addUserController: async (req, res) => {
    const {
      firstName,
      lastName,
      email1,
      email2,
      phone1,
      phone2,
      contactName,
      printUs,
      status,
      roleId,
      typeId,
    } = req.body;

    const check_email_query = `select id, email1 from users where email1 = "${email1}"`;
    mysqlconnection.query(check_email_query, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        res.status(409).send({ message: "Email1 already registered." });
      } else {
        const insert_query = `INSERT INTO users (firstName,lastName,email1,email2,phone1,phone2,contactName,printUs,status,roleId,typeId)VALUES("${firstName}","${lastName}","${email1}","${email2}",${phone1},${phone2},"${contactName}","${printUs}",${status},${roleId},${typeId})`;
        mysqlconnection.query(insert_query, function (err, responce) {
          if (err) throw err;
          if (responce) {
            //create reset password token
            const resetPasswordtoken = jwt.sign(
              { email1: email1, id: responce.insertId },
              process.env.JWT_SECRET_KEY
            );
            //send reset password mail

            //insert customer
            const getCustuser = `select id from users where roleId = 2 and id = ${responce.insertId}`;
            mysqlconnection.query(getCustuser, function (err, result) {
              if (err) throw err;
              if (result.length > 0) {
                const insert_cust = `INSERT INTO customers (userId)VALUES(${result[0].id})`;
                mysqlconnection.query(insert_cust, function (err, custResult) {
                  if (err) throw err;
                  if (custResult) {
                    const updtCust = `update customers set customerId = "CUST-000${custResult.insertId}" where id =${custResult.insertId}`;
                    mysqlconnection.query(updtCust, function (err, result) {
                      if (err) throw err;
                    });
                  }
                });
              }
            });

            //insert parent
            const getParent = `select id, parentId from users where roleId = 2 and id = ${responce.insertId}`;
            mysqlconnection.query(getParent, function (err, parentResult) {
              if (err) throw err;
              if (parentResult.length > 0 && parentResult[0].parentId !== 0) {
                const insert_parnt = `INSERT INTO parents (userId)VALUES(${parentResult[0].id})`;
                mysqlconnection.query(
                  insert_parnt,
                  function (err, parntResult) {
                    if (err) throw err;
                    if (parntResult) {
                      const updtparnt = `update parents set parentId = "PARNT-000${parntResult.insertId}" where id =${parntResult.insertId}`;
                      mysqlconnection.query(updtparnt, function (err, result) {
                        if (err) throw err;
                      });
                    }
                  }
                );
              }
            });

            res.status(200).json({
              msg1: "Registration successfully.",
            });
          }
        });
      }
    });
  },

  //get users controller
  getUserController: async (req, res) => {
    const { status } = req.body;
    let search_sql = "";
    if (status === 1) {
      search_sql += `and status = ${status}`;
    } else if (status === 0) {
      search_sql += `and status = ${status}`;
    } else {
      search_sql = "";
    }
    var sqlquery = `select users.id, customers.customerId, users.firstname,
    users.lastname, users.email1, users.email2, 
    users.phone1, users.phone2, types.name as "CustomerType", users.contactName,
    users.status, users.printUs, roles.name as "UserRole" from users 
    LEFT outer join roles on roles.id = users.roleId 
    LEFT outer join types on types.id = users.typeId 
    left outer join customers on customers.userId = users.id 
    where 1=1 ${search_sql}`;
    mysqlconnection.query(sqlquery, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
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
