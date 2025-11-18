const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routeController");
const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, routeController.getAllRoutes);
router.get("/:id", verifyToken, routeController.getRouteById);

router.get("/student/:id", verifyToken, routeController.getRouteByStudentId);

router.post(
  "/create",
  verifyToken,
  authorizeAdmin,
  routeController.createRoute
);
router.put("/edit", verifyToken, authorizeAdmin, routeController.editRoute);
router.put(
  "/edit/:id",
  verifyToken,
  authorizeAdmin,
  routeController.editRouteById
);
router.delete(
  "/delete",
  verifyToken,
  authorizeAdmin,
  routeController.deleteRoute
);
router.delete(
  "/delete/:id",
  verifyToken,
  authorizeAdmin,
  routeController.deleteRouteById
);

module.exports = router;
