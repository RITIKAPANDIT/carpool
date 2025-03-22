const Ride = require("../models/Ride");
const User = require("../models/User");
const haversine = require("haversine-distance");
const { calculateRouteMatch } = require("../utils/rideUtils");
exports.createRide = async (req, res) => {
    try {
      const ride = new Ride({ ...req.body, creator: req.user.id }); // ✅ Assign the creator automatically
      await ride.save();
  
      await User.findByIdAndUpdate(req.user.id, { $push: { ridesPublished: ride._id } });
  
      res.status(201).json({ message: "Ride created successfully", ride });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.joinRide = async (req, res) => {
    try {
      const ride = await Ride.findById(req.params.rideId);
      const user = await User.findById(req.user.id);
  
      if (!ride || ride.status !== "open") {
        return res.status(400).json({ message: "Ride not available" });
      }
  
      // ✅ Prevent users from joining their own ride
      if (ride.creator.toString() === req.user.id) {
        return res.status(400).json({ message: "You cannot join your own ride" });
      }
  
      // ✅ Check if ride is already full
      if (ride.passengers.length >= ride.availableSeats) {
        return res.status(400).json({ message: "Ride is already full" });
      }
  
      // ✅ Check if the user has already requested to join
      if (ride.requests.includes(req.user.id)) {
        return res.status(400).json({ message: "You have already requested to join this ride" });
      }
  
      console.log("Adding user to requests:", req.user.id); // ✅ Debugging
  
      // ✅ Add user to ride's requests instead of passengers
      ride.requests.push(req.user.id);
  
      await ride.save();
  
      console.log("Updated Ride Requests:", ride.requests); // ✅ Debugging
  
      res.status(200).json({ message: "Request to join ride sent", ride });
    } catch (error) {
      console.error("Error joining ride:", error); // ✅ Debugging
      res.status(500).json({ message: error.message });
    }
  };
  
// exports.joinRide = async (req, res) => {
//   try {
//     const ride = await Ride.findById(req.params.rideId);
//     const user = await User.findById(req.user.id);

//     if (!ride || ride.status !== "open") {
//       return res.status(400).json({ message: "Ride not available" });
//     }

//     if (ride.passengers.includes(req.user.id)) {
//       return res.status(400).json({ message: "Already joined this ride" });
//     }

//     ride.passengers.push(req.user.id);
//     user.ridesJoined.push(ride._id);

//     if (ride.passengers.length >= ride.availableSeats) {
//       ride.status = "full";
//     }

//     await ride.save();
//     await user.save();

//     res.status(200).json({ message: "Joined the ride successfully", ride });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// exports.joinRide = async (req, res) => {
//     try {
//       const ride = await Ride.findById(req.params.rideId);
//       const user = await User.findById(req.user.id);
  
//       if (!ride || ride.status !== "open") {
//         return res.status(400).json({ message: "Ride not available" });
//       }
  
//       // ✅ Prevent users from joining their own ride
//       if (ride.creator.toString() === req.user.id) {
//         return res.status(400).json({ message: "You cannot join your own ride" });
//       }
  
//       // ✅ Check if ride is already full
//       if (ride.passengers.length >= ride.availableSeats) {
//         return res.status(400).json({ message: "Ride is already full" });
//       }
  
//     //   // ✅ Check if the user has already joined the ride
//     //   if (ride.passengers.includes(req.user.id)) {
//     //     return res.status(400).json({ message: "You have already joined this ride" });
//     //   }
  
//     console.log("Adding user to ride:", req.user.id); // ✅ Debugging

//     // ✅ Add user to ride & update user's joined rides
//     ride.passengers.push(req.user.id);
//     user.ridesJoined.push(ride._id);
//       ride.availableSeats -= 1;
  
//       // ✅ If ride is full, update status
//       if (ride.availableSeats === 0) {
//         ride.status = "full";
//       }
  
//       await ride.save();
//       await user.save();
  
//       res.status(200).json({ message: "Joined ride successfully", ride });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };

exports.acceptRideRequest = async (req, res) => {
    try {
      const ride = await Ride.findById(req.params.rideId);
      const user = await User.findById(req.body.userId); // Get passenger ID from request body
  
      if (!ride) return res.status(404).json({ message: "Ride not found" });
  
      // ✅ Ensure only the ride creator can accept requests
      if (ride.creator.toString() !== req.user.id) {
        return res.status(403).json({ message: "Only the ride creator can accept requests" });
      }
  
      // ✅ Check if user requested to join
      if (!ride.requests.includes(user._id)) {
        return res.status(400).json({ message: "No request found from this user" });
      }
  
      // ✅ Check if ride is full
      if (ride.passengers.length >= ride.availableSeats) {
        return res.status(400).json({ message: "Ride is already full" });
      }
  
      console.log("Accepting user into ride:", user._id); // ✅ Debugging
  
      // ✅ Move user from requests[] to passengers[]
      ride.requests = ride.requests.filter((id) => id.toString() !== user._id.toString());
      ride.passengers.push(user._id);
      ride.availableSeats -= 1;
  
      // ✅ Add ride to user's `ridesJoined`
      user.ridesJoined.push(ride._id);
  
      if (ride.availableSeats === 0) {
        ride.status = "full";
      }
  
      await ride.save();
      await user.save();
  
      console.log("Updated Ride Passengers:", ride.passengers); // ✅ Debugging
      console.log("Updated User Joined Rides:", user.ridesJoined); // ✅ Debugging
  
      res.status(200).json({ message: "User accepted into the ride", ride });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  exports.rejectRideRequest = async (req, res) => {
    try {
      const ride = await Ride.findById(req.params.rideId);
      const userId = req.body.userId; // ID of the passenger to reject
  
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
  
      // ✅ Ensure only the ride creator can reject requests
      if (ride.creator.toString() !== req.user.id) {
        return res.status(403).json({ message: "Only the ride creator can reject requests" });
      }
  
      // ✅ Check if the user requested to join
      if (!ride.requests.includes(userId)) {
        console.log("User ID not found in requests:", userId); // ✅ Debugging
        return res.status(400).json({ message: "No request found from this user" });
      }
  
      console.log("Rejecting user:", userId); // ✅ Debugging
  
      // ✅ Remove user from requests
      ride.requests = ride.requests.filter((id) => id.toString() !== userId);
  
      await ride.save();
  
      console.log("Updated Ride Requests:", ride.requests); // ✅ Debugging
  
      res.status(200).json({ message: "User request rejected", ride });
    } catch (error) {
      console.error("Error rejecting request:", error); // ✅ Debugging
      res.status(500).json({ message: error.message });
    }
  };
  
  
exports.getAvailableRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: "open" }).populate("creator", "fullName email");
    res.status(200).json({ rides });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserRides = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("ridesPublished")
      .populate("ridesJoined");

    res.status(200).json({
      published: user.ridesPublished,
      joined: user.ridesJoined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.matchRides = async (req, res) => {
    try {
      const { pickupLat, pickupLng, route, departureTime, preferences, gender } = req.body;
  
      let rides = await Ride.find({ status: "open" }).populate("creator", "fullName gender");
  
      rides = rides.map((ride) => {
        let score = 0;
  
        // ✅ Proximity Score (Lower distance = higher score)
        const distancePickup = haversine(
          { latitude: pickupLat, longitude: pickupLng },
          { latitude: ride.route[0].lat, longitude: ride.route[0].lng }
        );
        if (distancePickup <= 2000) score += 40; // If within 2km, increase score
  
        // ✅ Route Similarity Score
        let matchPercentage = calculateRouteMatch(route, ride.route);
        score += matchPercentage * 0.5; // Weighted by 50%
  
        // ✅ Timing Match
        const rideTime = new Date(ride.departureTime).getTime();
        const userTime = new Date(departureTime).getTime();
        const timeDifference = Math.abs(rideTime - userTime) / (1000 * 60); // Minutes difference
        if (timeDifference <= 30) score += 20; // Exact time match
  
        // ✅ Preference Matching
        if (
          ride.preferences.music === preferences.music &&
          ride.preferences.smoking === preferences.smoking &&
          ride.preferences.petFriendly === preferences.petFriendly
        ) {
          score += 10;
        }
  
        // ✅ Gender Preference Match
        if (ride.preferences.genderPreference !== "any" && ride.preferences.genderPreference !== gender) {
          score -= 20; // Reduce score if gender preference does not match
        }
  
        return { ...ride.toObject(), score };
      });
  
      // ✅ Sort rides by best match score
      rides.sort((a, b) => b.score - a.score);
  
      res.status(200).json({ success: true, rides });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  