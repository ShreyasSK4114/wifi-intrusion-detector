const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


const DeviceSchema = new mongoose.Schema({
  ssid: String,
  bssid: String,
  rssi: Number,
  scannedAt: { type: Date, default: Date.now },
});
const Device = mongoose.model('Device', DeviceSchema);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/networks', async (req, res) => {
  const incomingDevices = req.body;

  // Fetch all known BSSIDs from DB
  const knownDevices = await Device.find({}, 'bssid');
  const knownBSSIDs = new Set(knownDevices.map(d => d.bssid));

  // Identify new devices not in DB
  const newDevices = incomingDevices.filter(d => !knownBSSIDs.has(d.bssid));

  // Prepare bulk operations (update existing or insert if new)
  const ops = incomingDevices.map(d => ({
    updateOne: {
      filter: { bssid: d.bssid },
      update: { $set: { ssid: d.ssid, rssi: d.rssi, scannedAt: new Date() } },
      upsert: true,
    },
  }));

  await Device.bulkWrite(ops);

  console.log('Total devices:', incomingDevices.length);
  console.log('New devices detected:', newDevices.length);

  res.status(200).json({ 
    message: 'Devices processed', 
    totalDevices: incomingDevices.length,
    newDevicesCount: newDevices.length 
  });
});


app.get('/api/networks', async (req, res) => {
  const devices = await Device.find().sort({ scannedAt: -1 }).limit(100);
  res.json(devices);
});

app.listen(5000, () => console.log('Server running on port 5000'));
