
/* jshint jquery: true, browser: true, node: false */
/* global google: true */

'use strict';


var map;

// Initialize Google Map API
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 57.706944, lng: 11.966389},
    zoom: 10
  });
}

// Define a Google Marker variabe to store all of the markers in
var markers = [];

function updateStatus() {
  // Get status of the bridge and display it.
  $.ajax({
    url: '/bridge',
    timeout: 9999,
    success: function( data ) {
      $( '#bridgeData' ).text( data.status ? 'The bridge is open/up!' : 'The bridge is closed/down!' );
    }
  });
  // Get the air status and display them.
  $.ajax({
    url: '/air',
    timeout: 9999,
    success: function( data ) {
      var k;
      for(k in data.Weather) {
        $('#'+k).text((!!data.Weather[k].Value ? data.Weather[k].Value : 0) + ' ' + data.Weather[k].Unit);
      }
    }
  });
  // Get other information which is currently water flows
  $.ajax({
    url: '/other',
    timeout: 9999,
    success: function( data ) {
      var i, ii, j, jj;

      if(data.message === 'no-data') {
        return;
      }

      for(i=0, ii=data.length; i<ii; i++) {
        var contentString = '', alreadyShown = false;
        contentString+= '<p id="'+ data[i].Code +'">'+ data[i].Description + ': <ul>';
        for(j=0, jj=data[i].MeasureParameters.length; j<jj; j++) {
          contentString+= '<li id="'+ data[i].Code +'-mparam-'+ data[i].MeasureParameters[j].Code +'">'+
            data[i].MeasureParameters[j].Description +': '+ data[i].MeasureParameters[j].CurrentValue +'</li>';
        }
        contentString+= '</ul></p>';

        for(j=0, jj=markers.length;j<jj; j++) {
          if(markers[j].marker.getTitle() === data[i].Description) {
            markers[j].infowindow.setContent(contentString);
            alreadyShown = true;
          }
        }
        if(alreadyShown) {
          continue;
        }

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        
        var marker = new google.maps.Marker({
          position: {lat: data[i].Lat, lng: data[i].Long},
          map: map,
          title: data[i].Description
        });
        marker.addListener('click', function() {
          var i, ii;
          for(i=0,ii=markers.length; i<ii; i++) {
            markers[i].infowindow.close();
            if(markers[i].marker === this) {
              markers[i].infowindow.open(map, markers[i].marker);
            }
          }
        });
        marker.setMap(map);
        markers.push({marker: marker, infowindow: infowindow});
      }
    }
  });
}

setTimeout(updateStatus, 2500);

setInterval(updateStatus, 10000);
