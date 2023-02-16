const {client,IA} = require('./IntacctClient')
module.exports = {
    createSalesInvoice : async(req,res)=>{
        try{
            let record = new IA.Functions.OrderEntry.OrderEntryTransactionCreate();
            record.transactionDefinition = "Sales Invoice";
            record.transactionDate = new Date("2/15/2023");
            record.dueDate = new Date("02/24/2025");
            record.customerId = "10003";

           const line1 = new IA.Functions.OrderEntry.OrderEntryTransactionLineCreate();
            line1.itemId = "CSS1003";
            line1.quantity = 2;
            line1.locationId="100--USA1"
            line1.unit="Each"
            record.lines = [
                line1,
            ];
          const createResponse = await client.execute(record).catch((error)=>{
                console.log("error =>",error.message);
                res.send(error.message)
            })
            const createResult = createResponse.getResult();
            console.log("createResult => ",createResult);
            res.send(createResult)
        }catch(error){
            res.send(error.message);
        }
    },

    updateSalesInvoice : async(req,res)=>{
        try{
            let record = new IA.Functions.OrderEntry.OrderEntryTransactionUpdate();
            record.transactionId ="Sales Invoice-IN0023"
            record.transactionDefinition = "Sales Invoice";
            record.transactionDate = new Date("2/15/2023");
            record.dueDate = new Date("02/24/2027");
            record.customerId = "10003";
            record.state = "Closed";
            const line1 = new IA.Functions.OrderEntry.OrderEntryTransactionLineUpdate();
            line1.lineNo= 1
            line1.itemId = "CSS1003";
            line1.quantity =1;
            line1.locationId="100--USA1"
            line1.unit="Each"
            record.lines = [
                line1,
            ];
          const createResponse = await client.execute(record).catch((error)=>{
                console.log("error =>",error.message);
                res.send(error.message)
            })
            const createResult = createResponse.getResult();
            console.log("createResult => ",createResult);
            res.send(createResult)
        }catch(error){
            res.send(error.message);
        }
    },
    deleteSalesInvoice : async(req,res)=>{
        try{
            let record = new IA.Functions.OrderEntry.OrderEntryTransactionDelete();
            record.documentId ="Sales Invoice-IN0023"
            const createResponse = await client.execute(record).catch((error)=>{
                console.log("error =>",error.message);
                res.send(error.message)
            })
            const createResult = createResponse.getResult();
            console.log("createResult => ",createResult);
            res.send(createResult)
        }catch(error){
            res.send(error.message);
        }
    },
    getListOfSalesInovice : async(req,res)=>{
        try{
            
            let query = new IA.Functions.Common.ReadByQuery();
            query.objectName = "SODOCUMENT"; // Keep the count to just 1 for the example
            query.pageSize = 100;
            query.docParId= "Sales Invoice"
            const response = await client.execute(query);
            const result = response.getResult();
            let json_data = result.data;
            res.status(200).send(json_data)
        }catch(error){
            res.status(400).send({
                error:error.message
            })
        }
    }
}