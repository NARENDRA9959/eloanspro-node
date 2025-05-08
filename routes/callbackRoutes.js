const express = require("express");
const {
  getCallBacks,
  getCallBacksCount,
  getCallBackById,
  createCallBack,
  updateCallBack,
  deleteCallBack,
  changeCallbackStatus,
  getTotalCallbacksCountArray,
  getStatusCallbacksCountArray,
} = require("../controllers/callbacksController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();
router
  .route("/")
  .get(validateToken, getCallBacks)
  .post(validateToken, createCallBack);
router.route("/total").get(validateToken, getCallBacksCount);
router
  .route("/:callBackId/changestatus/:statusId")
  .put(validateToken, changeCallbackStatus);
router.route("/arraycount").get(validateToken, getTotalCallbacksCountArray);
router.route("/statuscount").get(validateToken, getStatusCallbacksCountArray);
router
  .route("/:id")
  .get(validateToken, getCallBackById)
  .put(validateToken, updateCallBack)
  .delete(validateToken, deleteCallBack);
module.exports = router;
