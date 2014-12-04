var express = require('express');
var router = express.Router();
var moment = require('moment');

var google = require('googleapis');
require('array.prototype.find');

var UserProfile = require('../models.js').UserProfile;

// INIT GOOGLE API
var OAuth2 = google.auth.OAuth2;

var CLIENT_ID = "619973237257-ud5ujht6btm8njnfq6v158sm27abr5nn.apps.googleusercontent.com";
var CLIENT_SECRET = "O-b4w10_tnK96SUG9tpdDYxS";
//var REDIRECT_URL = "http://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:8080/oauth2callback/google";
var REDIRECT_URL = "http://localhost:8080/google/oauth2callback/";

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// default email to store and retrieve Google tokens (until we implement user logins and profiles)
var email = 'nicolas.daudin@gmail.com';



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

	oauth2Client.getToken(authCode, function(err, token){
		if (!err){
			oauth2Client.setCredentials(token);

			console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Google Token is : ' + token);
			
			// storing it
			UserProfile.update({email:email},{googleToken:token}, function(err,todo){
				if (err){
					console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Error when storing Google token: '  + err);
				}
			})
		}
	})

	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' End Google OAUTH CALLBACK');

	res.redirect('/');
})

router.get('/adsense',function(req,res){
	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Start Google REPORT');

	var adsense = google.adsense('v1.4');

	// looking for credentials
	UserProfile.find({email:email},function(err,profiles){
		if (err){
			console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Error while retrieving User Profile: ' + err);
		}

		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Profiles: ' + profile[s0]);
		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' User with Google credentials: ' + JSON.stringify(profiles[0].googleToken));
		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' User with email: ' + JSON.stringify(profile[s0].email));

		oauth2Client.setCredentials(profiles[0].googleToken);
		//https://developers.google.com/accounts/docs/OAuth2WebServer

		adsense.accounts.list({auth:oauth2Client} , function(err,response){
			if (err){
				console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Error while getting Adsense data: ' + err);
			} else {
				console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Google OAUTH result LIST: ' + JSON.stringify(response));
				console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Publisher name : ' + response.items[0].name);
			
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
	

	})

	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' End Google REPORT');

	//res.redirect('/');
})

module.exports = router;
