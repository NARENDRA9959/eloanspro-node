const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");

const getNotices = asyncHandler(async (req, res) => {
  const sql = "SELECT * FROM notice";
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const getNoticeById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM notice WHERE notice_id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const createNotice = asyncHandler((req, res) => {
  const sql = `INSERT INTO NOTICE( notice_title, notice_link) VALUES('${req.body.notice_title}', '${req.body.notice_link}')`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send("Notice Created Successfully");
  });
});

const updateNotice = asyncHandler((req, res) => {
  const sql = `UPDATE NOTICE SET notice_title = "${req.body.notice_title}", notice_link = "${req.body.notice_link}" WHERE notice_id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send(result);
  });
});

const deleteNotice = asyncHandler((req, res) => {
  const sql = `DELETE FROM NOTICE WHERE notice_id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(200).send("Notice Deleted Successfully");
  });
});

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
};
