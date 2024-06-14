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

const createUsers = asyncHandler(async (req, res) => {
  let userId = "U-" + generateRandomNumber(6);
  let phoneNumber = req.body.phone; // Assuming phone number is in the request body
  //console.log(phoneNumber);
  let encryptedPassword = await bcrypt.hash(phoneNumber, 12); // Hashing the phone number

  req.body["userId"] = userId;
  req.body["userInternalStatus"] = 1;
  req.body["lastUserInternalStatus"] = 1;
  req.body["password"] = encryptedPassword; // Setting the hashed phone number as password
  //console.log(encryptedPassword);
  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO users (${createClause[0]}) VALUES (${createClause[1]})`;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error creating users:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).send(true);
  });
});
const updateUsers = asyncHandler(async (req, res) => {
  const id = req.params.id;
  let phoneNumber = req.body.phone.toString(); // Assuming phone number is in the request body
  //console.log(phoneNumber);
  let encryptedPassword = await bcrypt.hash(phoneNumber, 12); // Hashing the phone number
  req.body["password"] = encryptedPassword; // Setting the hashed phone number as password

  // const checkRequiredFields = handleRequiredFields("users", req.body);
  // if (!checkRequiredFields) {
  //   res.status(422).send("Please Fill all required fields");
  //   return;
  // }
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE users SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("updateUsers error in controller");
    }
    res.status(200).send(result);
  });
});


const deleteUsers = asyncHandler((req, res) => {
  const sql = `DELETE FROM users WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("deleteusers error in controller");
    }
    res.status(200).send("users Deleted Successfully");
  });
});
const getUsersById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM users WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
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
      // throw err;
      console.log("getUsers Error in controller");
    }
    leadUsersData = parseNestedJSON(result);
    res.status(200).send(leadUsersData);
  });
});
const exportLeads = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leads";
  const queryParams = req.query;
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, async (err, result) => {
    if (err) {
      console.log("Error exporting leads: ", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    try {
      for (let i = 0; i < result.length; i++) {
        result[i].sourcedBy = await getSourceName(result[i].sourcedBy);
      }
      result = parseNestedJSON(result);
      const csvWriter = createObjectCsvWriter({
        path: "leads1.csv",
        header: [
          { id: "id", title: "ID" },
          { id: "leadId", title: "Lead Id" },
          { id: "businessName", title: "Business Name" },
          { id: "businessEmail", title: "Business Email" },
          { id: "contactPerson", title: "Contact Person" },
          { id: "sourcedBy", title: "Sourced By" },
        ],
      });
      csvWriter
        .writeRecords(result)
        .then(() => {
          console.log("CSV file created successfully");
          res.download("leads1.csv", "downloads/leads1.csv");
          res.status(200).json(true);
        })
        .catch((error) => {
          console.error("Error writing CSV file:", error);
          res.status(500).json({ error: "Internal server error" });
        });
    } catch (error) {
      console.error("Error getting sourcedBy names:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

const getSourceName = async (userId) => {
  try {
    //console.log(leadUsersData)
    //console.log(userId)
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

const getUsersCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as usersCount FROM users";
  const filtersQuery = handleGlobalFilters(req.query, true);
  sql += filtersQuery;
  //console.log(sql)
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("Error in getUsersCount:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const usersCount = result[0]["usersCount"];
      //console.log(usersCount);
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
      // throw err;
      console.log("getUserRoles Error in Controller");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const { status } = req.body;

  // Update user status in the database
  const sql = "UPDATE users SET status = ? WHERE id = ?";
  dbConnect.query(sql, [status, userId], (err, result) => {
    if (err) {
      console.error("Error updating user status:", err);
      return res.status(500).json({ error: "Failed to update user status" });
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
  changeUsersStatus,
  getUsersCount,
  getUserRoles,
  updateUserStatus,
  getActiveUsers,
  exportLeads,
};
