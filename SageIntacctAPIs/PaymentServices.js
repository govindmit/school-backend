const {client,IA} = require('./IntacctClient')
module.exports = {
    createpaymentAndApplyOnARInvoice : async(req,res)=>{
        try{
            let objectDate = new Date();
            let CreateDate =
              objectDate.getMonth() +
              1 +
              "/" +
              objectDate.getDate() +
              "/" +
              objectDate.getFullYear();
            console.log("new Date(CreateDate) =>",new Date(CreateDate));
            console.log("new Date =>",new Date("6/30/2016"));

            const record = new IA.Functions.AccountsReceivable.ArPaymentCreate();
            record.customerId = "10381";
            record.transactionPaymentAmount = 500.00;
            // record.receivedDate = new Date("6/30/2016");
            record.receivedDate = new Date(CreateDate);
            record.paymentMethod = "EFT";
            record.bankAccountId = "100_SVB";
            // record.undepositedFundsGlAccountNo = "10100";
            // record.summaryRecordNo = 12345;
            // record.overpaymentLocationId = "100--US";
            // record.overpaymentDepartmentId = "CS";
            
            record.referenceNumber = "123456789";
            const applyToRecordA = new IA.Functions.AccountsReceivable.ArPaymentItem();
            applyToRecordA.applyToRecordId = 1352;
            applyToRecordA.amountToApply = 75.00;
            record.applyToTransactions = [
                applyToRecordA
            ];
            const response = await client.execute(record).then(result =>{
                console.log("result =>",result);
                res.send(result)

            }).catch(error=>{
                console.log("error =>",error);
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