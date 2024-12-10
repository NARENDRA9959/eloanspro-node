const express = require("express");

const {
    exportFilesInProcess,
    exportApprovalLeads,
    exportDisbursalLeads,
    exportBankRejectedLeads,
    exportCNILeads,
    exportCNILeadDetails,
    exportSanctionDetails,
    exportloginsDoneDetails,
    exportDisbursalDetails,
    exportLeads,
    exportCallbacks,
    getReports,
    getReportsCount,
    exportloginFiles
} = require("../controllers/reportsController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();
router.route("/exportFip").get(validateToken, exportFilesInProcess);
router.route("/exportApprovals").get(validateToken, exportApprovalLeads);
router.route("/exportDisbursals").get(validateToken, exportDisbursalLeads);
router.route("/exportBankRejects").get(validateToken, exportBankRejectedLeads);
router.route("/exportCNIS").get(validateToken, exportCNILeads);
router.route("/exportCNIdetails").get(validateToken, exportCNILeadDetails);
router.route("/exportSanctionDetails").get(validateToken, exportSanctionDetails);
router.route("/exportDisbursalDetails").get(validateToken, exportDisbursalDetails);
router.route("/exportloginsDoneDetails").get(validateToken, exportloginsDoneDetails);
router.route("/exportloginfiles").get(validateToken, exportloginFiles);
router.route("/exportLeads").get(validateToken, exportLeads);
router.route("/exportCallbacks").get(validateToken, exportCallbacks);
router.route("/reportsdata").get(validateToken, getReports);
router.route("/reportsCount").get(validateToken, getReportsCount);
module.exports = router;
