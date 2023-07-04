const express = require("express");
const userLogin = require("../controllers/userController");
const router = express.Router();

router.route("/").post(userLogin);

module.exports = router;
