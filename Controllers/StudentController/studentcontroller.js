const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");

module.exports = {
  // add student controller
  addstudentcontroller: (req, res) => {
    //console.log(req.body);
    const { firstName, lastName, user_id } = req.body;
    if (!firstName || !lastName || !user_id) {
      return res.status(400).send({ message: "All feild is required" });
    }
    var sql = `INSERT INTO students (firstName,lastName,user_id)VALUES("${firstName}","${lastName}",${user_id})`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log("record inserted");
      //console.log(result);
      res.status(201).json({ message: "data inserted", data: result });
    });
  },

  //get students controller
  getstudentcontroller: (req, res) => {
    const id = req.params.id;
    if (id) {
      var sql = `select * from students where students.user_id = ${id}`;
      //console.log(sql);
      mysqlconnection.query(sql, function (err, result) {
        if (err) throw err;
        //console.log(result);
        res.status(200).json({ message: "ok", data: result });
      });
    } else {
      res.status(400).json({ message: "Id not found" });
    }
  },

  editstudentcontroller: (req, res) => {
    const id = req.params.id;
    const { firstName, lastName, user_id } = req.body;
    const updt_query = `update students set firstName = "${firstName}", lastName = "${lastName}", user_id = ${user_id} where id = ${id}`;
    console.log(updt_query);
    mysqlconnection.query(updt_query, function (err, result) {
      //console.log(result);
      if (err) throw err;
      //console.log(result);
      res
        .status(200)
        .json({ message: "data updated successfully", data: result });
    });
  },
};
