var express = require('express');
var path    = require('path');
var less    = require('less-middleware');
// Routes
var networking = require('./networking');



// Le routing
module.exports = function (app) {

  // add less support
  // from: https://github.com/emberfeather/less.js-middleware
  app.use(less(path.join(__dirname, '/../views'), { debug : app.DEBUG }));

  // expose /views/assets folder to web
  app.use("/assets", express.static(__dirname + "/../views/assets"));

  // expose /views basedir to jade
  app.locals.basedir = __dirname + '/../views';

  app.set('views', __dirname + '/../views');
  // automatic routing via jsonfile-restful
  // networking
  networking(app);
 
};
