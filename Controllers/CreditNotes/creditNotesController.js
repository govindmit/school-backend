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
    //insert query
    const creditRequestsquery = `INSERT INTO creditRequests (userId,salesOrderId,status,amount,createdBy)VALUES(${userId},${salesOrderId},${status},${amount},${createdBy})`;
    mysqlconnection.query(creditRequestsquery, function (err, result) {
      if (err) throw err;
      if (result) {
        const creditRequestMsgquery = `INSERT INTO creditRequestMsg (message,senderId,creditReqId)VALUES("${message}",${userId},${result.insertId})`;
        mysqlconnection.query(creditRequestMsgquery, function (err, rest) {
          if (err) throw err;
          if (rest) {
            const creditNotesquery = `INSERT INTO creditNotes (customerId,creditRequestId,createdBy)VALUES(${userId},${result.insertId},${createdBy})`;
            mysqlconnection.query(creditNotesquery, function (err, results) {
              if (err) throw err;
              res.status(200).send({
                message: "credit request created successfully.",
              });
            });
          }
        });
      }
    });
  },

  //get credits Notes controller
  getCreditNotesController: async (req, res) => {
    const { status, sorting, customerId, startdate, enddate } = req.body;

    let bystatus = "";
    if (status === "0" || status === "1" || status === "2" || status === "3") {
      bystatus = ` and creditRequests.status = ${status}`;
    } else {
      bystatus = "";
    }

    let bysorting = "";
    if (sorting === 0) {
      bysorting = ` ORDER BY createdAt ASC`;
    } else if (sorting === 1) {
      bysorting = ` ORDER BY createdAt DESC`;
    } else if (sorting === 2) {
      bysorting = ` ORDER BY amount ASC`;
    } else if (sorting === 3) {
      bysorting = ` ORDER BY amount DESC`;
    } else {
      bysorting = "";
    }

    let BycustomerId = "";
    if (customerId) {
      BycustomerId = ` and creditNotes.customerId  = ${customerId}`;
    } else {
      BycustomerId = "";
    }

    var sqlquery = `select creditNotes.id, users.name,users.email1,creditRequests.status,creditRequests.amount from creditNotes
    LEFT outer join users on users.id = creditNotes.customerId
    LEFT outer join creditRequests on creditRequests.userId = creditNotes.customerId
    where 1=1 ${bystatus} ${BycustomerId}`;

    mysqlconnection.query(sqlquery, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get credit notes details controller
  getCreditNotesDetailsController: (req, res) => {
    const id = req.params.id;
    var sql = `select users.name, users.email1, creditRequests.status, creditNotes.creditRequestId, creditRequests.amount from creditNotes
    LEFT OUTER JOIN users on users.id = creditNotes.customerId
    LEFT OUTER JOIN creditRequests on creditRequests.userId = creditNotes.customerId
    where creditNotes.id =  ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      const dt = `select message from creditRequestMsg where creditReqId = ${result[0].creditRequestId}`;
      mysqlconnection.query(dt, function (err, results) {
        if (err) throw err;
        res.status(200).json({ message: "ok", data: { result, results } });
      });
    });
  },

  //update/delete credit notes
  editCreditNotesController: async (req, res) => {
    const id = req.params.id;
    const { status, amount, message, updatedBy } = req.body;
    const sel_query = `select creditRequestId from creditNotes where id = ${id}`;
    mysqlconnection.query(sel_query, function (err, result) {
      if (err) throw err;
      const updatecreditRequestswuery = `update creditRequests set status = ${status} where id = ${result[0].creditRequestId}`;
      mysqlconnection.query(updatecreditRequestswuery, function (err, results) {
        if (err) throw err;
        const creditRequestMsgquery = `INSERT INTO creditRequestMsg (message,senderId,receiverId,creditReqId)VALUES("${message}",0,${updatedBy},${result[0].creditRequestId})`;
        mysqlconnection.query(creditRequestMsgquery, function (err, result) {
          if (err) throw err;
          res.status(200).json({ message: "ok" });
        });
      });
    });
  },
};
