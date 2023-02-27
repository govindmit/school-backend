const sendEmails = require("../Controllers/Helper/sendEmails");
const jwt = require("jsonwebtoken");
const ResetEmailFormat = require("../Controllers/Helper/templates/ResetEmailTemp");
module.exports = {
  CheckEmails: async (req, res) => {
    // const resetPasswordtoken = jwt.sign(
    //   { email1: "govind.mangoitsolutions@gmail.com", id: "1" },
    //   process.env.JWT_SECRET_KEY
    // );
    // const dt = await ResetEmailFormat(resetPasswordtoken);
    // sendEmails("sj2585097@gmail.com", "Testing Qatar School Emails ✔", dt);
    // res.status(200).json({ message: "Email sent" });

    const nodemailer = require("nodemailer");

    let transporter = nodemailer.createTransport({
      host: "smtp-relay.sendinblue.com",
      port: "587",
      auth: {
        user: "govind.mangoitsolutions@gmail.com",
        pass: "cI1J58ZNPKRxadQz",
      },
    });

    let mailOptions = {
      from: "govind.mangoitsolutions@gmail.com",
      to: "devendramangoit@gmail.com",
      subject: "email subject",
      text: "email text body",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json({ message: "Email sent" });
      }
    });
  },
};
