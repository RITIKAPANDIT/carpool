const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Access Denied! No Token Provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next(); // Move to next middleware
  } catch (error) {
    res.status(401).json({ message: "Invalid or Expired Token" });
  }
};
