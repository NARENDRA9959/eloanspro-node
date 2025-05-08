const express = require("express");
const {
  getLeadCountStatus,
  getFilesCountStatus,
  // getPartialCountStatus,
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
  getDisbursedAmount,
  getSanctionedAmount,
  getLastBeforeMonthLeadCountStatus,
  getThisMonthLeadCountStatus,
  getThisMonthCallBacksCount,
  getTwoMonthsAgoCallBacksCount,
  getuserLastMonthSanctionedAmount,
  getuserLastMonthDisbursedAmount,
  getuserCurrentMonthSanctionedAmount,
  getuserCurrentMonthDisbursedAmount,
  getuserLastLastMonthDisbursedAmount,
  getuserLastLastMonthSanctionedAmount,
  getuserTwoMonthsAgoSanctionedAmount,
  getuserTwoMonthsAgoDisbursedAmount
} = require("../controllers/allCountsController");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
router.route("/leads").get(validateToken, getLeadCountStatus);
router.route("/callback").get(validateToken, getCallbackCountStatus);
router.route("/files").get(validateToken, getFilesCountStatus);
// router.route("/partial").get(validateToken, getPartialCountStatus);
router.route("/rejects").get(validateToken, getRejectedCountStatus);
router.route("/logins").get(validateToken, getLoginsCountStatus);
router.route("/credit").get(validateToken, getCreditEvaluationCountStatus);
router.route("/monthcallbacks").get(validateToken, getMonthWiseCallBacksCount);
router.route("/monthleads").get(validateToken, getMonthWiseLeadCountStatus);
router.route("/week/leads").get(validateToken, getPast7DaysLeadCountStatus);
router.route("/week/callback").get(validateToken, getPast7DaysCallBacksCount);
router
  .route("/lastmonth/leads")
  .get(validateToken, getLastMonthLeadCountStatus);
router
  .route("/thismonth/leads")
  .get(validateToken, getThisMonthLeadCountStatus);

router
  .route("/thismonth/callbacks")
  .get(validateToken, getThisMonthCallBacksCount);

router
  .route("/lastbeforemonth/leads")
  .get(validateToken, getLastBeforeMonthLeadCountStatus);

router
  .route("/lastbeforemonth/callbacks")
  .get(validateToken, getTwoMonthsAgoCallBacksCount);
router
  .route("/lastmonth/callback")
  .get(validateToken, getLastMonthCallBacksCount);
router
  .route("/lastmonth/disbursed")
  .get(validateToken, getDisbursedAmount);
router
  .route("/firstmonth/approved")
  .get(validateToken, getSanctionedAmount);
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
router
  .route("/lastmonth/sancamount")
  .get(validateToken, getuserLastMonthSanctionedAmount);
router
  .route("/lastmonth/disbamount")
  .get(validateToken, getuserLastMonthDisbursedAmount);
router
  .route("/thismonth/sancamount")
  .get(validateToken, getuserCurrentMonthSanctionedAmount);
router
  .route("/thismonth/disbamount")
  .get(validateToken, getuserCurrentMonthDisbursedAmount);

router
  .route("/lastlastmonth/sancamount")
  .get(validateToken, getuserLastLastMonthSanctionedAmount);
router
  .route("/lastlastmonth/disbamount")
  .get(validateToken, getuserLastLastMonthDisbursedAmount);

router
  .route("/twomonthsago/sancamount")
  .get(validateToken, getuserTwoMonthsAgoSanctionedAmount);
router
  .route("/twomonthsago/disbamount")
  .get(validateToken, getuserTwoMonthsAgoDisbursedAmount);
module.exports = router;
