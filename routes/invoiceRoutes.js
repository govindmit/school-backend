const router = require("express").Router();
const path = require("path");
const express = require("express");
const multer = require("multer");

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./image`);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

const {
  CreateInvoice,
  getInvoice,
  DeleteInvoice,
  updateInvoice,
} = require("../controllers/invoiceController");

router.post("/createInvoice", CreateInvoice);
router.get("/getInvoiceByUserId/:id?", getInvoice);
router.delete("/deleteInvoice/:id", DeleteInvoice);
router.put("/updateInvoice/:id", updateInvoice);



module.exports = router;
