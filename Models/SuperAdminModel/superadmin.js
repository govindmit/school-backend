const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const SuperAdminSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  number: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
});

const superadminmodel = new mongoose.model("SuperAdmin", SuperAdminSchema);
module.exports = superadminmodel;
