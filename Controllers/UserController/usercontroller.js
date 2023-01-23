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
    const insert_query = `INSERT INTO users (firstName,lastName,name,email1,email2,phone1,phone2,printUs,contactName,status,roleId,typeId,parentId,createdBy,updatedBy)VALUES("${
      firstName ? firstName : ""
    }", "${lastName ? lastName : ""}", "${name ? name : ""}", "${email1}", "${
      email2 ? email2 : ""
    }",${phone1 ? phone1 : 0}, ${phone2 ? phone2 : 0}, "${
      contactName ? contactName : ""
    }", "${printUs ? printUs : ""}", ${status ? status : 1}, ${
      roleId ? roleId : 2
    }, ${typeId ? typeId : 0}, ${parentId ? parentId : 0}, ${
      createdBy ? createdBy : 1
    }, ${updatedBy ? updatedBy : 1})`;
    mysqlconnection.query(check_email_query, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(409).send({ message: "Email1 already registered." });
      } else {
        if (parentId > 0 || parentId === undefined) {
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
                          res.status(201).json({
                            msg1: "Customer Registration successfully.",
                          });
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
    const { status, contactName, customerType, phoneNumber, sorting } =
      req.body;

   // console.log(req.body);

    let search_sql = "";
    if (status === 1) {
      search_sql += `and status = ${status}`;
    } else if (status === 0) {
      search_sql += `and status = ${status}`;
    } else {
      search_sql = "";
    }

    // if (contactName === "" && contactName === undefined) {
    //   search_sql = "";
    // } else {
    //   search_sql = ` and contactName = "${contactName}"`;
    // }

    var sqlquery = `select users.id, customers.customerId, users.firstname,
    users.lastname, users.email1, users.email2, 
    users.phone1, users.phone2, types.name as "CustomerType", users.contactName,
    users.status, users.printUs, roles.name as "UserRole" from users 
    LEFT outer join roles on roles.id = users.roleId 
    LEFT outer join types on types.id = users.typeId 
    left outer join customers on customers.userId = users.id 
    where 1=1 and roleId = 2 ${search_sql}`;

   // console.log(sqlquery);

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
