const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");

const getEvents = asyncHandler(async (req, res) => {
  const sql = "SELECT * FROM events";
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});



const getEventById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM events WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const createEvent = asyncHandler((req, res) => {
  const sql = `INSERT INTO EVENTS(event_name) VALUES('${req.body.name}')`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send("Event Created Successfully");
  });
});

const updateEvent = asyncHandler((req, res) => {
  const sql = `UPDATE EVENTS SET event_name = "${req.body.name}" WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const deleteEvent = asyncHandler((req, res) => {
  const sql = `DELETE FROM EVENTS WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send("Event Deleted Successfully");
  });
});

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
