const {client,IA} = require('./IntacctClient')
const mysqlconnection = require("../DB/db.config.connection");
const util = require("util");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
    createSalesInvoice : async(data)=>{
        try{
            // const itemIds = data.itemId.split(",");
            // const itemQuantity = data.quantity.split(",")
            const itemIds = data.itemId;
            const itemQuantity = data.quantity;
            if(itemIds.length != itemQuantity.length){
                return "please provide the quantity for each item !"
            }

            let record = new IA.Functions.OrderEntry.OrderEntryTransactionCreate();
            record.transactionDefinition = "Sales Invoice";
            record.transactionDate = new Date(data.createDate);//"2/15/2023"
            record.dueDate = new Date("02/24/2025");
            record.customerId = data.customerId; //10003
            record.summaryRecordNo = "12345"
            var lines = [];
               
                for(var i=0 ; i<itemIds.length ; i++){
                    lines.push(`line${i}`)
                 }

                 for(var j=0 ; j<itemIds.length ; j++){
                    lines[j]= new IA.Functions.OrderEntry.OrderEntryTransactionLineCreate();
                    lines[j].itemId = itemIds[j] ;     //"CSS1003"
                    lines[j].quantity = itemQuantity[j]; // 2
                    lines[j].locationId="100--USA1"
                    lines[j].unit="Each"
                 }
                //    const line1 = new IA.Functions.OrderEntry.OrderEntryTransactionLineCreate();
                //     line1.itemId = data.itemId ;     //"CSS1003"
                //     line1.quantity = data.quantity; // 2
                //     line1.locationId="100--USA1"
                //     line1.unit="Each"
            record.lines = lines;
            const createResponse = await client.execute(record).catch((error)=>{
                console.log("error =>",error.message);
                // res.send(error.message)
                return error.message
            })
            const createResult = createResponse.getResult();
            console.log("createResult => ",createResult);
            return createResult
            // res.send(createResult)
        }catch(error){
            // res.send(error.message);
            return error.message
        }
    },

    updateSalesInvoice : async(data)=>{
        try{
            const itemIds = data.itemId.split(",");
            const itemQuantity = data.quantity.split(",")

            let record = new IA.Functions.OrderEntry.OrderEntryTransactionUpdate();
            record.transactionId =`Sales Invoice-${data.invoiceID}`
            record.transactionDefinition = "Sales Invoice";
            // record.transactionDate = new Date("2/15/2023");
            record.dueDate = new Date(data.dueDate); //"02/24/2027"
            record.customerId = data.customerId//"10003";
            record.state = data.state;//"Closed ,pending"


            var lines = [];
            for(var i=0 ; i<itemIds.length ; i++){
                lines.push(`line${i}`)
             }

             for(var j=0 ; j<itemIds.length ; j++){
                var lineNo = parseInt(1+j)
                lines[j]= new IA.Functions.OrderEntry.OrderEntryTransactionLineUpdate();
                lines[j].lineNo = lineNo;
                lines[j].itemId = itemIds[j] ;     //"CSS1003"
                lines[j].quantity = itemQuantity[j]; // 2
                lines[j].locationId="100--USA1"
                lines[j].unit="Each"
             }
             record.lines = lines;
            // const line1 = new IA.Functions.OrderEntry.OrderEntryTransactionLineUpdate();
            // line1.lineNo= 1
            // line1.itemId = "CSS1003";
            // line1.quantity =1;
            // line1.locationId="100--USA1"
            // line1.unit="Each"
            //  record.lines = [
            //     line1,
            // ];
            const createResponse = await client.execute(record)
            const createResult = createResponse.getResult();
            // res.send(createResult)
            return createResult
        }catch(error){
            // res.send(error.message);
            return error.message
        }
    },
    deleteSalesInvoice : async(invoiceID)=>{
        try{
            let record = new IA.Functions.OrderEntry.OrderEntryTransactionDelete();
            record.documentId =`Sales Invoice-${invoiceID}`
            const createResponse = await client.execute(record);
            const createResult = createResponse.getResult();
            console.log("createResult => ",createResult);
            // res.send(createResult)
            return error.message
        }catch(error){
            // res.send(error.message);
            return error.message
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
            // isSalesInvoiceExistInDB(json_data);
            res.status(200).send(json_data)
        }catch(error){
            // res.status(400).send({
            //     error:error.message
            // })
            console.log("Error in invoice scheduler => ",error.message);
        }
    }
}


async function isSalesInvoiceExistInDB(sageIntacctInovice){
    try{
        
        let alreadyinvoicesInDB = []
        let sageIntacctinvoicesId = []
        const alreadyDBInvoice=`(SELECT invoiceId FROM invoices where invoiceId IS NOT NULL) order by invoiceId desc `
        const DBinvoice = await query(alreadyDBInvoice);
        for(var k=0; k < DBinvoice.length ; k++){
            alreadyinvoicesInDB.push(DBinvoice[k]['invoiceId'])

        }
         for(var i=0 ; i<sageIntacctInovice.length ; i++){
            sageIntacctinvoicesId.push(sageIntacctInovice[i]['DOCNO'])
        }
      
       for(var j=0 ; j< sageIntacctinvoicesId.length ; j++){
                     const recordNo = sageIntacctInovice[j]['RECORDNO'];
                     console.log("record no",recordNo);
                     let read = new IA.Functions.Common.Read();
                    read.objectName = "SODOCUMENT";
                    read.keys = [recordNo];

                    const responsebyname = await client.execute(read);
                    const invoiceResponse = responsebyname.getResult();
                    const invoice = invoiceResponse._data[0]
                    const queryUserId = `select userId from customers where customerId = "${invoice['CUSTVENDID']}"`
                    const userIdResponse = await query(queryUserId)
                    const userID = userIdResponse[0].userId;
                    // console.log("invoice=>",invoice);
                  if(alreadyinvoicesInDB.includes(sageIntacctinvoicesId[j])){
                    console.log("invoice Already exist in DB =>",sageIntacctinvoicesId[j]);
                    // const updateSql = `UPDATE invoices SET  status = "${invoice['STATE']}",amount="${item['PODESCRIPTION']}",price="${item['BASEPRICE']}" WHERE itemID="${item['ITEMID']}"`
                    var updateSql = `UPDATE invoices SET customerId = '${userID}',invoiceId = '${invoice['DOCNO']}', amount='${invoice['TOTALENTERED']}',status='${invoice['STATE']}' WHERE invoiceId = "${invoice['DOCNO']}"`;
                    //  console.log("update",updateSql);
                    const update = await query(updateSql);
                    
                    
                }else{
                    console.log("Item Not exist in DB =>",sageIntacctinvoicesId[j]);
                    // const InsertSql = `INSERT INTO invoices (name,description,price,itemID) VALUES('${item['NAME']}','${item['PODESCRIPTION']}','${item['BASEPRICE']}','${item['ITEMID']}')`;
                    var InsertSql = `INSERT INTO invoices (customerId,amount,status,createdDate,createdBy,invoiceDate,invoiceId) VALUES('${userID}','${invoice['TOTALENTERED']}','${invoice['STATE']}','${invoice['WHENCREATED']}','${invoice['CREATEDBY']}','${invoice['WHENCREATED']}','${invoice['DOCNO']}')`;
                    // console.log("InsertSql =>",InsertSql);
                    const insert = await query(InsertSql);
                    
                }
        }
    }catch(error){
        return error.message
    }
}