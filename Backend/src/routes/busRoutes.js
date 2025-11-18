const express = require("express");
const router = express.Router();
const busController = require("../controllers/busController");

const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, busController.getAllBuses);
router.get("/:id", verifyToken, busController.getBusById);
router.get("/driver/:id", busController.getBusByDriverId);
router.post("/create", verifyToken, authorizeAdmin, busController.createBus);
router.put("/edit", verifyToken, authorizeAdmin, busController.editBus);
router.put("/edit/:id", verifyToken, authorizeAdmin, busController.editBusById);
router.delete("/delete", verifyToken, authorizeAdmin, busController.deleteBus);
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeAdmin,
  busController.deleteBusById
);

module.exports = router;
