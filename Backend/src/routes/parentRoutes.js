const express = require("express");
const router = express.Router();
const parentController = require("../controllers/parentController");

const { verifyToken, authorizeAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, parentController.getAllParents);
router.get("/:id", verifyToken, parentController.getParentById);
router.post(
  "/create",
  verifyToken,
  authorizeAdmin,
  parentController.createParent
);
router.put("/edit", verifyToken, authorizeAdmin, parentController.editParent);
router.put(
  "/edit/:id",
  verifyToken,
  authorizeAdmin,
  parentController.editParentById
);

router.delete(
  "/delete/:id",
  verifyToken,
  authorizeAdmin,
  parentController.deleteParentById
);

module.exports = router;
