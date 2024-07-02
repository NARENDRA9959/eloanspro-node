// const asyncHandler = require("express-async-handler");

// const dbConnect = require("../config/dbConnection");
// const handleGlobalFilters = require("../middleware/filtersHandler");
// const parseNestedJSON = require("../middleware/parseHandler");
// const {
//   createClauseHandler,
//   updateClauseHandler,
// } = require("../middleware/clauseHandler");
// const handleRequiredFields = require("../middleware/requiredFieldsChecker");
// const { generateRandomNumber } = require("../middleware/valueGenerator");

// // const addLoginInfoData = asyncHandler((req, res) => {
// //   const id = req.params.leadId;
// //   const updateClause = updateClauseHandler(req.body);
// // //   console.log(req)
// // //   console.log(updateClause);
// // console.log(id);
// //   const sql = `UPDATE login_info SET ${updateClause} WHERE leadId = ${id}`;
// //   dbConnect.query(sql, (err, result) => {
// //     if (err) {
// //       console.log("addLoginInfoData error in controller");
// //     }
// //     res.status(200).send({ success: "Documents Saved Successfully" });
// //   });
// // });

// // const addLoginInfoData = asyncHandler(async (req, res) => {
// //   const id = req.params.leadId;
// //   const newData = req.body.data; // Assuming req.body contains the new data to append

// //   // Step 1: Retrieve existing data from the database
// //   const sqlSelect = `SELECT data FROM login_info WHERE leadId = ?`;
// //   dbConnect.query(sqlSelect, [id], async (err, results) => {
// //     if (err) {
// //       console.error("Error fetching existing data:", err);
// //       res.status(500).send({ error: "Failed to fetch existing data" });
// //       return;
// //     }

// //     if (results.length === 0) {
// //       res.status(404).send({ error: "No data found for the specified leadId" });
// //       return;
// //     }

// //     // Assuming there is only one row for the specified leadId, you can access it as results[0]
// //     const existingData = JSON.parse(results[0].data);

// //     // Step 2: Append new data to existing data
// //     existingData.push(newData);

// //     // Step 3: Update the database with the modified data
// //     const sqlUpdate = `UPDATE login_info SET data = ? WHERE leadId = ?`;
// //     dbConnect.query(sqlUpdate, [JSON.stringify(existingData), id], (err, result) => {
// //       if (err) {
// //         console.error("Error updating data:", err);
// //         res.status(500).send({ error: "Failed to update data" });
// //         return;
// //       }
// //       res.status(200).send({ success: "Data updated successfully" });
// //     });
// //   });
// // });

// const addLoginInfoData = asyncHandler(async (req, res) => {
//   const id = req.params.leadId;
//   const newData = req.body.data;
//   const sqlSelect = `SELECT data FROM login_info WHERE leadId = ?`;
//   dbConnect.query(sqlSelect, [id], async (err, results) => {
//     if (err) {
//       console.error("Error fetching existing data:", err);
//       res.status(500).send({ error: "Failed to fetch existing data" });
//       return;
//     }
//     let existingData = [];
//     if (results.length > 0 && results[0].data) {
//       try {
//         existingData = JSON.parse(results[0].data);
//       } catch (error) {
//         console.error("Error parsing existing data:", error);
//         res.status(500).send({ error: "Failed to parse existing data" });
//         return;
//       }
//     }
//     existingData.push(newData);
//     if (results.length === 0) {
//       const sqlInsert = `INSERT INTO login_info (leadId, data) VALUES (?, ?)`;
//       dbConnect.query(
//         sqlInsert,
//         [id, JSON.stringify(existingData)],
//         (err, result) => {
//           if (err) {
//             console.error("Error inserting data:", err);
//             res.status(500).send({ error: "Failed to insert data" });
//             return;
//           }
//           res.status(200).send({ success: "Data inserted successfully" });
//         }
//       );
//     } else {
//       const sqlUpdate = `UPDATE login_info SET data = ? WHERE leadId = ?`;
//       dbConnect.query(
//         sqlUpdate,
//         [JSON.stringify(existingData), id],
//         (err, result) => {
//           if (err) {
//             console.error("Error updating data:", err);
//             res.status(500).send({ error: "Failed to update data" });
//             return;
//           }
//           res.status(200).send({ success: "Data updated successfully" });
//         }
//       );
//     }
//   });
// });

// const getLoginInfoById = asyncHandler((req, res) => {
//   const sql = `SELECT * FROM login_info WHERE leadId = ${req.params.leadId}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("getLoginInfoById Error in controller");
//     }
//     result = parseNestedJSON(result);
//     res.status(200).send(result[0] || {});
//   });
// });

// module.exports = {
//   getLoginInfoById,
//   addLoginInfoData,
// };
