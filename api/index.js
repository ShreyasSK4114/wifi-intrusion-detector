import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Schema
const networkSchema = new mongoose.Schema({
  ssid: String,
  bssid: { type: String, unique: true },
  rssi: Number,
  lastSeen: { type: Date, default: Date.now }
});

const Network = mongoose.model("Network", networkSchema);

// POST /api/networks
app.post("/api/networks", async (req, res) => {
  const devices = req.body.devices;
  try {
    for (let device of devices) {
      await Network.findOneAndUpdate(
        { bssid: device.bssid },
        { ...device, lastSeen: new Date() },
        { upsert: true, new: true }
      );
    }
    res.json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// GET /api/networks
app.get("/api/networks", async (req, res) => {
  try {
    const networks = await Network.find()
      .sort({ lastSeen: -1 })
      .limit(100);
    res.json(networks);
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default app;
