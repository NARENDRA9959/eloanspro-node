const express = require("express");
const {
  getFacultys,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require("../controllers/facultyController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(getFacultys).post(validateToken, createFaculty);

router
  .route("/:id")
  .get(getFacultyById)
  .put(validateToken, updateFaculty)
  .delete(validateToken, deleteFaculty);

module.exports = router;
