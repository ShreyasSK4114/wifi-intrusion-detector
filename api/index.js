const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const DeviceSchema = new mongoose.Schema({
  ssid: String,
  bssid: String,
  rssi: Number,
  scannedAt: { type: Date, default: Date.now }
});
const Device = mongoose.model('Device', DeviceSchema);

app.post('/api/networks', async (req, res) => {
  const devices = req.body;
  const ops = devices.map(d => ({
    updateOne: {
      filter: { bssid: d.bssid },
      update: { $set: { ssid: d.ssid, rssi: d.rssi, scannedAt: new Date() } },
      upsert: true,
    },
  }));
  await Device.bulkWrite(ops);
  res.status(200).json({ message: 'Devices updated' });
});

app.get('/api/networks', async (req, res) => {
  const devices = await Device.find().sort({ scannedAt: -1 }).limit(100);
  res.json(devices);
});

module.exports = app;
