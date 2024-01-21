const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");

const getLeads = asyncHandler(async (req, res) => {
  const sql = "SELECT * FROM leads";
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
  const sql = `INSERT INTO EVENTS(event_name) VALUES('${req.body.name}')`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send("Lead Created Successfully");
  });
});

const updateLead = asyncHandler((req, res) => {
  const sql = `UPDATE EVENTS SET event_name = "${req.body.name}" WHERE id = ${req.params.id}`;
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
