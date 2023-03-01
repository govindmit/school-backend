const util = require("util");
const mysqlconnection = require("../DB/db.config.connection");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
   calculateDataForDashboard:async (req, res) => {
    try{
        // total customer
        const queryForTotalCustomerCount = `SELECT count(id) as totalCustomer FROM users`;
        const queryForTotalCustomerCountReqponse = await query(queryForTotalCustomerCount);
        const totalCustomer = queryForTotalCustomerCountReqponse[0].totalCustomer
       
        // leates customers
        const queryForLeatestCustomer = `select * from users ORDER BY createdAt DESC LIMIT 7`
        const queryForLeatestCustomerCountReqponse = await query(queryForLeatestCustomer);
        const leatestCustomer = queryForLeatestCustomerCountReqponse;
       
        // total earning
        const queryForSumAmountofInvoice = `select sum(amount) as invoiceSumAmount from invoices where status="paid"`
        const queryForSumAmountofSalesOrder = `SELECT Sum(amount) as salesSumAmount FROM sales_order where status="0"`
        const queryForSumAmountofInvoiceResponse = await query(queryForSumAmountofInvoice);
        const invoiceSumOfAmount = queryForSumAmountofInvoiceResponse[0].invoiceSumAmount
        const queryForSumAmountofSalesOrderResponse = await query(queryForSumAmountofSalesOrder);
        const salesOrderSumOfAmount = queryForSumAmountofSalesOrderResponse[0].salesSumAmount
        const totalEarning  = parseInt(invoiceSumOfAmount+salesOrderSumOfAmount);

        // total credit amount

        const queryForTotalCreditAmount = `select sum(amount) as creditAmount from creditNotes where amountMode = 1 `
        const queryForTotalCreditAmountResponse = await query(queryForTotalCreditAmount);
        const totalCredit = queryForTotalCreditAmountResponse[0].creditAmount

        // total pending invoice and there amount
        const queryForTotalPendingInvoiceAndAmount = `select count(id) as count, sum(amount) as sumamount from invoices where status="pending"`
        const queryForTotalPendingInvoiceAndAmountResponse = await query(queryForTotalPendingInvoiceAndAmount);
        const pendingInvoice = queryForTotalPendingInvoiceAndAmountResponse[0].count
        const pendingInvoiceAmount = queryForTotalPendingInvoiceAndAmountResponse[0].sumamount
      
        // leatest credit request 
        const queryForLeatestcreditRequset = `SELECT cd.id as creditNoteId ,cd.amount as creditAmount,cd.customerId,cd.creditRequestId,cr.id as creditRequestId,cr.amount as requestedAmount,cr.createdAt,u.id,u.name FROM creditNotes as cd, creditRequests as cr, users as u
        WHERE cd.creditRequestId = cr.id AND 
        cd.customerId = u.id order by createdAt LIMIT 7`;
        const queryForLeatestcreditRequsetResponse = await query(queryForLeatestcreditRequset);
        const creditRequestData = queryForLeatestcreditRequsetResponse
         res.status(200).send({
            totalCustomer,
            leatestCustomer,
            totalEarning,
            totalCredit,
            pendingInvoice,
            pendingInvoiceAmount,
            creditRequestData
         })
    }catch(error){
        res.status(400).send({
            message:error.message
        });
    }

  },



};