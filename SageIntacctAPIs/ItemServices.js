const {client,IA} = require('./IntacctClient')
const mysqlconnection = require("../DB/db.config.connection");
const util = require("util");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {

    getListOfItems : async(req,res)=>{
        try{

            let query = new IA.Functions.Common.ReadByQuery();
            query.objectName = "ITEM"; // Keep the count to just 1 for the example
            query.pageSize = 100;
            const response = await client.execute(query);
            const result = response.getResult();
            let json_data = result.data;
            isItemsExistInDB(json_data)
            res.status(200).send(json_data)
        }catch(error){
            res.status(400).send({
                error:error.message
            })
        }
    },
    getListOfItemsByFilter : async(req,res)=>{
        try{
        
            let query = new IA.Functions.Common.NewQuery.Query();
            query.fromObject = "ITEM";
            let fields = [
                             new IA.Functions.Common.NewQuery.QuerySelect.Field('ITEMID'),
                             new IA.Functions.Common.NewQuery.QuerySelect.Field('NAME'),
                             new IA.Functions.Common.NewQuery.QuerySelect.Field('STATUS'),
                             new IA.Functions.Common.NewQuery.QuerySelect.Field('GLGROUP'),
                             new IA.Functions.Common.NewQuery.QuerySelect.Field('BASEPRICE'),
                             new IA.Functions.Common.NewQuery.QuerySelect.Field('PRODUCTLINEID'),
                         ]
            let filter = new IA.Functions.Common.NewQuery.QueryFilter.Filter('PRODUCTLINEID').notEqualTo("''");
            query.selectFields = fields;
            query.pageSize = 100;
            query.filter = filter;
            const response = await client.execute(query);
            const result = response.getResult();
            let json_data = result.data;
            res.status(200).send(json_data)
        }catch(error){
            res.status(400).send({
                error:error.message
            })
        }
    },


    createSageIntacctItem : async(data)=>{
        try{
            let record = new IA.Functions.InventoryControl.ItemCreate();
            // record.controlId = "unittest";
            record.itemId = `I${data.id}`;
            record.itemName = data.name;
            record.itemType = data.itemType;
            record.itemGlGroupName = data.itemGlGroupName;
            record.produceLineId = data.produceLineId;
            record.basePrice = data.price
            const createResponse = await client.execute(record).catch((error)=>{
                console.log("error =>",error.message);
                // res.send(error.message)
                return error.message;
            })
           

            const createResult = createResponse.getResult();
            return createResult
            //res.send(createResult)
        }catch(error){
            // res.send(error.message);
            console.log("error =>",error.message);
            return error.message
        }
    },

    updateSageIntacctItem : async(req,res)=>{
        try{
             const body = req.body;
             const itemid = body.itemId;
             if(!itemid){
                res.status(201).send({message:"item id is required !"});
                return
             }
            let record = new IA.Functions.InventoryControl.ItemUpdate();
            const keys = Object.keys(body);
            for(var i=0 ; i<keys.length ; i++){
                record[keys[i]]= body[keys[i]]
            }
            //record.itemId = "I1234";
            // record.recordNo = "62"
            // record.itemName = "hello world update";
            // record.itemType = "Inventory";
            // record.itemGlGroupName = "Accessories"
            // record.produceLineId = "Office Supplies"
            // record.active = false
            // record.basePrice = '25.00'
            console.log("record =>",record);
            const createResponse = await client.execute(record).catch((error)=>{
                console.log("error =>",error.message);
                res.send(error.message)
                return
            })
           const createResult = createResponse.getResult();
            res.send(createResult)
        }catch(error){
            res.send(error.message)
        }
    },
    deleteSageIntacctItem : async(req,res)=>{
        try{
             const itemid = req.body.itemid;
             if(!itemid){
                res.status(201).send({message:'item id is required !'});
                return
             }
            let record = new IA.Functions.InventoryControl.ItemDelete();
            record.itemId = itemid;
            const createResponse = await client.execute(record);
            // .catch((error)=>{
            //     console.log("error =>",error.message);
            //     res.status(400).send(error.message)
            //     return
            // })
           const createResult = createResponse.getResult();
           res.status(200).send(createResult)
        }catch(error){
            res.status(400).send(error.message)
        }
    },

    deleteSageIntacctItemAsActivity : async(itemId)=>{
        try{
            
             if(!itemId){
                res.status(201).send({message:'item id is required !'});
                return
             }
            let record = new IA.Functions.InventoryControl.ItemDelete();
            record.itemId = itemId;
            const createResponse = await client.execute(record);
            const createResult = createResponse.getResult();
             return createResult
        }catch(error){
             return error.message
        }
    },
    updateSageIntacctItemAsActivity : async(data)=>{
        try{
          
             const itemid = data.itemId;
             if(!itemid){
                res.status(201).send({message:"item id is required !"});
                return
             }
            let record = new IA.Functions.InventoryControl.ItemUpdate();
            const keys = Object.keys(data);
            for(var i=0 ; i<keys.length ; i++){
                record[keys[i]]= data[keys[i]]
            }
            //record.itemId = "I1234";
            // record.recordNo = "62"
            // record.itemName = "hello world update";
            // record.itemType = "Inventory";
            // record.itemGlGroupName = "Accessories"
            // record.produceLineId = "Office Supplies"
            // record.active = false
            // record.basePrice = '25.00'
            console.log("record =>",record);
            const createResponse = await client.execute(record);
            const createResult = createResponse.getResult();
            return createResult
        }catch(error){
            return error.message;
        }
    },
}

async function isItemsExistInDB(sageIntacctItems){
    try{
        let alreadyItemsInDB = []
        let sageIntacctItemsId = []
        const alreadyDBItem=`(SELECT itemID FROM items where itemID IS NOT NULL) order by ItemID ASC ;`
        const DBitem = await query(alreadyDBItem);
        for(var k=0; k < DBitem.length ; k++){
            alreadyItemsInDB.push(DBitem[k]['itemID'])

        }
         for(var i=0 ; i<sageIntacctItems.length ; i++){
            sageIntacctItemsId.push(sageIntacctItems[i]['ITEMID'])
        }
       
        for(var j=0 ; j< sageIntacctItemsId.length ; j++){
                     const recordNo = sageIntacctItems[j]['RECORDNO'];
                   
                    let read = new IA.Functions.Common.Read();
                    read.objectName = "ITEM";
                    read.keys = [
                        recordNo
                    ];
                    const responsebyname = await client.execute(read);
                    const itemResponse = responsebyname.getResult();
                    const item = itemResponse._data[0]
                  if(alreadyItemsInDB.includes(sageIntacctItemsId[j])){
                    console.log("Item Already exist in DB =>",sageIntacctItemsId[j]);
                    const updateSql = `UPDATE items SET  name = "${item['NAME']}",description="${item['PODESCRIPTION']}",price="${item['BASEPRICE']}" WHERE itemID="${item['ITEMID']}"`
                    const insert = await query(updateSql);
                    
                    
                }else{
                    console.log("Item Not exist in DB =>",sageIntacctItemsId[j]);
                    const InsertSql = `INSERT INTO items (name,description,price,itemID) VALUES('${item['NAME']}','${item['PODESCRIPTION']}','${item['BASEPRICE']}','${item['ITEMID']}')`;
                    const insert = await query(InsertSql);
                    
                }
        }
    }catch(error){
        return error.message
    }
}