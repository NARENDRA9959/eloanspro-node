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
  addDocumentData,
  addDscrValuesData,
  getDscrValuesById,
  calculateBalanceSheet,
  calculateGstProgram,
  calculateBTOProgram,
  getCreditSummary,
  calculateDscrRatio,
} = require("../controllers/leadsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getLeads).post(validateToken, createLead);

router.route("/total").get(validateToken, getLeadsCount);

router.route("/sources").get(validateToken, getLeadSources);

router
  .route("/:leadId/changestatus/:statusId")
  .put(validateToken, changeLeadStatus);

router.route("/users").get(validateToken, getLeadUsers);

router
  .route("/documents/:leadId")
  .get(validateToken, getLeadDocumentsById)
  .put(validateToken, addDocumentData);

router
  .route("/dscr_ratio/:leadId")
  .get(validateToken, getDscrValuesById)
  .put(validateToken, addDscrValuesData);

router
  .route("/calulategstprogram/:leadId")
  .put(validateToken, calculateGstProgram);
router.route("/balancesheet/:leadId").put(validateToken, calculateBalanceSheet);
router.route("/btoprogram/:leadId").put(validateToken, calculateBTOProgram);
router.route("/dscrratio/:leadId").put(validateToken, calculateDscrRatio);

router
  .route("/:id")
  .get(validateToken, getLeadById)
  .put(validateToken, updateLead)
  .delete(validateToken, deleteLead);

router.route("/creditSummary/:id").get(validateToken, getCreditSummary);

module.exports = router;
