const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const nodemailer = require("nodemailer");
const { createSageIntacctItem } = require("../../SageIntacctAPIs/ItemServices");

const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {
  CreateItem: async (req, res) => {
    let name = req.body.name;
    let description = req.body.description;
    let price = req.body.price;
    var sql = `INSERT INTO items (name,description,price) VALUES('${name}','${description}','${price}')`;
    const item = await query(sql);

    const intacctItem = {
      id:item.insertId,
      name:name,
      price:price,
      itemType:"Inventory",
      produceLineId:"",
      itemGlGroupName:"Accessories"

    }
    const sageIntacctItem = await createSageIntacctItem(intacctItem);
    const itemId = sageIntacctItem._data[0]["ITEMID"];
    const updateSql = `UPDATE items SET  itemID = "${itemId}" WHERE id="${item.insertId}"`
    const updateItem = await query(updateSql);

    res.status(200).json({ message: "Item created successfully", data: item });
  },
  GetItembyid: async (req, res) => {
    let id = req.body.id ? req.body.id : null;
    var sql = `SELECT id,name,price,description FROM items WHERE id IN(${id})`;
    const item = await query(sql);

    res.status(200).json({ data: item });
  },
  GetItem: async (req, res) => {
    var sql = `SELECT id,name,price,description FROM items`;
    const item = await query(sql);

    res.status(200).json({ data: item });
  },
  GetItemData: async (req, res) => {
    var sql = `SELECT id,name,price,description,itemID FROM items`;
    const item = await query(sql);

    res.status(200).json({ data: item });
  },
};
