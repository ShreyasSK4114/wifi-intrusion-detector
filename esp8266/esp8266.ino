#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid     = "Sunil BSNL";            // Replace with your Wi-Fi SSID
const char* password = "9844007710";        // Replace with your Wi-Fi password
const char* serverUrl = "https://wifi-intrusion-detector-6af5-3rsbaka3p.vercel.app/api/networks"; // Your deployed backend API URL

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting...");
  }
  Serial.println("Connected.");
}

void loop() {
  int n = WiFi.scanNetworks();
  String json = "[";
  for (int i = 0; i < n; ++i) {
    json += "{\"ssid\":\"" + WiFi.SSID(i) + "\",\"bssid\":\"" + WiFi.BSSIDstr(i) + "\",\"rssi\":" + String(WiFi.RSSI(i)) + "}";
    if (i != n - 1) json += ",";
  }
  json += "]";

  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;                // Use secure client for HTTPS
    client.setInsecure();                   // Skip certificate validation (for testing)
    HTTPClient http;
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(json);

    Serial.println("Sent data: " + json);
    Serial.println("Response: " + String(httpResponseCode));

    http.end();
  }
  delay(15000);
}
