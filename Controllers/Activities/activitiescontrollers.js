const express = require("express");
const app = express();
const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");
const {
  createSageIntacctItem,
  deleteSageIntacctItemAsActivity,
  updateSageIntacctItemAsActivity,
  getListOfItems,
} = require("../../SageIntacctAPIs/ItemServices");
const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);

module.exports = {
  //add activity controller
  addActivityController: (req, res) => {
    // if (!req.file) {
    //   return res.status(400).send({ message: "Image field is required" });
    // }
    // if (
    //   req.file.originalname.split(".").pop() !== "png" &&
    //   req.file.originalname.split(".").pop() !== "jpeg"
    // ) {
    //   return res
    //     .status(400)
    //     .send({ message: "Please upload png and jpeg image formats " });
    // }
    const {
      name,
      description,
      shortDescription,
      type,
      price,
      startdate,
      enddate,
      status,
    } = req.body;
    if (
      !name ||
      !type ||
      // !price ||
      !startdate ||
      !enddate ||
      !status
      // !description ||
      // !shortDescription
    ) {
      return res.status(400).send({ message: "All field is required" });
    }
    const check_name_query = `select id, name from  activites where name = "${name}"`;
    mysqlconnection.query(check_name_query, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        res.status(409).send({ message: "Activity Name already registred" });
      } else {
        var sql = `INSERT INTO activites (name,type,price,startdate,enddate,status,shortDescription,description)VALUES("${name}","${type}",${price},"${startdate}","${enddate}","${status}","${description}","${shortDescription}")`;
        mysqlconnection.query(sql, async function (err, result) {
          if (err) throw err;

          var sql = `INSERT INTO items (name,description,price) VALUES('${name}','${description}','${price}')`;
          const item = await query(sql);
          const intacctItem = {
            id: item.insertId,
            name: name,
            price: price,
            itemType: "Inventory",
            produceLineId: "General Purchases",
            itemGlGroupName: "Accessories",
          };
          const sageIntacctItem = await createSageIntacctItem(intacctItem);
          const itemId = sageIntacctItem._data[0]["ITEMID"];
          const updateSql = `UPDATE items SET  itemID = "${itemId}",activityID = "${result.insertId}" WHERE id="${item.insertId}"`;
          const updateItem = await query(updateSql);

          res
            .status(201)
            .json({ message: "Data inserted successfully", data: result });
        });
      }
    });
  },

  //get activity controller
  getActivityController:async (req, res) => {

    const { status, type } =req.body;

    let byStatus = "";
    if (status === "Active") {
      byStatus = ` and status = "${status}"`;
    } else if (status === "Upcoming") {
      byStatus = ` and status = "${status}"`;
    } else if (status === "Draft") {
      byStatus = ` and status = "${status}"`;
    } else {
      byStatus = "";
    }

    let byType = "";
    if (type === "Free") {
      byType = ` and type = "${type}"`;
    } else if (type === "Paid") {
      byType = ` and type = "${type}"`;
    } else {
      byType = "";
    }

    // var sql = `select id, name, type, status,shortDescription, description,startDate, endDate, price  from activites where 1=1 ${byStatus}${byType}`;
    var sql = `select activites.id , activites.name, activites.type, activites.status,shortDescription, activites.description,startDate, endDate, activites.price,items.itemId ,items.id as Iid,items.price as Iprice,items.description as Idescription ,items.name as Iname,items.activityId  from activites,items where items.activityId = activites.id and  1=1 ${byStatus}${byType} `;
  
    //  const schedulerExist = await getListOfItems();
    mysqlconnection.query(sql, function (err, result) {
      if (err) throw err;
      res.status(200).json({ message: "ok", data: result });
    });
  },

  //get activity details controller
  getActivityDetailsController: (req, res) => {
    const id = req.params.id;
    var sql = `select id, name,shortDescription,description, type, status, startDate, endDate, price from activites where id = ${id}`;
    mysqlconnection.query(sql, function (err, result) {
      if (err) {
        res.status(400).json({ message: "ok", data: result });
      } else {
        res.status(200).json({ message: "ok", data: result });
      }
    });
  },

  //edit activity controller
  editActivityController: (req, res) => {
    const id = req.params.id;
    // if (
    //   req.file.originalname.split(".").pop() !== "png" &&
    //   req.file.originalname.split(".").pop() !== "jpeg"
    // ) {
    //   return res
    //     .status(400)
    //     .send({ message: "Please upload png and jpeg image formats " });
    // }
    const {
      name,
      type,
      price,
      startdate,
      enddate,
      status,
      shortDescription,
      description,
    } = req.body;

    const updt_query = `update activites set name = "${name}",type = "${type}", price = ${price}, startdate = "${startdate}", enddate = "${enddate}", status = "${status}",shortDescription="${shortDescription}",description="${description}" where id = ${id}`;
    mysqlconnection.query(updt_query, async function (err, result) {
      if (err) throw err;
      const getItemIDQuery = `SELECT itemID FROM items where activityId = "${id}"`;
      const itemId = await query(getItemIDQuery);
      const itemUpdateQuery = `update items set name="${name}",description="${description}",price =${price} where activityId ="${id}"`;
      const updateItemAsActivity = await query(itemUpdateQuery);
      const active = status === "active" ? true : false;
      const data = {
        itemId: itemId[0].itemID,
        itemName: name,
        active: active,
        basePrice: price,
      };
      const update = await updateSageIntacctItemAsActivity(data);

      res
        .status(200)
        .json({ message: "data updated successfully", data: result });
    });
  },

  //delete user controller
  deleteActivityController: async (req, res) => {
    const id = req.params.id;
    var sql = `delete from activites where id = ${id}`;
    const deleteItemAsActivity = `delete from items where  activityId = "${id}"`;
    const getItemIDQuery = `SELECT itemID FROM items where activityId = "${id}"`;
    mysqlconnection.query(sql, async function (err, result) {
      if (err) throw err;
      const itemId = await query(getItemIDQuery);

      await deleteSageIntacctItemAsActivity(itemId[0].itemID);

      const deleteActivityItem = await query(deleteItemAsActivity);
      res
        .status(200)
        .json({ message: "data deleted successfully", responce: result });
    });
  },
};
