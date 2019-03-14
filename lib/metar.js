var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request');
var parser = require('xml2js').parseString;
var _ = require('lodash');
var parseMETAR = require("metar");
var moment = require('moment');

var decodeMetar = function (txt) {
  var metar = parseMETAR(txt);
  return {
    locn: metar.station,
    txt: txt,
    time: moment(metar.time).add(5, 'hours').format('DD/MM HH:mm'),
    spd: metar.wind.speed + metar.wind.unit + (metar.wind.gust ? ' G' + metar.wind.gust : '') + ' ' + metar.wind.direction,
    temp: metar.temperature + ' (' + metar.dewpoint + ')',
    pressure: metar.altimeterInHpa,
    weather: _.reduce(metar.weather, function (result, w) {
      return result + w.meaning + ' ';
    }, '')
  }
}


var getMETAR = function (code, numReadings, cb) {
  var url = 'http://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=' + code + '&hoursBeforeNow=' + numReadings;
  request(url, function (error, response, data) {

    parser(data, function (err, jsonRes) {

      if (jsonRes.response && jsonRes.response.data && jsonRes.response.data[0] && jsonRes.response.data[0].METAR) {
        var json = jsonRes.response.data[0].METAR;
        var parsedObj = _.map(json, function (o) {
          return decodeMetar(o.raw_text[0]);
        })

      }

      if (!error && !err && response.statusCode === 200 && parsedObj) {
        cb({ res: parsedObj }) // Show the HTML for the Google homepage. 
      } else {
        console.log('ERROR getting metar ');
        console.log(error)
        console.log(err)
        cb({ err: 'error getting metar' })
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


  // POST REST endpoint - note we use 'body-parser' middleware above to parse the request body in this route.
  // This can also be added in application.js
  // See: https://github.com/senchalabs/connect#middleware for a list of Express 4 middleware
  metar.get('/airports', function (req, res, next) {
    console.log(new Date(), 'In hello route POST / req.body=', req.query);
    var airports = [
      {
        name: 'Dublin',
        code: 'EIDW'
      }, {
        name: 'Casement',
        code: 'EIME'
      }
    ]
    res.json(airports);
  });


  metar.get('/', function (req, res, next) {
    console.log(new Date(), 'In hello route POST / req.body=', req.query);
    var code = req.query && req.query.code ? req.query.code : 'EIDW';
    var numReadings = req.query && req.query.numReadings ? req.query.numReadings : 20;
    getMETAR(code, numReadings, function (response) {
      if (response.res) {
        res.json({ res: response.res });
      } else {
        next(response.err);
      }
    });
  });
  return metar;
}



module.exports = metarRoute;
