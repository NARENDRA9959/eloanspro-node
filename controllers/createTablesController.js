const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");

const createDscrTable = asyncHandler(async (req, res) => {
    const { id } = req.body; // Extract id from request body
    const createdBy = req.user.name; // Extract creator's name from authenticated user
  
    // Check if the id already exists in dscr_values table
    const checkQuery = `SELECT * FROM dscr_values WHERE leadId = ?`;
    dbConnect.query(checkQuery, [id], (checkErr, checkResult) => {
      if (checkErr) {
        console.error("Error checking existing id in dscr_values table:", checkErr);
        return res.status(500).send("Internal server error");
      }
  
      if (checkResult.length > 0) {
        // If id already exists, return a message indicating it's already inserted
        return res.status(200).send(`ID ${id} already exists in dscr_values table just upload the files `);
      }
  
      // If id does not exist, proceed with insertion
      const sql = `INSERT INTO dscr_values (leadId, createdBy) VALUES (?, ?)`;
      dbConnect.query(sql, [id, createdBy], (err, result) => {
        if (err) {
          console.error("Error inserting data into dscr_values table:", err);
          return res.status(500).send("Internal server error");
        }
        console.log("Data inserted into dscr_values table successfully");
        res.status(200).send(true);
      });
    });
  });
  

module.exports = {
  createDscrTable,
};
