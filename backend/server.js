import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./src/routes/auth.js";
import requestRoutes from "./src/routes/requests.js";
import dashboardRoutes from "./src/routes/dashboard.js";
import rewardRoutes from "./src/routes/rewards.js";

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "EcoLoop API" }));
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rewards", rewardRoutes);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const port = process.env.PORT || 5674;
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ecoloop")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`EcoLoop API running at http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    console.error("Check that MongoDB is running and MONGO_URI in backend/.env is correct.");
    process.exit(1);
  });
