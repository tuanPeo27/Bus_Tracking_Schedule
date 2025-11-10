const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/login", userController.login);
router.post("/forgotpass", userController.forgotPass);
router.delete("/delete", userController.deleteUser);
router.delete("/delete/:id", userController.deleteUserById);

module.exports = router;
