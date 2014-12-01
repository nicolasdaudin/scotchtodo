var express = require('express');
var router = express.Router();
var moment = require('moment');

var google = require('googleapis');
require('array.prototype.find');

// INIT GOOGLE API
var OAuth2 = google.auth.OAuth2;

var CLIENT_ID = "619973237257-ud5ujht6btm8njnfq6v158sm27abr5nn.apps.googleusercontent.com";
var CLIENT_SECRET = "O-b4w10_tnK96SUG9tpdDYxS";
//var REDIRECT_URL = "http://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:8080/oauth2callback/google";
var REDIRECT_URL = "http://localhost:8080/google/oauth2callback/";

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);


router.get('/oauth',function(req,res){

	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Google OAUTH START');
	

	// generate a url that asks permissions for Google+ and Google Calendar scopes
	var scopes = [
	  'https://www.googleapis.com/auth/adsense'	  
	];

	var url = oauth2Client.generateAuthUrl({
		access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  		scope: scopes // If you only need one scope you can pass it as string
	})

	console.log('Google OAuth url generated : ' + url);
	res.send(url);

})

router.get('/oauth2callback',function(req,res){
	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Start Google OAUTH CALLBACK');
	
	var authCode = req.param('code');
	console.log('Google OAUTH code authorization : ' + authCode);

	oauth2Client.getToken(authCode, function(err, tokens){
		if (!err){
			oauth2Client.setCredentials(tokens);
		}
	})

	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' End Google OAUTH CALLBACK');

	res.redirect('/');
})

router.get('/adsense',function(req,res){
	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Start Google REPORT');

	var adsense = google.adsense('v1.4');
	adsense.accounts.list({auth:oauth2Client} , function(err,response){
		if (err){
			console.log('Error during callbak from Google to oauth2callback/google' + err);
		} else {
			console.log('Google OAUTH result LIST: ' + JSON.stringify(response));
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

Last test done: Google OAUTH CALLBACK
Google OAUTH code authorization : 4/iXuBxZGxLBKR-gWaYF1-FfqDe6F0.cvmZ6BkXWvwWPvB8fYmgkJx9OXQekQI
Google OAUTH result LIST: [object Object]
Publisher name : pub-6163954883404250

Mais c'est étrange, il fuat aller plusieurs fois sur la url auth pour que ca marche....

		*/
			console.log('Publisher id : ' + response.items[0].id);

			var accountId = response.items[0].id;

			var today = {
				start 	:  	moment().format('YYYY-MM-DD'),
				end 	: 	moment().format('YYYY-MM-DD')
			}

			var yesterday = {
				start 	:  	moment().subtract(1,'day').format('YYYY-MM-DD'),
				end 	: 	moment().subtract(1,'day').format('YYYY-MM-DD')
			}

			var two_days_ago = {
				start 	:  	moment().subtract(2,'day').format('YYYY-MM-DD'),
				end 	: 	moment().subtract(2,'day').format('YYYY-MM-DD')
			}

			var current_month = {
				start :  moment().startOf('month').format('YYYY-MM-DD'),
				end : moment().format('YYYY-MM-DD')
			}

			var reportParams = {
				accountId : response.items[0].id,
				auth : oauth2Client,
				startDate: current_month.start,
				endDate: current_month.end,
				dimension:'DATE',
				metric:'EARNINGS'
			}

			adsense.accounts.reports.generate(reportParams, function(errReport,response){
				if (errReport){
					console.log('Error while getting report: ' + errReport);
					console.log('Error while getting report: ' + JSON.stringify(errReport));
				} else {
					console.log('Google Reports Response: ' + response);
					console.log('Google Reports Response JSON: ' + JSON.stringify(response));

					console.log('Google Reports Rows : ' + response.rows);
					
					var todayValue = response.rows.find(function(a) { return a[0] === today.start;})
					console.log('Google Report Todays earnings: ' + todayValue[1]);

					var yesterdayValue = response.rows.find(function(a) { return a[0] === yesterday.start;})
					console.log('Google Report Yesterdays earnings : ' + yesterdayValue[1]);

					var twoDaysAgoValue = response.rows.find(function(a) { return a[0] === two_days_ago.start;})
					console.log('Google Report Two Days Ago earnings : ' + twoDaysAgoValue[1]);

					var monthValue = response.totals[1];
					console.log('Google Report Total Months earnings : ' + monthValue);

					res.send({
						today: todayValue[1],
						yesterday: yesterdayValue[1],
						two_days_ago: twoDaysAgoValue[1],
						current_month: monthValue
					});
				}
			});
		}
	});
	
	console.log(moment().format('YYYY-MM-DD hh:mm:ss') + ' End Google REPORT');

	//res.redirect('/');
})

module.exports = router;
