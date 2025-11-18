const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.get("/:id", verifyToken, authorizeAdmin, adminController.getAdminById);
router.post(
  "/create",
  verifyToken,
  authorizeAdmin,
  adminController.createAdmin
);
router.put(
  "/edit/:id",
  verifyToken,
  authorizeAdmin,
  adminController.editAdminById
);

module.exports = router;
