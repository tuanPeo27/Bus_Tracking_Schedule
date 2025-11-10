const express = require("express");
const router = express.Router();
const busStopController = require("../controllers/busStopController");

router.post("/", busStopController.createBusStop);
router.get("/route/:route_id", busStopController.getBusStopsByRouteId);
router.put("/edit/:id", busStopController.editBusStop);
router.delete("/delete/:id", busStopController.deleteBusStop);

module.exports = router;
