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
  const filtersQuery = handleGlobalFilters(req.query,true);
  //console.log(filtersQuery)
  sql += filtersQuery;
  //console.log(sql);
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("getCallBacksCount error");
    }
    const callBacksCount = result[0]["callBacksCount"];
    //console.log(callBacksCount)
    res.status(200).send(String(callBacksCount));
  });
});

const getCallBacks = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM callbacks";
  const filtersQuery = handleGlobalFilters(req.query);
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
});

const updateCallBack = asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields("callbacks", req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE callbacks SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.log("updateCallBack error:");
    }
    res.status(200).send(result);
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
