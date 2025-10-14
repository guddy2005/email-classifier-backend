require("dotenv").config();

const express = require("express");
const http = require("http"); // Import http for Socket.IO
const { Server } = require("socket.io"); // Import Server for Socket.IO
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const emailRoutes = require("./routes/email.routes");

const app = express();

connectDB();

app.use(
  cors({
    origin: "https://email-classifier-zeta.vercel.app",
  }),
);

app.use(express.json());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api", emailRoutes);
app.get("/api", (req, res) => {
  res.send("AI Email Classifier API is running...");
});

// --- Server and Socket.IO Setup ---
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://email-classifier-zeta.vercel.app",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 A user connected with ID: ${socket.id}`);
});

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  // --- Listen on the httpServer, not the app ---
  httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for testing purposes
module.exports = { app, httpServer, io };
