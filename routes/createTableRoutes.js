const express = require("express");
const {
  createDscrTable,
  // createLoginInfoTable,
  // createFilesInProcessTable,
  // createApprovalsTable,
  // createDisbursalsTable,
} = require("../controllers/createTablesController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.route("/insertidDscrTable").post(validateToken, createDscrTable);
// router.route("/insertidLoginInfo").post(validateToken, createLoginInfoTable);
// router.route("/insertidApprovals").post(validateToken, createApprovalsTable);
// router.route("/insertidDisbursals").post(validateToken, createDisbursalsTable);

// router
//   .route("/insertidFilesInProcess")
//   .post(validateToken, createFilesInProcessTable);

module.exports = router;
