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

const getLeadDocumentsById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM leaddocuments WHERE leadId = ${req.params.leadId}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0] || {});
  });
});

const addDocumentData = asyncHandler((req, res) => {
  const id = req.params.leadId;
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE leaddocuments SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
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

const changeLeadStatus = asyncHandler((req, res) => {
  const id = req.params.leadId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM leads WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastLeadInternalStatus: result[0].leadInternalStatus,
        leadInternalStatus: statusId
      }
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          throw err;
        }
        res.status(200).send(true);
      });
    }
    else {
      res.status(422).send("No Leads Found");
    }
    // const updateClause = updateClauseHandler(req.body);
    // const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
    // dbConnect.query(sql, (err, result) => {
    //   if (err) {
    //     throw err;
    //   }
    //   res.status(404).send("No Lead Found");
    // });
  });
});


module.exports = {
  getLeads,
  getLeadSources,
  getLeadUsers,
  getLeadsCount,
  getLeadById,
  getLeadDocumentsById,
  createLead,
  updateLead,
  deleteLead,
  changeLeadStatus,
  addDocumentData
};
