const express = require("express");
const {
  getBankers,
  getBankersCount,
  getBankersById,
  createBanker,
  updateBanker,
  deleteBanker,
  changeBankersStatus,
  getBanks,

  getNewBankersCount
} = require("../controllers/bankersController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();
router
  .route("/")
  .get(validateToken, getBankers)
  .post(validateToken, createBanker);
router.route("/banks").get(validateToken, getBanks);
router.route("/total").get(validateToken, getBankersCount);
router.route("/newBankerscount").get(validateToken, getNewBankersCount);

router
  .route("/:bankerId/changestatus/:statusId")
  .put(validateToken, changeBankersStatus);
router
  .route("/:id")
  .get(validateToken, getBankersById)
  .put(validateToken, updateBanker)
  .delete(validateToken, deleteBanker);

module.exports = router;
