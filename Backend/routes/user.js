const express = require("express");
const { updatePrivacy } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const { getUserRides } = require("../controllers/userController"); 
const router = express.Router();

router.put("/update-privacy", authMiddleware, updatePrivacy);
router.get("/myrides", authMiddleware, getUserRides);

module.exports = router;
