const express = require("express");
const router = express.Router();

//#####################################################################################
//##                               REQUIRE MIDDLEWARES                                #
//#####################################################################################
//authorization middlewar
const { verifyAuthToken } = require("../Middlewares/auth");
//aunthontication middleware
//const { verifyLoginAuthToken } = require("../Middlewares/loginauthtoken");
//upload
const upload = require("../Middlewares/uploadmulter");

//######################################################################################
//#                                REQUIRE CONTROLLERS                                 #
//######################################################################################

//#############  Get get auth token controller   #############
const { getauthtoken } = require("../Controllers/GetAuthtoken/getauthtoken");

//#############  Roles controllers  ###########################
const {
  addRoleController,
  getRoleController,
} = require("../Controllers/RoleController/rolecontroller");

//#############  types controllers  ###########################
const {
  addTypeController,
  getTypeController,
  deleteTypeController,
  TypeDetController,
  TypeEditController,
} = require("../Controllers/TypeController/typecontroller");

//#############  User controllers  ############################
const {
  addUserController,
  getUserController,
  deleteUserController,
  getUserDetailsController,
  editUserController,
  GetUserByPidController,
  GetUserByMultipleIdController,
  GetLastInsertIdController,
} = require("../Controllers/UserController/usercontroller");

//############  Student controller  ##########################
const {
  addstudentcontroller,
  getstudentcontroller,
  editstudentcontroller,
} = require("../Controllers/StudentController/studentcontroller");

//############  User login reset forgot pass controller  ############
const {
  userlogincontroller,
  forgotpasswordcontroller,
  resetpasswordcontroller,
  sendComposerMailcontroller,
} = require("../Controllers/AuthController/authcontroller");

//################        activities controllers      #########
const {
  getActivityController,
  getActivityDetailsController,
  deleteActivityController,
  editActivityController,
  addActivityController,
} = require("../Controllers/Activities/activitiescontrollers");

//################    salesordercontrollers      #########
const {
  addSalesOrder,
  getSalesOrder,
  getSalesDetails,
  getActivityViewSales,
  editSalesOrder,
  deleteSalesOrder,
  getSalesOrderByUserId,
} = require("../Controllers/SalesOrderController/salesordercontrollers");

//################        invoice controllers      #########
const {
  CreateInvoice,
  getInvoice,
  DeleteInvoice,
  updateInvoice,
  SendInvoiceEmail,
  getInvoiceByUserId,
  getInvoiceNo,
  editInvoice,
  getInvoiceByUser,
  getPendingInvoice
} = require("../Controllers/InvoiceController/invoiceController");

//################  items controllers ########################
const {
  CreateItem,
  GetItem,
  GetItembyid,
  GetItemData,
} = require("../Controllers/InvoiceController/itemController");

//################  credit notes controllers ########################
const {
  addCreditNotesController,
  getCreditNotesController,
  getCreditNotesDetailsController,
  editCreditNotesController,
  getCredirBallanceController,
  insertAmount,
  getCredirBallanceByUserController,
  getCreditReqByuserController,
} = require("../Controllers/CreditNotes/creditNotesController");

//################        check emails controllers ########################
const { CheckEmails } = require("../Controllers/CheckEmails");

//#######################################################################################
//#                                    ROUTERS                                          #
//#######################################################################################

//############################## get  authorization tokenss ###################
router.get("/get_authorization_token", getauthtoken);

//############################## role routers    ###############################
router.post("/addRole", verifyAuthToken, addRoleController);
router.get("/getRole", verifyAuthToken, getRoleController);

//############################## type routers    ###############################
router.post("/addType", verifyAuthToken, addTypeController);
router.get("/getType", verifyAuthToken, getTypeController);
router.get("/getTypeDet/:id", verifyAuthToken, TypeDetController);
router.put("/editType/:id", verifyAuthToken, TypeEditController);
router.delete("/deleteType/:id", verifyAuthToken, deleteTypeController);
//#############################  user routers ##################################
router.post("/addUser", verifyAuthToken, addUserController);
router.post("/getUser", verifyAuthToken, getUserController);
router.get("/getUserDetails/:id", verifyAuthToken, getUserDetailsController);
router.put("/edituser/:id", verifyAuthToken, editUserController);
router.delete("/deleteuser/:id", verifyAuthToken, deleteUserController);
router.get("/getuserbypid/:id", verifyAuthToken, GetUserByPidController);
router.get(
  "/getuserbymultipleid/:id",
  verifyAuthToken,
  GetUserByMultipleIdController
);
router.get("/getLastInsertId", verifyAuthToken, GetLastInsertIdController);

//##############################  students routes   ############################
router.post("/addstudent", upload.none(), addstudentcontroller);
router.get("/getstudentbyuser/:id", getstudentcontroller);
router.put("/updatestudent/:id", editstudentcontroller);

//#############################  Auth login reset forgot pas router  ###########
router.post("/userlogin", verifyAuthToken, userlogincontroller);
router.post("/forgotpassword", verifyAuthToken, forgotpasswordcontroller);
router.post("/resetpassword", verifyAuthToken, resetpasswordcontroller);
router.post("/sendcomposer", sendComposerMailcontroller);

//#############################  activities routers  ###########################
router.post("/getActivity", verifyAuthToken, getActivityController);
router.get(
  "/getActivityDetails/:id",
  verifyAuthToken,
  getActivityDetailsController
);
router.put(
  "/editActivity/:id",
  upload.none(),
  verifyAuthToken,
  editActivityController
);
router.post(
  "/addActivity",
  upload.none(),
  verifyAuthToken,
  addActivityController
);

router.delete("/deleteActivity/:id", verifyAuthToken, deleteActivityController);

//#############################  SalesOrders routers  ###########################
router.post("/addSalesOrders", upload.none(), addSalesOrder);
router.post("/getSalesOrders", getSalesOrder);
router.get("/getSalesOrdersDetails/:id", getSalesDetails);
router.get("/getactivitybyuserid/:id", getActivityViewSales);
router.put("/editSalesOrders/:id", upload.none(), editSalesOrder);
router.delete("/deleteSalesOrders/:id", deleteSalesOrder);
router.get("/getSalesOrdersByUser/:id", verifyAuthToken, getSalesOrderByUserId);

//#########################  invoice routers  ###########################

router.post("/createInvoice", upload.none(), CreateInvoice);
router.post("/getInvoice/:id?", upload.none(), getInvoice);
router.delete("/deleteInvoice/:id", upload.none(), DeleteInvoice);
router.put("/updateInvoice/:id", upload.none(), updateInvoice);
router.post("/editInvoice/:id", upload.none(), editInvoice);

router.get("/sendInvoiceEmail/:id", SendInvoiceEmail);
router.get("/getInvoicebyUser/:id", getInvoiceByUserId);
router.post("/getInvoicebyUser/:id", getInvoiceByUser);
router.post("/getPendingInvoices/:id", getPendingInvoice);
router.get("/getInvoiceNo", getInvoiceNo);

//############################ Item routers ############################
router.post("/createItem", upload.none(), CreateItem);
router.post("/getItembyid", upload.none(), GetItembyid);
router.get("/getItem", GetItem);
router.get("/getItems", GetItemData);

// ######################## Transaction Routes ############################
const { createTransaction } = require("../Controllers/TransactionController");
router.post("/createTransaction", createTransaction);

// #################### Dash Board Route ##################
const {
  calculateDataForDashboard,
} = require("../Controllers/DashBoardController");
router.get("/dashboardData", verifyAuthToken, calculateDataForDashboard);

// IntacctAPIs Routes do not touch
const {
  getListCustomersLegacy,
  createIntacctCustomer,
  updateIntacctCustomer,
  deleteIntacctCustomer,
  getIntacctCustomerById,
  getListofCustomersType,
} = require("../SageIntacctAPIs/CustomerServices");
const {
  getInvoiceList,
  createInstacctInvoice,
  deleteInstacctInvoice,
  updateInstacctInvoice,
  getListARPayments,
  getARInvoiceRecordNumber,
} = require("../SageIntacctAPIs/InvoiceService");
const {
  getListOfItems,
  getListOfItemsByFilter,
  createSageIntacctItem,
  updateSageIntacctItem,
  deleteSageIntacctItem,
} = require("../SageIntacctAPIs/ItemServices");
const {
  getListOfSalesInovice,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
} = require("../SageIntacctAPIs/SalesInvoiceService");
const {
  getListOfSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  deleteSageIntacctSalesOrder,
} = require("../SageIntacctAPIs/SalesOrderService");
const { createpaymentAndApplyOnARInvoice } = require("../SageIntacctAPIs/PaymentServices");

router.get("/getListCustomersLegacy", getListCustomersLegacy);
router.get("/getListCustomersTypeLegacy", getListofCustomersType);
router.get("/getCustomerByRecordId", getIntacctCustomerById);

router.get("/getInvoiceLegacy", getListOfSalesInovice);
router.post("/createSalesInvoice", createSalesInvoice);
router.put("/updateSalesInvoice", updateSalesInvoice);
router.delete("/deleteSalesInvoice", deleteSalesInvoice);

router.get("/getItemsLegacy", getListOfItems);
router.get("/getFilterItemsLegacy", getListOfItemsByFilter);
// router.post('/createSageIntacctItem',createSageIntacctItem)
router.put("/updateSageIntacctItem", updateSageIntacctItem);
router.delete("/deleteSageIntacctItem", deleteSageIntacctItem);

router.get("/getSalesOrderLegacy", getListOfSalesOrder);

router.get('/AccountsReceivable/getARInvoice',getInvoiceList)
router.post('/AccountsReceivable/getARInvoiceRecordNo',getARInvoiceRecordNumber)
router.get('/AccountsReceivable/getARPayment',getListARPayments);
router.post("/AccountsReceivable/applyPayment",createpaymentAndApplyOnARInvoice)
// router.post('/createSalesOrder',createSalesOrder)
// router.put('/updateSalesOrder',updateSalesOrder)
// router.delete('/deleteSalesOrder',deleteSageIntacctSalesOrder)

// router.post('/createIntacctCustomer' ,createIntacctCustomer);
// router.put('/updateIntacctCustomer' ,updateIntacctCustomer);
// router.delete('/deleteIntacctCustomer' ,deleteIntacctCustomer);
//######################### credit notes routesr #######################
router.post("/addCreditNotes", verifyAuthToken, addCreditNotesController);
router.post("/getCreditNotes", verifyAuthToken, getCreditNotesController);
router.put("/editCreditNotes/:id", verifyAuthToken, editCreditNotesController);
router.get(
  "/getCreditNotesDetails/:id",
  verifyAuthToken,
  getCreditNotesDetailsController
);
router.get(
  "/creditballanceByUser/:id",
  verifyAuthToken,
  getCredirBallanceByUserController
);
router.get("/creditballance/:id", verifyAuthToken, getCredirBallanceController);
router.put("/insertAmount", verifyAuthToken, insertAmount);
router.get(
  "/getCreditReqByuser/:id",
  verifyAuthToken,
  getCreditReqByuserController
);

//######################### check emails #######################
router.post("/checkEmails", CheckEmails);

module.exports = router;
