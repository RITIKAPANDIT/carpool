// const express = require("express");
// const {
//   createRide,
//   joinRide,
//   getAvailableRides,
//   getUserRides,
//   acceptRideRequest,
//   rejectRideRequest,
//   matchRides // ✅ Import matchRides function
// } = require("../controllers/rideController.js"); 

// const authMiddleware = require("../middleware/auth");
// const router = express.Router();

// // ✅ Ensure all controller functions are correctly imported
// router.post("/", authMiddleware, createRide);       // Create a ride
// router.post("/join/:rideId", authMiddleware, joinRide);  // Join a ride
// router.post("/accept/:rideId", authMiddleware, acceptRideRequest); // ✅ Accept request
// router.post("/reject/:rideId", authMiddleware, rejectRideRequest); // ✅ Reject request
// router.get("/", getAvailableRides);               // Get all rides
// router.get("/myrides", authMiddleware, getUserRides);  // Get user rides

// router.post("/match", authMiddleware, matchRides); // ✅ Intelligent ride matching
// module.exports = router;
const express = require("express");
const {
  createRide,
  joinRide,
  getAvailableRides,
  getUserRides,
  acceptRideRequest,
  rejectRideRequest,
  matchRides // ✅ Ensure this function is correctly imported
} = require("../controllers/rideController"); // ✅ Import all controllers properly

const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ✅ Ensure all controller functions are correctly used
router.post("/", authMiddleware, createRide);       // Create a ride
router.post("/match", authMiddleware, matchRides); // Intelligent ride matching
router.post("/join/:rideId", authMiddleware, joinRide);  // Join a ride
router.post("/accept/:rideId", authMiddleware, acceptRideRequest); // Accept request
router.post("/reject/:rideId", authMiddleware, rejectRideRequest); // Reject request
router.get("/", getAvailableRides);               // Get all rides
router.get("/myrides", authMiddleware, getUserRides);  // Get user rides


module.exports = router;
