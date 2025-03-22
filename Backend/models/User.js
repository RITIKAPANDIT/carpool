const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    profilePhoto: { type: String, default: "default.jpg" }, // Original image

    preferences: { music: Boolean, smoking: Boolean, petFriendly: Boolean },
    displayName: { type: String, default: "" },
    isProfileBlurred: { type: Boolean, default: true },
    ridesPublished: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ride" }], // Rides user created
    ridesJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ride" }],
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
