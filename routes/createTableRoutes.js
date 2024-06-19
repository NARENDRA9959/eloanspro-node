const express = require("express");
const { createDscrTable } = require("../controllers/createTablesController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();

router.route("/insertidDscrTable").post(validateToken, createDscrTable);

module.exports = router;

