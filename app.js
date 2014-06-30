
/**
 * Module dependencies.
 */

var fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// gzip/deflate outgoing responses
var compression = require('compression')
app.use(compression())

// parse urlencoded request bodies into req.body
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded())

// development only
if ('development' == app.get('env')) {
  // app.use(express.errorHandler());
}

// Bootstrap db connection
// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } }
  mongoose.connect('mongodb://localhost/broken', options)
}
connect()

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err)
})

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  connect()
})

// Bootstrap models
var models_path = __dirname + '/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

// Start updating arcs
var Checker = require('./lib/checker');
Checker(); 

// Load routes
var 
	routes = require('./routes'),
	city = require('./routes/city');

app.get('/', routes.index);
app.get('/cities/load', city.load);
app.get('/cities/arc', city.updateArcs);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
