const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const { createClauseHandler, updateClauseHandler } = require("../middleware/clauseHandler");
const handleRequiredFields = require("../middleware/requiredFieldsChecker");

const getLeads = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leads";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const getLeadById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM leads WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const createLead = asyncHandler((req, res) => {
  const createClause = createClauseHandler(req.body);
  const checkRequiredFields = handleRequiredFields('leads', req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send("Lead Created Successfully");
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
  const sql = `UPDATE EVENTS SET ${updateClause} WHERE id = ${id}`;
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
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
};
