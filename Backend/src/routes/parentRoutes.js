const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parentController");

router.get("/", parentController.getAllParents);
router.get("/:id", parentController.getParentById);
router.post("/create", parentController.createParent);
router.put("/edit", parentController.editParent);
router.put("/edit/:id", parentController.editParentById);

module.exports = router;
