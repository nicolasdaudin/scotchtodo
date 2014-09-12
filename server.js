// set up ===============================
var express = require ('express'); 
var app		= express(); // create our app w/ express
var mongoose = require('mongoose');// mongoose for mongodb
var morgan = require('morgan');// log requests to the console (express4)
var bodyParser = require('body-parser');// pull information from HTML POST (express4)
var methodOverride = require('method-override');// simulate DELETE and PUT (express4)
//var http = require('http');
var https = require('https');
var fs = require('fs');

// configuration =======================

// Database stuff
//var mongo = require('mongoskin');
//var db = mongo.db("mongodb://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:27017/scotchtodo",{native_parser:true});

mongoose.connect('mongodb://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:27017/scotchtodo'); 	// connect to mongoDB database


app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type:'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride());


// Define model =============================
var Todo = mongoose.model('Todo',{
	text : String,
	done: Boolean
});

// routes ======================================

// api -----------------------------------

// get all TODOS
app.get('/api/todos',function(req,res){

	Todo.find(function(err,todos){
		if (err){
			res.send(err);
		}
		console.log("Number of todos found: " + todos.length);
		res.json(todos); // return all todos in JSON format

	})
})

// get clickbank data
app.get('/clickbank',function(req,res){
	console.log('Clickbank method START');
	var host = 'api.clickbank.com';	
	//var path = '/rest/1.3/quickstats/accounts';
	var path = '/rest/1.3/debug';
	var dev_api_key = 'DEV-8Q6RMJUSUOCR3PRFF2QUGF1JGQ575UO2';
	var user_api_key = 'API-JBQIHA1OH2QH40PDQ9LLLAIR1S0BCAKT';
	

	var options = {
	    host: host,	
	    method: 'GET',
	    path: path,
	    auth: 'DEV-8Q6RMJUSUOCR3PRFF2QUGF1JGQ575UO2:API-JBQIHA1OH2QH40PDQ9LLLAIR1S0BCAKT',
	    /*cert: fs.readFileSync('certs/clickbank.cer'),*/
	    headers: {
	    	'Accept': 'application/xml'
	    	/*'Authorization':dev_api_key + ':' + user_api_key*/
	    }
	  };

	var options2 = {
		host: 'google.com',
		method: 'GET'
	};



	var cbreq = https.request(options, function(res) {
		  console.log('RESP STATUS: ' + res.statusCode);
		  console.log('RESP HEADERS: ' + JSON.stringify(res.headers));
		  res.setEncoding('utf8');
		  res.on('data', function (chunk) {
		    console.log('BODY: ' + chunk);
		  });
		});
	
	cbreq.on('error', function(e) {
	  console.log('problem with request: ' + e);
	});
	
	cbreq.end();

	res.send('success');
})

// create todo and send back all todos after creation
app.post('/api/todos',function(req,res){

	Todo.create({
		text: req.body.text,
		done: false
	}, function(err,todo){
		if (err){
			res.send(err);
		}

		// get and return all the todos after you create another todo
		Todo.find(function(err,todos){
			if(err){
				res.send(err);
			}
			res.json(todos);
		});

	});
});

// update a TODO and send back all todos after creation
app.post('/api/todos/:id',function(req,res){

	Todo.update({_id:req.params.id},{text:req.body.text}, function(err,todo){
		if (err){
			res.send(err);
		}

		// get and return all the todos after you create another todo
		Todo.find(function(err,todos){
			if(err){
				res.send(err);
			}
			res.json(todos);
		});

	});
})

app.post('/api/todos/switchcomplete/:id',function(req,res){	
	Todo.findById(req.params.id,function(err,todo){
		if (err){
			res.send('Error while finding by id: ' + err);
		}

		console.log('Switching COMPLETE state for [id=' + req.params.id + ',text='+todo.text+'] from ' + todo.done + ' to ' + !todo.done);

		Todo.update({_id:req.params.id},{done:!todo.done},function(err,todo){
			if (err){
				res.send('Error while switching complete: ' + err);
			}

			// get and return all the todos after you create another todo
			Todo.find(function(err,todos){
				if(err){
					res.send('Error while retrieving all tODOs: ' + err);
				}
				res.json(todos);
			});
		})
	})

})

// delete a TODO using his id abnd send back all todos
app.delete('/api/todos/:id',function(req,res){
	console.log('Trying to remove todo with id ' + req.params.id);
	Todo.remove({_id:req.params.id}, function(err){
		if (err){
			res.send(err);
		}

		// get and return all the todos after you create another todo
		Todo.find(function(err,todos){
			if(err){
				res.send(err);
			}
			res.json(todos);
		});
	})
});

// appplication -----------------
app.get('*', function(req,res){
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the frontend)
});




// listen (start app with node server.js) =========================
var PORT = 8080;
app.listen(PORT);
console.log("App DAEMON listening on port " + PORT);
