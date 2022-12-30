const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReceptionistSchema = new Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  username: {
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
  dob: {
    type: Date,
  },
  age: {
    type: Number,
  },
  address1: {
    type: String,
  },
  address2: {
    type: String,
    default: "",
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  postalcode: {
    type: Number,
  },
  registrationdate: {
    type: Date,
    default: Date.now(),
  },
  joiningdate: {
    type: Date,
    default: "1970-01-01T00:00:00.001Z",
  },
  leavingdate: {
    type: Date,
    default: "1970-01-01T00:00:00.001Z",
  },
  image: {
    type: String,
    default: "",
  },
  tokens: [
    {
      token: { type: String },
    },
  ],
});

//generate login auth token
ReceptionistSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    console.log(error);
  }
};

const Receptionistmodel = new mongoose.model(
  "Receptionist",
  ReceptionistSchema
);

module.exports = Receptionistmodel;
