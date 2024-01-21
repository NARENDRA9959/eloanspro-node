const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const fs = require('fs');
const path = require('path');

const getFaculty = asyncHandler(async (req, res) => {
  const sql = "SELECT * FROM leads";
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const getFacultyById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM faculty WHERE facultyId = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const createFaculty = asyncHandler((req, res) => {
  let randomValue = Math.floor(1000000000 + Math.random() * 9000000000);
  const { name, standard, subject, profilePic } = req.body;
  const sql = `INSERT INTO FACULTY(facultyId, class, name, subject,profilePic) VALUES('${randomValue}','${standard}', '${name}', '${subject}', '${profilePic}')`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(true);
  });
});

const updateFaculty = asyncHandler((req, res) => {
  const { name, standard, subject, profilePic } = req.body;
  let randomValue = Math.floor(10000000000 + Math.random() * 90000000000000);
  const blobData = profilePic;
  console.log("formData", profilePic)
  const buffer = Buffer.from(blobData, 'binary');
  const filename = `${randomValue}.png`;
  const uploadFolder = path.join("", 'uploads');
  const filePath = path.join(uploadFolder, filename);
  fs.writeFileSync(filePath, buffer);
  const sql = `UPDATE FACULTY SET name = "${name}",class="${standard}",subject="${subject}",profilePic="${profilePic}" WHERE facultyId = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const deleteFaculty = asyncHandler((req, res) => {
  const sql = `DELETE FROM faculty WHERE facult yId = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(true);
  });
});

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
