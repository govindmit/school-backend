const nodemailer = require("nodemailer");
const sendEmails = (emailTo, emailSub, emailMsg) => {
  //nodemailer start//
  async function main() {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "govind.mangoitsolutions@gmail.com", // generated ethereal user
        pass: "cI1J58ZNPKRxadQz", // generated ethereal password
      },
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.SMTP_FROM_NAME_EMAIL, // sender address
      to: emailTo, // list of receivers
      subject: emailSub, // Subject line
      text: emailMsg, // plain text body
      html: emailMsg, // html body
    });
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
  main().catch(" smtp error ---- ", console.error);
};

module.exports = sendEmails;
