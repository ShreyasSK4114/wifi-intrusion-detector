#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <ArduinoJson.h>

const char* ssid = "Sunil BSNL";
const char* password = "9844007710";
const char* serverUrl = "https://wifi-intrusion-detector-6af5.vercel.app/api/networks";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");
}

void loop() {
  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("No networks found");
  } else {
    DynamicJsonDocument doc(1024);
    JsonArray devices = doc.createNestedArray("devices");
    for (int i = 0; i < n; ++i) {
      JsonObject device = devices.createNestedObject();
      device["ssid"] = WiFi.SSID(i);
      device["bssid"] = WiFi.BSSIDstr(i);
      device["rssi"] = WiFi.RSSI(i);
    }

    if (WiFi.status() == WL_CONNECTED) {
      // Use WiFiClientSecure for HTTPS
      WiFiClientSecure client;
      client.setInsecure(); // Skip certificate verification (for testing)
      HTTPClient http;
      http.begin(client, serverUrl);
      http.addHeader("Content-Type", "application/json");

      String json;
      serializeJson(doc, json);
      int httpResponseCode = http.POST(json);

      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      http.end();
    }
  }

  delay(15000); // Scan every 15 seconds
}
