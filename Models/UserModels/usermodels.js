const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserRegistrationSchema = new Schema({
  firstname: {
    type: String,
  },
  lastname: {
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
  confirmpassword: {
    type: String,
  },
  token: {
    type: String,
  },
});

//generate auth token
UserRegistrationSchema.methods.generateAuthToken = async function (param) {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY);
    this.token = token;
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

const userregistration = new mongoose.model("Users", UserRegistrationSchema);
module.exports = userregistration;
