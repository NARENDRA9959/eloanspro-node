const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
  createClauseHandler,
  updateClauseHandler,
} = require("../middleware/clauseHandler");

let leadUsersData = [];

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
      return res.status(500).send("Error in Checking Username");
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
        return res.status(500).send("Error in Creating User");
      }
      const rbacValues = {
        1: 'leads,callbacks,files,partial,team,credit,bankers,logins,approvals,disbursals,rejects,reports,filesinprocess,followups,ipAddress',
        2: 'leads,callbacks,files,partial,team,credit,bankers,logins,approvals,disbursals,rejects,filesinprocess,followups',
        3: 'leads,callbacks,files,followups',
        4: 'leads,callbacks,files,partial,team,credit,bankers,logins,approvals,disbursals,rejects,filesinprocess,followups',
        5: 'leads,callbacks,files,partial,team,followups'
      };
      const rbacValue = rbacValues[req.body.userType];
      if (rbacValue) {
        const updateRbacQuery = `UPDATE users SET rbac = ? WHERE id = ?`;
        dbConnect.query(updateRbacQuery, [rbacValue, result.insertId], (err, updateResult) => {
          if (err) {
            console.error("Error updating RBAC:", err);
            return res.status(500).send("Error in Updating RBAC");
          }
          res.status(200).send(true);
        });
      } else {
        res.status(200).send(true);
      }
    });
  });
});


const updateUsers = asyncHandler(async (req, res) => {
  const id = req.params.id;
  let phoneNumber = req.body.phone.toString();
  let encryptedPassword = await bcrypt.hash(phoneNumber, 12);
  req.body["password"] = encryptedPassword;
  const checkIfExistsQuery = `SELECT * FROM users WHERE name = ? AND id != ?`;
  dbConnect.query(checkIfExistsQuery, [req.body.name, req.params.id], (err, results) => {
    if (err) {
      console.error("Error checking if user exists:", err);
      return res.status(500).send("Error in Checking Username");
    }
    if (results.length > 0) {
      res.status(400).send("User with this username already exists");
      return;
    }
    const updateClause = updateClauseHandler(req.body);
    const sql = `UPDATE users SET ${updateClause} WHERE id = ${id}`;
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.log("updateUsers error in controller");
        return res.status(500).send("Error in Updating User");
      }
      const rbacValues = {
        1: 'leads,callbacks,files,partial,team,credit,bankers,logins,approvals,disbursals,rejects,reports,filesinprocess,followups,ipAddress',
        2: 'leads,callbacks,files,partial,team,credit,bankers,logins,approvals,disbursals,rejects,filesinprocess,followups',
        3: 'leads,callbacks,files,followups',
        4: 'leads,callbacks,files,partial,team,credit,bankers,logins,approvals,disbursals,rejects,filesinprocess,followups',
        5: 'leads,callbacks,files,partial,team,followups'
      };
      const rbacValue = rbacValues[req.body.userType];
      if (rbacValue) {
        const updateRbacQuery = `UPDATE users SET rbac = ? WHERE id = ?`;
        dbConnect.query(updateRbacQuery, [rbacValue, id], (err, updateResult) => {
          if (err) {
            console.error("Error updating RBAC:", err);
            return res.status(500).send("Error in Updating RBAC");
          }
          res.status(200).send(result);
        });
      } else {
        res.status(200).send(result);
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
//       return res.status(500).send("Error in Updating User");
//     }
//     const rbacValues = {
//       1: 'leads,callbacks,files,partial,team,credit,bankers,logins,approvals,disbursals,rejects,reports,filesinprocess,followups,ipAddress',
//       2: 'leads,callbacks,files,partial,team,credit,bankers,logins,approvals,disbursals,rejects,filesinprocess,followups',
//       3: 'leads,callbacks',
//       4: 'leads,callbacks,files,partial,team,credit,bankers,logins,approvals,disbursals,rejects,filesinprocess,followups',
//       5: 'leads,callbacks,files,partial,team,followups'
//     };
//     const rbacValue = rbacValues[req.body.userType];
//     if (rbacValue) {
//       const updateRbacQuery = `UPDATE users SET rbac = ? WHERE id = ?`;
//       dbConnect.query(updateRbacQuery, [rbacValue, id], (err, updateResult) => {
//         if (err) {
//           console.error("Error updating RBAC:", err);
//           return res.status(500).send("Error in Updating RBAC");
//         }
//         res.status(200).send(result);
//       });
//     } else {
//       res.status(200).send(result);
//     }
//   });
// });

// const deleteUsers = asyncHandler((req, res) => {
//   const sql = `DELETE FROM users WHERE id = ${req.params.id}`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       console.log("deleteusers error in controller");
//     }
//     res.status(200).send("users Deleted Successfully");
//   });
// });

const deleteUsers = asyncHandler((req, res) => {
  const sql = `DELETE FROM users WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteUsers error:", err);
      return res.status(500).send("Error In Deleting the User");
    }
    res.status(200).json({ message: "User Deleted Successfully" });
  });
});

const getUsersById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM users WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getUsersById error in controller");
      return res.status(500).send("Error in Fetching User");
    }
    result = parseNestedJSON(result[0]);
    res.status(200).send(result);
  });
});

const getUsers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM users";
  const queryParams = req.query;
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getUsers Error in controller");
      return res.status(500).send("Error in Fetching Users");
    }
    leadUsersData = parseNestedJSON(result);
    res.status(200).send(leadUsersData);
  });
});
function fetchUsers() {
  return new Promise((resolve, reject) => {
    dbConnect.query("SELECT * FROM users", (err, results) => {
      if (err) {
        return reject(err);
      }
      const leadUsersData = results;
      resolve(leadUsersData);
    });
  });
}
const getSourceName = async (userId) => {
  try {
    const leadUsers = await fetchUsers();
    const leadUser = leadUsers.find((user) => user.id == userId);
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
      return res.status(500).send("Error in Fetching Active Users");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getActiveUsersCount = asyncHandler(async (req, res) => {
  let sql = "SELECT COUNT(*) AS activeUsersCount FROM users WHERE status = 'Active'";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getActiveUsersCount Error in controller");
      return res.status(500).send("Error in Fetching Active Users Count");
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
      return res.status(500).send("Error in Fetching Users Count");
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
      return res.status(500).send("Error in Fetching User Roles");
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
      return res.status(500).send("Error updating user status");
    }
    res.status(200).json({ message: "User status updated successfully" });
  });
});


module.exports = {
  createUsers,
  deleteUsers,
  updateUsers,
  getUsersById,
  getUsers,
  getUsersCount,
  getUserRoles,
  updateUserStatus,
  getActiveUsers,
  getActiveUsersCount,
  getSourceName
};
