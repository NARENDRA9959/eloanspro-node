const express = require("express");
const {
  getLeadCountStatus,
  getFilesCountStatus,
  getPartialCountStatus,
  getCreditEvaluationCountStatus,
  getMonthWiseLeadCountStatus,
  getMonthWiseCallBacksCount,
  getPast7DaysLeadCountStatus,
  getPast7DaysCallBacksCount,
  getLastMonthLeadCountStatus,
  getLastMonthCallBacksCount,
  getLast6MonthsLeadCountStatus,
  getLast6MonthsCallBacksCount,
  getLastYearCallBacksCount,
  getLastYearLeadCountStatus,
  getDaywiseLeadsCount,
  getDaywiseCallBacksCount,
  getCallbackCountStatus,
  getRejectedCountStatus,
  getLoginsCountStatus,
  getApprovalsCountStatus,
  getDisbursalsCountStatus,
  getMonthWiseFilesCountStatus,
  getmonthwiseSanctionedAmount,
  getMonthWiseLoginsCountStatus,
  getmonthwiseDisbursedAmount
} = require("../controllers/allCountsController");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
router.route("/leads").get(validateToken, getLeadCountStatus);
router.route("/callback").get(validateToken, getCallbackCountStatus);
router.route("/files").get(validateToken, getFilesCountStatus);
router.route("/partial").get(validateToken, getPartialCountStatus);
router.route("/rejects").get(validateToken, getRejectedCountStatus);
router.route("/logins").get(validateToken, getLoginsCountStatus);
router.route("/approvals").get(validateToken, getApprovalsCountStatus);
router.route("/disbursals").get(validateToken, getDisbursalsCountStatus);
router.route("/credit").get(validateToken, getCreditEvaluationCountStatus);
router.route("/monthcallbacks").get(validateToken, getMonthWiseCallBacksCount);
router.route("/monthleads").get(validateToken, getMonthWiseLeadCountStatus);
router.route("/monthfiles").get(validateToken, getMonthWiseFilesCountStatus);
router.route("/monthwisesanction").get(validateToken, getmonthwiseSanctionedAmount);
router.route("/monthwisedisbursed").get(validateToken, getmonthwiseDisbursedAmount);

router.route("/monthlogins").get(validateToken, getMonthWiseLoginsCountStatus);
router.route("/daywise/leads").get(validateToken, getDaywiseLeadsCount);
router.route("/daywise/callback").get(validateToken, getDaywiseCallBacksCount);
router.route("/week/leads").get(validateToken, getPast7DaysLeadCountStatus);
router.route("/week/callback").get(validateToken, getPast7DaysCallBacksCount);
router
  .route("/lastmonth/leads")
  .get(validateToken, getLastMonthLeadCountStatus);
router
  .route("/lastmonth/callback")
  .get(validateToken, getLastMonthCallBacksCount);
router
  .route("/last6months/leads")
  .get(validateToken, getLast6MonthsLeadCountStatus);
router
  .route("/last6months/callback")
  .get(validateToken, getLast6MonthsCallBacksCount);
router.route("/lastyear/leads").get(validateToken, getLastYearLeadCountStatus);
router
  .route("/lastyear/callback")
  .get(validateToken, getLastYearCallBacksCount);
module.exports = router;
