// const asyncHandler = require("express-async-handler");
// const dbConnect = require("../config/dbConnection");

// const {
//   createClauseHandler,
//   updateClauseHandler,
// } = require("../middleware/clauseHandler");
// const parseNestedJSON = require("../middleware/parseHandler");

// const getDisbursalDetails = asyncHandler(async (req, res) => {
//   const leadId = req.params.id;
//   const query = (queryString, params) => {
//     return new Promise((resolve, reject) => {
//       dbConnect.query(queryString, params, (err, results) => {
//         if (err) reject(err);
//         else resolve(results);
//       });
//     });
//   };
//   try {
//     const existingData = await query(
//       `SELECT data FROM disbursals WHERE leadId = ?`,
//       [leadId]
//     );
//     if (existingData.length > 0) {
//       const parsedData = parseNestedJSON(existingData);
//       if (parsedData[0]?.data && parsedData[0].data.length > 0) {
//         return res.status(200).json(parsedData[0].data);
//       }
//     }
//     const approvalsResults = await query(
//       `SELECT * FROM approvals WHERE leadId = ?`,
//       [leadId]
//     );
//     if (approvalsResults.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No disbursals found for this File" });
//     }
//     const filesData = JSON.parse(approvalsResults[0].data);
//     console.log(filesData);
//     const disbursalDetails = filesData
//       .filter((item) => item.approvedstatus === "disbursed")
//       .map(
//         ({
//           program,
//           lan,
//           bank,
//           disbursedAmount,
//           sanctionedAmount,
//           approvedstatus,
//           date,
//         }) => ({
//           program,
//           lan,
//           bank,
//           disbursedAmount,
//           sanctionedAmount,
//           approvedstatus,
//           date,
//         })
//       );
//     console.log(disbursalDetails);
//     res.json(disbursalDetails);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// const addDisbursalsData = asyncHandler(async (req, res) => {
//   const leadId = req.params.id;
//   const updateClause = updateClauseHandler(req.body);
//   const query = (queryString, params) => {
//     return new Promise((resolve, reject) => {
//       dbConnect.query(queryString, params, (err, results) => {
//         if (err) reject(err);
//         else resolve(results);
//       });
//     });
//   };
//   try {
//     const sql = `UPDATE disbursals SET ${updateClause} WHERE leadId = ${leadId}`;
//     await query(sql);
//     const updatedData = await query(
//       `SELECT * FROM disbursals WHERE leadId = ?`,
//       [leadId]
//     );
//     const parsedData = parseNestedJSON(updatedData);
//     console.log(parsedData);
//     res.status(200).json(parsedData[0] || {});
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = {
//   getDisbursalDetails,
//   addDisbursalsData,
// };
