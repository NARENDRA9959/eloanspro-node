const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(getEvents).post(validateToken, createEvent);

router
  .route("/:id")
  .get(getEventById)
  .put(validateToken, updateEvent)
  .delete(validateToken, deleteEvent);

module.exports = router;
