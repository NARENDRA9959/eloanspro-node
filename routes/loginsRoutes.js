const express = require("express");
const {
  createLogin,
  getDistinctLeads,
  getDistinctLeadCount,
  getFIPDetailsById,
  updateFIPDetails,
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
  getSanctionedAmountSum,
  getLoginsDoneById
} = require("../controllers/loginsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();
router
  .route("/")
  .post(validateToken, createLogin)
  .get(validateToken, getDistinctLeads);

router.route("/approvals").get(validateToken, getApprovalsLeads);
router.route("/disbursals").get(validateToken, getDisbursalLeads);
router.route("/bankRejects").get(validateToken, getBankRejectsLeads);
router.route("/cniRejects").get(validateToken, getCNIRejectsLeads);

router.route("/total").get(validateToken, getDistinctLeadCount);
router.route("/approvalCount").get(validateToken, getApprovedLeadCount);
router.route("/rejectedCount").get(validateToken, getBankRejectedLeadCount);
router.route("/cniCount").get(validateToken, getCNIRejectedLeadCount);


router.route("/disbursalCount").get(validateToken, getDisbursalLeadCount);

router
  .route("/fipDetails/:leadId")
  .get(validateToken, getFIPDetailsById)
  .put(validateToken, updateFIPDetails);

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
  .route("/sancAmountSum/:leadId")
  .get(validateToken, getSanctionedAmountSum);
  
router
  .route("/disbursed/:leadId")
  .get(validateToken, getDisbursalsDetailsById)
  .put(validateToken, updateDisbursalDetails);


  router
  .route("/loginsDone/:leadId")
  .get(validateToken, getLoginsDoneById);
module.exports = router;
