const express = require("express");
const {
  getLeads,
  searchLeads,
  getLeadById,
  getLeadsCount,
  createLead,
  updateLead,
  deleteLead,
  getLeadSources,
  // getLeadUsers,
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
  createLeadFromCallback,
  getAllLeadData,
  getInhouseRejectedLeads,
  getFiles,
  getFilesCount
} = require("../controllers/leadsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getLeads).post(validateToken, createLead);
router.route("/files").get(validateToken, getFiles);
router.route("/files-count").get(validateToken, getFilesCount);


router.route("/callbacktolead").post(validateToken, createLeadFromCallback);

router.route("/search").get(validateToken, searchLeads);
router.route("/total").get(validateToken, getLeadsCount);

router.route("/sources").get(validateToken, getLeadSources);
router.route("/lead-data/:leadId").get(validateToken, getAllLeadData);

router
  .route("/:leadId/changestatus/:statusId")
  .put(validateToken, changeLeadStatus);

// router.route("/users").get(validateToken, getLeadUsers);
router.route("/inHouseRejects").get(validateToken, getInhouseRejectedLeads);

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
