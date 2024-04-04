const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const { createClauseHandler, updateClauseHandler } = require("../middleware/clauseHandler");
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");

const getCallBacksCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as callBacksCount FROM callbacks";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    const callBacksCount = result[0]['callBacksCount'];
    res.status(200).send(String(callBacksCount))
  });
});


const getCallBacks = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM callbacks";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});


const getCallBackById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM callbacks WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0]);
  });
});

const createCallBack = asyncHandler((req, res) => {
  let callBackId = 'C-' + generateRandomNumber(6);
  req.body['callBackId'] = callBackId;
  req.body['createdBy'] = req.user.username;
  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO callbacks (${createClause[0]}) VALUES (${createClause[1]})`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(true);
  });
});

const updateCallBack = asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields('callbacks', req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE callbacks SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const deleteCallBack = asyncHandler((req, res) => {
  const sql = `DELETE FROM callbacks WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
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
};
