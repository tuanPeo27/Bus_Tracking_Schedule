const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, studentController.getAllStudents);
router.get("/route/:id", verifyToken, studentController.getStudentsByRouteId);
router.get("/parent/:id", verifyToken, studentController.getStudentsByParentId);
router.get(
  "/schedule/:id",
  verifyToken,
  studentController.getStudentsByScheduleId
);
router.post(
  "/create",
  // verifyToken,
  // authorizeAdmin,
  studentController.createStudent
);
router.put("/edit", verifyToken, authorizeAdmin, studentController.editStudent);
router.put(
  "/edit/:id",
  verifyToken,
  authorizeAdmin,
  studentController.editStudentById
);
router.delete(
  "/delete",
  verifyToken,
  authorizeAdmin,
  studentController.deleteStudent
);
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeAdmin,
  studentController.deleteStudentById
);

module.exports = router;
