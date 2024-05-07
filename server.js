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
        const rows = await conn.query("Select 1 as val");
        console.log(rows);
        console.log(jsonObj.device_id);
        const device = await conn.query("SELECT id FROM devices WHERE ID = " + message.device_id, (error, results, fields) => {
            if (error) throw error;

            let data = results;

            console.log(data);
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
