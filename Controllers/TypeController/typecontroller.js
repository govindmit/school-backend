const mysqlconnection = require("../../DB/db.config.connection");

module.exports = {
  // add role controller
  addTypeController: (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ message: "All field is required" });
    }
    const check_query = `select name from types where name = "${name}"`;
    mysqlconnection.query(check_query, function (err, result) {
      if (result.length == 0) {
        const sql = `INSERT INTO types (name) VALUES ("${name}")`;
        mysqlconnection.query(sql, function (err, result) {
          if (err) throw err;
          res
            .status(201)
            .send({ message: "Type inserted successfully", data: result });
        });
      } else {
        res.status(409).send({ message: "Type Name Allready Registred" });
      }
    });
  },
};
