
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
        res.status(200).send(json_data)
    }catch(error){
        res.status(400).send({
            error:error.message
        })
    }
       

},

createIntacctCustomer : async(data)=>{
     try{
        const {email1,email2 ,phoneNumber1,phoneNumber2 , active ,name ,parentCustomerId}= data
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
        // create.customerTypeId = customerTypeId;
        // create.primaryContactName =primaryContactName;
        const createResponse = await client.execute(create);
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
        console.log("customer =>",customer);
        res.status(200).send(customer);
   }catch(error){
    return {message:error.message}
   }
}
}

