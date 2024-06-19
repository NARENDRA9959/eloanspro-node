const express = require("express");

const {
  getLenders,
  getLendersCount,
  getLenderById,
  createLender,
  updatelenders,
  changeLenderStatus
} = require("../controllers/lendersController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getLenders).post(validateToken,createLender);
router.route("/total").get(validateToken, getLendersCount);
router
  .route("/:id")
  .get(validateToken, getLenderById)
  .put(validateToken,updatelenders);
 
  router
  .route("/:lenderId/changestatus/:statusId")
  .put(validateToken, changeLenderStatus);


module.exports = router;
