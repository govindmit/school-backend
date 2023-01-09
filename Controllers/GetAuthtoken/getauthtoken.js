const jwt = require("jsonwebtoken");
const getauthtoken = async (req, res) => {
  try {
    const token = jwt.sign(
      { email: "sj2585097@gmail.com", password: "Shubham#12" },
      process.env.JWT_SECRET_KEY
    );
    //console.log(token);
    if (token) {
      res.status(200).json({ message: "ok pipeline testing ", token: token });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
module.exports = { getauthtoken };
