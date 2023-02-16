const jwt = require("jsonwebtoken");
const mysqlconnection = require("../../DB/db.config.connection");
module.exports = {
  // Add credit notes Controller
  addCreditNotesController: async (req, res) => {
    const { customerId, status, amount, salesOrderId, amountMode, createdBy } =
      req.body;
    //insert query
    const insert_query = `INSERT INTO creditNotes (customerId, status, amount, salesOrderId, amountMode, createdBy)VALUES("${customerId}",${status},${amount},${salesOrderId},${amountMode},${createdBy})`;
    mysqlconnection.query(insert_query, function (err, result) {
      if (err) throw err;
      res.status(200).send({
        message: "credit notes created successfully.",
      });
    });
  },

  //get credits Notes controller
  getCreditNotesController: async (req, res) => {
    const { status, customerId, sorting } = req.body;

    // let bystatus = "";
    // if (status === 1) {
    //   bystatus = ` and status = ${status}`;
    // } else if (status === 0) {
    //   bystatus = ` and status = ${status}`;
    // } else {
    //   bystatus = "";
    // }

    // let bysorting = "";
    // if (sorting === 0) {
    //   bysorting = ` ORDER BY createdAt ASC`;
    // } else if (sorting === 1) {
    //   bysorting = ` ORDER BY createdAt DESC`;
    // } else if (sorting === 2) {
    //   bysorting = ` ORDER BY name ASC`;
    // } else if (sorting === 3) {
    //   bysorting = ` ORDER BY name DESC`;
    // } else {
    //   bysorting = "";
    // }

    // let BycustomerId = "";
    // if (customerId) {
    //   BycustomerId = ` and users.parentId  = ${ParentId}`;
    // } else {
    //   ByparentId = "";
    // }

    var sqlquery = `select creditNotes.id, users.name as "customerName",
    users.email1 as "email", creditNotes.amount, 
    creditRequests.status from creditNotes
    LEFT outer join users on users.id = creditNotes.customerId 
    LEFT outer join creditRequests on creditRequests.userId = creditNotes.customerId
    where 1=1`;
    mysqlconnection.query(sqlquery, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get credit notes details controller
  getCreditNotesDetailsController: (req, res) => {
    const id = req.params.id;
    var sql = `select creditNotes.id, users.name as "customerName",
    users.email1 as "email", sales_order.orderId as "purchaseId", sales_order.amount, 
    creditRequests.status, creditRequestMsg.message from creditNotes
    LEFT outer join users on users.id = creditNotes.customerId 
    LEFT outer join creditRequests on creditRequests.userId = creditNotes.customerId
    where ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  editCreditNotesController: async (req, res) => {
    const id = req.params.id;
    const { name } = req.body;

    let sql = `status, generatedId, agegroup, roleId, updatedBy from users where id=${id}`;
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
      }", typeId= ${typeId ? typeId : result[0].typeId}, roleId = ${
        roleId ? roleId : result[0].roleId
      }, parentId = ${parentId ? parentId : result[0].parentId}, updatedBy = ${
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
};
