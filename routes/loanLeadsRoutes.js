const express = require("express");
const {
    getloanLeads,
    createLoanLead,
    getloanLeadsCount,
    changeLoanLeadStatus,
    getLoanLeadById,
    updateLoanLead,
    deleteLoanLead,
    addLoanLeadsDocumentData,
    getTotalLeadsCountArray,
    getStatusLeadsCountArray,
    createLoanLeadFromCallback
} = require("../controllers/loanLeadsController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router
    .route("/loanleadsdocuments/:leadId")
    .put(validateToken, addLoanLeadsDocumentData);

router.route("/").get(validateToken, getloanLeads).post(validateToken, createLoanLead);
router.route("/total").get(validateToken, getloanLeadsCount);
router.route("/arraycount").get(validateToken, getTotalLeadsCountArray);
router.route("/statuscount").get(validateToken, getStatusLeadsCountArray);
router.route("/callbacktoloanlead").post(validateToken, createLoanLeadFromCallback);

router
    .route("/:leadId/changestatus/:statusId")
    .put(validateToken, changeLoanLeadStatus);
router
    .route("/:id")
    .get(validateToken, getLoanLeadById)
    .put(validateToken, updateLoanLead)
    .delete(validateToken, deleteLoanLead);
module.exports = router;
