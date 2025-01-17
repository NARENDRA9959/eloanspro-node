const express = require("express");
const {
  createLogin,
  getDistinctLeads,
  getDistinctLeadCount,
  getFIPDetailsById,
  updateFIPDetails,
  updateRevenueDetails,
  getApprovalsLeads,
  getApprovalsDetailsById,
  updateApprovalsDetails,
  getApprovedLeadCount,
  getDisbursalLeads,
  getDisbursalLeadCount,
  getDisbursalsDetailsById,
  updateDisbursalDetails,
  getBankRejectsLeads,
  getBankRejectedLeadCount,
  getCNIRejectsLeads,
  getCNIRejectedLeadCount,
  getBankRejectsDetailsById,
  getCNIRejectsDetailsById,
  getLoginsDoneCount,
  getLoginsDoneById,
  getTotalDisbursedAmountSum,
  getTotalSanctionedAmountSum,
  getFIPProcessDistinctLeads,
  getFIPProcessDistinctLeadsCount,
  deleteLogin
} = require("../controllers/loginsController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();
router
  .route("/")
  .post(validateToken, createLogin)
  .get(validateToken, getDistinctLeads);
router.route("/fipDistinctLeads").get(validateToken, getFIPProcessDistinctLeads);
router.route("/fipcount").get(validateToken, getFIPProcessDistinctLeadsCount);
router.route("/loginsDoneCount").get(validateToken, getLoginsDoneCount);

router.route("/approvals").get(validateToken, getApprovalsLeads);
router.route("/disbursals").get(validateToken, getDisbursalLeads);
router.route("/bankRejects").get(validateToken, getBankRejectsLeads);
router.route("/cniRejects").get(validateToken, getCNIRejectsLeads);
router.route("/total").get(validateToken, getDistinctLeadCount);
router.route("/approvalCount").get(validateToken, getApprovedLeadCount);
router.route("/rejectedCount").get(validateToken, getBankRejectedLeadCount);
router.route("/cniCount").get(validateToken, getCNIRejectedLeadCount);
router.route("/disbursalCount").get(validateToken, getDisbursalLeadCount);
router.route("/totalsancsum").get(validateToken, getTotalSanctionedAmountSum);
router.route("/totaldisbsum").get(validateToken, getTotalDisbursedAmountSum);

router
  .route("/fipDetails/:leadId")
  .get(validateToken, getFIPDetailsById)
  .put(validateToken, updateFIPDetails);

router
  .route("/revenueDetails/:leadId")
  .put(validateToken, updateRevenueDetails);
router
  .route("/bankRejected/:leadId")
  .get(validateToken, getBankRejectsDetailsById);
router
  .route("/cniRejected/:leadId")
  .get(validateToken, getCNIRejectsDetailsById);
router
  .route("/approved/:leadId")
  .get(validateToken, getApprovalsDetailsById)
  .put(validateToken, updateApprovalsDetails);
router
  .route("/disbursed/:leadId")
  .get(validateToken, getDisbursalsDetailsById)
  .put(validateToken, updateDisbursalDetails);

router.route("/loginsDone").get(validateToken, getLoginsDoneById);
router
  .route("/:id")
  .delete(validateToken, deleteLogin);
module.exports = router;
