const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");

module.exports = {
  //add activity controller
  addactivitycontroller: (req, res) => {
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
    const { name, description, type, price, startdate, enddate, status } =
      req.body;
    if (!name || !type || !price || !startdate || !enddate || !status) {
      return res.status(400).send({ message: "All field is required" });
    }
    const check_name_query = `select id, name from  activites where name = "${name}"`;
    mysqlconnection.query(check_name_query, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        res.status(409).send({ message: "Activity Name already registred" });
      } else {
        var sql = `INSERT INTO activites (name,type,price,startdate,enddate,status)VALUES("${name}","${type}",${price},"${startdate}","${enddate}","${status}")`;
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
    const { name, type, price, startdate, enddate, status } = req.body;

    // var selectsql = `select *from activites where id = ${id}`;
    // mysqlconnection.query(selectsql, function (err, result) {
    //   if (result.length > 0) {
    //     let new_name,
    //       new_desc,
    //       new_short_desc,
    //       new_type,
    //       new_price,
    //       new_start_date,
    //       new_end_date,
    //       new_status;

    //     if (name !== "") {
    //       new_name = name;
    //     } else {
    //       new_name = result[0].name;
    //     }
    //     if (description !== "") {
    //       new_desc = description;
    //     } else {
    //       new_desc = result[0].description;
    //     }
    //     if (shortdescription !== "") {
    //       new_short_desc = shortdescription;
    //     } else {
    //       new_short_desc = result[0].shortdescription;
    //     }
    //     if (type !== "") {
    //       new_type = type;
    //     } else {
    //       new_type = result[0].type;
    //     }
    //     if (price !== "") {
    //       new_price = price;
    //     } else {
    //       new_price = result[0].price;
    //     }
    //     if (startdate !== "") {
    //       new_start_date = startdate;
    //     } else {
    //       new_start_date = result[0].startdate;
    //     }
    //     if (enddate !== "") {
    //       new_end_date = enddate;
    //     } else {
    //       new_end_date = result[0].enddate;
    //     }
    //     if (status !== "") {
    //       new_status = status;
    //     } else {
    //       new_status = result[0].status;
    //     }

    const updt_query = `update activites set name = "${name}",type = "${type}", price = ${price}, startdate = "${startdate}", enddate = "${enddate}", status = "${status}" where id = ${id}`;
    console.log(updt_query);
    mysqlconnection.query(updt_query, function (err, result) {
      if (err) throw err;
      res
        .status(200)
        .json({ message: "data updated successfully", data: result });
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
