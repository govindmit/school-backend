const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");

module.exports = {
  // add role controller
  addrolecontroller: (req, res) => {
    //console.log(req.body);
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ message: "all field is required" });
    }
    const check_query = `select * from roles where name = "${name}"`;
    mysqlconnection.query(check_query, function (err, result) {
      //console.log(result.length);
      if (result.length == 0) {
        const sql = `INSERT INTO roles (name) VALUES ("${name}")`;
        mysqlconnection.query(sql, function (err, result) {
          if (err) throw err;
          res.status(201).send({ message: "Data inserted", data: result });
        });
      } else {
        res.status(409).send({ message: "Role Name Allready Registred" });
      }
    });
  },
};
