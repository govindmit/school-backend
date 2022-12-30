const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const mysqlconnection = require("../../DB/db.config.connection");
app.use(cookieParser());

module.exports = {
  // add student controller
  addstudentcontroller: (req, res) => {
    //console.log(req.body);
    const { firstName, lastName, user_id } = req.body;
    if (!firstName && !lastName) {
      return res.status(400).send({ message: "all feild is required" });
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

  //get users controller
  getusercontroller: (req, res) => {
    var sql = `select users.firstname, users.lastname, users.email, users.contact, roles.name as "role" from users inner join roles on roles.id = users.role_id`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log(result);
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get user details controller
  getuserdetailscontroller: (req, res) => {
    const id = req.params.id;
    var sql = `select users.firstname, users.lastname, users.email, users.contact, roles.name as "role" from users inner join roles on roles.id = users.role_id where users.id = ${id}`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log(result);
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //edit user controller
  editusercontroller: (req, res) => {
    console.log(req.body);
    const { firstName, lastName, email, password, contact, status, role_id } =
      req.body;
    var sql = `select users.firstname, users.lastname, users.email, users.contact, roles.name as "role" from users inner join roles on roles.id = users.role_id`;
    console.log(sql);
    // mysqlconnection.query(sql, function (err, result) {
    //   if (err) throw err;
    //   //console.log(result);
    //   res.status(200).json({ message: "ok", data: result });
    // });
  },

  //delete user controller
  deleteusercontroller: (req, res) => {
    const id = req.params.id;
    var sql = `delete from users where id = ${id}`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log(result);
      res
        .status(200)
        .json({ message: "data deleted successfully", responce: result });
    });
  },
};
