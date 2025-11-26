const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, scheduleController.getAllSchedules);
router.get("/:id", verifyToken, scheduleController.getScheduleById);
router.get(
  "/driver/:driverId",
  verifyToken,
  scheduleController.getScheduleByDriverId
);
router.get(
  "/student/:studentId",
  verifyToken,
  scheduleController.getScheduleByStudentId
);
router.post(
  "/create",
  verifyToken,
  authorizeAdmin,
  scheduleController.createSchedule
);
router.put(
  "/edit",
  verifyToken,
  authorizeAdmin,
  scheduleController.editSchedule
);
router.put(
  "/edit/:id",
  verifyToken,
  authorizeAdmin,
  scheduleController.editScheduleById
);
router.delete(
  "/delete",
  verifyToken,
  authorizeAdmin,
  scheduleController.deleteSchedule
);
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeAdmin,
  scheduleController.deleteScheduleById
);

module.exports = router;
