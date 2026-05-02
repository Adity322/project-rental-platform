const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
dotenv.config();
const connectDB = require("./config/db");
connectDB();

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",                        // local dev
  process.env.FRONTEND_URL,                       // Vercel URL from env
]

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true
}))

app.use(express.json());

// HTTP server
const server = http.createServer(app);

// ✅ Socket.io with proper CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
});

// make io available everywhere
app.set("io", io);

// socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// routes
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const amenityRoutes = require("./routes/amenityRoutes");
const propertyRoutes = require("./routes/propertyRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/properties", propertyRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});