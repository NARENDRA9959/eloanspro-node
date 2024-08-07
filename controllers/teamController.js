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

//const request = require('request');
const axios = require('axios');
//const FormData = require('form-data');
const fs = require('fs');
const path = require('path');



let leadUsersData = []; // Define a variable to store lead users

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
      2: 'leads,callbacks,team',
      3: 'leads,callbacks',
      4: 'leads,callbacks,files,partial,credit,bankers,logins,approvals,disbursals,rejects,filesinprocess',
      5: 'leads,callbacks,files,partial,credit'
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

const exportLeads = asyncHandler(async (req, res) => {
  let reportId = "R-" + generateRandomNumber(6);
  let sql = "SELECT * FROM leads";
  const queryParams = req.query;
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  const uploadDirectory = path.join(__dirname, '../excelFiles');
  const excelFileName = 'leads1.xlsx';
  const excelFilePath = path.join(uploadDirectory, excelFileName);

  const cleanup = (directory, filePath) => {
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting the file:", unlinkErr);
      } else {
        console.log("File deleted successfully");
        fs.readdir(directory, (err, files) => {
          if (err) {
            console.error("Error reading directory:", err);
          } else if (files.length === 0) {
            fs.rmdir(directory, (rmdirErr) => {
              if (rmdirErr) {
                console.error("Error deleting the directory:", rmdirErr);
              } else {
                console.log("Directory deleted successfully");
              }
            });
          }
        });
      }
    });
  };

  dbConnect.query(sql, async (err, result) => {
    if (err) {
      console.error("Error exporting leads: ", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    try {
      console.log(result)
      for (let i = 0; i < result.length; i++) {
        result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
        result[i].createdOn = moment(result[i].createdOn).format('YYYY-MM-DD');
      }
      result = parseNestedJSON(result);
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Leads');
      worksheet.columns = [
        { header: 'Lead Id', key: 'id' },
        { header: 'Business Name', key: 'businessName' },
        { header: 'Business Email', key: 'businessEmail' },
        { header: 'Contact Person', key: 'contactPerson' },
        { header: 'Primary Phone', key: 'primaryPhone' },
        { header: 'Secondary Phone', key: 'secondaryPhone' },
        { header: 'City', key: 'city' },
        { header: 'State', key: 'state' },
        { header: 'Business Entity', key: 'businessEntity' },
        { header: 'Business Turnover', key: 'businessTurnover' },
        { header: 'Nature Of Business', key: 'natureOfBusiness' },
        { header: 'Product', key: 'product' },
        { header: 'Business Vintage', key: 'businessOperatingSince' },
        { header: 'Had Own House', key: 'hadOwnHouse' },
        { header: 'Loan Requirement', key: 'loanRequirement' },
        { header: 'OD Requirement', key: 'odRequirement' },
        { header: 'Remarks', key: 'remarks' },
        { header: 'Sourced By', key: 'sourcedBy' },
        { header: 'Created By', key: 'createdBy' },
        { header: 'Created On', key: 'createdOn' },
      ];
      worksheet.addRows(result);
      await workbook.xlsx.writeFile(excelFilePath);
      console.log("Excel file created successfully at", excelFilePath);
      const fileContent = fs.readFileSync(excelFilePath);
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('files', fileContent, {
        filename: excelFileName,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const type = 'LEADS';
      const leadId = 'REPORTS';
      const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
      const response = await axios.post(url, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      // console.log('Response Status:', response.status);
      // console.log('Response Data:', response.data);
      if (response.status === 200) {
        if (response.data && response.data.links && response.data.links.length > 0) {
          const fileUrl = response.data.links[0];
          const fileUrlArray = JSON.stringify([fileUrl]);
          const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
          const values = [reportId, type, fileUrlArray];
          dbConnect.query(insertSql, values, (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error inserting report URL into the database:", insertErr);
              res.status(500).json({ error: "Internal server error" });
              return;
            }
            console.log("Report URL inserted successfully into the database");
            res.status(200).json({
              success: true,
              message: 'File uploaded successfully',
              fileUrl: fileUrl,
            });
          });
        } else {
          console.warn("Server returned 200 status but no file URL in response.");
          res.status(500).json({ error: "Upload succeeded but no file URL returned" });
        }
      } else {
        console.error("Error uploading file:", response.data);
        res.status(500).json({ error: "Error uploading file" });
      }
    } catch (error) {
      console.error("Error processing leads:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      cleanup(uploadDirectory, excelFilePath);
    }
  });
});



const exportCallbacks = asyncHandler(async (req, res) => {
  let reportId = "R-" + generateRandomNumber(6);
  let sql = "SELECT * FROM callbacks";
  const queryParams = req.query;
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  const uploadDirectory = path.join(__dirname, '../excelFiles');
  const excelFileName = 'callbacks1.xlsx';
  const excelFilePath = path.join(uploadDirectory, excelFileName);
  const cleanup = (directory, filePath) => {
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting the file:", unlinkErr);
      } else {
        console.log("File deleted successfully");
        fs.readdir(directory, (err, files) => {
          if (err) {
            console.error("Error reading directory:", err);
          } else if (files.length === 0) {
            fs.rmdir(directory, (rmdirErr) => {
              if (rmdirErr) {
                console.error("Error deleting the directory:", rmdirErr);
              } else {
                console.log("Directory deleted successfully");
              }
            });
          }
        });
      }
    });
  };
  dbConnect.query(sql, async (err, result) => {
    if (err) {
      console.error("Error exporting leads: ", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    try {
      console.log(result)
      for (let i = 0; i < result.length; i++) {
        result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
        result[i].createdOn = moment(new Date(result[i].createdOn)).format('YYYY-MM-DD');
        result[i].date = moment(new Date(result[i].date)).format('YYYY-MM-DD');
      }
      result = parseNestedJSON(result);
      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, { recursive: true });
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Callbacks');
      worksheet.columns = [

        { header: 'CallBack Id', key: 'callBackId' },
        { header: 'Business Name', key: 'businessName' },
        { header: 'Phone', key: 'phone' },
        { header: 'Callback Date', key: 'date' },
        { header: 'Remarks', key: 'remarks' },
        { header: 'Sourced By', key: 'sourcedBy' },
        { header: 'Created On', key: 'createdOn' },
      ];
      worksheet.addRows(result);
      await workbook.xlsx.writeFile(excelFilePath);
      console.log("Excel file created successfully at", excelFilePath);
      const fileContent = fs.readFileSync(excelFilePath);
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('files', fileContent, {
        filename: excelFileName,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const type = 'CALLBACKS';
      const leadId = 'REPORTS';
      const url = `https://files.thefintalk.in/files?type=${type}&leadId=${leadId}`;
      const response = await axios.post(url, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      // console.log('Response Status:', response.status);
      // console.log('Response Data:', response.data);
      if (response.status === 200) {
        if (response.data && response.data.links && response.data.links.length > 0) {
          const fileUrl = response.data.links[0];
          const fileUrlArray = JSON.stringify([fileUrl]);
          const insertSql = "INSERT INTO reports (reportId, reportType, reportUrl) VALUES (?, ?, ?)";
          const values = [reportId, type, fileUrlArray];
          dbConnect.query(insertSql, values, (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error inserting report URL into the database:", insertErr);
              res.status(500).json({ error: "Internal server error" });
              return;
            }
            console.log("Report URL inserted successfully into the database");
            res.status(200).json({
              success: true,
              message: 'File uploaded successfully',
              fileUrl: fileUrl,
            });
          });
        } else {
          console.warn("Server returned 200 status but no file URL in response.");
          res.status(500).json({ error: "Upload succeeded but no file URL returned" });
        }
      } else {
        console.error("Error uploading file:", response.data);
        res.status(500).json({ error: "Error uploading file" });
      }
    } catch (error) {
      console.error("Error processing leads:", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      cleanup(uploadDirectory, excelFilePath);
    }
  });
});

const getReports = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM reports";
  const queryParams = req.query;
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getReports Error in controller");
    }
    let reportsData = parseNestedJSON(result);
    res.status(200).send(reportsData);
  });
});
const getReportsCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as reportCount FROM reports";
  const filtersQuery = handleGlobalFilters(req.query, true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("Error in getUsersCount:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const reportsCount = result[0]["reportCount"];
      res.status(200).send(String(reportsCount));
    }
  });
});
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
  exportLeads,
  exportCallbacks,
  getReports,
  getReportsCount,
  getActiveUsersCount,


  getSourceName
};
