const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");

module.exports = {
  //add activity controller
  addActivityController: (req, res) => {
    // if (!req.file) {
    //   return res.status(400).send({ message: "Image field is required" });
    // }
    // if (
    //   req.file.originalname.split(".").pop() !== "png" &&
    //   req.file.originalname.split(".").pop() !== "jpeg"
    // ) {
    //   return res
    //     .status(400)
    //     .send({ message: "Please upload png and jpeg image formats " });
    // }
    const { name, type, status, startDate, endDate, price } = req.body;
    if (!name || !type || !status || !startDate || !endDate || !price) {
      return res.status(400).send({ message: "All field is required" });
    }
    const check_name_query = `select id, name from  activites where name = "${name}"`;
    mysqlconnection.query(check_name_query, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        res.status(409).send({ message: "Activity Name already registred" });
      } else {
        var sql = `INSERT INTO activites (name,type,status,startDate,endDate,price)VALUES("${name}", ${type}, ${status},"${startDate}","${endDate}",${price})`;
        mysqlconnection.query(sql, function (err, result) {
          if (err) throw err;
          res
            .status(201)
            .json({ message: "Data inserted successfully", data: result });
        });
      }
    });
  },

  //get activity controller
  getActivityController: (req, res) => {
    var sql = `select name, type, status, startDate, endDate, price  from activites`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get activity details controller
  getActivityDetailsController: (req, res) => {
    const id = req.params.id;
    var sql = `select name, type, status, startDate, endDate, price from activites where id = ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //edit activity controller
  editActivityController: (req, res) => {
    const id = req.params.id;
    // if (
    //   req.file.originalname.split(".").pop() !== "png" &&
    //   req.file.originalname.split(".").pop() !== "jpeg"
    // ) {
    //   return res
    //     .status(400)
    //     .send({ message: "Please upload png and jpeg image formats " });
    // }
    const { name, type, status, startDate, endDate, price } = req.body;
    var selectsql = `select name, type, status, startDate, endDate, price from activites where id = ${id}`;
    mysqlconnection.query(selectsql, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        const updt_query = `update activites set name = "${
          name ? name : result[0].name
        }", type = ${type ? type : result[0].type}, status = "${
          status ? status : result[0].status
        }", startDate = "${
          startDate ? startDate : result[0].startDate
        }", endDate = "${endDate ? endDate : result[0].endDate}", price = ${
          price ? price : result[0].price
        } where id = ${id}`;
        mysqlconnection.query(updt_query, function (err, result) {
          if (err) throw err;
          res
            .status(200)
            .json({ message: "Data updated successfully", data: result });
        });
      } else {
        res
          .status(400)
          .json({ message: "data not found this id", responce: result });
      }
    });
  },

  //delete user controller
  deleteActivityController: (req, res) => {
    const id = req.params.id;
    var sql = `delete from activites where id = ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res
        .status(200)
        .json({ message: "data deleted successfully", responce: result });
    });
  },
};
