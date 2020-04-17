//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    cors = require('cors'),
    path = require('path'),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

// app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8001,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      console.log('ERROR CONNECTING TO MONGO URL', mongoURL)
      console.log('ERROR CONNECTING TO MONGO ', err)
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

// app.get('/', function (req, res) {
//   // try to initialize the db on every request if it's not already
//   // initialized.
//   if (!db) {
//     initDb(function(err){});
//   }
//   if (db) {
//     var col = db.collection('counts');
//     // Create a document with request IP and current time of request
//     col.insert({ip: req.ip, date: Date.now()});
//     col.count(function(err, count){
//       if (err) {
//         console.log('Error running count. Message:\n'+err);
//       }
//       res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
//     });
//   } else {
//     res.render('index.html', { pageCountMessage : null});
//   }
// });

// app.get('/pagecount', function (req, res) {
//   // try to initialize the db on every request if it's not already
//   // initialized.
//   if (!db) {
//     initDb(function(err){});
//   }
//   if (db) {
//     db.collection('counts').count(function(err, count ){
//       res.send('{ pageCount: ' + count + '}');
//     });
//   } else {
//     res.send('{ pageCount: -1 }');
//   }
// });

console.log('routes oi');
// fhlint-begin: custom-routes
app.use('/metar', require('./lib/metar.js')());
app.use('/buoy', require('./lib/buoy.js')());
app.use('/dlData', require('./lib/dlharbour.js')());

app.get('/health', function (req, res) {
  res.json('ok');
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

console.log('REMOTE HOSTNAME server IS ', process.env.HOSTNAME)
app.listen(port, ip, function () {
  console.log("App started at: " + new Date() + " on port: " + ip + ":" + port);
});

module.exports = app ;
