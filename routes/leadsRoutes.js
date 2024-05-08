const express = require("express");
const {
  getLeads,
  getLeadById,
  getLeadsCount,
  createLead,
  updateLead,
  deleteLead,
  getLeadSources,
  getLeadUsers,
  changeLeadStatus,
  getLeadDocumentsById,
  addDocumentData
} = require("../controllers/leadsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(getLeads).post(createLead);

router.route("/total").get(getLeadsCount);

router.route("/sources").get(getLeadSources);

router.route("/:leadId/changestatus/:statusId").put(changeLeadStatus);

router.route("/users").get(getLeadUsers);

router.route("/documents/:leadId").get(getLeadDocumentsById).put(addDocumentData);

router
  .route("/:id")
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead);

module.exports = router;
