const express = require("express");
const router = express.Router();

//#####################################################################################
//##                               REQUIRE MIDDLEWARES                                #
//#####################################################################################
//authorization middlewar
const { verifyAuthToken } = require("../Middlewares/auth");
//aunthontication middleware
const { verifyLoginAuthToken } = require("../Middlewares/loginauthtoken");
//upload image
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
} = require("../Controllers/AuthController/authcontroller");

//################        activities controllers      #########
const {
  addActivityController,
  getActivityController,
  getActivityDetailsController,
  editActivityController,
  deleteActivityController,
} = require("../Controllers/Activities/activitiescontrollers");

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
} = require("../Controllers/InvoiceController/invoiceController");
const {
  CreateItem,
  GetItem,
  GetItembyid,
  GetItemData,
} = require("../Controllers/InvoiceController/itemController");

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

//##############################  students routes   ############################
router.post("/addstudent", upload.none(), addstudentcontroller);
router.get("/getstudentbyuser/:id", getstudentcontroller);
router.put("/updatestudent/:id", editstudentcontroller);

//#############################  Auth login reset forgot pas router  ###########
router.post("/userlogin", verifyAuthToken, userlogincontroller);
router.post("/forgotpassword", verifyAuthToken, forgotpasswordcontroller);
router.post("/resetpassword", verifyAuthToken, resetpasswordcontroller);

//#############################  activities routers  ###########################
router.post(
  "/addActivity",
  verifyAuthToken,
  upload.single("image"),
  addActivityController
);
router.get("/getActivity", verifyAuthToken, getActivityController);
router.get(
  "/getActivityDetails/:id",
  verifyAuthToken,
  getActivityDetailsController
);
router.put(
  "/editActivity/:id",
  verifyAuthToken,
  upload.none(),
  editActivityController
);
router.delete("/deleteActivity/:id", verifyAuthToken, deleteActivityController);

//#############################  invoice routers  ###########################

router.post("/createInvoice", upload.none(), CreateInvoice);
router.post("/getInvoice/:id?", upload.none(), getInvoice);
router.delete("/deleteInvoice/:id", upload.none(), DeleteInvoice);
router.put("/updateInvoice/:id", upload.none(), updateInvoice);
router.post("/editInvoice/:id", upload.none(), editInvoice);

router.get("/sendInvoiceEmail/:id", SendInvoiceEmail);
router.get("/getInvoicebyUser/:id", getInvoiceByUserId);
router.get("/getInvoiceNo", getInvoiceNo);

//############################ Item routers ############################
router.post("/createItem", upload.none(), CreateItem);
router.post("/getItembyid", upload.none(), GetItembyid);
router.get("/getItem", GetItem);
router.get("/getItems", GetItemData);

module.exports = router;
