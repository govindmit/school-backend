const bcrypt = require("bcryptjs");
const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");

module.exports = {
  //add user controller
  addusercontroller: async (req, res) => {
    //console.log(req.body);
    const { firstName, lastName, email, password, contact, status, role_id } =
      req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !contact ||
      !status ||
      !role_id
    ) {
      return res.status(400).send({ message: "All feild is required" });
    }
    const secure_password = await bcrypt.hash(password, 12);
    //console.log(secure_password);
    const check_email_query = `select *from  users where email = "${email}" `;
    //console.log(check_email_query);
    var sql = `INSERT INTO users (firstName,lastName,email,password,contact,status,role_id)VALUES("${firstName}","${lastName}","${email}","${secure_password}","${contact}",${status},${role_id})`;
    mysqlconnection.query(check_email_query, function (err, result) {
      //console.log(result.length);
      if (result.length > 0) {
        res.status(409).send({ message: "Email allready registred" });
      } else {
        //console.log(sql);
        mysqlconnection.query(sql, function (err, result) {
          if (err) throw err;
          //console.log(result);
          res.status(201).json({ message: "data inserted", data: result });
        });
      }
    });
  },

  //get users controller
  getusercontroller: (req, res) => {
    var sql = `select users.id, users.firstname, users.lastname, users.email, users.contact, roles.name as "role" from users inner join roles on roles.id = users.role_id`;
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
    var sql = `select users.id, users.firstname, users.lastname, users.email, users.contact, roles.name as "role" from users inner join roles on roles.id = users.role_id where users.id = ${id}`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      //console.log(result);
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //edit user controller
  editusercontroller: (req, res) => {
    const id = req.params.id;
    //console.log(id);
    //console.log(req.body);
    const { firstName, lastName, email, contact, status, role_id } = req.body;
    var sql = `select users.id, users.firstname, users.lastname, users.email, users.contact, users.role_id, roles.name as "role" from users inner join roles on roles.id = users.role_id where users.id = ${id}`;
    //console.log(sql);
    mysqlconnection.query(sql, function (err, result) {
      //console.log(result);
      if (result.length > 0) {
        let new_firstname,
          new_lastname,
          new_email,
          new_contact,
          new_status,
          new_role_id;

        if (firstName !== "") {
          new_firstname = firstName;
        } else {
          new_firstname = result[0].firstname;
        }
        if (lastName !== "") {
          new_lastname = lastName;
        } else {
          new_lastname = result[0].lastname;
        }
        if (email !== "") {
          new_email = email;
        } else {
          new_email = result[0].email;
        }
        if (contact !== "") {
          new_contact = contact;
        } else {
          new_contact = result[0].contact;
        }
        const updt_query = `update users set firstname = "${new_firstname}", lastname = "${new_lastname}", email = "${new_email}", contact = "${new_contact}" where users.id = ${id}`;
        console.log(updt_query);
        mysqlconnection.query(updt_query, function (err, result) {
          //console.log(result);
          if (err) throw err;
          //console.log(result);
          res
            .status(200)
            .json({ message: "data updated successfully", data: result });
        });
      }
    });
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
