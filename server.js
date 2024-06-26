const express = require("express");
const app = express();
const session = require("express-session");

//MariaDB
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'toor',
    database: 'esp_data',
    connectionLimit: 2
});

async function asyncFunction(message) {
    let conn;
    let jsonObj = JSON.parse(message);
    try {
        conn = await pool.getConnection();
        const res = await conn.query("INSERT INTO devices (id, first_entry, last_entry) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE last_entry = VALUES (last_entry);", [jsonObj.device_id, jsonObj.timestamp, jsonObj.timestamp]);
	    console.log(res);
        const entry = await conn.query("INSERT INTO esp_data.entries (esp_id, altitude, pressure, temperature, humidity, recorded_at) VALUES (?, ?, ?, ?, ?, ?);", [jsonObj.device_id, jsonObj.altitude, jsonObj.airPressure, jsonObj.temperature, jsonObj.humidity, jsonObj.timestamp]);
        console.log(entry);
    } catch(err) {
        console.log("Error: " + err);
        throw err;
    }
    finally {
        if(conn) return conn.end();
    }
}

/*
function print_devices(conn)
{
    return new Promise((resolve, reject) => {
        resolve(
            conn.queryStream("SELECT * FROM esp_data.devices;")
            .on("error", (err) => { console.error("Issue retrieving data from devices Table.", err); })
            .on("fields", (meta) => { console.error("Fields metadata: ", meta); })
            .on("data", (row) => { console.log('${row.id}, ${row.first_entry}, ${row.last_entry}'); })
        )
    });
}

function print_measurementData(conn)
{
    return new Promise((resolve, reject) => {
        resolve(
            conn.queryStream("SELECT * FROM esp_data.entries;")
            .on("error", (err) => { console.error("Issue retrieving data from devices Table.", err); })
            .on("fields", (meta) => { console.error("Fields metadata: ", meta); })
            .on("data", (row) => { console.log('${row.id}, ${row.first_entry}, ${row.last_entry}'); })
        )
    });
}

async function insert_device(conn, device_id, timestamp)
{
    const query = `
        INSERT INTO esp_data.devices (id, first_entry, last_entry)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE last_entry = VALUES(last_entry);
    `;
    console.log(query);
    console.log(timestamp);
    const res = await conn.query(query, [device_id, timestamp, timestamp], (error, results) => {
        if (error) 
        {
            console.error('Error executing the query:', error);
            return;
        }
        console.log('Query executed successfully:', results);
    });
    console.log(res);
}

function insert_entry(conn, jsonObj)
{
    insert_device(conn, jsonObj.device_id, jsonObj.timestamp);

    const query = `
    INSERT INTO esp_data.entries (esp_id, altitude, pressure, temperature, humidity, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?);
    `;
    conn.query(query, [jsonObj.device_id, jsonObj.altitude, jsonObj.airPressure, jsonObj.humidity, timestamp], (error, results) => {
        if(error) 
        {
            console.error('Error executing the query:', error);
            return;
        }
        console.log('Query executed successfully:', results);
    });
}
*/


//MQTT
const mqtt = require('mqtt');
const { each, error, ready } = require("jquery");
const protocol = 'mqtt';
const mqtt_broker = 'test.mosquitto.org';
//const mqtt_broker = 'mqtt.eclipseprojects.io';
const mqtt_port = 1883;
const mqtt_url = protocol + '://' + mqtt_broker + ':' + mqtt_port;
const mqtt_topic = 'est/katastrophenprojekt/espdaten';
const mqtt_client = mqtt.connect(mqtt_url, keepalive = 60);
let topic = mqtt_client.subscribe(mqtt_topic);

mqtt_client.on('connect', () => {
    console.log('Connected to: ' + mqtt_broker);
});

mqtt_client.on('message', (topic, message) => {
    console.log('Message:' + message);
    asyncFunction(message);
    console.log('success');
});

const nodeAppPort = 8080;

async function readData(req, res) {
    let conn;
    try {
      conn = await pool.getConnection();
      data = await conn.query("SELECT * FROM (SELECT * FROM entries ORDER BY recorded_at DESC LIMIT 1000) AS subquery ORDER BY id ASC;");
      res.json(data);
    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.end();
    }
}

BigInt.prototype['toJSON'] = function () { 
return this.toString()
}

function get_index(req, res) {
    res.render("pages/index", {
        loggedin: req.session.loggedin,
    });
}

// expose static path
app.use(express.static("static"));

// set view engine
app.set("view engine", "ejs");

//initialize session
app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// host app on port xxxx
app.listen(nodeAppPort, () => {
    console.log(`App listening at port ${nodeAppPort}`);
    console.log("http://localhost:" + nodeAppPort + "/");
});

// route pages
app.get("/", (req, res) => {
    get_index(req, res);
});

app.get("/data", (req, res) => {
   readData(req, res);
});

