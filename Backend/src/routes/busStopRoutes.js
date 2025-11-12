const express = require("express");
const router = express.Router();
const busStopController = require("../controllers/busStopController");
const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.post("/", verifyToken, busStopController.createBusStop);
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
router.delete("/delete/:id", verifyToken, busStopController.deleteBusStop);

module.exports = router;
