// const mongoose = require("mongoose");

// const RideSchema = new mongoose.Schema({
//   creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User who created the ride
//   pickupLocation: { type: String, required: true },
//   dropLocation: { type: String, required: true },
//   departureTime: { type: Date, required: true },
//   availableSeats: { type: Number, required: true },
//   vehicleDetails: { model: String, licensePlate: String },
//   preferences: { music: Boolean, smoking: Boolean, petFriendly: Boolean },
//   route: [{ lat: Number, lng: Number }], // Route points for ride matching
//   passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who joined the ride
//   status: { type: String, enum: ["open", "full", "completed"], default: "open" },
// }, { timestamps: true });

// module.exports = mongoose.model("Ride", RideSchema);

const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Changed from `driver` to `creator`
    pickupLocation: { type: String, required: true },
    dropLocation: { type: String, required: true },
    departureTime: { type: Date, required: true },
    availableSeats: { type: Number, required: true },
    vehicleDetails: {
      model: { type: String, required: true },
      licensePlate: { type: String, required: true }
    },
    preferences: {
      music: Boolean,
      smoking: Boolean,
      petFriendly: Boolean,
      genderPreference: { type: String, enum: ["male", "female", "any"], default: "any" }
    },
    route: [{ lat: Number, lng: Number }], // ✅ Store route coordinates
    passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["open", "full", "completed"], default: "open" },
    requests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // ✅ Store pending requests before approval
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", RideSchema);

