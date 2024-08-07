const express = require("express");
const { adminLogin, userLogout } = require("../controllers/userController");
const {
  createUsers,
  deleteUsers,
  updateUsers,
  getUsersById,
  getUsers,
  changeUsersStatus,
  getUsersCount,
  getUserRoles,
  updateUserStatus,
  getActiveUsers,
  exportLeads,
  exportCallbacks,
  getReports,
  getReportsCount,
  getActiveUsersCount
} = require("../controllers/teamController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();
router.route("/").get(validateToken, getUsers).post(validateToken, createUsers);
router.route("/total").get(validateToken, getUsersCount);
router.route("/activeCount").get(validateToken, getActiveUsersCount);

router
  .route("/:userId/changestatus/:statusId")
  .put(validateToken, changeUsersStatus);
router.route("/reportsdata").get(validateToken, getReports);
router.route("/reportsCount").get(validateToken, getReportsCount);
router.route("/userroles").get(validateToken, getUserRoles);
router.route("/active").get(validateToken, getActiveUsers);
router.route("/:userId/status").put(validateToken, updateUserStatus);
router.route("/exportLeads").get(validateToken, exportLeads);
router.route("/exportCallbacks").get(validateToken, exportCallbacks);
router
  .route("/:id")
  .get(validateToken, getUsersById)
  .put(validateToken, updateUsers)
  .delete(validateToken, deleteUsers);

module.exports = router;
