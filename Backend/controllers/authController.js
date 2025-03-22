const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
    try {
      const { fullName, email, password, phoneNumber } = req.body;
      const profilePhoto = req.file ? `/uploads/${req.file.filename}` : "default.jpg"; // Use uploaded photo or default
  
      const user = new User({ fullName, email, password, phoneNumber, profilePhoto });
      await user.save();
  
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // const user = await User.findOne({ email });

    // if (!user || !(await bcrypt.compare(password, user.password))) {
    //   return res.status(401).json({ message: "Invalid credentials" });
    // }
 // ✅ Step 1: Check if user exists
 const user = await User.findOne({ email });
 if (!user) {
   console.log("User not found in database"); // ✅ Debugging
   return res.status(400).json({ message: "Invalid credentials - user not found" });
 }

 console.log("User Found:", user); // ✅ Debugging

 // ✅ Step 2: Compare hashed password
 const isMatch = await bcrypt.compare(password, user.password);
 if (!isMatch) {
   console.log("Password mismatch"); // ✅ Debugging
   return res.status(400).json({ message: "Invalid credentials - incorrect password" });
 }

 console.log("Password Matched, Generating Token..."); // ✅ Debugging

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
