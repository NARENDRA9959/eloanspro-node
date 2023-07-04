const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");

const getFacultys = asyncHandler(async (req, res) => {
  const sql = "SELECT * FROM faculty";
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const getFacultyById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM faculty WHERE faculty_id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const createFaculty = asyncHandler((req, res) => {
  let digit = Math.floor(1000000000 + Math.random() * 9000000000);
  const sql = `INSERT INTO FACULTY(faculty_id, class, name, subject) VALUES('${digit}','${req.body.class}', '${req.body.name}', '${req.body.subject}')`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send("Faculty Created Successfully");
  });
});

const updateFaculty = asyncHandler((req, res) => {
  const sql = `UPDATE FACULTY SET name = "${req.body.name}" WHERE faculty_id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const deleteFaculty = asyncHandler((req, res) => {
  const sql = `DELETE FROM faculty WHERE faculty_id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send("Faculty Deleted Successfully");
  });
});

module.exports = {
  getFacultys,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
