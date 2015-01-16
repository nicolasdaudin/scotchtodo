// set up ===============================
var express = require ('express'); 
var app		= express(); // create our app w/ express
var morgan = require('morgan');// log requests to the console (express4)
var bodyParser = require('body-parser');// pull information from HTML POST (express4)
var methodOverride = require('method-override');// simulate DELETE and PUT (express4)
//var http = require('http');
//var https = require('https');
var fs = require('fs');
var moment = require('moment');
//var querystring = require('querystring');
//var google = require('googleapis');
//require('array.prototype.find');

var todojs 		= require('./smd_modules/todo.js'		);
var clickbank_routes = require('./routes/clickbank_routes.js'	);
var google_routes 	= require('./routes/google_routes.js'		);
var cronjs 		= require('./smd_modules/cron.js'		);
//var mailjs		= require('./smd_modules/mail.js');





// configuration =======================

// Database stuff
//var mongo = require('mongoskin');
//var db = mongo.db("mongodb://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:27017/scotchtodo",{native_parser:true});




app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type:'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride());

// Make our db accessible to our router
/*app.use(function(req,res,next){
    req.db = db;
    next();
})*/



// routes ======================================
app.use('/todos', 		todojs);
app.use('/clickbank',	clickbank_routes);
app.use('/google'	,	google_routes);
//app.use('/mail'	,	mailjs);

// api -----------------------------------






// appplication -----------------
app.get('*', function(req,res){
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the frontend)
});




// listen (start app with node server.js) =========================
var PORT = 8080;
app.listen(PORT);
console.log("App DAEMON listening on port " + PORT);
