const express = require("express");
const {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(getNotices).post(validateToken, createNotice);

router
  .route("/:id")
  .get(getNoticeById)
  .put(validateToken, updateNotice)
  .delete(validateToken, deleteNotice);

module.exports = router;
