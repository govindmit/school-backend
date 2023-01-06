const express = require("express");
const router = express.Router();

//#####################################################################################
//##                               REQUIRE MIDDLEWARES                                #
//#####################################################################################
//authorization middlewar
const { verifyAuthToken } = require("../Middlewares/auth");
//aunthontication middleware
// const { verifyLoginAuthToken } = require("../Middlewares/loginauthtoken");
//upload image
const uploads = require("../Middlewares/uploadmulter");

//######################################################################################
//#                                REQUIRE CONTROLLERS                                 #
//######################################################################################

//#############  Get auth controller   #######################
const { getauthtoken } = require("../Controllers/GetAuthtoken/getauthtoken");

//#############  Roles controllers  ##########################
const {
  addrolecontroller,
} = require("../Controllers/RoleController/rolecontroller");

//#############  User controllers  ###########################
const {
  addusercontroller,
  getusercontroller,
  deleteusercontroller,
  getuserdetailscontroller,
  editusercontroller,
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
  addactivitycontroller,
  getactivitycontroller,
  getactivitydetailscontroller,
  editactivitycontroller,
  deleteactivitycontroller,
} = require("../Controllers/Activities/activitiescontrollers");

//################        invoice controllers      #########
const {
  CreateInvoice,
  getInvoice,
  DeleteInvoice,
  updateInvoice,
} = require("../Controllers/InvoiceController/invoiceController");

//#######################################################################################
//#                                    ROUTERS                                          #
//#######################################################################################

//get  authorization token
router.get("/get_authorization_token", getauthtoken);

//############################## role routers    ###############################
router.post("/addrole", verifyAuthToken, addrolecontroller);

//#############################  user routers ##################################
router.post("/adduser", verifyAuthToken, addusercontroller);
router.get("/getuser", verifyAuthToken, getusercontroller);
router.get("/getuserdetails/:id", verifyAuthToken, getuserdetailscontroller);
router.put("/edituser/:id", verifyAuthToken, editusercontroller);
router.delete("/deleteuser/:id", verifyAuthToken, deleteusercontroller);

//##############################  students routes   ############################
router.post("/addstudent", addstudentcontroller);
router.get("/getstudentbyuser/:id", getstudentcontroller);
router.put("/updatestudent/:id", editstudentcontroller);

//#############################  Auth login reset forgot pas router  ###########
router.post("/userlogin", verifyAuthToken, userlogincontroller);
router.post("/forgotpassword", verifyAuthToken, forgotpasswordcontroller);
router.post("/resetpassword/:id", verifyAuthToken, resetpasswordcontroller);

//#############################  activities routers  ###########################
router.post(
  "/addactivity",
  verifyAuthToken,
  uploads.single("image"),
  addactivitycontroller
);
router.get("/getactivity", verifyAuthToken, getactivitycontroller);
router.get(
  "/getactivitydetails/:id",
  verifyAuthToken,
  getactivitydetailscontroller
);
router.put(
  "/editactivity/:id",
  verifyAuthToken,
  uploads.single("image"),
  editactivitycontroller
);
router.delete("/deleteactivity/:id", verifyAuthToken, deleteactivitycontroller);

//#############################  invoice routers  ###########################

router.post("/createInvoice", CreateInvoice);
router.get("/getInvoiceByUserId/:id?", getInvoice);
router.delete("/deleteInvoice/:id", DeleteInvoice);
router.put("/updateInvoice/:id", updateInvoice);

module.exports = router;
