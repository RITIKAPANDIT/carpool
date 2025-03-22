const express = require("express");
const { sendSOS } = require("../controllers/sosController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/", authMiddleware, sendSOS); // Send SOS alert

module.exports = router;
