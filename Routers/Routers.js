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
} = require("../Controllers/StudentController/studentcontroller");

//############  User login reset forgot pass controller  ############
const {
  userlogincontroller,
  forgotpasswordcontroller,
  resetpasswordcontroller,
} = require("../Controllers/AuthController/authcontroller");

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

//#############################  Auth login reset forgot pas router  ###########
router.post("/userlogin", verifyAuthToken, userlogincontroller);
router.post("/forgotpassword", verifyAuthToken, forgotpasswordcontroller);
router.post("/resetpassword/:id", verifyAuthToken, resetpasswordcontroller);

module.exports = router;
