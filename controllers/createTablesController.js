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


const createleadDocumentsTable = asyncHandler(async (req, res) => {
  const { id } = req.body;
  console.log(req)
  console.log(req.body)
  console.log(id);
  const checkQuery = `SELECT * FROM leaddocuments WHERE leadId = ?`;
  dbConnect.query(checkQuery, [id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Error checking existing id in leaddocuments table:", checkErr);
      return res.status(500).send("Internal server error");
    }
    if (checkResult.length > 0) {
      return res.status(200).send(`ID ${id} already exists in leaddocuments table. Just upload the files.`);
    }

    const sql = `INSERT INTO leaddocuments (leadId) VALUES (?)`;
    dbConnect.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error inserting data into leaddocuments table:", err);
        return res.status(500).send("Internal server error");
      }
      console.log("Data inserted into leaddocuments table successfully");
      res.status(200).send(true);
    });
  });
});

// const createLoginInfoTable = asyncHandler(async (req, res) => {
//   const { id } = req.body;
//   const createdBy = req.user.name;
//   const checkQuery = `SELECT * FROM login_info WHERE leadId = ?`;
//   dbConnect.query(checkQuery, [id], (checkErr, checkResult) => {
//     if (checkErr) {
//       console.error(
//         "Error checking existing id in login_info table:",
//         checkErr
//       );
//       return res.status(500).send("Internal server error");
//     }

//     if (checkResult.length > 0) {
//       return res
//         .status(200)
//         .send(`ID ${id} already exists in login_info table`);
//     }
//     const insertQuery = `INSERT INTO login_info (leadId, createdBy) VALUES (?, ?)`;
//     dbConnect.query(insertQuery, [id, createdBy], (insertErr, insertResult) => {
//       if (insertErr) {
//         console.error("Error inserting data into login_info table:", insertErr);
//         return res.status(500).send("Internal server error");
//       }
//       console.log("Data inserted into login_info table successfully");
//       res.status(200).send(true);
//     });
//   });
// });

// const createDisbursalsTable = asyncHandler(async (req, res) => {
//   const { id } = req.body;
//   const createdBy = req.user.name;
//   const checkQuery = `SELECT * FROM disbursals WHERE leadId = ?`;
//   dbConnect.query(checkQuery, [id], (checkErr, checkResult) => {
//     if (checkErr) {
//       console.error(
//         "Error checking existing id in disbursals table:",
//         checkErr
//       );
//       return res.status(500).send("Internal server error");
//     }
//     if (checkResult.length > 0) {
//       return res
//         .status(200)
//         .send(`ID ${id} already exists in disbursals table`);
//     }
//     const insertQuery = `INSERT INTO disbursals (leadId, createdBy) VALUES (?, ?)`;
//     dbConnect.query(insertQuery, [id, createdBy], (insertErr, insertResult) => {
//       if (insertErr) {
//         console.error("Error inserting data into disbursals table:", insertErr);
//         return res.status(500).send("Internal server error");
//       }
//       console.log("Data inserted into disbursals table successfully");
//       res.status(200).send(true);
//     });
//   });
// });

// const createApprovalsTable = asyncHandler(async (req, res) => {
//   const { id } = req.body;
//   const createdBy = req.user.name;
//   const checkQuery = `SELECT * FROM approvals WHERE leadId = ?`;
//   dbConnect.query(checkQuery, [id], (checkErr, checkResult) => {
//     if (checkErr) {
//       console.error(
//         "Error checking existing id in approvals table:",
//         checkErr
//       );
//       return res.status(500).send("Internal server error");
//     }

//     if (checkResult.length > 0) {
//       return res
//         .status(200)
//         .send(`ID ${id} already exists in approvals table`);
//     }
//     const insertQuery = `INSERT INTO approvals (leadId, createdBy) VALUES (?, ?)`;
//     dbConnect.query(insertQuery, [id, createdBy], (insertErr, insertResult) => {
//       if (insertErr) {
//         console.error("Error inserting data into approvals table:", insertErr);
//         return res.status(500).send("Internal server error");
//       }
//       console.log("Data inserted into approvals table successfully");
//       res.status(200).send(true);
//     });
//   });
// });
// const createFilesInProcessTable = asyncHandler(async (req, res) => {
//   const { id } = req.body;
//   const createdBy = req.user.name;
//   const checkQuery = `SELECT * FROM files_in_process WHERE leadId = ?`;
//   dbConnect.query(checkQuery, [id], (checkErr, checkResult) => {
//     if (checkErr) {
//       console.error(
//         "Error checking existing id in files_in_process table:",
//         checkErr
//       );
//       return res.status(500).send("Internal server error");
//     }

//     if (checkResult.length > 0) {
//       return res
//         .status(200)
//         .send(`ID ${id} already exists in files_in_process table`);
//     }
//     const insertQuery = `INSERT INTO files_in_process (leadId, createdBy) VALUES (?, ?)`;
//     dbConnect.query(insertQuery, [id, createdBy], (insertErr, insertResult) => {
//       if (insertErr) {
//         console.error(
//           "Error inserting data into files_in_process table:",
//           insertErr
//         );
//         return res.status(500).send("Internal server error");
//       }
//       console.log("Data inserted into files_in_process table successfully");
//       res.status(200).send(true);
//     });
//   });
// });

module.exports = {
  createDscrTable,
  createleadDocumentsTable
  // createLoginInfoTable,
  // createFilesInProcessTable,
  // createApprovalsTable,
  // createDisbursalsTable
};
