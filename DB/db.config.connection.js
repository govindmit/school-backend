const mysql = require("mysql");

var mysqlconnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Shubham#12",
  database: "student_portal",
  acquireTimeout: 6000000,
});

mysqlconnection.connect((err) => {
  if (!err) {
    console.log("DB connected");
  } else {
    console.log(err);
  }
});
module.exports = mysqlconnection;

// const mongoose = require("mongoose");
// //database info
// const username = process.env.dbusername;
// const password = process.env.password;
// const dbname = process.env.dbname;
// const db_cluster_url = `mongodb+srv://${username}:${password}@cluster0.08polbo.mongodb.net/${dbname}?retryWrites=true&w=majority`;
// //connect database
// mongoose
//   .connect(db_cluster_url)
//   .then(() => {
//     console.log("db connection successfull");
//   })
//   .catch((err) => {
//     //console.log("db connection unsuccessfull", err);
//     console.log("db connection unsuccessfull", err.message);
//   });
