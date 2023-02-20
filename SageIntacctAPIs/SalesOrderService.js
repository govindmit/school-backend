const {client,IA} = require('./IntacctClient')
const mysqlconnection = require("../DB/db.config.connection");
const util = require("util");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
    createSalesOrder : async(data)=>{
        try{
            let record = new IA.Functions.OrderEntry.OrderEntryTransactionCreate();
            record.transactionDefinition = "Sales Order";
            record.transactionDate = new Date(data.transactionDate);//"2/15/2023"
            record.dueDate = new Date("02/24/2025");
            record.customerId = data.customerId // "10003";
            
            const line1 = new IA.Functions.OrderEntry.OrderEntryTransactionLineCreate();
            line1.itemId = data.itemId //"CSS1003";
            line1.quantity = 1;
            line1.locationId="100--USA1"
            line1.unit="Each"
            record.lines = [
                line1,
            ];
            const createResponse = await client.execute(record);
            const createResult = createResponse.getResult();
            console.log("createResult => ",createResult);
            // res.send(createResult)
            return createResult;
        }catch(error){
            // res.send(error.message);
            return error.message;
        }
    },

    updateSalesOrder : async(data)=>{
        try{
            let record = new IA.Functions.OrderEntry.OrderEntryTransactionUpdate();
            record.transactionId =`Sales Order-${data.transactionId}`
            record.transactionDefinition = "Sales Order";
            // record.transactionDate = new Date("2/15/2023");
            record.dueDate = new Date("02/24/2027");
            record.customerId = data.customerId //"10003";
            record.state = data.state//"Closed";
            const line1 = new IA.Functions.OrderEntry.OrderEntryTransactionLineUpdate();
            line1.lineNo= 1
            line1.itemId = data.itemId//"CSS1003";
            line1.quantity =1;
            line1.locationId="100--USA1"
            line1.unit="Each"
            record.lines = [
                line1,
            ];
            const createResponse = await client.execute(record);
            const createResult = createResponse.getResult();
            console.log("createResult => ",createResult);
            // res.send(createResult)
            return createResult
        }catch(error){
            // res.send(error.message);
            return error.message
        }
    },
    deleteSageIntacctSalesOrder : async(documentId)=>{
        try{
            let record = new IA.Functions.OrderEntry.OrderEntryTransactionDelete();
            record.documentId =`Sales Order-${documentId}`
            const createResponse = await client.execute(record).catch((error)=>{
                console.log("error =>",error.message);
                res.send(error.message)
            })
             const createResult = createResponse.getResult();
             console.log("createResult => ",createResult);
             return createResult
        }catch(error){
            return error.message
        }
    },
    getListOfSalesOrder : async(req,res)=>{
        try{
            
            let query = new IA.Functions.Common.ReadByQuery();
            query.objectName = "SODOCUMENT"; // Keep the count to just 1 for the example
            query.pageSize = 100;
            query.docParId= "Sales Order"
            const response = await client.execute(query);
            const result = response.getResult();
            let json_data = result.data;
            isSalesOrderExistInDB(json_data)
            res.status(200).send(json_data)
        }catch(error){
            res.status(400).send({
                error:error.message
            })
        }
    }
}


async function isSalesOrderExistInDB(sageIntacctorders){
    try{
        
        let alreadyordersInDB = []
        let sageIntacctordersId = []
        const alreadyDBorderQuery=`(SELECT transactionId FROM sales_order where transactionId IS NOT NULL) order by transactionId desc`
        const DBorder = await query(alreadyDBorderQuery);
        for(var k=0; k < DBorder.length ; k++){
            alreadyordersInDB.push(DBorder[k]['transactionId'])

        }
         for(var i=0 ; i<sageIntacctorders.length ; i++){
            sageIntacctordersId.push(sageIntacctorders[i]['DOCNO'])
        }
      
       for(var j=0 ; j< sageIntacctordersId.length ; j++){
                     const recordNo = sageIntacctorders[j]['RECORDNO'];
                    let read = new IA.Functions.Common.Read();
                    read.objectName = "SODOCUMENT";
                    read.keys = [recordNo];

                    const responsebyname = await client.execute(read);
                    const orderResponse = responsebyname.getResult();
                    const salesOrder = orderResponse._data[0]
                    const queryForuserId = `SELECT userId FROM customers where customerId = "${salesOrder['CUSTVENDID']}"`;
                    const userIdQueryResponse = await query(queryForuserId);
                    const userId = userIdQueryResponse[0].userId ;
                    let status = ""
                    if(salesOrder['STATE'] === "Converted"|| salesOrder['STATE'] ===  "Pending"){
                        status = 1
                    }
                    if(salesOrder['STATE'] === "Closed"){
                        status = 0
                    }
                 
                    if(alreadyordersInDB.includes(sageIntacctordersId[j])){
                    console.log("order Already exist in DB =>",sageIntacctordersId[j]);
                     var updateSql = `update sales_order set amount = "${salesOrder['TOTAL']}",status = ${status}, userId = ${userId}, updatedBy="${salesOrder['MODIFIEDBY']}" where transactionId = "${salesOrder['DOCNO']}"`;
                     const update = await query(updateSql);
                    
                    
                }else{
                    console.log("order Not exist in DB =>",sageIntacctordersId[j]);
                    var InsertSql = `INSERT INTO sales_order (amount,status,userId,transactionId,createdBy)VALUES("${salesOrder['TOTAL']}",${status},"${userId}","${salesOrder['DOCNO']}","${salesOrder['CREATEDBY']}")`;
                    const insert = await query(InsertSql);
                    
                }
        }
    }catch(error){
        return error.message
    }
}