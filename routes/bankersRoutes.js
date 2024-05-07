const express = require("express");
const {
    getBankers,
    getBankersCount,
    getBankersById,
    createBanker,
    updateBanker,
    deleteBanker,
    changeBankersStatus,
 
} = require("../controllers/bankersController");

const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getBankers).post(validateToken, createBanker);

router.route("/total").get(validateToken, getBankersCount);

router.route("/:bankerId/changestatus/:statusId").put(validateToken, changeBankersStatus);


router
  .route("/:id")
  .get(validateToken, getBankersById)
  .put(validateToken, updateBanker)
  .delete(validateToken, deleteBanker);

module.exports = router;
