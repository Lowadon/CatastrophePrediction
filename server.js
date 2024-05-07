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

async function asyncFunction() {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("Select 1 as val");
        console.log(rows);
        const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
	    console.log(res);
    } catch(err) {
        throw err;
    }
    finally {
        if(conn) return conn.end();
    }
}

//MQTT
const mqtt = require('mqtt');
const mqtt_client = mqtt.connect('mqtt://broker.hivemq.com');
let topic = mqtt_client.subscribe('my/topic/here');
mqtt_client.on('message', (topic, message) => {
    console.log(message)
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
