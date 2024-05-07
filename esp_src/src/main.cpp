#include <Arduino.h>
#include <stdio.h>
#include <iostream>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <Adafruit_BMP085.h>
#include <SPI.h>
#include <string>
#include <ArduinoJson.h>
#include <chrono>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>

#define ESP_ID 000001;

const char *brokerAddress ="test.mosquitto.org";
const char *topic = "est/katastrophenprojekt/espdaten";
int brokerPort = 1883;
String ssid = "piwifi-a005";
String password = "piuserwifi";

class sensorData
{
  public:
    sensorData(float temperature, float humidity, float altitude, float airPressure)
      : temperature(temperature)
      , humidity(humidity)
      , altitude(altitude)
      , airPressure(airPressure)
    {
      this->timestamp = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    }
    ~sensorData() {}
  public:
    std::time_t timestamp;
    float temperature = 0.0f;
    float humidity = 0.0f;
    float altitude = 0.0f;
    float airPressure = 0.0f;
};

DHT dht(02,DHT22);
Adafruit_BMP085 bmp180;
WiFiClient espClient;
PubSubClient client;

bool wifiConnect(String, String);
bool brokerConnect(const char *, int);


void setup() 
{
  Serial.begin(9600);
  dht.begin();
  bmp180.begin();
  WiFi.mode(WIFI_STA);
  wifiConnect(ssid, password);
  brokerConnect(brokerAddress, brokerPort);
}


void loop() 
{
  sensorData* currData = new sensorData
  (
    (dht.readTemperature() + bmp180.readTemperature())/2
    , dht.readHumidity()
    , bmp180.readAltitude()
    , (float)bmp180.readPressure()/100
  );

  JsonDocument serializedData;
  char buffer[256];

  std::cout << "Temperatur: " << currData->temperature << "°C" << std::endl;
  std::cout << "Luftfeuchtigkeit: " << currData->humidity << "%" << std::endl;
  std::cout << "Hoehe: " << currData->altitude << " m" << std::endl;
  std::cout << "Luftdruck: " << currData->airPressure << " mBar\n" << std::endl;

  serializedData["device_id"] = ESP_ID;
  serializedData["timestamp"] = currData->timestamp;
  serializedData["temperature"] = currData->temperature;
  serializedData["humidity"] = currData->humidity;
  serializedData["altitude"] = currData->altitude;
  serializedData["airPressure"] = currData->airPressure;

  size_t n = serializeJson(serializedData, buffer);

  std::cout << serializedData << std::endl;

  if(WiFi.status() != WL_CONNECTED)
  {
    Serial.println("WiFi connection lost, reconnecting...");
    wifiConnect(ssid, password);
  }

  if(!client.connected())
  {
    std::cout << "Connection to MQTT lost, reconnecting..." << std::endl;
    brokerConnect(brokerAddress, brokerPort);
  }

  if(client.publish(topic, buffer, n))
  {
    std::cout << "Publish successful\n===================================" << std::endl;
  }
  else
  {
    std::cout << "Publish successful\n===================================" << std::endl;
  }

  delay(5000);
  delete currData;
}

//Funktionen==================================================================

bool wifiConnect(String ssid, String password)
{
  WiFi.begin(ssid, password);

  Serial.print("\nConnecting to: ");
  Serial.print(ssid);

  while (WiFi.status() != WL_CONNECTED) { // Wait for the Wi-Fi to connect
    Serial.print(".");
    delay(1000);
  }

  Serial.print("\nConnection established. IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("===================================");

  return true;
}


bool brokerConnect(const char *address, int port)
{
  client.setServer(address, port);
  client.setClient(espClient);

  String clientId = "HurensohnClient-";
    clientId += String(random(0xffff), HEX);

  Serial.print("Attempting MQTT connection");

  while (!client.connected()) 
  {
    
    if(client.connect(clientId.c_str()))
    {
      std::cout << "\nBroker connected\n" << std::endl;
      return true;
    }
    else
    {
      Serial.print(".");
      //Serial.println(client.state());
      delay(1000);
    }
  }
  return true;
}