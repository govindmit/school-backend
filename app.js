const express = require("express");
const DatabaseConn = require("./database/conn");

var bodyParser = require("body-parser");
const cors = require("cors");
DatabaseConn;

const invoiceRoutes = require("./routes/invoiceRoutes");


const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + "/image"));
app.use("/image", express.static("image"));


app.use("/api", invoiceRoutes);


app.listen(3001, () => {
  console.log("server is running on port 3001");
});
