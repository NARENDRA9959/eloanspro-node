const express = require("express");
const {
  getLeads,
  getLeadById,
  getLeadsCount,
  createLead,
  updateLead,
  deleteLead,
  getLeadSources,
  getLeadUsers
} = require("../controllers/leadsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getLeads).post(validateToken, createLead);

router.route("/total").get(validateToken, getLeadsCount);

router.route("/sources").get(validateToken, getLeadSources);

router.route("/users").get(validateToken, getLeadUsers);


router
  .route("/:id")
  .get(validateToken, getLeadById)
  .put(validateToken, updateLead)
  .delete(validateToken, deleteLead);

module.exports = router;
