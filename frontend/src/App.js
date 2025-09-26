import React, { useEffect, useState } from "react";

function App() {
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("https://wifi-intrusion-detector-6af5-3rsbaka3p.vercel.app")
      .then(res => res.json())
      .then(setDevices);
  }, []);

  const filteredDevices = devices.filter(d =>
    d.ssid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.bssid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: 32 }}>
      <h2>Wi-Fi Devices Around</h2>
      <input
        type="text"
        placeholder="Search by SSID or BSSID"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16, padding: 8, width: '100%' }}
      />
      <table border="1" cellPadding={6} width="100%">
        <thead>
          <tr>
            <th>SSID</th>
            <th>BSSID</th>
            <th>RSSI</th>
            <th>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {filteredDevices.map((d, i) => (
            <tr key={i}>
              <td>{d.ssid}</td>
              <td>{d.bssid}</td>
              <td>{d.rssi}</td>
              <td>{new Date(d.scannedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
