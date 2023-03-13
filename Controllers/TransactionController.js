const util = require("util");
const mysqlconnection = require("../DB/db.config.connection");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
   createTransaction:async (req, res) => {
    try{
        console.log("body =>",req.body);
        const { totalAmount,paidAmount,transactionId,amexorderId,paymentMethod,idForPayment,creditNotesId,sales_order_Id} = req.body;
        if (!transactionId ||  !amexorderId || !paymentMethod || !idForPayment) {
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
            res.status(200).send({message:`transaction created for sales order ${idForPayment}`,insetTransatction:insetTransatction})

        }
        if(firstTwoChars === "IN"){
            const invoiceIDQuery = `select id from invoices where invoiceId = "${idForPayment}"`
            const invoiceIDQueryResponse = await query(invoiceIDQuery);
            if(invoiceIDQueryResponse.length === 0){
                res.status(201).send({message:"invoiceId not found in invoices !"});
                return 
            }
            let salesorder = sales_order_Id ? sales_order_Id :null ;
            var transactionInsertQuery ;
            if(salesorder){
                const queryForgetsalesOrderId = `select id from sales_order where transactionId="${salesorder}"`
                const sgaeIntacctSalesOrderId = await query(queryForgetsalesOrderId);
                console.log("sales order id ",sgaeIntacctSalesOrderId);
                salesorder = sgaeIntacctSalesOrderId[0].id
                 transactionInsertQuery = `insert into transaction (invoiceId,sales_order_Id,paymentMethod ,transactionId,totalAmount,paidAmount,amex_order_Id,creditNotesId) values(${invoiceIDQueryResponse[0].id},"${salesorder}","${paymentMethod}","${transactionId}",${totalAmount},${paidAmount},"${amexorderId}",${creditNotesId})`

            }else{
                 transactionInsertQuery = `insert into transaction (invoiceId,paymentMethod ,transactionId,totalAmount,paidAmount,amex_order_Id,creditNotesId) values(${invoiceIDQueryResponse[0].id},"${paymentMethod}","${transactionId}",${totalAmount},${paidAmount},"${amexorderId}",${creditNotesId})`

            }
            console.log("salesorder =>",transactionInsertQuery);
            // const transactionInsertQuery = `insert into transaction (invoiceId,sales_order_Id,paymentMethod ,transactionId,totalAmount,paidAmount,amex_order_Id,creditNotesId) values(${invoiceIDQueryResponse[0].id},"${salesorder}","${paymentMethod}","${transactionId}",${totalAmount},${paidAmount},"${amexorderId}",${creditNotesId})`
            const insetTransatction = await query(transactionInsertQuery);
            const referenceNumber = generateRefrenceNumber(insetTransatction.insertId)
            const updateRefQuery = `update transaction set refrenceId = "${referenceNumber}" where id="${insetTransatction.insertId}"`
            const updateTransaction = await query(updateRefQuery);
            res.status(200).send({message:`transaction created for the invoice ${idForPayment}`,insetTransatction:insetTransatction})
   
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
}

generateRefrenceNumber = (DBTransactionId)=>{
    let gId =`${DBTransactionId.toString()}`; ;    
    let tempRef = "RCT-000000000";
    let refrenceNumber = tempRef.slice(0,-gId.length);
    let finalGeneratedRefrenceNumber = refrenceNumber+gId ;
    console.log("finalGeneratedRefrenceNumber =>",finalGeneratedRefrenceNumber);
    return finalGeneratedRefrenceNumber
  };