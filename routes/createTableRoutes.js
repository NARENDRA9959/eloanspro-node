const express = require("express");
const {
  createDscrTable,
  createleadDocumentsTable

} = require("../controllers/createTablesController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.route("/insertidDscrTable").post(validateToken, createDscrTable);
router.route("/insertidleaddocumentsTable").post(validateToken, createleadDocumentsTable);


module.exports = router;
