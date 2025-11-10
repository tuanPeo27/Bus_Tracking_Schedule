const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");

router.get("/", driverController.getAllDrivers);
router.get("/:id", driverController.getDriverById);
router.post("/create", driverController.createDriver);
router.put("/edit", driverController.editDriver);
router.put("/edit/:id", driverController.editDriverById);

module.exports = router;
