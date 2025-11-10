const express = require("express");
const router = express.Router();
const busController = require("../controllers/busController");

router.get("/", busController.getAllBuses);
router.get("/:id", busController.getBusById);
router.post("/create", busController.createBus);
router.put("/edit", busController.editBus);
router.put("/edit/:id", busController.editBusById);
router.delete("/delete", busController.deleteBus);
router.delete("/delete/:id", busController.deleteBusById);

module.exports = router;
