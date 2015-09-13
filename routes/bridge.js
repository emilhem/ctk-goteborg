
'use strict';

var express = require('express');
var router = express.Router();
var config = require('../config');
var http = require('http');
var url = require('url');
var debugLogging = require('util').debuglog('bridge');

var urlObject = url.parse('http://data.goteborg.se/BridgeService/v1.0/GetGABOpenedStatus/' + config.key + '?format=json');

router.get('/', function(req, res) {
  var options = {
    protocol: urlObject.protocol,
    host: urlObject.host,
    port: urlObject.port,
    method: 'GET',
    path: urlObject.path,
    headers: {
      'user-agent': 'ctk-goteborg'
    }
  };
  var remoteRequest = http.request(options, function(remoteResponse) {
    var data = '';
    debugLogging('STATUS:', remoteResponse.statusCode);
    debugLogging('HEADERS:', JSON.stringify(remoteResponse.headers));
    remoteResponse.setEncoding('utf-8');
    remoteResponse.on('data', function(chunk) {
      data += chunk;
    });
    remoteResponse.on('end', function() {
      debugLogging('All data received! Sending headers and data!');
      res.set({
        'Content-Type':  'application/json',
        'Cache-Control': 'private, max-age=0, no-cache, no-store',
        'pragma':        'no-cache'
      });
      res.send(data);
    });
  });

  debugLogging('Sending request!');
  remoteRequest.end();
});

module.exports = router;
