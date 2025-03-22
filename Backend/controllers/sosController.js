const User = require("../models/User");
const twilio = require("../config/twilio");

exports.sendSOS = async (req, res) => {
  try {
    const { location, emergencyContact } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send SOS alert via Twilio
    await twilio.messages.create({
      body: `🚨 Emergency Alert! ${user.fullName} is in danger at location: ${location.lat}, ${location.lng}. Please help!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: emergencyContact,
    });

    res.status(200).json({ message: "SOS Alert Sent Successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
