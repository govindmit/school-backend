const mysqlconnection = require("../../DB/db.config.connection");
const util = require("util");

const query = util.promisify(mysqlconnection.query).bind(mysqlconnection);
module.exports = {

  CreateItem: async (req, res) => {
    let name = req.body.name;
    let description = req.body.description;
    let price = req.body.price;
    var sql = `INSERT INTO items (name,description,price) VALUES('${name}','${description}','${price}')`;
    const item = await query(sql);
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
    var sql = `SELECT id,name,price,description FROM items`;
    const item = await query(sql);
    res.status(200).json({ data: item });
  },
};
