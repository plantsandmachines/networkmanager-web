var TAG = 'EXPRESS';

// REQUIRES

var http = require('http');
var express = require('express');
var faye = require('faye');
var _ = require('underscore');

// web routing
var routes = require('./routes');

// ---------------------------------------------------------------------

var app = express();

app.use(express.bodyParser());
app.use(express.query());
app.set('view engine', 'jade');

// load express webserver

app.networkManager = require('nm-dbus-native');
app.networkManager.dbusConnect(function(err, interfaces){
    app.server = http.createServer(app);

    var bayeux = new faye.NodeAdapter({
        mount: '/faye',
        timeout: 45
    });
    bayeux.attach(app.server);
    app.faye = new faye.Client('http://localhost:3000/faye');

    // web routing + templating
    routes(app);
    
    app.server.listen(3000);
    console.log('Your network interface is now running at http://localhost:3000');
});




