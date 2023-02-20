const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const { createSalesOrder, deleteSageIntacctSalesOrder, updateSalesOrder } = require("../../SageIntacctAPIs/SalesOrderService");
const util = require("util");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
  //add Sales controller
  addSalesOrder: (req, res) => {
    const {
      amount,
      status,
      userId,
      activityId,
      transactionId,
      orderId,
      createdBy,
    } = req.body;
    if (
      !amount ||
      !status ||
      !userId ||
      !activityId ||
      !transactionId ||
      !createdBy
    ) {
      return res.status(400).send({ message: "All field is required" });
    }
    var sql = `INSERT INTO sales_order (amount,status,userId,activityId,transactionId,orderId,createdBy)VALUES("${amount}","${status}","${userId}","${activityId}","${transactionId}","${orderId}","${createdBy}")`;
    mysqlconnection.query(sql, async function (err, result) {
      if (err) throw err;
      const queryForCustomerId = `SELECT customerId FROM customers where userId = "${userId}"`;
      const customerIdQueryResponse = await query(queryForCustomerId);
      const queryForItemID = `SELECT itemID FROM items where activityId = "${activityId}"`
      const itemId = await query(queryForItemID);
      
      let objectDate = new Date();
      let transactionDate =  (objectDate.getMonth()+1) + "/" + objectDate.getDate() + "/" + objectDate.getFullYear();
     
      const data ={
        customerId:customerIdQueryResponse[0].customerId,
        transactionDate:transactionDate,
        itemId:itemId[0].itemID
      }
     
        const sageIntacctSalesOrder = await createSalesOrder(data);
        const SalesorderId = sageIntacctSalesOrder._key;
        const sageIntacctorderID = SalesorderId.split("-")[1];
        const updateSql = `UPDATE sales_order SET  transactionId = "${sageIntacctorderID}" WHERE id="${result.insertId}"`
        const updateInvoice = await query(updateSql);

      res
        .status(200)
        .json({ message: "Data inserted successfully", data: result });
    });
  },

  //get activity controller
  getSalesOrder: (req, res) => {

    var sql = `SELECT sales_order.id,sales_order.amount,sales_order.status,userId,activityId,transactionId,orderId,sales_order.createdBy,sales_order.isDeleted,users.name as customer_name,users.email1 as customer_email,activites.name as activity_name from sales_order INNER JOIN users ON users.id = sales_order.userId INNER JOIN activites ON activites.id = sales_order.activityId where 1=1`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get sales details controller
  getSalesDetails: (req, res) => {
    const id = req.params.id;
    var sql = `SELECT sales_order.id,sales_order.amount,sales_order.status,userId,activityId,transactionId,orderId,sales_order.createdBy,sales_order.isDeleted,users.name as user_name,users.email1 as user_email1,users.email2 as user_email2,users.phone1 as user_phone1,users.phone2 as user_phone2,users.printUs as user_printUs,users.createdAt as user_create_Date,users.contactName as user_contactName,users.roleId as user_roleId,users.typeId as user_typeId,users.parentId as user_parentId,activites.name as activity_name,activites.description as activity_description,activites.shortDescription as activity_shortDescription,activites.type as activity_type,activites.status as activity_status,activites.shortDescription as activity_shortDescription,activites.description as activity_description,activites.startDate as activity_startDate,activites.endDate as activity_endDate,activites.price as activity_price from sales_order INNER JOIN users ON users.id = sales_order.userId INNER JOIN activites ON activites.id = sales_order.activityId where sales_order.id=${id}`;

    mysqlconnection.query(sql, function (err, result) {
      if (err) {
        res.status(400).json({ message: "something went wrong", data: result });
      } else {
        res.status(200).json({ message: "ok", data: result });
      }
    });
  },

  //edit sales controller
  editSalesOrder: (req, res) => {
    const id = req.params.id;
    const {
      amount,
      status,
      userId,
      activityId,
       orderId,
      updatedBy,
    } = req.body;

    const updt_query = `update sales_order set amount = "${amount}",status = "${status}", userId = ${userId}, activityId = "${activityId}", orderId = "${orderId}",updatedBy="${updatedBy}" where id = ${id}`;
    mysqlconnection.query(updt_query,async function (err, result) {
      if (err) throw err;

      const queryForCustomerId = `SELECT customerId FROM customers where userId = "${userId}"`;
      const customerIdQueryResponse = await query(queryForCustomerId);

      var salesOrderSql = `SELECT transactionId FROM  sales_order where id = "${id}"`
      const sageIntacctsalesorderId = await query(salesOrderSql);
      const salesOrderID =sageIntacctsalesorderId[0]['transactionId']

      const queryForItemID = `SELECT itemID FROM items where activityId = "${activityId}"`
      const itemId = await query(queryForItemID);

      const data ={
        transactionId :salesOrderID,
        customerId:customerIdQueryResponse[0].customerId,
        itemId:itemId[0].itemID,
        state: status===0 ? "Closed":"pending",
      }
      console.log("data =>",data);
      const sageIntacctInvoice = await updateSalesOrder(data);
      res
        .status(200)
        .json({ message: "data updated successfully", data: result });
    });
  },

  //delete sales controller
  deleteSalesOrder: (req, res) => {
    const id = req.params.id;
    var sql = `update sales_order set isDeleted = 1 where id = ${id}`;
    mysqlconnection.query(sql, async function (err, result) {
      if (err) throw err;
      const queryForGetTransactionID = `SELECT transactionId FROM  sales_order where id = "${id}"`
      const transactionIdResponse = await query(queryForGetTransactionID);
      const SageIntacctSalesOrder = await deleteSageIntacctSalesOrder(transactionIdResponse[0].transactionId);
      res
        .status(200)
        .json({ message: "Data deleted successfully", response: result });
    });
  },
};
