const express = require("express");
const {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require("../controllers/facultyController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(getFaculty).post(validateToken, createFaculty);

router
  .route("/:id")
  .get(validateToken, getFacultyById)
  .put(validateToken, updateFaculty)
  .delete(validateToken, deleteFaculty);

module.exports = router;
