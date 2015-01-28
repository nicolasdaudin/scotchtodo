var express = require('express');
var router = express.Router();
var moment = require('moment');
var util = require("util");

var Type = require('type-of-is');

var google = require('googleapis');
var adsense = google.adsense('v1.4');

require('array.prototype.find');

var UserProfile = require('../models.js').UserProfile;
var Earning = require('../models.js').Earning;

// INIT GOOGLE API
var OAuth2 = google.auth.OAuth2;

 // info from the app, need to be moved to constants file or to DB
var CLIENT_ID = "619973237257-ud5ujht6btm8njnfq6v158sm27abr5nn.apps.googleusercontent.com";
var CLIENT_SECRET = "O-b4w10_tnK96SUG9tpdDYxS";

//var REDIRECT_URL = "http://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:8080/google/oauth2callback/";
//var REDIRECT_URL = "http://localhost:8080/google/oauth2callback/";

//var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

var GoogleBiz = require('../smd_modules/google_biz.js').GoogleBiz();

// default email to store and retrieve Google tokens (until we implement user logins and profiles)
var email = 'nicolas.daudin@gmail.com';


// get oauth authentication request
router.get('/oauth',function(req,res){

	GoogleBiz.generateAuthUrl(function(url){
		res.send(url);	
	});
	

})

// successful comeback from oauth authentication
router.get('/oauth2callback',function(req,res){
	var authCode = req.param('code');
	GoogleBiz.oauth2Callback(authCode,function(){
		res.redirect('/');
	});

	
})

// get adsense report
router.get('/adsense',function(req,res){
	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Start Google REPORT');

	GoogleBiz.getAdsenseReport(function(report){
		console.log("AdsenseReport=" + report);
		res.send(report);
	});
	
})

// get adsense data from adsense API and store them in DB for yesterday
router.post('/adsense',function(req,res){
	GoogleBiz.getAdsenseReport(function(report){
		var amount = report.yesterday;

		var yesterday = moment().subtract(1,'day').format('YYYY-MM-DD');
		GoogleBiz.saveEarning(email,yesterday,amount);
	});
})

// get last 45 days
router.get('/import',function(req,res){
	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Google Import Data from site START');

	// yesterday
	var day = moment().subtract(1,'day').format('YYYY-MM-DD');
	var day_limit = moment().subtract(60,'day').format('YYYY-MM-DD');

	GoogleBiz.getAdsenseReportSeveralDays(day_limit,day,function(earnings){
		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Google Import Data : earnings : ' + earnings);

		earnings.forEach(function(element, index, array){			
			console.log('Google Amount imported for day ' + element[0] + ' : ' + element[1]);
			GoogleBiz.saveEarning(email,element[0],element[1]);
		});

		res.send('Google Import Data from site DONE');
	});

})


module.exports = router;
