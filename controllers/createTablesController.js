const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");

const createDscrTable = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const createdBy = req.user.name;
  const checkQuery = `SELECT * FROM dscr_values WHERE leadId = ?`;
  dbConnect.query(checkQuery, [id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(
        "Error checking existing id in dscr_values table:",
        checkErr
      );
      return res.status(500).send("Internal server error");
    }
    if (checkResult.length > 0) {
      return res
        .status(200)
        .send(
          `ID ${id} already exists in dscr_values table just upload the files `
        );
    }
    const sql = `INSERT INTO dscr_values (leadId, createdBy, lastUpdatedBy) VALUES (?, ?, ?)`;
    dbConnect.query(sql, [id, createdBy, createdBy], (err, result) => {
      if (err) {
        console.error("Error inserting data into dscr_values table:", err);
        return res.status(500).send("Internal server error");
      }
      console.log("Data inserted into dscr_values table successfully");
      res.status(200).send(true);
    });
  });
});

const createleadDocumentsTable = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const checkQuery = `SELECT * FROM leaddocuments WHERE leadId = ?`;
  dbConnect.query(checkQuery, [id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking existing id in leaddocuments table:", checkErr);
      return res.status(500).send("Internal server error");
    }
    if (checkResult.length > 0) {
      return res.status(200).send(`ID ${id} already exists in leaddocuments table. Just upload the files.`);
    }
    const sql = `INSERT INTO leaddocuments (leadId,createdBy,lastUpdatedBy) VALUES (?,?,?)`;
    dbConnect.query(sql, [id, req.user.name, req.user.name], (err, result) => {
      if (err) {
        console.error("Error inserting data into leaddocuments table:", err);
        return res.status(500).send("Internal server error");
      }
      console.log("Data inserted into leaddocuments table successfully");
      res.status(200).send(true);
    });
  });
});

module.exports = {
  createDscrTable,
  createleadDocumentsTable
};
