'use strict';

/**
 * Load Twilio configuration from .env config file - the following environment
 * variables should be set:
 * process.env.TWILIO_ACCOUNT_SID
 * process.env.TWILIO_API_KEY
 * process.env.TWILIO_API_SECRET
 */
require('dotenv').load();

var http = require('http');
var path = require('path');
var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;
var express = require('express');
var randomName = require('./randomname');

// Create Express webapp.
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(_request, response) {
  response.sendFile(process.cwd() + '/public/index.html');
});

app.get('/twilio', function(request, response) {
  const accountSid = 'AC5228aa17a5bc82b642f97194bdaf7aa7';
  const authToken = request.query.token;
  const client = require('twilio')(accountSid, authToken);

  console.log(client);

  response.send('Fuck off');
});

app.get('/twilio-video', function(request, response) {
  const accountSid = 'AC5228aa17a5bc82b642f97194bdaf7aa7';
  const authToken = request.query.token;
  const client = require('twilio')(accountSid, authToken);

  const recordId = request.query.sid;
  client.video
    .recordings(recordId)
    .fetch()
    .then(recording => {
      console.info(recording);
      response.json(recording);
    });
});

/**
 * Generate an Access Token for a chat application user - it generates a random
 * username for the client requesting a token, and takes a device ID as a query
 * parameter.
 */
app.get('/token', function(request, response) {
  var identity = randomName();

  // Create an access token which we will sign and return to the client,
  // containing the grant we just created.
  var token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
  );

  // Assign the generated identity to the token.
  token.identity = identity;

  // Grant the access token Twilio Video capabilities.
  var grant = new VideoGrant();
  token.addGrant(grant);

  // Serialize the token to a JWT string and include it in a JSON response.
  response.send({
    identity: identity,
    token: token.toJwt(),
  });
});

// Create http server and run it.
var server = http.createServer(app);
var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log(`Listening to requests on http://localhost:${port}`);
});
