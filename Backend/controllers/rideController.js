const Ride = require("../models/Ride");
const User = require("../models/User");
const haversine = require("haversine-distance");
const { calculateRouteMatch } = require("../utils/rideUtils");
const { sendEmail, createRideRequestEmail } = require("../utils/emailUtils");

exports.createRide = async (req, res) => {
  try {
    const ride = new Ride({ ...req.body, creator: req.user.id });
    await ride.save();

    await User.findByIdAndUpdate(req.user.id, { $push: { ridesPublished: ride._id } });

    res.status(201).json({ message: "Ride created successfully", ride });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.joinRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId).populate('creator');
    const user = await User.findById(req.user.id);

    if (!ride || ride.status !== "open") {
      return res.status(400).json({ message: "Ride not available" });
    }

    if (ride.creator._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot join your own ride" });
    }

    if (ride.passengers.length >= ride.availableSeats) {
      return res.status(400).json({ message: "Ride is already full" });
    }

    if (ride.requests.includes(req.user.id)) {
      return res.status(400).json({ message: "You have already requested to join this ride" });
    }

    ride.requests.push(req.user.id);
    await ride.save();

    // Add ride request with pending status
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        rideRequests: {
          ride: ride._id,
          status: 'pending'
        }
      }
    });

    // Send email notification
    const rideDetails = {
      source: ride.pickupLocation,
      destination: ride.dropLocation,
      date: ride.departureTime,
      time: new Date(ride.departureTime).toLocaleTimeString()
    };

    const requesterDetails = {
      name: user.fullName,
      email: user.email,
      phone: user.phoneNumber
    };

    const emailContent = createRideRequestEmail(rideDetails, requesterDetails);
    await sendEmail(
      ride.creator.email,
      'New Ride Request',
      emailContent
    );

    res.status(200).json({ message: "Request to join ride sent", ride });
  } catch (error) {
    console.error("Error joining ride:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.acceptRideRequest = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    const user = await User.findById(req.body.userId);

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the ride creator can accept requests" });
    }

    if (!ride.requests.includes(user._id)) {
      return res.status(400).json({ message: "No request found from this user" });
    }

    if (ride.passengers.length >= ride.availableSeats) {
      return res.status(400).json({ message: "Ride is already full" });
    }

    // Update request status to accepted
    await User.findByIdAndUpdate(user._id, {
      $pull: { rideRequests: { ride: ride._id } }
    });
    
    await User.findByIdAndUpdate(user._id, {
      $push: {
        rideRequests: {
          ride: ride._id,
          status: 'accepted'
        }
      }
    });

    // Move user from requests to passengers
    ride.requests = ride.requests.filter((id) => id.toString() !== user._id.toString());
    ride.passengers.push(user._id);
    ride.availableSeats -= 1;

    user.ridesJoined.push(ride._id);

    if (ride.availableSeats === 0) {
      ride.status = "full";
    }

    await ride.save();
    await user.save();

    // Get populated ride data
    const populatedRide = await Ride.findById(ride._id)
      .populate('requests', 'fullName email gender phoneNumber preferences displayName isProfileBlurred')
      .populate('passengers', 'fullName email gender phoneNumber preferences displayName isProfileBlurred')
      .populate('creator', 'fullName email phoneNumber');

    res.status(200).json({ 
      message: "User accepted into the ride", 
      ride: populatedRide 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectRideRequest = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    const userId = req.body.userId;

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the ride creator can reject requests" });
    }

    if (!ride.requests.includes(userId)) {
      return res.status(400).json({ message: "No request found from this user" });
    }

    // Update user's rideRequests with rejected status
    await User.findByIdAndUpdate(userId, {
      $pull: { rideRequests: { ride: ride._id } }
    });
    
    await User.findByIdAndUpdate(userId, {
      $push: {
        rideRequests: {
          ride: ride._id,
          status: 'rejected'
        }
      }
    });

    // Remove user from ride's requests
    ride.requests = ride.requests.filter((id) => id.toString() !== userId);
    await ride.save();

    res.status(200).json({
      message: "User request rejected",
      ride: await Ride.findById(ride._id)
        .populate('requests', 'fullName email gender phoneNumber preferences displayName isProfileBlurred')
        .populate('passengers', 'fullName email gender phoneNumber preferences displayName isProfileBlurred')
        .populate('creator', 'fullName email phoneNumber')
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserRides = async (req, res) => {
  try {
    const userFields = 'fullName email gender phoneNumber preferences displayName isProfileBlurred';
    
    // Get user with populated data
    const user = await User.findById(req.user.id)
      .populate({
        path: "ridesPublished",
        populate: [
          { path: "requests", select: userFields },
          { path: "passengers", select: userFields }
        ]
      })
      .populate({
        path: "ridesJoined",
        populate: {
          path: "creator",
          select: "fullName email phoneNumber"
        }
      })
      .populate({
        path: "rideRequests.ride",
        populate: {
          path: "creator",
          select: "fullName email phoneNumber"
        }
      });

    // Transform ride requests into the expected format
    const requestedRides = user.rideRequests.map(request => ({
      ...request.ride.toObject(),
      status: request.status
    }));

    res.status(200).json({
      published: user.ridesPublished,
      joined: user.ridesJoined,
      requests: requestedRides
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchRides = async (req, res) => {
  try {
    const {
      origin,
      destination,
      date,
      seats,
      pickupLat,
      pickupLng,
      dropLat,
      dropLng
    } = req.query;

    let rides = await Ride.find({
      status: "open",
      availableSeats: { $gte: parseInt(seats) || 1 }
    }).populate("creator", "fullName email gender");

    rides = rides.map((ride) => {
      let score = 0;
      
      // Location proximity score (40%)
      const pickupDistance = haversine(
        { latitude: parseFloat(pickupLat), longitude: parseFloat(pickupLng) },
        { latitude: ride.pickupLocation.lat, longitude: ride.pickupLocation.lng }
      );
      const dropDistance = haversine(
        { latitude: parseFloat(dropLat), longitude: parseFloat(dropLng) },
        { latitude: ride.dropLocation.lat, longitude: ride.dropLocation.lng }
      );
      
      if (pickupDistance <= 2000) score += 20; // Within 2km of pickup
      if (dropDistance <= 2000) score += 20; // Within 2km of drop

      // Time match score (30%)
      if (date) {
        const searchDate = new Date(date);
        const rideDate = new Date(ride.departureTime);
        const timeDiff = Math.abs(searchDate - rideDate) / (1000 * 60 * 60); // Hours difference
        if (timeDiff <= 2) score += 30;
        else if (timeDiff <= 4) score += 20;
        else if (timeDiff <= 6) score += 10;
      }

      // Available seats score (30%)
      const seatScore = (ride.availableSeats >= (parseInt(seats) || 1)) ? 30 : 0;
      score += seatScore;

      return {
        ...ride.toObject(),
        score
      };
    });

    // Sort by score and filter out low matches
    rides = rides
      .filter(ride => ride.score >= 30) // At least 30% match
      .sort((a, b) => b.score - a.score);

    res.status(200).json({ rides });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};