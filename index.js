/**
 * This is the webserver code for the Thargoid.Watch website. Live website can be found at https://www.thargoid.watch
 * 
 * IMPORTANT: If you are running this locally, ensure you create a .env file and include the following two variables.
 * 
 * PORT=<port number>
 * MODE=DEV
 * 
 */

require("dotenv").config();
const express = require('express');
const app = express();
const db = require('./db/index');
const zmq = require("zeromq");
const zlib = require("zlib");
const cors = require('cors');

const PORT = process.env.PORT;
const MODE = process.env.MODE;

function jsonResponse(data) {
    return (
    {  
        header: {
            timestamp: `${new Date().toISOString()}`,
            softwareName: 'AXI Sentry API',
            softwareVersion: '1.0',
        },
        message: {
            rows: data,
        }
    })
}

// Web Hosting
function requireHTTPS(req, res, next) {
    if (req.headers["x-forwarded-proto"] == "http" && MODE != "DEV") {
        return res.redirect(301, "https://" + req.hostname+req.url);
    }
    next();
}

app.use(cors())
app.use(requireHTTPS);
app.use(express.static('public'));

app.get('/', function (req,res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/incursions', async function(req, res) {
    const { rows } = await db.query(`SELECT * FROM systems WHERE status = '1'`);
    res.json(jsonResponse(rows))
  },
);

app.get('/api/systems', async function(req, res) {
    const { rows } = await db.query(`SELECT system_id, name, status, presence, population, faction, coords, last_updated, eddb_id FROM systems`);
    res.json(jsonResponse(rows))
  },
);

app.get('/api', function (req,res) {
    res.sendFile(__dirname + '/public/api.html');
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));

// EDDN Listener
const SOURCE_URL = 'tcp://eddn.edcd.io:9500'; //EDDN Data Stream URL
const targetAllegiance = "Thargoid";
const targetGovernment = "$government_Dictatorship;";
let msg;

async function processSystem(msg) {
    const { StarSystem, timestamp, SystemAllegiance, SystemGovernment } = msg.message;
    let date = new Date();
    let time = date.getTime(timestamp);
  
    if (SystemAllegiance != undefined && time >= Date.now() - 86400000) { // Checking if report is recent
        let id = await db.getSysID(StarSystem);

        if (id == "0" && SystemAllegiance == targetAllegiance && SystemGovernment == targetGovernment) {
            id = await db.addSystem(StarSystem);
        }
  
        if (id != "0") {
            await db.updateSysInfo(StarSystem, msg);
            if (SystemAllegiance == targetAllegiance && SystemGovernment == targetGovernment) {
                db.setStatus(StarSystem, 1);
                db.logIncursion(id, time);
            } else {
                db.setStatus(StarSystem, 0);
            }
        }  
    }
}

async function run() {
    const sock = new zmq.Subscriber;
  
    sock.connect(SOURCE_URL);
    sock.subscribe('');
    console.log("[✔] EDDN Listener Connected: ", SOURCE_URL);
  
    for await (const [src] of sock) {
        msg = JSON.parse(zlib.inflateSync(src));
        processSystem(msg);
    }
}

run();