const jwt = require("jsonwebtoken");
const Receptionistmodel = require("../Models/ReceptionistModel/receptionistmodel");
const acces_data_secret_key = process.env.JWT_SECRET_KEY;

const verifyLoginAuthToken = async (req, res, next) => {
  const loginauthtoken = req.headers["x-access-token"];
  //console.log(loginauthtoken);
  //return false;
  if (!loginauthtoken) {
    return res
      .status(403)
      .send({ message: "A authentication token is required " });
  }
  try {
    const verifylogintoken = jwt.verify(loginauthtoken, acces_data_secret_key);
    //console.log(verifylogintoken);
    //return false;
    const user = await Receptionistmodel.findOne({
      _id: verifylogintoken._id,
      "tokens.token": loginauthtoken,
    });
    if (!user) {
      throw new Error(" invalid token user not found");
    }
    req.user_id = user._id.toString();
    next();
  } catch (err) {
    return res.status(401).send({ message: "Invalid login Token" });
  }
};

module.exports = { verifyLoginAuthToken };
