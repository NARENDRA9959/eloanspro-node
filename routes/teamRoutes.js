const express = require("express");
const { adminLogin, userLogout } = require("../controllers/userController");
const {
  createUsers,
  deleteUsers,
  updateUsers,
  getUsersById,
  getUsers,
  // changeUsersStatus,
  getUsersCount,
  getUserRoles,
  updateUserStatus,
  getActiveUsers,
  

  getActiveUsersCount
} = require("../controllers/teamController");
const validateToken = require("../middleware/validateTokenHandler");
const router = express.Router();
router.route("/").get(validateToken, getUsers).post(validateToken, createUsers);
router.route("/total").get(validateToken, getUsersCount);
router.route("/activeCount").get(validateToken, getActiveUsersCount);

// router
//   .route("/:userId/changestatus/:statusId")
//   .put(validateToken, changeUsersStatus);

router.route("/userroles").get(validateToken, getUserRoles);
router.route("/active").get(validateToken, getActiveUsers);
router.route("/:userId/status").put(validateToken, updateUserStatus);

router
  .route("/:id")
  .get(validateToken, getUsersById)
  .put(validateToken, updateUsers)
  .delete(validateToken, deleteUsers);

module.exports = router;
