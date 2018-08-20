var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request');
var parser = require('xml2js').parseString;
var _ = require('lodash');
var parseMETAR = require("metar");
var moment = require('moment');

var decodeMetar = function(txt) {
  var metar = parseMETAR(txt);
  return {
    locn: metar.station,
    txt: txt,
    time : moment(metar.time).add(5,'hours').format('DD/MM HH:mm'),
    spd: metar.wind.speed + metar.wind.unit + (metar.wind.gust ? ' G'+ metar.wind.gust : '') + ' ' + metar.wind.direction,
    temp: metar.temperature + ' (' + metar.dewpoint + ')',
    pressure: metar.altimeter_hpa,
    weather: _.reduce(metar.weather, function(result, w){
      return result + w.meaning + ' ';
    }, '')
  }
}


var getMETAR = function(code, numReadings, cb){
  var url = 'http://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString='+ code + '&hoursBeforeNow=' + 12;
  request(url, function (error, response, data) {
    // console.log('response');
    // console.log(response)
    // console.log('ERROR');
    // console.log(error)
    parser(data, function (err, jsonRes) {
      var json = jsonRes.response.data[0].METAR;

      // console.log(jsonRes.response.data[0].METAR);

      var parsedObj = _.map(json , function(o){
        return decodeMetar(o.raw_text[0]);
      } )

      // console.log(JSON.stringify(parsedObj));
      if (!error && response.statusCode === 200) {
        cb({res: parsedObj}) // Show the HTML for the Google homepage. 
      } else {
        console.log('ERROR');
        console.log(error)
        cb({err: 'bang'})
      }
    });
    
  })
}

function metarRoute() {
  var metar = new express.Router();
  metar.use(cors());
  metar.use(bodyParser.urlencoded({
    extended: true
  }));
  metar.use(bodyParser.json());


  // GET REST endpoint - query params may or may not be populated
  metar.get('/', function(req, res) {
    console.log(new Date(), 'In hello route GET / req.query=', req.query);
    var world = req.query && req.query.hello ? req.query.hello : 'World';

    // see http://expressjs.com/4x/api.html#res.json
    res.json({msg: 'Hello ' + world});
  });

  // POST REST endpoint - note we use 'body-parser' middleware above to parse the request body in this route.
  // This can also be added in application.js
  // See: https://github.com/senchalabs/connect#middleware for a list of Express 4 middleware
  metar.post('/', function(req, res) {
    console.log(new Date(), 'In hello route POST / req.body=', req.body);
    var code = req.body && req.body.code ? req.body.code : 'EIDW';
    var numReadings = req.body && req.body.numReadings ? req.body.numReadings : 20;

    getMETAR(code, numReadings, function(response){
      if(response.res){
        res.json({res: response.res});
      } else {
        res.json({error: 'feck'});
      }
    });

    // see http://expressjs.com/4x/api.html#res.json
    
  });

  return metar;
}



module.exports = metarRoute;
