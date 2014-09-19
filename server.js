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
var moment = require('moment');
var querystring = require('querystring');
var google = require('googleapis');

// CLICKBANK CONSTANTS
var CLICKBANK_CONSTANTS = {
	HOST: 'api.clickbank.com',	
 	QUICKSTATS_PATH : '/rest/1.3/quickstats/count',
 	//DETAIL_PATH : '/rest/1.3/analytics/affiliate/subscription/trends',
 	DETAIL_PATH : '/rest/1.3/analytics/affiliate/affiliate/summary',
 	DEV_API_KEY : 'DEV-8Q6RMJUSUOCR3PRFF2QUGF1JGQ575UO2',
	USER_API : {
		TYPE 	:'master',
		KEY 	:'API-JBQIHA1OH2QH40PDQ9LLLAIR1S0BCAKT'
	},
	/*USER_API : {
		TYPE 	:'nicdo77',
		KEY 	:'API-6A9LNO4L8VVINIUIFIC96JUUERB33UDK'
	},*/
	ACCOUNT : 'nicdo77'
}

// INIT GOOGLE API
var OAuth2 = google.auth.OAuth2;

var CLIENT_ID = "619973237257-ud5ujht6btm8njnfq6v158sm27abr5nn.apps.googleusercontent.com";
var CLIENT_SECRET = "O-b4w10_tnK96SUG9tpdDYxS";
var REDIRECT_URL = "http://localhost:8080/oauth2callback/google";

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

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
app.get('/clickbank/month',function(req,res){
	console.log('Clickbank method START');
	var host = 'api.clickbank.com';	
	var path = '/rest/1.3/quickstats/count';
	//var path = '/rest/1.3/debug';
	var dev_api_key = 'DEV-8Q6RMJUSUOCR3PRFF2QUGF1JGQ575UO2';
	
	var user_api = {
		type:'master',
		key:'API-JBQIHA1OH2QH40PDQ9LLLAIR1S0BCAKT'
	};

	/*var user_api = {
		type:'nicdo77',
		key:'API-6A9LNO4L8VVINIUIFIC96JUUERB33UDK'
	};*/

	var startDate = moment().startOf('month').format('YYYY-MM-DD');
	var endDate = moment().format('YYYY-MM-DD');
	var account = 'nicdo77';	

	var clickbankQueryData = {
		startDate: startDate,
		endDate: endDate,
		account: account
	};
	var clickbankQueryString = querystring.stringify(clickbankQueryData);

	

	var options = {
	    host: host,	
	    method: 'GET',
	    path: path + '?' + clickbankQueryString,
	    /*auth: dev_api_key + ':' + user_api_key,*/
	    /*cert: fs.readFileSync('certs/clickbank.cer'),*/
	    headers: {
	    	'Accept': 'application/json',
	    	'Authorization':dev_api_key + ':' + user_api.key
	    }
	  };

	var options2 = {
		host: 'google.com',
		method: 'GET'
	};

	console.log('REQUEST OPTIONS [using API KEY from ' + user_api.type + ']: ' + JSON.stringify(options));

	var cbreq = https.request(options, function(resCB) {
		  console.log('RESP STATUS: ' + resCB.statusCode);
		  console.log('RESP HEADERS: ' + JSON.stringify(resCB.headers));
		  resCB.setEncoding('utf8');
		  resCB.on('data', function (chunk) {
		    console.log('BODY: ' + chunk);
		    res.send(chunk);
		  });
		});
	
	cbreq.on('error', function(e) {
	  console.log('problem with request: ' + e);
	});
	
	cbreq.end();

	//res.send('success');
})

var clickbankQuick = function(date_interval,callback){

	var clickbankQueryData = {		
		account 	: CLICKBANK_CONSTANTS.ACCOUNT 
	};

	if (date_interval.start != null){
		clickbankQueryData.startDate = date_interval.start;
		clickbankQueryData.endDate = date_interval.end;
	}

	var clickbankQueryString = querystring.stringify(clickbankQueryData);

	var options = {
	    host: CLICKBANK_CONSTANTS.HOST,	
	    method: 'GET',
	    path: CLICKBANK_CONSTANTS.QUICKSTATS_PATH + '?' + clickbankQueryString,
	    /*auth: dev_api_key + ':' + user_api_key,*/
	    /*cert: fs.readFileSync('certs/clickbank.cer'),*/
	    headers: {
	    	'Accept': 'application/json',
	    	'Authorization':CLICKBANK_CONSTANTS.DEV_API_KEY + ':' + CLICKBANK_CONSTANTS.USER_API.KEY
	    }
	  };

	console.log('About to request Clickbank [using API KEY from ' + CLICKBANK_CONSTANTS.USER_API.TYPE + ']: ' + JSON.stringify(options)); 

	//var clickbankResult; 
	var cbreq = https.request(options, function(resCB) {
		  console.log('RESP STATUS: ' + resCB.statusCode);
		  console.log('RESP HEADERS: ' + JSON.stringify(resCB.headers));
		  resCB.setEncoding('utf8');
		  resCB.on('data', function (chunk) {
		    console.log('BODY: ' + chunk);
		    callback(chunk);
		  });
		});
	
	cbreq.on('error', function(e) {
	  console.log('problem with request: ' + e);
	});
	
	cbreq.end();
};

var clickbankDetail = function(date_interval,callback){

	var clickbankQueryData = {
		startDate 	: date_interval.start,
		endDate		: date_interval.end,
		account 	: CLICKBANK_CONSTANTS.ACCOUNT,
		summaryType : 'AFFILIATE_ONLY' //à enlever
	};

	var clickbankQueryString = querystring.stringify(clickbankQueryData);

	var options = {
	    host: CLICKBANK_CONSTANTS.HOST,	
	    method: 'GET',
	    path: CLICKBANK_CONSTANTS.DETAIL_PATH + '?' + clickbankQueryString,
	    /*auth: dev_api_key + ':' + user_api_key,*/
	    /*cert: fs.readFileSync('certs/clickbank.cer'),*/
	    headers: {
	    	'Accept': 'application/json',
	    	'Authorization':CLICKBANK_CONSTANTS.DEV_API_KEY + ':' + CLICKBANK_CONSTANTS.USER_API.KEY
	    }
	  };

	console.log('About to request Clickbank [using API KEY from ' + CLICKBANK_CONSTANTS.USER_API.TYPE + ']: ' + JSON.stringify(options)); 

	//var clickbankResult; 
	var cbreq = https.request(options, function(resCB) {
		  console.log('RESP STATUS: ' + resCB.statusCode);
		  console.log('RESP HEADERS: ' + JSON.stringify(resCB.headers));
		  resCB.setEncoding('utf8');
		  resCB.on('data', function (chunk) {
		    console.log('BODY: ' + chunk);
		    callback(chunk);
		  });
		});
	
	cbreq.on('error', function(e) {
	  console.log('problem with request: ' + e);
	});
	
	cbreq.end();
};

// get clickbank data
app.get('/clickbank/sumup',function(req,res){
	console.log('Clickbank SUMUP method START');

	var current_month = {
		start :  moment().startOf('month').format('YYYY-MM-DD'),
		end : moment().format('YYYY-MM-DD')
	}	

	/*var one_month_ago = {
		start :  moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD'),
		end : moment().subtract(1,'month').endOf('month').format('YYYY-MM-DD'),
		name: moment().subtract(1,'month').format('MMMM')
	}	

	var two_month_ago = {
		start :  moment().subtract(2,'month').startOf('month').format('YYYY-MM-DD'),
		end : moment().subtract(2,'month').endOf('month').format('YYYY-MM-DD'),
		name: moment().subtract(2,'month').format('MMMM')
	}	*/

	var today = {
		start 	:  	moment().format('YYYY-MM-DD'),
		end 	: 	moment().format('YYYY-MM-DD')
	}

	var yesterday = {
		start 	:  	moment().subtract(1,'day').format('YYYY-MM-DD'),
		end 	: 	moment().subtract(1,'day').format('YYYY-MM-DD')
	}

	var all_time = {}
	
	/* to make everything parallel, check Fiber and WAITFOR
	https://github.com/luciotato/waitfor
	https://github.com/laverdet/node-fibers
	*/
	
	function allData(){
		console.log('Answering back ....');
		res.send({
			today: today,
			yesterday: yesterday,
			all_time: all_time,
			current_month: current_month
		});
	}

	var queriesToBeDone = 4; 
	clickbankQuick(current_month,function(result){
		current_month.result = JSON.parse(result);
		console.log('Clickbank MONTH result: ' + current_month.result);
		if (--queriesToBeDone === 0) allData();

	});

	clickbankQuick(today,function(result){
		today.result = JSON.parse(result);
		console.log('Clickbank TODAY result: ' + today.result);
		if (--queriesToBeDone === 0) allData();
	});

	clickbankQuick(yesterday,function(result){
		yesterday.result = JSON.parse(result);
		console.log('Clickbank YESTERDAY result: ' + yesterday.result);
		if (--queriesToBeDone === 0) allData();
	});

	clickbankQuick(all_time,function(result){
		all_time.result = JSON.parse(result);
		console.log('Clickbank ALL TIME result: ' + all_time.result);
		if (--queriesToBeDone === 0) allData();
	});

	


	

	/*clickbankDetail(one_month_ago,function(result){
		one_month_ago.result = result;
		console.log('Clickbank LAST MONTH result: ' + one_month_ago.result);
	});*/

})

app.get('/google/oauth',function(req,res){

	console.log('Google OAUTH START');
	

		// generate a url that asks permissions for Google+ and Google Calendar scopes
	var scopes = [
	  'https://www.googleapis.com/auth/adsense'	  
	];

	var url = oauth2Client.generateAuthUrl({
		access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  		scope: scopes // If you only need one scope you can pass it as string
	})

	console.log('Google OAuth url generated : ' + url);
	res.redirect(url);

})

app.get('/oauth2callback/google',function(req,res){
	console.log('Google OAUTH CALLBACK ');
	
	var authCode = req.param('code');
	console.log('Google OAUTH code authorization : ' + authCode);

	oauth2Client.getToken(authCode, function(err, tokens){
		if (!err){
			oauth2Client.setCredentials(tokens);
		}
	})

	var adsense = google.adsense('v1.4');
	adsense.accounts.list({auth:oauth2Client} , function(err,response){
		console.log('Google OAUTH result LIST: ' + response);
		console.log('Publisher name : ' + response.items[0].name);
		/* voir https://console.developers.google.com/project/enhanced-digit-708/apiui/api/adsense/method/adsense.accounts.list
		detail de account.list et executer pour voir le squelette
{
 "kind": "adsense#accounts",
 "etag": "\"l6zUEvvBh5CHA4zPDkQgWpZUrxA/7qS0Y4uAbvi6YHK7szO1Xg\"",
 "items": [
  {
   "kind": "adsense#account",
   "id": "pub-6163954883404250",
   "name": "pub-6163954883404250",
   "premium": false,
   "timezone": "Europe/Madrid"
  }
 ]
}



		*/
	});
	

	//res.redirect('/');
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
