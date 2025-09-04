import express from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; 
import route from "./routes/route.js"
import { initSocket } from "./socket.js";
import { fun } from "./controlers/controls.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware to parse JSON
app.use(cors({
  origin: process.env.CLIENT_URL, // your React app URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1); // Stop the app if connection fails
  }
};
initSocket(server);
app.use(route)
// Example route
app.get("/", (req, res) => {
  res.send("Hello, MongoDB is connected 🚀");
});


// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
