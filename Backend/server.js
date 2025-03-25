require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const socketIo = require("socket.io");

// Initialize Express App
const app = express();
const server = http.createServer(app);

// WebSocket Setup
const io = socketIo(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  // Listen for live location sharing
  socket.on("shareLocation", ({ userId, location }) => {
    io.emit(`locationUpdate-${userId}`, location);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

// Middleware
app.use(express.json());
// app.use(cors());
app.use(cors())

// Connect to Database
connectDB();
app.get("/", (req, res) => {
  res.send({
    activeStatus: true,
    error:false,
  })
});
// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/rides", require("./routes/rides"));
app.use("/api/sos", require("./routes/sos"));
app.use("/uploads", express.static("uploads")); // Serve profile photos
app.use("/api/user", require("./routes/user"));

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));














