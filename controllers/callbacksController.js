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

const getCallBacksCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as callBacksCount FROM callbacks";
  const filtersQuery = handleGlobalFilters(req.query, true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getCallBacksCount error");
    }
    const callBacksCount = result[0]["callBacksCount"];
    res.status(200).send(String(callBacksCount));
  });
});

const getCallBacks = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM callbacks";
  const queryParams = req.query;
  queryParams["sort"] = "createdOn";
  const filtersQuery = handleGlobalFilters(queryParams);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getCallBacks error:");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getCallBackById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM callbacks WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getCallBackById error:");
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0]);
  });
});


const createCallBack = asyncHandler((req, res) => {
  const phoneNumber = req.body.phone;
  const checkPhoneQuery = `SELECT * FROM callbacks WHERE phone = ?`;
  dbConnect.query(checkPhoneQuery, [phoneNumber], (err, result) => {
    if (err) {
      console.error("Error checking phone number:", err);
      res.status(500).json({ error: "Internal server error" });
    } else {
      if (result.length > 0) {
        const callback = result[0];
        res
          .status(500)
          .send(
            `Callback already exists with phone number ${phoneNumber}, created by - ${callback.createdBy}, callback id - ${callback.callBackId}, Buisness Name - ${callback.businessName}`
          );
      } else {
        let callBackId = "C-" + generateRandomNumber(6);
        req.body["callBackId"] = callBackId;
        req.body["callbackInternalStatus"] = 1;
        req.body["lastcallbackInternalStatus"] = 1;
        req.body["createdBy"] = req.user.name;
        req.body["lastUpdatedBy"] = req.user.name;
        const createClause = createClauseHandler(req.body);
        const sql = `INSERT INTO callbacks (${createClause[0]}) VALUES (${createClause[1]})`;
        dbConnect.query(sql, (err, result) => {
          if (err) {
            console.log("createCallBack error:");
          }
          res.status(200).send(true);
        });
      }
    }
  });
});

const updateCallBack = asyncHandler((req, res) => {
  const id = req.params.id;
  const { phone } = req.body;
  const checkRequiredFields = handleRequiredFields("callbacks", req.body);
  if (!checkRequiredFields) {
    return res.status(422).send("Please fill all required fields");
  }
  const checkPhoneQuery = `SELECT * FROM callbacks WHERE phone = ? AND id != ?`;
  dbConnect.query(checkPhoneQuery, [phone, id], (err, result) => {
    if (err) {
      console.error("Error checking phone number:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (result.length > 0) {
      const callback = result[0];
      return res
        .status(409)
        .send(
          `Callback already exists with phone number ${phone}, created by - ${callback.createdBy}, callback id - ${callback.callBackId}, Buisness Name - ${callback.businessName}`
        );
    }
    const updateClause = updateClauseHandler(req.body);
    const updateSql = `UPDATE callbacks SET ${updateClause} WHERE id = ?`;
    dbConnect.query(updateSql, [id], (updateErr, updateResult) => {
      if (updateErr) {
        console.error("updateCallBack error:", updateErr);
        return res.status(500).send("Internal server error");
      }
      return res.status(200).send(updateResult);
    });
  });
});


const changeCallbackStatus = asyncHandler((req, res) => {
  const id = req.params.callBackId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM callbacks WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      console.log("changeCallbackStatus error:");
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastCallbackInternalStatus: result[0].callbackInternalStatus,
        callbackInternalStatus: statusId,
      };
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE callbacks SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          console.log("changeCallbackStatus and updatecalss error:");
        }
        res.status(200).send(true);
      });
    } else {
      res.status(422).send("No Callbacks Found");
    }
  });
});

const deleteCallBack = asyncHandler((req, res) => {
  const sql = `DELETE FROM callbacks WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("deleteCallBack error:");
    }
    res.status(200).send("Callback Deleted Successfully");
  });
});

module.exports = {
  getCallBacks,
  getCallBacksCount,
  getCallBackById,
  createCallBack,
  updateCallBack,
  deleteCallBack,
  changeCallbackStatus,
};
