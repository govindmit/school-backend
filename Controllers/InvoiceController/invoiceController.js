const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const nodemailer = require("nodemailer");
const sendmail = require("sendmail")();
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
  CreateInvoice: async (req, res) => {
    const body = req.body;
    var customerId = req.body.customerId;
    var amount = req.body.amount;
    var itemId = req.body.itemId;
    var status = req.body.status;
    var createdDate = req.body.createdDate;
    var createdBy = req.body.createdBy;
    var invoiceDate = req.body.invoiceDate;
    var isDeleted = req.body.isDeleted;
    var deletedBy = req.body.deletedBy;
    var deletedDate = req.body.deletedDate;

    if (
      !customerId ||
      !amount ||
      !itemId ||
      !status ||
      !createdDate ||
      !invoiceDate
    ) {
      return res.status(400).send({ message: "All field is required" });
    }

    var sql = `INSERT INTO invoices (customerId,amount,itemId,status,createdDate,createdBy,invoiceDate) VALUES('${customerId}','${amount}','${itemId}','${status}','${createdDate}','${createdBy}','${invoiceDate}')`;

    const invoice = await query(sql);
    var sqls = `UPDATE invoices SET  invoiceId='INV000${invoice.insertId}' WHERE id = ${invoice.insertId}`;
    const updateInvoice = await query(sqls);
    let sqld = `SELECT users.name,items.name as itemname,items.description,invoices.amount,invoices.status,invoices.invoiceId,invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices INNER JOIN users ON invoices.customerId = users.id INNER JOIN items ON invoices.itemId = items.id WHERE invoices.id = ${invoice.insertId}`;
    const Getinvoice = await query(sqld);
    console.log(Getinvoice, "Getinvoice");
    if (invoice) {
      sendmail(
        {
          from: process.env.emailFrom,
          to: process.env.emailTo,
          subject: "test sendmail",
          html: `<style type="text/css" rel="stylesheet" media="all">
              /* Base ------------------------------ */

              @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
              body {
                width: 100% !important;
                height: 100%;
                margin: 0;
                -webkit-text-size-adjust: none;
              }

              a {
                color: #3869D4;
              }

              a img {
                border: none;
              }

              td {
                word-break: break-word;
              }

              .preheader {
                display: none !important;
                visibility: hidden;
                mso-hide: all;
                font-size: 1px;
                line-height: 1px;
                max-height: 0;
                max-width: 0;
                opacity: 0;
                overflow: hidden;
              }
              /* Type ------------------------------ */

              body,
              td,
              th {
                font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
              }

              h1 {
                margin-top: 0;
                color: #333333;
                font-size: 22px;
                font-weight: bold;
                text-align: left;
              }

              h2 {
                margin-top: 0;
                color: #333333;
                font-size: 16px;
                font-weight: bold;
                text-align: left;
              }

              h3 {
                margin-top: 0;
                color: #333333;
                font-size: 14px;
                font-weight: bold;
                text-align: left;
              }

              td,
              th {
                font-size: 16px;
              }

              p,
              ul,
              ol,
              blockquote {
                margin: .4em 0 1.1875em;
                font-size: 16px;
                line-height: 1.625;
              }

              p.sub {
                font-size: 13px;
              }
              /* Utilities ------------------------------ */

              .align-right {
                text-align: right;
              }

              .align-left {
                text-align: left;
              }

              .align-center {
                text-align: center;
              }

              .u-margin-bottom-none {
                margin-bottom: 0;
              }
              /* Buttons ------------------------------ */

              .button {
                background-color: #3869D4;
                border-top: 10px solid #3869D4;
                border-right: 18px solid #3869D4;
                border-bottom: 10px solid #3869D4;
                border-left: 18px solid #3869D4;
                display: inline-block;
                color: #FFF;
                text-decoration: none;
                border-radius: 3px;
                box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
                -webkit-text-size-adjust: none;
                box-sizing: border-box;
              }

              .button--green {
                background-color: #22BC66;
                border-top: 10px solid #22BC66;
                border-right: 18px solid #22BC66;
                border-bottom: 10px solid #22BC66;
                border-left: 18px solid #22BC66;
              }

              .button--red {
                background-color: #FF6136;
                border-top: 10px solid #FF6136;
                border-right: 18px solid #FF6136;
                border-bottom: 10px solid #FF6136;
                border-left: 18px solid #FF6136;
              }

              @media only screen and (max-width: 500px) {
                .button {
                  width: 100% !important;
                  text-align: center !important;
                }
              }
              /* Attribute list ------------------------------ */

              .attributes {
                margin: 0 0 21px;
              }

              .attributes_content {
                background-color: #F4F4F7;
                padding: 16px;
              }

              .attributes_item {
                padding: 0;
              }
              /* Related Items ------------------------------ */

              .related {
                width: 100%;
                margin: 0;
                padding: 25px 0 0 0;
                -premailer-width: 100%;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
              }

              .related_item {
                padding: 10px 0;
                color: #CBCCCF;
                font-size: 15px;
                line-height: 18px;
              }

              .related_item-title {
                display: block;
                margin: .5em 0 0;
              }

              .related_item-thumb {
                display: block;
                padding-bottom: 10px;
              }

              .related_heading {
                border-top: 1px solid #CBCCCF;
                text-align: center;
                padding: 25px 0 10px;
              }
              /* Discount Code ------------------------------ */

              .discount {
                width: 100%;
                margin: 0;
                padding: 24px;
                -premailer-width: 100%;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
                background-color: #F4F4F7;
                border: 2px dashed #CBCCCF;
              }

              .discount_heading {
                text-align: center;
              }

              .discount_body {
                text-align: center;
                font-size: 15px;
              }
              /* Social Icons ------------------------------ */

              .social {
                width: auto;
              }

              .social td {
                padding: 0;
                width: auto;
              }

              .social_icon {
                height: 20px;
                margin: 0 8px 10px 8px;
                padding: 0;
              }
              /* Data table ------------------------------ */

              .purchase {
                width: 100%;
                margin: 0;
                padding: 35px 0;
                -premailer-width: 100%;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
              }

              .purchase_content {
                width: 100%;
                margin: 0;
                padding: 25px 0 0 0;
                -premailer-width: 100%;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
              }

              .purchase_item {
                padding: 10px 0;
                color: #51545E;
                font-size: 15px;
                line-height: 18px;
              }

              .purchase_heading {
                padding-bottom: 8px;
                border-bottom: 1px solid #EAEAEC;
              }

              .purchase_heading p {
                margin: 0;
                color: #85878E;
                font-size: 12px;
              }

              .purchase_footer {
                padding-top: 15px;
                border-top: 1px solid #EAEAEC;
              }

              .purchase_total {
                margin: 0;
                text-align: right;
                font-weight: bold;
                color: #333333;
              }

              .purchase_total--label {
                padding: 0 15px 0 0;
              }

              body {
                background-color: #F2F4F6;
                color: #51545E;
              }

              p {
                color: #51545E;
              }

              .email-wrapper {
                width: 100%;
                margin: 0;
                padding: 0;
                -premailer-width: 100%;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
                background-color: #F2F4F6;
              }

              .email-content {
                width: 100%;
                margin: 0;
                padding: 0;
                -premailer-width: 100%;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
              }
              /* Masthead ----------------------- */

              .email-masthead {
                padding: 25px 0;
                text-align: center;
              }

              .email-masthead_logo {
                width: 94px;
              }

              .email-masthead_name {
                font-size: 16px;
                font-weight: bold;
                color: #A8AAAF;
                text-decoration: none;
                text-shadow: 0 1px 0 white;
              }
              /* Body ------------------------------ */

              .email-body {
                width: 100%;
                margin: 0;
                padding: 0;
                -premailer-width: 100%;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
              }

              .email-body_inner {
                width: 570px;
                margin: 0 auto;
                padding: 0;
                -premailer-width: 570px;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
                background-color: #FFFFFF;
              }

              .email-footer {
                width: 570px;
                margin: 0 auto;
                padding: 0;
                -premailer-width: 570px;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
                text-align: center;
              }

              .email-footer p {
                color: #A8AAAF;
              }

              .body-action {
                width: 100%;
                margin: 30px auto;
                padding: 0;
                -premailer-width: 100%;
                -premailer-cellpadding: 0;
                -premailer-cellspacing: 0;
                text-align: center;
              }

              .body-sub {
                margin-top: 25px;
                padding-top: 25px;
                border-top: 1px solid #EAEAEC;
              }

              .content-cell {
                padding: 45px;
              }
              /*Media Queries ------------------------------ */

              @media only screen and (max-width: 600px) {
                .email-body_inner,
                .email-footer {
                  width: 100% !important;
                }
              }

              @media (prefers-color-scheme: dark) {
                body,
                .email-body,
                .email-body_inner,
                .email-content,
                .email-wrapper,
                .email-masthead,
                .email-footer {
                  background-color: #333333 !important;
                  color: #FFF !important;
                }
                p,
                ul,
                ol,
                blockquote,
                h1,
                h2,
                h3,
                span,
                .purchase_item {
                  color: #FFF !important;
                }
                .attributes_content,
                .discount {
                  background-color: #222 !important;
                }
                .email-masthead_name {
                  text-shadow: none !important;
                }
              }

              :root {
                color-scheme: light dark;
                supported-color-schemes: light dark;
              }
              </style>
              <!--[if mso]>
              <style type="text/css">
                .f-fallback  {
                  font-family: Arial, sans-serif;
                }
              </style>
            <![endif]-->
            </head>
            <body>
              <span class="preheader">This is an invoice for your purchase on {{ purchase_date }}. Please submit payment by {{ due_date }}</span>
              <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center">
                    <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td class="email-masthead">
                          <a href="https://example.com" class="f-fallback email-masthead_name">
                          ${Getinvoice[0].itemname}
                        </a>
                        </td>
                      </tr>
                      <!-- Email Body -->
                      <tr>
                        <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                          <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                            <!-- Body content -->
                            <tr>
                              <td class="content-cell">
                                <div class="f-fallback">
                                  <h1>Hi ${Getinvoice[0].name}
                                  </h1>
                                  <p>Thanks for using ${Getinvoice[0].itemname}. This is an invoice for your recent purchase.</p>
                                  <table class="attributes" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                      <td class="attributes_content">
                                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                          <tr>
                                            <td class="attributes_item">
                                              <span class="f-fallback">
                        <strong>Amount Due:</strong> ${Getinvoice[0].amount}
                      </span>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td class="attributes_item">
                                              <span class="f-fallback">
                        <strong>Due By:</strong> ${Getinvoice[0].invoiceDate}
                      </span>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                  <!-- Action -->
                                  <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                      <td align="center">
                                        <!-- Border based button
                     https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                          <tr>
                                            <td align="center">
                                              <a href="{{action_url}}" class="f-fallback button button--green" target="_blank">Pay Invoice</a>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                  <table class="purchase" width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td>
                                        <h3>${Getinvoice[0].invoiceId}</h3>
                                      </td>
                                      <td>
                                        <h3 class="align-right">${Getinvoice[0].createdDate}</h3>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colspan="2">
                                        <table class="purchase_content" width="100%" cellpadding="0" cellspacing="0">
                                          <tr>
                                            <th class="purchase_heading" align="left">
                                              <p class="f-fallback">Description</p>
                                            </th>
                                            <th class="purchase_heading" align="right">
                                              <p class="f-fallback">Amount</p>
                                            </th>
                                          </tr>
                                          <tr>
                                            <td width="80%" class="purchase_item"><span class="f-fallback">${Getinvoice[0].description}</span></td>
                                            <td class="align-right" width="20%" class="purchase_item"><span class="f-fallback">${Getinvoice[0].amount}</span></td>
                                          </tr>
                                          <tr>
                                            <td width="80%" class="purchase_footer" valign="middle">
                                              <p class="f-fallback purchase_total purchase_total--label">Total</p>
                                            </td>
                                            <td width="20%" class="purchase_footer" valign="middle">
                                              <p class="f-fallback purchase_total">${Getinvoice[0].amount}</p>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                  <p>If you have any questions about this invoice, simply reply to this email or reach out to our <a href="{{support_url}}">support team</a> for help.</p>
                                  <p>Cheers,
                                    <br>The [Product Name] team</p>
                                  <!-- Sub copy -->
                                  <table class="body-sub" role="presentation">
                                    <tr>
                                      <td>
                                        <p class="f-fallback sub">If you’re having trouble with the button above, copy and paste the URL below into your web browser.</p>
                                        <p class="f-fallback sub">{{action_url}}</p>
                                      </td>
                                    </tr>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td class="content-cell" align="center">
                                <p class="f-fallback sub align-center">
                                  [Company Name, LLC]
                                  <br>1234 Street Rd.
                                  <br>Suite 1234
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>`,
        },
        function (err, reply) {
          // if (err) {
          //   res
          //     .status(400)
          //     .json({ message: "something went wrong to send mail" });
          // }
        }
      );
      res
        .status(200)
        .json({ message: "Invoice created successfully", data: invoice });
    } else {
      res.status(400).json({ message: "something went wrong" });
    }
  },

  getInvoice: async (req, res) => {
    var invoiceData = [];
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var customer = "";
    var status = "";
    var date = "";
    var amount = "";
    var order = "";
    var isdeleted = "";
    if (req.body.status == "paid") {
      status = `WHERE invoices.status = '${req.body.status}'`;
    } else if (req.body.status == "pending") {
      status = `WHERE invoices.status = '${req.body.status}'`;
    } else {
      var status = "";
    }
    if (startDate && endDate) {
      date = `WHERE invoices.invoiceDate BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (startDate && endDate && req.body.status) {
      date = `AND invoices.invoiceDate BETWEEN '${startDate}' AND '${endDate}'`;
    }

    if (req.body.amount) {
      amount = `AND invoices.amount = ${req.body.amount}`;
    }
    if (req.body.customer) {
      customer = `AND invoices.customerId IN (${req.body.customer})`;
    }
    if (req.body.order) {
      order = `ORDER BY id ${req.body.order}`;
    }
    if (
      startDate ||
      endDate ||
      req.body.status ||
      req.body.amount ||
      req.body.customer ||
      req.body.order
    ) {
      isdeleted = `AND invoices.isDeleted = 0`;
    } else {
      isdeleted = `WHERE invoices.isDeleted = 0`;
    }

    if (!req.params.id) {
      let sql = `SELECT users.name,items.name as itemname,items.description,invoices.amount,invoices.customerId,invoices.status,invoices.id,invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices INNER JOIN users ON invoices.customerId = users.id INNER JOIN items ON invoices.itemId = items.id ${status} ${date} ${amount} ${customer} ${isdeleted} ${order}`;
      const invoice = await query(sql);
      // for (let row of invoice) {
      //   let students = `SELECT * from students WHERE id = ${row.student_id}`;
      //   const studentRecords = await query(students);

      //   invoiceData.push({
      //     ...row,
      //     student: studentRecords ? studentRecords[0] : null,
      //   });
      // }

      res.status(200).json({ data: invoice });
    } else {
      let sql = `SELECT users.name,items.name as itemname,item.description,invoices.amount,invoices.id,invoices.item,invoices.invoice_pay_date_time,invoices.generate_date_time FROM invoices INNER JOIN users ON invoices.user_id = users.id WHERE invoices.id = ${req.params.id}`;
      const invoice = await query(sql);

      for (let row of invoice) {
        let students = `SELECT * from students WHERE id = ${row.student_id}`;
        const studentRecords = await query(students);

        invoiceData.push({
          ...row,
          student: studentRecords ? studentRecords[0] : null,
        });
      }
      res.status(200).json({ data: invoiceData });
    }
  },
  updateInvoice: async (req, res) => {
    let sqls = `SELECT invoices.amount,invoices.customerId,invoices.createdBy,invoices.id,invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices WHERE invoices.id = ${req.params.id}`;
    const invoice = await query(sqls);

    const { user_id, amount, itemId, createdDate, invoiceDate, createdBy } =
      req.body;

    let customerId = user_id ? user_id : invoice[0].customerId;
    let amounts = amount ? amount : invoice[0].amount;
    let createdDates = createdDate ? createdDate : invoice[0].createdDate;
    let invoiceDates = invoiceDate ? invoiceDate : invoice[0].invoiceDate;
    let itemIds = itemId ? itemId : invoice[0].itemId;
    let createdBys = createdBy ? createdBy : invoice[0].createdBy;
    let status = "paid";

    var sql = `UPDATE invoices SET customerId = '${customerId}', amount='${amounts}',itemId ='${itemIds}', createdDate='${createdDates}',invoiceDate='${invoiceDates}',createdBy='${createdBys}',status='${status}' WHERE id = ${req.params.id}`;
    const invoices = await query(sql);

    res.send(invoices);
  },

  DeleteInvoice: async (req, res) => {
    const { userId } = req.body;
    const date = new Date();

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    // This arrangement can be altered based on how we want the date's format to appear.
    let currentDate = `${day}/${month}/${year}`;
    if (!userId) {
      return res.status(400).send({ message: "userId is required" });
    }

    var sqls = `UPDATE invoices SET isDeleted='1',deletedBy='${userId}',deletedDate='${currentDate}' WHERE id = ${req.params.id}`;
    const updateInvoice = await query(sqls);
    res.status(200).json({ message: "Deleted Successfully" });
  },

  SendInvoiceEmail: async (req, res) => {
    let sqld = `SELECT users.firstName,users.lastName,items.description,items.name,invoices.amount,invoices.status,invoices.invoiceId, invoices.createdDate,invoices.invoiceDate,invoices.itemId FROM invoices INNER JOIN users ON invoices.customerId = users.id INNER JOIN items ON invoices.itemId = items.id WHERE invoices.id = ${req.params.id}`;
    const Getinvoice = await query(sqld);

    sendmail(
      {
        from: process.env.emailFrom,
        to: process.env.emailTo,
        subject: "test sendmail",
        html: `<style type="text/css" rel="stylesheet" media="all">
            /* Base ------------------------------ */

            @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
            body {
              width: 100% !important;
              height: 100%;
              margin: 0;
              -webkit-text-size-adjust: none;
            }

            a {
              color: #3869D4;
            }

            a img {
              border: none;
            }

            td {
              word-break: break-word;
            }

            .preheader {
              display: none !important;
              visibility: hidden;
              mso-hide: all;
              font-size: 1px;
              line-height: 1px;
              max-height: 0;
              max-width: 0;
              opacity: 0;
              overflow: hidden;
            }
            /* Type ------------------------------ */

            body,
            td,
            th {
              font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
            }

            h1 {
              margin-top: 0;
              color: #333333;
              font-size: 22px;
              font-weight: bold;
              text-align: left;
            }

            h2 {
              margin-top: 0;
              color: #333333;
              font-size: 16px;
              font-weight: bold;
              text-align: left;
            }

            h3 {
              margin-top: 0;
              color: #333333;
              font-size: 14px;
              font-weight: bold;
              text-align: left;
            }

            td,
            th {
              font-size: 16px;
            }

            p,
            ul,
            ol,
            blockquote {
              margin: .4em 0 1.1875em;
              font-size: 16px;
              line-height: 1.625;
            }

            p.sub {
              font-size: 13px;
            }
            /* Utilities ------------------------------ */

            .align-right {
              text-align: right;
            }

            .align-left {
              text-align: left;
            }

            .align-center {
              text-align: center;
            }

            .u-margin-bottom-none {
              margin-bottom: 0;
            }
            /* Buttons ------------------------------ */

            .button {
              background-color: #3869D4;
              border-top: 10px solid #3869D4;
              border-right: 18px solid #3869D4;
              border-bottom: 10px solid #3869D4;
              border-left: 18px solid #3869D4;
              display: inline-block;
              color: #FFF;
              text-decoration: none;
              border-radius: 3px;
              box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
              -webkit-text-size-adjust: none;
              box-sizing: border-box;
            }

            .button--green {
              background-color: #22BC66;
              border-top: 10px solid #22BC66;
              border-right: 18px solid #22BC66;
              border-bottom: 10px solid #22BC66;
              border-left: 18px solid #22BC66;
            }

            .button--red {
              background-color: #FF6136;
              border-top: 10px solid #FF6136;
              border-right: 18px solid #FF6136;
              border-bottom: 10px solid #FF6136;
              border-left: 18px solid #FF6136;
            }

            @media only screen and (max-width: 500px) {
              .button {
                width: 100% !important;
                text-align: center !important;
              }
            }
            /* Attribute list ------------------------------ */

            .attributes {
              margin: 0 0 21px;
            }

            .attributes_content {
              background-color: #F4F4F7;
              padding: 16px;
            }

            .attributes_item {
              padding: 0;
            }
            /* Related Items ------------------------------ */

            .related {
              width: 100%;
              margin: 0;
              padding: 25px 0 0 0;
              -premailer-width: 100%;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
            }

            .related_item {
              padding: 10px 0;
              color: #CBCCCF;
              font-size: 15px;
              line-height: 18px;
            }

            .related_item-title {
              display: block;
              margin: .5em 0 0;
            }

            .related_item-thumb {
              display: block;
              padding-bottom: 10px;
            }

            .related_heading {
              border-top: 1px solid #CBCCCF;
              text-align: center;
              padding: 25px 0 10px;
            }
            /* Discount Code ------------------------------ */

            .discount {
              width: 100%;
              margin: 0;
              padding: 24px;
              -premailer-width: 100%;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
              background-color: #F4F4F7;
              border: 2px dashed #CBCCCF;
            }

            .discount_heading {
              text-align: center;
            }

            .discount_body {
              text-align: center;
              font-size: 15px;
            }
            /* Social Icons ------------------------------ */

            .social {
              width: auto;
            }

            .social td {
              padding: 0;
              width: auto;
            }

            .social_icon {
              height: 20px;
              margin: 0 8px 10px 8px;
              padding: 0;
            }
            /* Data table ------------------------------ */

            .purchase {
              width: 100%;
              margin: 0;
              padding: 35px 0;
              -premailer-width: 100%;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
            }

            .purchase_content {
              width: 100%;
              margin: 0;
              padding: 25px 0 0 0;
              -premailer-width: 100%;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
            }

            .purchase_item {
              padding: 10px 0;
              color: #51545E;
              font-size: 15px;
              line-height: 18px;
            }

            .purchase_heading {
              padding-bottom: 8px;
              border-bottom: 1px solid #EAEAEC;
            }

            .purchase_heading p {
              margin: 0;
              color: #85878E;
              font-size: 12px;
            }

            .purchase_footer {
              padding-top: 15px;
              border-top: 1px solid #EAEAEC;
            }

            .purchase_total {
              margin: 0;
              text-align: right;
              font-weight: bold;
              color: #333333;
            }

            .purchase_total--label {
              padding: 0 15px 0 0;
            }

            body {
              background-color: #F2F4F6;
              color: #51545E;
            }

            p {
              color: #51545E;
            }

            .email-wrapper {
              width: 100%;
              margin: 0;
              padding: 0;
              -premailer-width: 100%;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
              background-color: #F2F4F6;
            }

            .email-content {
              width: 100%;
              margin: 0;
              padding: 0;
              -premailer-width: 100%;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
            }
            /* Masthead ----------------------- */

            .email-masthead {
              padding: 25px 0;
              text-align: center;
            }

            .email-masthead_logo {
              width: 94px;
            }

            .email-masthead_name {
              font-size: 16px;
              font-weight: bold;
              color: #A8AAAF;
              text-decoration: none;
              text-shadow: 0 1px 0 white;
            }
            /* Body ------------------------------ */

            .email-body {
              width: 100%;
              margin: 0;
              padding: 0;
              -premailer-width: 100%;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
            }

            .email-body_inner {
              width: 570px;
              margin: 0 auto;
              padding: 0;
              -premailer-width: 570px;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
              background-color: #FFFFFF;
            }

            .email-footer {
              width: 570px;
              margin: 0 auto;
              padding: 0;
              -premailer-width: 570px;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
              text-align: center;
            }

            .email-footer p {
              color: #A8AAAF;
            }

            .body-action {
              width: 100%;
              margin: 30px auto;
              padding: 0;
              -premailer-width: 100%;
              -premailer-cellpadding: 0;
              -premailer-cellspacing: 0;
              text-align: center;
            }

            .body-sub {
              margin-top: 25px;
              padding-top: 25px;
              border-top: 1px solid #EAEAEC;
            }

            .content-cell {
              padding: 45px;
            }
            /*Media Queries ------------------------------ */

            @media only screen and (max-width: 600px) {
              .email-body_inner,
              .email-footer {
                width: 100% !important;
              }
            }

            @media (prefers-color-scheme: dark) {
              body,
              .email-body,
              .email-body_inner,
              .email-content,
              .email-wrapper,
              .email-masthead,
              .email-footer {
                background-color: #333333 !important;
                color: #FFF !important;
              }
              p,
              ul,
              ol,
              blockquote,
              h1,
              h2,
              h3,
              span,
              .purchase_item {
                color: #FFF !important;
              }
              .attributes_content,
              .discount {
                background-color: #222 !important;
              }
              .email-masthead_name {
                text-shadow: none !important;
              }
            }

            :root {
              color-scheme: light dark;
              supported-color-schemes: light dark;
            }
            </style>
            <!--[if mso]>
            <style type="text/css">
              .f-fallback  {
                font-family: Arial, sans-serif;
              }
            </style>
          <![endif]-->
          </head>
          <body>
            <span class="preheader">This is an invoice for your purchase on {{ purchase_date }}. Please submit payment by {{ due_date }}</span>
            <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td align="center">
                  <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td class="email-masthead">
                        <a href="https://example.com" class="f-fallback email-masthead_name">
                        ${Getinvoice[0].name}
                      </a>
                      </td>
                    </tr>
                    <!-- Email Body -->
                    <tr>
                      <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                        <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                          <!-- Body content -->
                          <tr>
                            <td class="content-cell">
                              <div class="f-fallback">
                                <h1>Hi ${Getinvoice[0].firstName} &nbsp;${Getinvoice[0].lastName}
                                </h1>
                                <p>Thanks for using ${Getinvoice[0].name}. This is an invoice for your recent purchase.</p>
                                <table class="attributes" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td class="attributes_content">
                                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                        <tr>
                                          <td class="attributes_item">
                                            <span class="f-fallback">
                      <strong>Amount Due:</strong> ${Getinvoice[0].amount}
                    </span>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="attributes_item">
                                            <span class="f-fallback">
                      <strong>Due By:</strong> ${Getinvoice[0].invoiceDate}
                    </span>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                                <!-- Action -->
                                <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td align="center">
                                      <!-- Border based button
                   https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
                                      <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                        <tr>
                                          <td align="center">
                                            <a href="{{action_url}}" class="f-fallback button button--green" target="_blank">Pay Invoice</a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                                <table class="purchase" width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td>
                                      <h3>${Getinvoice[0].invoiceId}</h3>
                                    </td>
                                    <td>
                                      <h3 class="align-right">${Getinvoice[0].createdDate}</h3>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colspan="2">
                                      <table class="purchase_content" width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                          <th class="purchase_heading" align="left">
                                            <p class="f-fallback">Description</p>
                                          </th>
                                          <th class="purchase_heading" align="right">
                                            <p class="f-fallback">Amount</p>
                                          </th>
                                        </tr>
                                        <tr>
                                          <td width="80%" class="purchase_item"><span class="f-fallback">${Getinvoice[0].description}</span></td>
                                          <td class="align-right" width="20%" class="purchase_item"><span class="f-fallback">${Getinvoice[0].amount}</span></td>
                                        </tr>
                                        <tr>
                                          <td width="80%" class="purchase_footer" valign="middle">
                                            <p class="f-fallback purchase_total purchase_total--label">Total</p>
                                          </td>
                                          <td width="20%" class="purchase_footer" valign="middle">
                                            <p class="f-fallback purchase_total">${Getinvoice[0].amount}</p>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                                <p>If you have any questions about this invoice, simply reply to this email or reach out to our <a href="{{support_url}}">support team</a> for help.</p>
                                <p>Cheers,
                                  <br>The [Product Name] team</p>
                                <!-- Sub copy -->
                                <table class="body-sub" role="presentation">
                                  <tr>
                                    <td>
                                      <p class="f-fallback sub">If you’re having trouble with the button above, copy and paste the URL below into your web browser.</p>
                                      <p class="f-fallback sub">{{action_url}}</p>
                                    </td>
                                  </tr>
                                </table>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                            <td class="content-cell" align="center">
                              <p class="f-fallback sub align-center">
                                [Company Name, LLC]
                                <br>1234 Street Rd.
                                <br>Suite 1234
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>`,
      },
      function (err, reply) {
        if (!err) {
          res.status(200).json({ message: "send invoice email successfully" });
        }
      }
    );
  },
};
