const express = require("express");
const { register, login } = require("../controllers/authController.js");
const upload = require("../middleware/upload.js");

const router = express.Router();

router.post("/register", upload.single("profilePhoto"), register); // Register with photo upload
router.post("/login", login);

module.exports = router;
