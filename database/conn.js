const mysql = require("mysql");

var mysqlconnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "jaydeep@123",
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
