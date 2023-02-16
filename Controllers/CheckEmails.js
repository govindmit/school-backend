const ResetEmailFormat = require("../Controllers/Helper/ResetEmailTemp");
const sendEmails = require("../Controllers/Helper/sendEmails");
const jwt = require("jsonwebtoken");

module.exports = {
  CheckEmails: async (req, res) => {
    const resetPasswordtoken = jwt.sign(
      { email1: "govind.mangoitsolutions@gmail.com", id: "1" },
      process.env.JWT_SECRET_KEY
    );

    const dt = await ResetEmailFormat(resetPasswordtoken);
    sendEmails("sj2585097@gmail.com", "Testing Qatar School Emails ✔", dt);

    res.status(200).json({ message: "Email sent" });
  },
};
