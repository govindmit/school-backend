
const mysqlconnection = require("../DB/db.config.connection");
const util = require("util");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
const {client,IA} = require('./IntacctClient')
module.exports = {

getListCustomersLegacy : async (req, res)=>{
    try{

        let query = new IA.Functions.Common.ReadByQuery();
        query.objectName = "CUSTOMER"; // Keep the count to just 1 for the example
        query.pageSize = 100;
        const response = await client.execute(query);
        const result = response.getResult();
        let json_data = result.data;
        isCustomersExistInPortalDB(json_data)
        res.status(200).send(json_data)
    }catch(error){
        res.status(400).send({
            error:error.message
        })
    }
       

},

createIntacctCustomer : async(data)=>{
     try{
        const {email1,email2 ,phoneNumber1,phoneNumber2 , active ,name ,parentCustomerId,customerTypeId}= data
         if( !email1 || !phoneNumber1 || !name || !parentCustomerId){
                   return {message:'required data not provided !'}
                 }
       
        let create = new IA.Functions.AccountsReceivable.CustomerCreate();
        create.customerName = name;
        create.active = active;
        // create.firstName = firstName;
        // create.lastName = lastName;
        create.primaryEmailAddress = email1 ;
        create.secondaryEmailAddress = email2;
        create.primaryPhoneNo = phoneNumber1;
        create.secondaryPhoneNo = phoneNumber2;
        create.parentCustomerId = parentCustomerId;
        create.customerTypeId = customerTypeId;
        // create.primaryContactName =primaryContactName;
        const createResponse = await client.execute(create).catch((err)=>{console.log(err.messge);});
        const createResult = createResponse.getResult();
        return createResult;
     }catch(error){
        // res.status(400).send({error:error.message});
        return error.message
     }
},

updateIntacctCustomer : async(data)=>{
    try{
        const body = data;
        const keys = Object.keys(body);
        let update = new IA.Functions.AccountsReceivable.CustomerUpdate();
        for(var i=0 ; i<keys.length ; i++){
            update[keys[i]] = body[keys[i]]
        }
        const updateResponse = await client.execute(update);
        const updateResult = updateResponse.getResult();
        // res.status(200).send(updateResult);
        return updateResult
    }catch(error){
        return {message:error.message}
    }
},

deleteIntacctCustomer : async(data)=>{
        try{
            const body = data
            const customerId = body.customerId;
            let del = new IA.Functions.AccountsReceivable.CustomerDelete();
            del.customerId = customerId;
            const deleteResponse = await client.execute(del);
            const deleteResult = deleteResponse.getResult();
            
            if(deleteResult._status === 'success'){
                // res.status(200).send({message:'customer deleted successfully !'})
                return {message:'customer deleted successfully !'}
            }
        }catch(error){
            return {message:error.message}
        }
},

getIntacctCustomerById :async(req,res)=>{
   try{
        const {recordId} = req.body;
        let read = new IA.Functions.Common.Read();
        read.objectName = "CUSTOMER";
        read.keys = [
            recordId
        ];
        const responsebyname = await client.execute(read);
        const customer = responsebyname.getResult();
        res.status(200).send(customer);
   }catch(error){
    return {message:error.message}
   }
},

getListofCustomersType : async(req,res)=>{
    try{

        let query = new IA.Functions.Common.ReadByQuery();
        query.objectName = "CUSTTYPE"; // Keep the count to just 1 for the example
        query.pageSize = 100;
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

async function  isCustomersExistInPortalDB (SageIntacctCustomers){
    try{
        var dbCustomersId = [];
        var sgaeIntacctCustomers = [];
        const sql = `(SELECT customerId FROM customers where customerId IS NOT NULL) order by customerId ASC ;`
        const alreadyCustomerInDB = await query(sql);
        for(var j=0 ; j<alreadyCustomerInDB.length ; j++){
            dbCustomersId.push(alreadyCustomerInDB[j].customerId)
        }
        console.log("dbCustomersId =>",dbCustomersId);
       
        for(var i=0 ; i< SageIntacctCustomers.length ; i++){
            sgaeIntacctCustomers.push(SageIntacctCustomers[i]['CUSTOMERID']);
        }
       console.log("sgaeIntacctCustomers =>",sgaeIntacctCustomers.length);

        for(var k=0 ; k < sgaeIntacctCustomers.length ; k++){
       console.log(sgaeIntacctCustomers[k],"sgaeIntacctCustomers =>",dbCustomersId.includes(sgaeIntacctCustomers[k]));

            if(dbCustomersId.includes(sgaeIntacctCustomers[k])){
                console.log("customer exist in potral DB =>",sgaeIntacctCustomers[k]);
                const recordNoSql = `SELECT record_no,userId FROM customers where customerId=${parseInt(sgaeIntacctCustomers[k])};` 
                const recordNo = await query(recordNoSql);
                const userId = recordNo[0].userId
                let read = new IA.Functions.Common.Read();
                read.objectName = "CUSTOMER";
                read.keys = [
                    recordNo[0].record_no
                ];
                const responsebyname = await client.execute(read);
                const customerResponse = responsebyname.getResult();
                const customer = customerResponse._data[0]
                const name = customer['NAME'];
                const email1 = customer['DISPLAYCONTACT']['EMAIL1']
                const email2 = customer['DISPLAYCONTACT']['EMAIL2']
                const phone1 = customer['DISPLAYCONTACT']['PHONE1']
                const phone2 = customer['DISPLAYCONTACT']['PHONE2']
                const  contactName = customer['DISPLAYCONTACT']['CONTACTNAME']
                const  status = customer['STATUS']
                const  parentId = customer['PARENTID'];
                const  createdBy = customer['CREATEDBY'] ;
                const  updatedBy = customer['MODIFIEDBY'];
                const   typeId = customer['CUSTTYPE'] ;
                // console.log(name,email1,email2 ,phone1 ,phone2,contactName,status,parentId,createdBy,updatedBy,typeId);
                 const updt_query = `update users set
                  name = "${name}",
                  email1 = "${email1}", 
                  email2 = "${email2}",
                  phone1 = ${parseInt(phone1)},
                  phone2 = ${parseInt(phone2)},
                  contactName="${contactName}",
                  status= ${status === "active" ? 1 : 0},
                  parentId=${parentId},
                  createdBy=${createdBy},
                  updatedBy=${updatedBy}
                  where id = ${userId}`;
                  const updateUser = await query(updt_query);

            }else{
                console.log("customer not exist in potral DB =>",sgaeIntacctCustomers[k]);
                const recordNo = SageIntacctCustomers[k]['RECORDNO'];
                let read = new IA.Functions.Common.Read();
                read.objectName = "CUSTOMER";
                read.keys = [
                    recordNo
                ];
                const responsebyname = await client.execute(read);
                const customerResponse = responsebyname.getResult();
                const customer = customerResponse._data[0]
                const customerId = customer['CUSTOMERID']
                const name = customer['NAME'];
                const email1 = customer['DISPLAYCONTACT']['EMAIL1']
                const email2 = customer['DISPLAYCONTACT']['EMAIL2']
                const phone1 = customer['DISPLAYCONTACT']['PHONE1']
                const phone2 = customer['DISPLAYCONTACT']['PHONE2']
                const  contactName = customer['DISPLAYCONTACT']['CONTACTNAME']
                const  status = customer['STATUS']
                const  parentId = customer['PARENTID'];
                const  createdBy = customer['CREATEDBY'] ;
                const  updatedBy = customer['MODIFIEDBY'];
                const   typeId = customer['CUSTTYPE'] ;
                // console.log(name,email1,email2 ,phone1 ,phone2,contactName,status,parentId,createdBy,updatedBy,typeId);
               
               const customerExistSql = `SELECT * FROM users where email1="${email1}";`
               const  customerExist = await query(customerExistSql);
               console.log("customerExist =>",customerExist);     
              if(!customerExist.length > 0){
                        const insert_user = `INSERT INTO users (name,email1,email2,phone1,phone2,contactName,status,typeId,createdBy,updatedBy)
                VALUES(
                    "${ name ? name : ""}", 
                    "${email1}",
                    "${email2}",
                     ${phone1 ? phone1 : 0}, 
                     ${phone2 ? phone2 : 0},
                    "${contactName ? contactName : ""}",
                     ${status === 'active' ? 1 :0}, 
                     ${typeId ? typeId : 0},
                     ${createdBy ? createdBy : 1}, 
                     ${updatedBy ? updatedBy : 1}
                     )`;
                console.log("insert_user =>",insert_user);     
                const insetUser = await query(insert_user);
                const insert_customer_sql = `INSERT INTO customers (userId,customerId,record_no)VALUES(${insetUser.insertId},${parseInt(customerId)},${parseInt(recordNo)})`;
                const insert_customer = await query(insert_customer_sql);
          
               }
            
            }
        }


    }catch(error){
        return error.message
    }
}
