const express = require("express");
const app = express();
const body_parser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

//dependies middlewares
app.use(express.json());
app.use(cors());
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));

const HOSTNAME = process.env.HOSTNAME;
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("working fine..");
});

//create server
app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});

//require database file connect db
require("./database/conn.js");

//require routes file
const router = require("./Routers/Routers");
app.use("/api", router);
