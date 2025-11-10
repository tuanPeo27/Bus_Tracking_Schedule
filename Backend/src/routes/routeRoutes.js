const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routeController");

router.get("/", routeController.getAllRoutes);
router.get("/:id", routeController.getRouteById);
router.post("/create", routeController.createRoute);
router.put("/edit", routeController.editRoute);
router.put("/edit/:id", routeController.editRouteById);
router.delete("/delete", routeController.deleteRoute);
router.delete("/delete/:id", routeController.deleteRouteById);

module.exports = router;
