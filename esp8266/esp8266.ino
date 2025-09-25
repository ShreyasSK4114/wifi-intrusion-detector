#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid     = "Sunil BSNL";           // Your Wi-Fi SSID
const char* password = "9844007710";           // Your Wi-Fi password
const char* serverUrl = "http://192.168.1.37:5000/api/networks"; // Your backend IP and port

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
    WiFiClient client;                  // Create Wi-Fi client
    HTTPClient http;
    http.begin(client, serverUrl);     // Specify destination
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(json);

    Serial.println("Sent data: " + json);
    Serial.println("Response: " + String(httpResponseCode));

    http.end();
  }

  delay(15000);  // Wait 15 seconds before next scan
}
