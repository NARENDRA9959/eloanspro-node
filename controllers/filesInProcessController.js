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

// const addFilesInProcessData = asyncHandler((req, res) => {
//   const id = req.params.leadId;
//   const updateClause = updateClauseHandler(req.body);
//   console.log(req);
//   // console.log(updateClause);
//   // console.log(id);
//   const sql = `UPDATE files_in_process SET ${updateClause} WHERE leadId = ${id}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("addFilesInProcessData error in controller");
//     }
//     res.status(200).send({ success: "Documents Saved Successfully" });
//   });
// });

// const getFilesInProcessById = asyncHandler((req, res) => {
//   const sql = `SELECT * FROM files_in_process WHERE leadId = ${req.params.leadId}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("getLoginInfoById Error in controller");
//     }
//     result = parseNestedJSON(result);
//     res.status(200).send(result[0] || {});
//   });
// });

// const fetchData = asyncHandler(async (req, res) => {
//   try {
//     const bankName = req.query.bankName;
//     const query3 = "SELECT * FROM files_in_process";
//     const results = await new Promise((resolve, reject) => {
//       dbConnect.query(query3, (err, results) => {
//         if (err) {
//           return reject(err);
//         }
//         resolve(results);
//       });
//     });
//     let dataToReturn = [];
//     let idCounter = 1;
//     for (const row of results) {
//       try {
//         if (!row.data.trim()) {
//           console.error("Empty data found in row:", row);
//           continue;
//         }
//         const data = JSON.parse(row.data);
//         console.log("Data:", data);
//         if (!Array.isArray(data) || data.length === 0) {
//           throw new Error("Invalid data structure");
//         }
//         const leadId = row.leadId;
//         //console.log("Lead ID:", leadId);
//         const leadQuery = `SELECT * FROM leads WHERE id='${leadId}'`;
//         const leadResult = await new Promise((resolve, reject) => {
//           dbConnect.query(leadQuery, (err, result) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(result);
//             }
//           });
//         });
//         const lead = leadResult[0];
//         // console.log("Lead:", lead);
//         for (const entry of data) {
//           const { program, bank, status, remarks } = entry;
//           if (bank.toUpperCase() === bankName.toUpperCase()) {
//             dataToReturn.push({
//               id: idCounter++,
//               leadName: lead ? lead.businessName : "",
//               program: program.toUpperCase(),
//               status: status.toUpperCase(),
//               remarks: remarks.toUpperCase(),
//             });
//           }
//         }
//       } catch (error) {
//         console.error("Error processing row:", error);
//       }
//     }

//     res.json(dataToReturn);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });

// module.exports = {
//   addFilesInProcessData,
//   getFilesInProcessById,
//   fetchData,
// };
