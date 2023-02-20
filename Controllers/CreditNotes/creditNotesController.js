const jwt = require("jsonwebtoken");
const mysqlconnection = require("../../DB/db.config.connection");
module.exports = {
  // Add credit notes Controller
  addCreditNotesController: async (req, res) => {
    const {
      userId,
      status,
      amount,
      salesOrderId,
      createdBy,
      message,
      amountMode,
    } = req.body;
    console.log(req.body);
    //insert query
    const creditRequestsquery = `INSERT INTO creditRequests (salesOrderId,status,amount,createdBy)VALUES(${salesOrderId},${status},${amount},${createdBy})`;
    mysqlconnection.query(creditRequestsquery, function (err, result) {
      if (err) throw err;
      if (result) {
        const creditRequestMsgquery = `INSERT INTO creditRequestMsg (message,senderId,creditReqId)VALUES("${message}",${userId},${result.insertId})`;
        mysqlconnection.query(creditRequestMsgquery, function (err, rest) {
          if (err) throw err;
          if (rest) {
            const creditNotesquery = `INSERT INTO creditNotes (customerId,amount,status,salesOrderId,amountMode,creditRequestId,createdBy)VALUES(${userId},${amount},${status},${salesOrderId},${amountMode},${result.insertId},${createdBy})`;
            mysqlconnection.query(creditNotesquery, function (err, results) {
              if (err) throw err;
              res.status(200).send({
                message: "credit notes created successfully.",
              });
            });
          }
        });
      }
    });
  },

  //get credits Notes controller
  getCreditNotesController: async (req, res) => {
    const { status, customerId, sorting } = req.body;

    let bystatus = "";
    if (status === 1) {
      bystatus = ` and creditNotes.status = ${status}`;
    } else if (status === 0) {
      bystatus = ` and creditNotes.status = ${status}`;
    } else {
      bystatus = "";
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

    let BycustomerId = "";
    if (customerId) {
      BycustomerId = ` and users.customerId  = ${customerId}`;
    } else {
      BycustomerId = "";
    }

    var sqlquery = `select users.name,users.email1,creditNotes.status,creditNotes.amount
    from creditNotes
    LEFT outer join users on users.id = creditNotes.customerId 
    where 1=1 ${bystatus}${BycustomerId}${bysorting}`;
    mysqlconnection.query(sqlquery, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get credit notes details controller
  getCreditNotesDetailsController: (req, res) => {
    const id = req.params.id;
    var sql = `select users.name,users.email1,creditNotes.salesOrderId,creditNotes.amount,creditNotes.status,
    creditRequestMsg.message,activites.name as "activityName" from creditNotes
    LEFT outer join users on users.id = creditNotes.customerId
    LEFT outer join creditRequestMsg on creditRequestMsg.senderId = creditNotes.customerId
    LEFT outer join activites on activites.id = creditNotes.salesOrderId
    where ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //update/delete credit notes
  editCreditNotesController: async (req, res) => {
    const id = req.params.id;
    const { status, message, updatedBy } = req.body;
    if (status === 1 || status === 2 || status === 3 || status === 4) {
      const updatecreditRequestswuery = `update creditRequests set status = ${status} where userId = ${id}`;
      mysqlconnection.query(
        updatecreditRequestswuery,
        function (err, responce) {
          if (err) throw err;
          if (responce) {
            const updatecreditRequestMsg = `update creditRequestMsg set message = "${message}", receiverId = ${updatedBy} where senderId = ${id}`;
            mysqlconnection.query(
              updatecreditRequestMsg,
              function (err, result) {
                if (err) throw err;
                const updatecreditRequestMsg = `update creditNotes set status = ${status}  where customerId = ${id}`;
                mysqlconnection.query(
                  updatecreditRequestMsg,
                  function (err, result) {
                    if (err) throw err;
                    res.status(200).send({
                      message: "Request updated successfully.",
                    });
                  }
                );
              }
            );
          }
        }
      );
    }
  },
};
