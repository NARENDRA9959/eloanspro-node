const express = require("express");

const {
    exportFilesInProcess,
    exportApprovalLeads,
    exportDisbursalLeads,
    exportBankRejectedLeads,
    exportCNILeads,
    exportSanctionDetails
} = require("../controllers/reportsController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.route("/exportFip").get(validateToken, exportFilesInProcess);
router.route("/exportApprovals").get(validateToken, exportApprovalLeads);
router.route("/exportDisbursals").get(validateToken, exportDisbursalLeads);
router.route("/exportBankRejects").get(validateToken, exportBankRejectedLeads);
router.route("/exportCNIS").get(validateToken, exportCNILeads);
router.route("/exportSanctionDetails").get(validateToken, exportSanctionDetails);



module.exports = router;
