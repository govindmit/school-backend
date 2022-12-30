const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const mysqlconnection = require("../../DB/db.config.connection");
app.use(cookieParser());

module.exports = {
  // add role controller
  addrolecontroller: (req, res) => {
    //console.log(req.body);
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ message: "all feild is required" });
    }
    var sql = "INSERT INTO roles (name) VALUES ('user')";
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log("record inserted");
      //console.log(result);
      res.status(201).json({ message: "data inserted", data: result });
    });
  },
};
