const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
  createClauseHandler,
  updateClauseHandler,
} = require("../middleware/clauseHandler");
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");
const { createObjectCsvWriter } = require("csv-writer");
const moment = require('moment');
const ExcelJS = require('exceljs');

const axios = require('axios');
const fs = require('fs');
const path = require('path');



let leadUsersData = [];

// const createUsers = asyncHandler((req, res) => {
//   let userId = "U-" + generateRandomNumber(6);
//   req.body["userId"] = userId;
//   req.body["userInternalStatus"] = 1;
//   req.body["lastUserInternalStatus"] = 1;

//   const createClause = createClauseHandler(req.body);
//   const sql = `INSERT INTO users (${createClause[0]}) VALUES (${createClause[1]})`;

//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.error("Error creating users :", err);
//       res.status(500).send("Internal Server Error");
//       return;
//     }
//     res.status(200).send(true);
//   });
// });

// const createUsers = asyncHandler(async (req, res) => {
//   let phoneNumber = req.body.phone;
//   let encryptedPassword = await bcrypt.hash(phoneNumber, 12);
//   req.body["userInternalStatus"] = 1;
//   req.body["lastUserInternalStatus"] = 1;
//   req.body["password"] = encryptedPassword;
//   const createClause = createClauseHandler(req.body);
//   const sql = `INSERT INTO users (${createClause[0]}) VALUES (${createClause[1]})`;

//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.error("Error creating users:", err);
//       res.status(500).send("Internal Server Error");
//       return;
//     }
//     res.status(200).send(true);
//   });
// });

// const createUsers = asyncHandler(async (req, res) => {
//   let phoneNumber = req.body.phone;
//   let encryptedPassword = await bcrypt.hash(phoneNumber, 12);
//   req.body["userInternalStatus"] = 1;
//   req.body["lastUserInternalStatus"] = 1;
//   req.body["password"] = encryptedPassword;
//   console.log(req)
//   const checkIfExistsQuery = `SELECT * FROM users WHERE name = ?`;
//   dbConnect.query(checkIfExistsQuery, [req.body.name], (err, results) => {
//     if (err) {
//       console.error("Error checking if user exists:", err);
//       res.status(500).send("Internal Server Error");
//       return;
//     }
//     if (results.length > 0) {
//       res.status(400).send("User with this username already exists");
//       return;
//     }
//     const createClause = createClauseHandler(req.body);
//     const sql = `INSERT INTO users (${createClause[0]}) VALUES (${createClause[1]})`;
//     dbConnect.query(sql, (err, result) => {
//       if (err) {
//         console.error("Error creating user:", err);
//         res.status(500).send("Internal Server Error");
//         return;
//       }
//       res.status(200).send(true);
//     });
//   });
// });



const createUsers = asyncHandler(async (req, res) => {
  let phoneNumber = req.body.phone;
  let encryptedPassword = await bcrypt.hash(phoneNumber, 12);
  req.body["userInternalStatus"] = 1;
  req.body["lastUserInternalStatus"] = 1;
  req.body["password"] = encryptedPassword;
  const checkIfExistsQuery = `SELECT * FROM users WHERE name = ?`;
  dbConnect.query(checkIfExistsQuery, [req.body.name], (err, results) => {
    if (err) {
      console.error("Error checking if user exists:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    if (results.length > 0) {
      res.status(400).send("User with this username already exists");
      return;
    }
    const createClause = createClauseHandler(req.body);
    const sql = `INSERT INTO users (${createClause[0]}) VALUES (${createClause[1]})`;
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.error("Error creating user:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      const rbacValues = {
        1: 'leads,callbacks,files,partial,team,credit,lenders,bankers,bankdocuments,logins,approvals,disbursals,rejects,reports,filesinprocess',
        2: 'leads,callbacks,team',
        3: 'leads,callbacks',
        4: 'leads,callbacks,files,partial,credit,bankers,logins,approvals,disbursals,rejects,filesinprocess',
        5: 'leads,callbacks,files,partial,credit'
      };
      const rbacValue = rbacValues[req.body.userType];
      if (rbacValue) {
        const updateRbacQuery = `UPDATE users SET rbac = ? WHERE id = ?`;
        dbConnect.query(updateRbacQuery, [rbacValue, result.insertId], (err, updateResult) => {
          if (err) {
            console.error("Error updating RBAC:", err);
            res.status(500).send("Internal Server Error");
            return;
          }
          res.status(200).send(true);
        });
      } else {
        res.status(200).send(true);
      }
    });
  });
});


// const updateUsers = asyncHandler(async (req, res) => {
//   const id = req.params.id;
//   let phoneNumber = req.body.phone.toString();
//   let encryptedPassword = await bcrypt.hash(phoneNumber, 12);
//   req.body["password"] = encryptedPassword;
//   const updateClause = updateClauseHandler(req.body);
//   const sql = `UPDATE users SET ${updateClause} WHERE id = ${id}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("updateUsers error in controller");
//     }
//     res.status(200).send(result);
//   });
// });


const updateUsers = asyncHandler(async (req, res) => {
  const id = req.params.id;
  let phoneNumber = req.body.phone.toString();
  let encryptedPassword = await bcrypt.hash(phoneNumber, 12);
  req.body["password"] = encryptedPassword;
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE users SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("updateUsers error in controller");
      res.status(500).send("Internal Server Error");
      return;
    }
    const rbacValues = {
      1: 'leads,callbacks,files,partial,team,credit,lenders,bankers,bankdocuments,logins,approvals,disbursals,rejects,reports,filesinprocess',
      2: 'leads,callbacks,files,partial,team,credit,lenders,bankers,bankdocuments,logins,approvals,disbursals,rejects,reports,filesinprocess',
      3: 'leads,callbacks',
      4: 'leads,callbacks,files,partial,team,credit,lenders,bankers,bankdocuments,logins,approvals,disbursals,rejects,reports,filesinprocess',
      5: 'leads,callbacks,files,partial,team'
    };
    const rbacValue = rbacValues[req.body.userType];
    if (rbacValue) {
      const updateRbacQuery = `UPDATE users SET rbac = ? WHERE id = ?`;
      dbConnect.query(updateRbacQuery, [rbacValue, id], (err, updateResult) => {
        if (err) {
          console.error("Error updating RBAC:", err);
          res.status(500).send("Internal Server Error");
          return;
        }
        res.status(200).send(result);
      });
    } else {
      res.status(200).send(result);
    }
  });
});

const deleteUsers = asyncHandler((req, res) => {
  const sql = `DELETE FROM users WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteusers error in controller");
    }
    res.status(200).send("users Deleted Successfully");
  });
});

const getUsersById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM users WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getUsersById error in controller");
    }
    result = parseNestedJSON(result[0]);
    res.status(200).send(result);
  });
});

const getUsers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM users";
  const queryParams = req.query;
  queryParams["sort"] = "addedOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getUsers Error in controller");
    }
    leadUsersData = parseNestedJSON(result);
    // console.log(leadUsersData)
    res.status(200).send(leadUsersData);
  });
});
const getSourceName = async (userId) => {
  try {
    //console.log("leadUsersData:", leadUsersData)
    const leadUser = leadUsersData.find((user) => user.id == userId);
    //console.log(leadUser)
    return leadUser ? leadUser.name : "";
  } catch (error) {
    console.error("Error getting sourcedBy names:", error);
    throw error;
  }
};
const getActiveUsers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM users WHERE status = 'Active'";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getUsers Error in controller");
      return res.status(500).send({ error: "Database query failed" });
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});
const changeUsersStatus = asyncHandler((req, res) => {
  const id = req.params.userId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM users WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      console.log("changeusersStatus error:");
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastUserInternalStatus: result[0].userInternalStatus,
        userInternalStatus: statusId,
      };
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE users SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          console.log("changeusersStatus and updatecalss error:");
        }
        res.status(200).send(true);
      });
    } else {
      res.status(422).send("No users  Found");
    }
  });
});

const getActiveUsersCount = asyncHandler(async (req, res) => {
  let sql = "SELECT COUNT(*) AS activeUsersCount FROM users WHERE status = 'Active'";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getActiveUsersCount Error in controller");
      return res.status(500).send("Internal Server Error");
    }
    const count = result[0].activeUsersCount;
    res.status(200).send(String(count));
  });
});

const getUsersCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as usersCount FROM users";
  const filtersQuery = handleGlobalFilters(req.query, true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("Error in getUsersCount:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const usersCount = result[0]["usersCount"];
      res.status(200).send(String(usersCount));
    }
  });
});
const getUserRoles = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM userrole";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getUserRoles Error in Controller");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});
const updateUserStatus = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const { status } = req.body;
  const sql = "UPDATE users SET status = ? WHERE id = ?";
  dbConnect.query(sql, [status, userId], (err, result) => {
    if (err) {
      console.error("Error updating user status:", err);
      return res.status(500).json({ error: "Failed to update user status" });
    }
    res.status(200).json({ message: "User status updated successfully" });
  });
});
// const exportLeads = asyncHandler(async (req, res) => {
//   let sql = "SELECT * FROM leads";
//   const queryParams = req.query;
//   queryParams["sort"] = "createdOn";
//   const filtersQuery = handleGlobalFilters(queryParams);
//   sql += filtersQuery;

//   dbConnect.query(sql, async (err, result) => {
//     if (err) {
//       console.error("Error exporting leads: ", err);
//       res.status(500).json({ error: "Internal server error" });
//       return;
//     }
//     try {
//       for (let i = 0; i < result.length; i++) {
//         result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
//       }
//       result = parseNestedJSON(result);

//       const uploadDirectory = path.join(__dirname, '../csvFiles');
//       if (!fs.existsSync(uploadDirectory)) {
//         fs.mkdirSync(uploadDirectory, { recursive: true });
//       }

//       const csvFilePath = path.join(uploadDirectory, 'leads1.csv');
//       const csvWriter = createObjectCsvWriter({
//         path: csvFilePath,
//         header: [
//           { id: "id", title: "ID" },
//           { id: "leadId", title: "Lead Id" },
//           { id: "businessName", title: "Business Name" },
//           { id: "businessEmail", title: "Business Email" },
//           { id: "contactPerson", title: "Contact Person" },
//           { id: "primaryPhone", title: "Primary Phone" },
//           { id: "secondaryPhone", title: "Secondary Phone" },
//           { id: "city", title: "City" },
//           { id: "state", title: "State" },
//           { id: "businessEntity", title: "Business Entity" },
//           { id: "businessTurnover", title: "Business Turnover" },
//           { id: "natureOfBusiness", title: "Nature Of Business" },
//           { id: "product", title: "Product" },
//           { id: "businessOperatingSince", title: "Business Vintage" },
//           { id: "loanRequirement", title: "Loan Requirement" },
//           { id: "odRequirement", title: "OD Requirement" },
//           { id: "sourcedBy", title: "Sourced By" },
//           { id: "createdOn", title: "Created On" },
//         ],
//       });

//       await csvWriter.writeRecords(result);
//       console.log("CSV file created successfully at", csvFilePath);

//       if (!fs.existsSync(csvFilePath)) {
//         console.error('File does not exist:', csvFilePath);
//         res.status(500).json({ error: "File not found" });
//         return;
//       }

//       const formData = {
//         file: {
//           value: fs.createReadStream(csvFilePath),
//           options: {
//             filename: 'leads1.csv',
//             contentType: 'text/csv'
//           }
//         }
//       };
//       const options = {
//         url: 'https://files.thefintalk.in/files?type=LEADS&leadId=REPORTS',
//         formData: formData
//       };
//       console.log("options", options)
//       request.post(options, (err, httpResponse, body) => {
//         if (err) {
//           console.error('Error uploading file:', err);
//           res.status(500).json({ error: "Error uploading file" });
//         } else {
//           try {
//             let response = body;
//             if (typeof body === 'string') {
//               response = JSON.parse(body);
//             }
//             console.log(response)
//             const fileUrl = response.fileUrl || response.url || response.link;
//             console.log('File uploaded successfully', fileUrl);
//             res.status(200).json({ success: true, fileUrl });
//           } catch (error) {
//             console.error('Error parsing response:', error);
//             res.status(500).json({ error: "Error parsing server response" });
//           }
//         }
//       });

//     } catch (error) {
//       console.error("Error processing leads:", error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   });
// });



module.exports = {
  createUsers,
  deleteUsers,
  updateUsers,
  getUsersById,
  getUsers,
  changeUsersStatus,
  getUsersCount,
  getUserRoles,
  updateUserStatus,
  getActiveUsers,
  getActiveUsersCount,
  getSourceName
};
