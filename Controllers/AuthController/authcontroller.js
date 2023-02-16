const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysqlconnection = require("../../DB/db.config.connection");
const ResetEmailFormat = require("../Helper/ResetEmailTemp");
const Passdsetconformationemail = require("../Helper/Passdsetconformationemail");
const sendEmails = require("../Helper/sendEmails");
module.exports = {
  // user login controller
  userlogincontroller: (req, res) => {
    const { email1, password } = req.body;
    if (!email1 || !password) {
      return res
        .status(400)
        .send({ message: "Email and Password field is required" });
    }
    const check_email_query = `select id, name, email1, password, status, roleId from  users where email1 = "${email1}" `;
    mysqlconnection.query(check_email_query, function (err, result) {
      if (result) {
        bcrypt
          .compare(password, result[0].password)
          .then((responce) => {
            if (responce) {
              const loginToken = jwt.sign(
                { email1: result[0].email1, id: result[0].id },
                process.env.JWT_SECRET_KEY,
                {
                  expiresIn: "4h",
                }
              );
              res.status(200).send({
                message: "User login successfully",
                loginToken: loginToken,
                data: {
                  id: result[0].id,
                  fname: result[0].name,
                  email: result[0].email1,
                  role_id: result[0].roleId,
                },
              });
            } else {
              res.status(400).send({ message: "invalid credentials" });
            }
          })
          .catch((error) => {
            res.status(400).send({ message: "invalid credentials" });
          });
      } else {
        res.status(400).send({ message: "invalid credentials" });
      }
    });
  },

  //forgot password controller
  forgotpasswordcontroller: async (req, res) => {
    const { email1 } = req.body;
    if (!email1) {
      return res.status(400).send({ message: "Email field is required" });
    }
    const check_email = `select id, email1 from users where email1 = "${email1}"`;
    mysqlconnection.query(check_email, async function (err, result) {
      if (result.length > 0) {
        //create reset password token
        const resetPasswordtoken = jwt.sign(
          { email1: result[0].email1, id: result[0].id },
          process.env.JWT_SECRET_KEY
        );
        const dt = await ResetEmailFormat(resetPasswordtoken);
        sendEmails(email1, "Reset Password Link From QIS✔", dt);
        res
          .status(200)
          .json({ msg: "Link send successfully for reset password" });
      } else {
        res.status(401).json({ message: "Email Not Registred" });
      }
    });
  },

  //reset password controller
  resetpasswordcontroller: async (req, res) => {
    const { token, password } = req.body;
    if (!password || !token) {
      return res
        .status(400)
        .send({ message: "Password and Token is  Required" });
    }
    const secure_pass = await bcrypt.hash(password, 12);
    try {
      decodedtoken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (decodedtoken) {
        const email1 = decodedtoken.email1;
        const id = decodedtoken.id;
        var check_email = `select id, email1 from users where email1 = "${email1}"`;
        mysqlconnection.query(check_email, function (err, result) {
          if (result.length > 0) {
            const updtsql = `update users set password ="${secure_pass}" where email1 = "${result[0].email1}" and id = ${result[0].id}`;
            mysqlconnection.query(updtsql, async function (err, result) {
              if (err) throw err;
              const dt = await Passdsetconformationemail();
              sendEmails(email1, "Login Link From QIS✔", dt);
              res.status(200).json({
                message: "Password updated successfully",
              });
            });
          } else {
            res.status(400).json({ message: "Link Experied" });
          }
        });
      }
    } catch (err) {
      return res.status(400).send({ message: "Link Experied" });
    }
  },
};
