const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

router.get("/", scheduleController.getAllSchedules);
router.get("/:id", scheduleController.getScheduleById);
router.get("/driver/:driverId", scheduleController.getScheduleByDriverId);
router.post("/create", scheduleController.createSchedule);
router.put("/edit", scheduleController.editSchedule);
router.put("/edit/:id", scheduleController.editScheduleById);
router.delete("/delete", scheduleController.deleteSchedule);
router.delete("/delete/:id", scheduleController.deleteScheduleById);

module.exports = router;
