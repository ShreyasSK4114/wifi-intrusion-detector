const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Device Schema
const DeviceSchema = new mongoose.Schema({
  ssid: String,
  bssid: String,
  rssi: Number,
  scannedAt: { type: Date, default: Date.now },
  deviceId: String, // track which ESP sent it
});

const Device = mongoose.model('Device', DeviceSchema);

const app = express();

// Enable CORS for your frontend domain
app.use(cors({
  origin: 'https://wifi-intrusion-detector-6af5.vercel.app', // replace with your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ESP POST endpoint
app.post('/api/networks', async (req, res) => {
  const { deviceId, scans } = req.body;

  if (!deviceId || !Array.isArray(scans)) {
    return res.status(400).json({ error: 'Invalid payload: deviceId + scans[] required' });
  }

  // Fetch known BSSIDs
  const knownDevices = await Device.find({}, 'bssid');
  const knownBSSIDs = new Set(knownDevices.map(d => d.bssid));

  // Identify new devices
  const newDevices = scans.filter(d => !knownBSSIDs.has(d.bssid));

  // Prepare bulk operations (update existing or insert if new)
  const ops = scans.map(d => ({
    updateOne: {
      filter: { bssid: d.bssid },
      update: { 
        $set: { ssid: d.ssid, rssi: d.rssi, scannedAt: new Date(), deviceId } 
      },
      upsert: true,
    },
  }));

  await Device.bulkWrite(ops);

  console.log(`[${deviceId}] Total devices: ${scans.length}, New devices: ${newDevices.length}`);

  res.status(200).json({
    message: 'Devices processed',
    totalDevices: scans.length,
    newDevicesCount: newDevices.length,
  });
});

// Frontend GET endpoint
app.get('/api/networks', async (req, res) => {
  const devices = await Device.find().sort({ scannedAt: -1 }).limit(100);
  res.json(devices);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
