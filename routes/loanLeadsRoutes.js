const express = require("express");
const {
    getloanLeads,
    createLoanLead,
    getloanLeadsCount,
    changeLoanLeadStatus,
    getLoanLeadById,
    updateLoanLead,
    deleteLoanLead
} = require("../controllers/loanLeadsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();
router.route("/").get(validateToken, getloanLeads).post(validateToken, createLoanLead);
router.route("/total").get(validateToken, getloanLeadsCount);
router
    .route("/:leadId/changestatus/:statusId")
    .put(validateToken, changeLoanLeadStatus);
router
    .route("/:id")
    .get(validateToken, getLoanLeadById)
    .put(validateToken, updateLoanLead)
    .delete(validateToken, deleteLoanLead);
module.exports = router;
