const express = require("express");
const app = express();
const session = require("express-session");
const mysql = require("mysql2");

//MariaDB
const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'toor',
    connectionLimit: 1
});

async function asyncFunction(message) {
    let conn;
    let jsonObj = JSON.parse(message);
    try {
        conn = await pool.getConnection();
        //const rows = await conn.query("Select 1 as val");
        //console.log(rows);
        //console.log("Device ID: " + jsonObj.device_id);
        //console.log("Temperature: " + jsonObj.temperature);
        //console.log("Altitude: " + jsonObj.altitude);
        //console.log("Air Pressure: " + jsonObj.airPressure);
        //console.log("Humidity: " + jsonObj.humidity);
        //console.log("Timestamp: " + jsonObj.timestamp);
        
        insert_device(conn, jsonObj.device_id, jsonObj.timestamp);
        print_devices(conn);

        const device = await conn.query("SELECT id FROM esp_data.devices WHERE ID = " + jsonObj.device_id + ";", (error, results, fields) => {
            if (error) {console.log("Error: " + error); throw error;}

            let data = results;

            console.log("Data: " + data);
            data.array.forEach(row => {
                console.log(row.id);
                console.log(row.first_entry);
                console.log(row.last_entry);
            });
        });
        //const insert = await conn.query("INSERT INTO ");
        //const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
	    //console.log(res);
    } catch(err) {
        throw err;
    }
    finally {
        if(conn) return conn.end();
    }
}

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

function insert_device(conn, device_id, timestamp)
{
    const query = `
        INSERT INTO esp_data.devices (id, first_entry, last_entry)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE last_entry = VALUES(last_entry);
    `;
    console.log(query);
    conn.query(query, [device_id, Date(timestamp).toISOString(), Date(timestamp).toISOString()], (error, results) => {
        if (error) 
        {
            console.error('Error executing the query:', error);
            return;
        }
        console.log('Query executed successfully:', results);
    });
}

function insert_entry(conn, jsonObj)
{
    insert_device(conn, jsonObj.device_id, jsonObj.timestamp);

    const query = `
    INSERT INTO esp_data.entries (esp_id, altitude, pressure, temperature, humidity, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?);
    `;
    conn.query(query, [jsonObj.device_id, jsonObj.altitude, jsonObj.airPressure, jsonObj.humidity, Date(jsonObj.timestamp).toISOString()], (error, results) => {
        if(error) 
        {
            console.error('Error executing the query:', error);
            return;
        }
        console.log('Query executed successfully:', results);
    });
}

//MQTT
const mqtt = require('mqtt');
const { each } = require("jquery");
const protocol = 'mqtt';
const mqtt_broker = 'test.mosquitto.org';
const mqtt_port = 1883;
const mqtt_url = protocol + '://' + mqtt_broker + ':' + mqtt_port;
const mqtt_topic = 'est/katastrophenprojekt/espdaten';
const mqtt_client = mqtt.connect(mqtt_url, keepalive = 60);
mqtt_client.connect();
let topic = mqtt_client.subscribe(mqtt_topic);

mqtt_client.on('connected', () => {
    console.log('Connected to: ' + mqtt_broker)
});

mqtt_client.on('message', (topic, message) => {
    console.log('Message:' + message)
    asyncFunction(message);
});

//VARIABLES
//const dbHost = "localhost";
//const dbUser = "skyryll";
//const dbPass = "SkyDbAccess";
//const dbDatabase = "systeminfo";
const nodeAppPort = 8080;

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

//connect to local database
//const connection = mysql.createConnection({
//    host: dbHost,
//    user: dbUser,
//    password: dbPass,
//    database: dbDatabase,
//});

// connection test
//connection.connect(function (error) {
//    if (error) throw error;
//    else console.log("connection to database successful");
//});

// route pages
app.get("/", (req, res) => {
    get_index(req, res);
});

function get_index(req, res) {
    res.render("pages/index", {
        loggedin: req.session.loggedin,
    });
}

app.get("/ticketform", (req, res) => {
    get_ticketform(req, res);
});

function get_ticketform(req, res) {
    res.render("pages/ticketform", {
        loggedin: req.session.loggedin,
    });
}
