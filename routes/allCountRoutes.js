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
  getCallbackCountStatus,
  getRejectedCountStatus,
  getLoginsCountStatus,
  getMonthWiseFilesCountStatus,
  getMonthWiseCreditsCountStatus,
  getMonthWisePartialCountStatus,
  getLastMonthDisbursedAmount,
  getCurrentMonthDisbursedAmount,
  getLastLastMonthDisbursedAmount,
  getLastLastLastMonthDisbursedAmount,
  getLastLastLastLastMonthDisbursedAmount,
  getfirstMonthDisbursedAmount,
  getCurrentMonthSanctionedAmount,
  getLastMonthSanctionedAmount,
  getLastLastMonthSanctionedAmount,
  getLastLastLastMonthSanctionedAmount,
  getLastLastLastLastMonthSanctionedAmount,
  getfirstMonthSanctionedAmount
} = require("../controllers/allCountsController");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
router.route("/leads").get(validateToken, getLeadCountStatus);
router.route("/callback").get(validateToken, getCallbackCountStatus);
router.route("/files").get(validateToken, getFilesCountStatus);
router.route("/partial").get(validateToken, getPartialCountStatus);
router.route("/rejects").get(validateToken, getRejectedCountStatus);
router.route("/logins").get(validateToken, getLoginsCountStatus);
router.route("/credit").get(validateToken, getCreditEvaluationCountStatus);
router.route("/monthcallbacks").get(validateToken, getMonthWiseCallBacksCount);
router.route("/monthleads").get(validateToken, getMonthWiseLeadCountStatus);
router.route("/monthfiles").get(validateToken, getMonthWiseFilesCountStatus);
router.route("/monthcredits").get(validateToken, getMonthWiseCreditsCountStatus);
router.route("/monthpartial").get(validateToken, getMonthWisePartialCountStatus);
router.route("/week/leads").get(validateToken, getPast7DaysLeadCountStatus);
router.route("/week/callback").get(validateToken, getPast7DaysCallBacksCount);
router
  .route("/lastmonth/leads")
  .get(validateToken, getLastMonthLeadCountStatus);
router
  .route("/lastmonth/callback")
  .get(validateToken, getLastMonthCallBacksCount);
router
  .route("/lastmonth/disbursed")
  .get(validateToken, getLastMonthDisbursedAmount);
router
  .route("/lastmonth/approved")
  .get(validateToken, getLastMonthSanctionedAmount);
router
  .route("/lastlastmonth/disbursed")
  .get(validateToken, getLastLastMonthDisbursedAmount);
router
  .route("/lastlastmonth/approved")
  .get(validateToken, getLastLastMonthSanctionedAmount);
router
  .route("/currentmonth/disbursed")
  .get(validateToken, getCurrentMonthDisbursedAmount);
router
  .route("/currentmonth/approved")
  .get(validateToken, getCurrentMonthSanctionedAmount);
router
  .route("/lastlastlastmonth/disbursed")
  .get(validateToken, getLastLastLastMonthDisbursedAmount);
router
  .route("/lastlastlastmonth/approved")
  .get(validateToken, getLastLastLastMonthSanctionedAmount);
router
  .route("/lastlastlastlastmonth/disbursed")
  .get(validateToken, getLastLastLastLastMonthDisbursedAmount);
router
  .route("/lastlastlastlastmonth/approved")
  .get(validateToken, getLastLastLastLastMonthSanctionedAmount);
router
  .route("/firstmonth/disbursed")
  .get(validateToken, getfirstMonthDisbursedAmount);
router
  .route("/firstmonth/approved")
  .get(validateToken, getfirstMonthSanctionedAmount);
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
