import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [networks, setNetworks] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNetworks();
    const interval = setInterval(fetchNetworks, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchNetworks = async () => {
    try {
      const res = await axios.get("https://wifi-intrusion-detector-6af5.vercel.app/api/networks");

      setNetworks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = networks.filter(
    n =>
      n.ssid.toLowerCase().includes(search.toLowerCase()) ||
      n.bssid.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20, fontFamily: "Arial", background: "#121212", color: "#fff" }}>
      <h1>Wi-Fi Intrusion Detector</h1>
      <input
        type="text"
        placeholder="Search SSID or BSSID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: 8, marginBottom: 20, width: "100%" }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>SSID</th>
            <th>BSSID</th>
            <th>RSSI</th>
            <th>Last Seen</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(n => (
            <tr key={n.bssid}>
              <td>{n.ssid}</td>
              <td>{n.bssid}</td>
              <td>{n.rssi}</td>
              <td>{new Date(n.lastSeen).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
