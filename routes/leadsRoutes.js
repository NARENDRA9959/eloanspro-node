const express = require("express");
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} = require("../controllers/leadsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(getLeads).post(validateToken, createLead);

router
  .route("/:id")
  .get(validateToken, getLeadById)
  .put(validateToken, updateLead)
  .delete(validateToken, deleteLead);

module.exports = router;
