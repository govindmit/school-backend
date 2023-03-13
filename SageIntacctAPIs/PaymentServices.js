const {client,IA} = require('./IntacctClient')
module.exports = {
    createpaymentAndApplyOnARInvoice : async(req,res)=>{
        try{
            const body = req.body;
            const {customerId,amount,ARinvoiceRecordNumber,referenceNumber,ARpaymentMethod} = body;
            if(!customerId || !amount || !ARinvoiceRecordNumber || !referenceNumber || !ARpaymentMethod){
                res.status(201).send({message:"fileds are missing"});
                return ;
            }
            let objectDate = new Date();
            let CreateDate = objectDate.getMonth() +  1 +  "/" + objectDate.getDate() +"/" + objectDate.getFullYear();
            // const record = new IA.Functions.AccountsReceivable.ArPaymentCreate();
            // record.customerId = "10381";
            // record.transactionPaymentAmount = 500.00;
            // record.receivedDate = new Date(CreateDate);
            // record.paymentMethod = "EFT";
            // record.bankAccountId = "100_SVB";
            // record.overpaymentLocationId = "100";
            // record.referenceNumber = "123456789";
            // const applyToRecordA = new IA.Functions.AccountsReceivable.ArPaymentItem();
            // applyToRecordA.applyToRecordId = 1352;
            // applyToRecordA.amountToApply = 75.00;

            const record = new IA.Functions.AccountsReceivable.ArPaymentCreate();
            record.customerId = customerId;
            record.transactionPaymentAmount = amount;
            record.receivedDate = new Date(CreateDate);
            record.paymentMethod = ARpaymentMethod;
            record.bankAccountId = "100_SVB";
            record.overpaymentLocationId = "100";
            record.referenceNumber = referenceNumber;
            const applyToRecordA = new IA.Functions.AccountsReceivable.ArPaymentItem();
            applyToRecordA.applyToRecordId = ARinvoiceRecordNumber;
            applyToRecordA.amountToApply = amount;
            record.applyToTransactions = [
                applyToRecordA
            ];
            const response = await client.execute(record).then(result =>{
                console.log("result =>",result);
                res.send(result)

            }).catch(error=>{
               
                res.send(error)
            });
            // const result = response.getResult();
            // let json_data = result.data;
            // res.status(200).send(json_data);
        }catch(error){
            res.status(400).send({message:error.message})
        }
    }
}