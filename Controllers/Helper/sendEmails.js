const nodemailer = require("nodemailer");
const sendEmails = (emailTo, emailSub, emailMsg) => {
  //nodemailer start//
  async function main() {
    // create reusable transporter object using the default SMTP transport
    // let transporter = nodemailer.createTransport({
    //   // host: process.env.SMTP_HOST,
    //   // port: process.env.SMTP_PORT,
    //   // secure: false, // true for 465, false for other ports
    //   auth: {
    //     user: process.env.SMTP_AUTH_USER, // generated ethereal user
    //     pass: process.env.SMTP_AUTH_PASS, // generated ethereal password
    //   },
    // });
    //
    const nodemailer = require("nodemailer");

    const mailOptions = {
      from: process.env.SMTP_FROM_NAME_EMAIL, // sender address
      to: emailTo, // list of receivers
      subject: emailSub, // Subject line
      // text: emailMsg, // plain text body
      html: emailMsg, // html body
    };

    let dispatcher = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS,
      },
    });

    await dispatcher
      .sendMail(mailOptions)
      .then((info) => {
        console.log("Email sent: " + info.response);
        sentDataEmail = info.response;
      })
      .catch((error) => {
        sentDataEmail = "error";
      });
    return sentDataEmail;
  }
  main().catch(" smtp error ---- ", console.error);
};

module.exports = sendEmails;
