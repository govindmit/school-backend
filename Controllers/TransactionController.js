const util = require("util");
const mysqlconnection = require("../DB/db.config.connection");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
   createTransaction:async (req, res) => {
    try{
        console.log("body =>",req.body);
        const { totalAmount,paidAmount,transactionId,amexorderId,paymentMethod,idForPayment,creditNotesId} = req.body;
        if (!totalAmount || !paidAmount || !transactionId ||  !amexorderId || !paymentMethod || !idForPayment) {
           res.status(400).send({ message: "All field is required" });
           return
        }
        const firstTwoChars = idForPayment.slice(0, 2);
        if(firstTwoChars === "SO"){
            const salesOrderID = `select id from sales_order where transactionId = "${idForPayment}"`
            const salesOrderResponse = await query(salesOrderID);
        
                if(salesOrderResponse.length === 0){
                    res.status(201).send({message:"sales order transactionId not found !"});
                    return 
                }
            const transactionInsertQuery = `insert into transaction (sales_order_Id,paymentMethod ,transactionId,totalAmount,paidAmount,amex_order_Id,creditNotesId) values(${salesOrderResponse[0].id},"${paymentMethod}","${transactionId}",${totalAmount},${paidAmount},"${amexorderId}",${creditNotesId})`
            const insetTransatction = await query(transactionInsertQuery);
            res.status(200).send({message:`transaction created for sales order ${idForPayment}`})

        }
        if(firstTwoChars === "IN"){
            const invoiceIDQuery = `select id from invoices where invoiceId = "${idForPayment}"`
            const invoiceIDQueryResponse = await query(invoiceIDQuery);
            if(invoiceIDQueryResponse.length === 0){
                res.status(201).send({message:"invoiceId not found in invoices !"});
                return 
            }
            
            const transactionInsertQuery = `insert into transaction (invoiceId,paymentMethod ,transactionId,totalAmount,paidAmount,amex_order_Id,creditNotesId) values(${invoiceIDQueryResponse[0].id},"${paymentMethod}","${transactionId}",${totalAmount},${paidAmount},"${amexorderId}",${creditNotesId})`
            const insetTransatction = await query(transactionInsertQuery);
            res.status(200).send({message:`transaction created for the invoice ${idForPayment}`})
   
        }
        if(firstTwoChars === "CD"){
                console.log("firstTwoChars",firstTwoChars);
        }
        
    }catch(error){
        res.status(400).send({
            message:error.message
        });
    }

  },



};