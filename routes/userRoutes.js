const express = require("express");
const { adminLogin, studentLogin, userLogout } = require("../controllers/userController");
const router = express.Router();

router.route("/admin/login").post(adminLogin);

router.route("/student/login").post(studentLogin);

router.route("/logout").post(userLogout);

module.exports = router;
