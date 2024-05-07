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
#include <time.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

//Geräte-ID definieren falls mehrere ESPs verwendet werden, um die Daten zu unterscheiden
#define ESP_ID 000001;

//Url, Topic und Port für Broker definieren
const char *brokerAddress ="test.mosquitto.org";
const char *topic = "est/katastrophenprojekt/espdaten";
int brokerPort = 1883;

//SSID und Passwort für WLAN definieren
String ssid = "piwifi-a005";
String password = "piuserwifi";

//Globale Variablen zur Referenzierung der Höhenmessung
float seaLevelPressure;
float currentAltitude = 469;

//Klasse zur Speicherung der Sensordaten
class sensorData
{
  public:
    sensorData(float temperature, float humidity, float altitude, float airPressure)
      : temperature(temperature)
      , humidity(humidity)
      , altitude(altitude)
      , airPressure(airPressure)
    {
      //Erzeugung eines verwendbaren, aktuellen timestamps
      std::time_t now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now()) + 2*60*60;
      strftime(timestamp, 20, "%Y-%m-%d %H:%M:%S" ,localtime(&now));
    }
    ~sensorData() {}
  public:
    std::time_t now;
    char timestamp[20];
    float temperature = 0.0f;
    float humidity = 0.0f;
    float altitude = 0.0f;
    float airPressure = 0.0f;
};

//Initialisierungen der Sensoren
DHT dht(02,DHT22);
Adafruit_BMP085 bmp180;

//Initialisierung des MQTT-Clients
WiFiClient espClient;
PubSubClient client(espClient);

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7200);

//Initialisierung der Verbindungsfunktionen
bool wifiConnect(String, String);
bool brokerConnect(const char *, int);

//Setup von Serieller Ausgabe, Sensoren, WLAN-Verbindung und MQTT-Verbindung
void setup() 
{
  Serial.begin(9600);
  dht.begin();
  bmp180.begin();
  seaLevelPressure = bmp180.readSealevelPressure(currentAltitude);
  WiFi.mode(WIFI_STA);
  wifiConnect(ssid, password);
  timeClient.begin();
  brokerConnect(brokerAddress, brokerPort);
}


void loop() 
{
  timeClient.update();
  Serial.println(timeClient.getFormattedTime());
  //Schreiben der Sensordaten in die dafür vorgesehene Klasse
  sensorData* currData = new sensorData
  (
    (dht.readTemperature() + bmp180.readTemperature())/2
    , dht.readHumidity()
    , bmp180.readAltitude(seaLevelPressure)
    , (float)bmp180.readPressure()/100
  );

  //Deklaration der Variablen für die serialisierung des Json-Objektes
  JsonDocument serializedData;
  char buffer[256];

  //Schreiben aller benötigten Elemente in das Json-Objekt
  serializedData["device_id"]   = ESP_ID;
  serializedData["timestamp"]   = currData->timestamp;
  serializedData["temperature"] = currData->temperature;
  serializedData["humidity"]    = currData->humidity;
  serializedData["altitude"]    = currData->altitude;
  serializedData["airPressure"] = currData->airPressure;

  //Debug-Ausgabe:
  std::cout << "device_id   : "  << serializedData["device_id"]    <<std::endl;
  std::cout << "timestamp   : "  << serializedData["timestamp"]    <<std::endl;
  std::cout << "temperature : "  << serializedData["temperature"]  <<std::endl;
  std::cout << "humidity    : "  << serializedData["humidity"]     <<std::endl;
  std::cout << "altitude    : "  << serializedData["altitude"]     <<std::endl;
  std::cout << "airPressure : "  << serializedData["airPressure"]  <<std::endl;

  //Größe des Json-Objekts bestimmen und in Buffer-Zwischenspeichervariable schreiben
  size_t n = serializeJson(serializedData, buffer);

  //Überprüfung, ob WLAN und MQTT Broker verbunden sind
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

  //Buffer-Variable auf Topic publishen und Debug-Rückmeldung geben
  if(client.publish(topic, buffer, n))
  {
    std::cout << "Publish successful\n===================================" << std::endl;
  }
  else
  {
    std::cout << "Publish failed\n===================================" << std::endl;
  }

  //Klasse für Sensordaten löschen und 5s bis zur nächsten Abfrage warten
  delete currData;
  delay(5000);
}

//Funktionen==================================================================

bool wifiConnect(String ssid, String password)
{
  //Verbindung initialisieren
  WiFi.begin(ssid, password);

  //Debug-Ausgabe
  Serial.print("\nConnecting to: ");
  Serial.print(ssid);

  //Auf erfolgreiche Verbindung warten
  while (WiFi.status() != WL_CONNECTED) { // Wait for the Wi-Fi to connect
    Serial.print(".");
    delay(1000);
  }

  //Debug-Ausgabe
  Serial.print("\nConnection established. IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("===================================");

  return true;
}


bool brokerConnect(const char *address, int port)
{
  //Serveradresse und -port setzen
  client.setServer(address, port);

  //ClientID erzeugen
  String clientId = "HurensohnClient-";
    clientId += String(random(0xffff), HEX);

  Serial.print("Attempting MQTT connection");

  //Konsequent versuchen, eine Verbindung herzustellen
  while (!client.connected()) 
  {
    //Verbindung hergestellt, Schleife verlassen
    if(client.connect(clientId.c_str()))
    {
      std::cout << "\nBroker "<< brokerAddress <<" connected\n" << std::endl;
      return true;
    }
    //Verbinden fehlgeschlagen, nach 1s erneut versuchen
    else
    {
      Serial.print(".");
      //Serial.println(client.state());
      delay(1000);
    }
  }
  return true;
}