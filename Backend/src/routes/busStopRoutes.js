const express = require("express");
const router = express.Router();
const busStopController = require("../controllers/busStopController");
const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.post("/create", verifyToken, busStopController.createBusStop);
router.get(
  "/route/:route_id",
  verifyToken,
  busStopController.getBusStopsByRouteId
);
router.put(
  "/edit/:id",
  verifyToken,
  authorizeAdmin,
  busStopController.editBusStop
);
router.put("/status/:id", verifyToken, busStopController.editStatusBusStop);
router.put("/status/all/:id", verifyToken, busStopController.editAllStatus);
router.delete("/delete/:id", verifyToken, busStopController.deleteBusStop);

module.exports = router;
