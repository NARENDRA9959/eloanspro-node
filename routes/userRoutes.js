const express = require("express");
const { adminLogin, userLogout } = require("../controllers/userController");
const { getActiveUsers } = require("../controllers/teamController");
const router = express.Router();

router.route("/admin/login").post(adminLogin);

router.route("/logout").post(userLogout);

router.route("/sources").get(getActiveUsers);

module.exports = router;
