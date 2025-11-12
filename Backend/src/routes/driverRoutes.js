const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");

const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, driverController.getAllDrivers);
router.get("/:id", verifyToken, driverController.getDriverById);

router.post(
  "/create",
  verifyToken,
  authorizeAdmin,
  driverController.createDriver
);
router.put("/edit", verifyToken, driverController.editDriver);
router.put(
  "/edit/:id",
  verifyToken,
  authorizeAdmin,
  driverController.editDriverById
);

module.exports = router;
