const User = require("../models/User");

exports.getUserRides = async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .populate("ridesPublished")
        .populate("ridesJoined");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        published: user.ridesPublished,
        joined: user.ridesJoined,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.updatePrivacy = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.displayName = req.body.displayName || user.displayName;
    user.isProfileBlurred = req.body.isProfileBlurred;

    await user.save();
    res.status(200).json({ message: "Privacy settings updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
