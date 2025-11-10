const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/", studentController.getAllStudents);
router.get("/:id", studentController.getStudentsByRouteId);
router.post("/create", studentController.createStudent);
router.put("/edit", studentController.editStudent);
router.put("/edit/:id", studentController.editStudentById);
router.delete("/delete", studentController.deleteStudent);
router.delete("/delete/:id", studentController.deleteStudentById);

module.exports = router;
