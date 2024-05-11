const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
  createClauseHandler,
  updateClauseHandler,
} = require("../middleware/clauseHandler");
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");

const createUsers = asyncHandler((req, res) => {
  let userId = "U-" + generateRandomNumber(6);
  req.body["userId"] = userId;
  req.body["userInternalStatus"] = 1;
  req.body["lastUserInternalStatus"] = 1;

  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO users (${createClause[0]}) VALUES (${createClause[1]})`;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error creating users :", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).send(true);
  });
});

const updateUsers= asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields("users", req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
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
    result = parseNestedJSON(result);
    //console.log(result)
    res.status(200).send(result[0]);
  });
});

const getUsers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM users";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getUsers Error in controller");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});


const getActiveUsers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM users WHERE status = 'Active'";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // Handle error
      console.log("getUsers Error in controller");
      res.status(500).send("Internal server error");
      return;
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
        console.log("getUserRoles Error in Controller")
      }
      result = parseNestedJSON(result);
      res.status(200).send(result);
    });
  });


 const  updateUserStatus =asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const { status } = req.body;
  
    // Update user status in the database
    const sql = 'UPDATE users SET status = ? WHERE id = ?';
    dbConnect.query(sql, [status, userId], (err, result) => {
      if (err) {
        console.error('Error updating user status:', err);
        return res.status(500).json({ error: 'Failed to update user status' });
      }
      res.status(200).json({ message: 'User status updated successfully' });
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
  getActiveUsers
};
