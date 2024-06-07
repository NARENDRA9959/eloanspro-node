const express = require("express");

const {
  getLenders,
  getLendersCount,
} = require("../controllers/lendersController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getLenders);
router.route("/total").get(validateToken, getLendersCount);

module.exports = router;
