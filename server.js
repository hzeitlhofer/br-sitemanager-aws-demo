const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const moment = require('moment');
const path = require('path');
const aws  = require('aws-iot-device-sdk');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/device', (req, res) => {
  res.send(JSON.stringify(thing));
});
app.use(function (req, res/*, next*/) {
  res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server, path: "/ws" });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      try {
//        console.log('sending data ' + data);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

console.log('connecting to AWS IoT Core');

var aws_host = "a192kd9ilmmk8l-ats.iot.eu-central-1.amazonaws.com";
var deviceID = "SiteManager-Monitor";

var thing = aws.thingShadow({
    "host": aws_host,
    "region": "eu-central-1",
    "port": 8883,
    "clientId": deviceID,
    "thingName": deviceID,
    "caPath": 'certs/awsroot.crt',
    "clientCert": 'certs/device.crt',
    "privateKey": 'certs/device.pk',
});

const init = function() {
    thing.register(deviceID, {
        persistentSubscribe: true
    });
    console.log ('subscribe to topics');
    thing.subscribe('br/sitemanagerdemo/raw');
    // startTimer();
}

thing.on('connect', function(connack) {
    console.log(deviceID, 'is now connected to AWS');
    init();
});

thing.on('message', function(topic, payload) {
//  console.log(topic, payload.toString());
  wss.broadcast(payload.toString());
});


var port = normalizePort(process.env.PORT || '3000');
server.listen(port, function listening() {
  console.log('Listening on %d', server.address().port);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

