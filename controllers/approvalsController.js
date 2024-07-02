// const asyncHandler = require("express-async-handler");
// const dbConnect = require("../config/dbConnection");

// const {
//   createClauseHandler,
//   updateClauseHandler,
// } = require("../middleware/clauseHandler");
// const parseNestedJSON = require("../middleware/parseHandler");

// const getApprovedDetails = asyncHandler(async (req, res) => {
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
//       `SELECT data FROM approvals WHERE leadId = ?`,
//       [leadId]
//     );
//     if (existingData.length > 0) {
//       const parsedData = parseNestedJSON(existingData);
//       if (parsedData[0]?.data && parsedData[0].data.length > 0) {
//         return res.status(200).json(parsedData[0].data);
//       }
//     }
//     const filesInProcessResults = await query(
//       `SELECT * FROM files_in_process WHERE leadId = ?`,
//       [leadId]
//     );
//     if (filesInProcessResults.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No Approvals found for this File" });
//     }
//     const filesData = JSON.parse(filesInProcessResults[0].data);
//     const approvedDetails = filesData
//       .filter((item) => item.status === "approved")
//       .map(({ program, bank, status, remarks }) => ({
//         program,
//         bank,
//         status,
//         remarks,
//       }));
//     res.json(approvedDetails);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// const addApprovalsData = asyncHandler(async (req, res) => {
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
//     const sql = `UPDATE approvals SET ${updateClause} WHERE leadId = ${leadId}`;
//     await query(sql);
//     const updatedData = await query(
//       `SELECT * FROM approvals WHERE leadId = ?`,
//       [leadId]
//     );
//     const parsedData = parseNestedJSON(updatedData);
//     console.log(parsedData);
//     res.status(200).json(parsedData[0] || {});
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// const getApprovalsById = asyncHandler((req, res) => {
//   console.log(req.params.id)
//   const sql = `SELECT * FROM approvals WHERE leadId = ${req.params.id}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("getApprovelsById Error in controller");
//     }
//     result = parseNestedJSON(result);
//     res.status(200).send(result[0] || {});
//   });
// });
// module.exports = {
//   getApprovedDetails,
//   addApprovalsData,
//   getApprovalsById
// };
