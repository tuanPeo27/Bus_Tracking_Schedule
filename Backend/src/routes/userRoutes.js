const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.post("/login", userController.login);
router.post("/forgotpass", userController.forgotPass);
router.post(
  "/create/admin",
  verifyToken,
  authorizeAdmin,
  userController.createAdmin
);
router.delete(
  "/delete",
  verifyToken,
  authorizeAdmin,
  userController.deleteUser
);
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeAdmin,
  userController.deleteUserById
);

module.exports = router;
