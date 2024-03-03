const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const { createClauseHandler, updateClauseHandler } = require("../middleware/clauseHandler");
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");

const getLeadsCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as leadsCount FROM leads";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    const leadsCount = result[0]['leadsCount'];
    res.status(200).send(String(leadsCount))
  });
});


const getLeads = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leads";
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


const getLeadSources = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leadSources";
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

const getLeadUsers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM users";
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


const getLeadById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM leads WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0]);
  });
});

const createLead = asyncHandler((req, res) => {
  let leadId = 'L-' + generateRandomNumber(6);
  req.body['leadId'] = leadId;
  req.body['leadInternalStatus'] = 1;
  req.body['lastLeadInternalStatus'] = 1;
  // req.body['createdBy'] = createdBy;
  // req.body['lastUpdatedBy'] = lastUpdatedBy;
  const createClause = createClauseHandler(req.body);
  // const checkRequiredFields = handleRequiredFields('leads', req.body);
  // if (!checkRequiredFields) {
  //   res.status(422).send("Please Fill all required fields");
  //   return;
  // }
  const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(true);
  });
});

const updateLead = asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields('leads', req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const deleteLead = asyncHandler((req, res) => {
  const sql = `DELETE FROM leads WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send("Lead Deleted Successfully");
  });
});


module.exports = {
  getLeads,
  getLeadSources,
  getLeadUsers,
  getLeadsCount,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
};
