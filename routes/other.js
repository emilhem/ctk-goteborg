
'use strict';

var express = require('express');
var router = express.Router();
var config = require('../config');
var http = require('http');
var url = require('url');
var debugLogging = require('util').debuglog('other');

var stations = null;


router.get('/', function(req, res) {
  if(!stations) {
    res.set({
      'Content-Type':  'application/json',
      'Cache-Control': 'private, max-age=0, no-cache, no-store',
      'pragma':        'no-cache'
    });
    res.send({message: 'no-data'});
    return;
  } else {
    res.set({
      'Content-Type':  'application/json',
      'Cache-Control': 'private, max-age=0, no-cache, no-store',
      'pragma':        'no-cache'
    });
    res.send(stations);
    return;
  }
});

module.exports = router;

function fetchStations(callback) {
  var urlObject = url.parse('http://data.goteborg.se/RiverService/v1.1/MeasureSites/' + config.key + '?format=json');
  debugLogging('FetchStations: request url:', url.format(urlObject));
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
    debugLogging('FetchStations: STATUS:', remoteResponse.statusCode);
    debugLogging('FetchStations: HEADERS:', JSON.stringify(remoteResponse.headers));
    remoteResponse.setEncoding('utf-8');
    remoteResponse.on('data', function(chunk) {
      data += chunk;
    });
    remoteResponse.on('end', function() {
      debugLogging('FetchStations: All data received!');
      callback(JSON.parse(data));
    });
  });

  debugLogging('FetchStations: Sending request!');
  remoteRequest.end();
}

setInterval(function() {
  fetchStations(function(data) {
    debugLogging('FetchStations: Callback!');
    stations = data;
  });
}, 10000);
