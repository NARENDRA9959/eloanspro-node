const express = require("express");
const { adminLogin, userLogout } = require("../controllers/userController");
const { createUsers,
  deleteUsers,
  updateUsers,
  getUsersById,
  getUsers,
  changeUsersStatus,
  getUsersCount,
  getUserRoles,updateUserStatus} =require("../controllers/teamController");
const {changeLeadStatus} =require("../controllers/leadsController")
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getUsers).post(validateToken, createUsers);
router.route("/total").get(validateToken,  getUsersCount); 
router.route("/:userId/changestatus/:statusId").put(validateToken, changeUsersStatus);

router.route("/userroles").get(validateToken, getUserRoles);
router.route('/:userId/status').put(validateToken,updateUserStatus);

router
  .route("/:id")
  .get(validateToken, getUsersById)
  .put(validateToken, updateUsers)
  .delete(validateToken, deleteUsers);

module.exports = router;