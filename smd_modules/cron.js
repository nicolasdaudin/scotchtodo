var express = require('express');
var router = express.Router();
var moment = require('moment');
var querystring = require('querystring');
var https = require('https');
var cron = require('cron');

var UserProfile = require('../models.js').UserProfile;
var Earning = require('../models.js').Earning;

var GoogleBiz = require('../smd_modules/google_biz.js').GoogleBiz();

var Mailer = require('../smd_modules/mail.js').Mailer();


// CLICKBANK CONSTANTS
var CLICKBANK_CONSTANTS = {
	HOST: 'api.clickbank.com',	
 	QUICKSTATS_PATH : '/rest/1.3/quickstats/count',
 	//DETAIL_PATH : '/rest/1.3/analytics/affiliate/subscription/trends',
 	DETAIL_PATH : '/rest/1.3/analytics/affiliate/affiliate',
 	SUBS_DETAIL_PATH: '/rest/1.3/analytics/affiliate/subscription/details',
 	TRENDS_PATH: '/rest/1.3/analytics/affiliate/subscription/trends',
 	
 	DEV_API_KEY : 'DEV-8Q6RMJUSUOCR3PRFF2QUGF1JGQ575UO2' // info from the app, need to be moved to constants file or to DB

}


// default email to store and retrieve Clickbank info (until we implement user logins and profiles)
var email = 'nicolas.daudin@gmail.com';

var clickbankCreateCron = function(){
	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ########## CRON Clickbank + Google - ABOUT TO DECLARE CRON');
	/**
	0 31 00 * * * is every day at 00:31:00
	* 31 00 * * * is every day at 00:31, at every second
	0 31 07 * * * is every day at 07:31:00 */
	var job = new cron.CronJob('0 31 03 * * *', function() {
		
		// CLICBANK CRON 
		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ########## CRON Clickbank - START EXECUTING');
	
		var yesterday = moment().subtract(1,'day').format('YYYY-MM-DD');
		

		clickbankQuick(yesterday,function(result){
			parsed = parseClickbankResult(result);
			console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' CRON Clickbank NOW in DB result: ' + parsed);	

			// inserting in table Earning
			Earning.create({
				email:email,
				source:"clickbank",
				date:yesterday,
				quantity : parsed.sale
			}, function(err,earning){
				if (err){
					console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' CRON Clickbank - Error while inserting CLICKBANK Earning:' + err);
					console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ########## CRON Clickbank - END WITH ERRORS');
				} else {
					console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' CRON Clickbank - Earning of amount['+parsed.sale+'] for date['+yesterday+'] inserted !!!!!');
					console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ########## CRON Clickbank - END SUCCESSFULL');


					// GOOGLE CRON
					console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ########## CRON Google - START EXECUTING');
					GoogleBiz.getAdsenseReportYesterday(function(report){
						var amount = report.yesterday;

						//var yesterday = moment().subtract(1,'day').format('YYYY-MM-DD');

						// inserting in table Earning
						Earning.create({
							email:email,
							source:"google",
							date:yesterday,
							quantity : amount
						}, function(err,earning){
							if (err){
								console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ########## CRON Google - Error while inserting GOOGLE Earning:' + err);
								console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ########## CRON Google - END WITH ERRORS');
							} else {
								console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ########## CRON GOOGLE - Earning of amount['+amount+'] for date['+yesterday+'] inserted !!!!!');
								console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ########## CRON Google - END SUCCESSFULL');

								// sending emails
								var mailBody = '<p>On day ' + yesterday +' you have earned : <ul><li>Clickbank: ' + parsed.sale + ' USD</li><li>Google : ' + amount + ' EUR</li></ul></p><p>This email has been set from cron at ' + yesterday + '</p>';
								var mailSubject = '[Social Dashboard] Earnings for day ' + yesterday;
								Mailer.send(mailSubject,mailBody);
							}
						});
					});
				}
			});
		});


		

	});
	job.start();
};
clickbankCreateCron();



var clickbankQuick = function(date_interval,callback){

	// finding the correct UserProfile
	UserProfile.findOne({email:email},function(err, userprofile){
		if (err){
			console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Error while retrieving user profile: '  + err);
		}

		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' userprofile found : '  + JSON.stringify(userprofile)); 

		var clickbankInfo = userprofile.clickbank;
		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' clickbankInfo: '  + JSON.stringify(clickbankInfo));
		
		var account = clickbankInfo.account_name;
		var api_key = clickbankInfo.api_key;
		

		var clickbankQueryData = {		
			account 	: account
		};

		if (date_interval.start != null){
			clickbankQueryData.startDate = date_interval.start;
			clickbankQueryData.endDate = date_interval.end;
		} else {
			clickbankQueryData.startDate = date_interval;
			clickbankQueryData.endDate = date_interval;
		}

		var clickbankQueryString = querystring.stringify(clickbankQueryData);

		var options = {
		    host: CLICKBANK_CONSTANTS.HOST,	
		    method: 'GET',
		    path: CLICKBANK_CONSTANTS.QUICKSTATS_PATH + '?' + clickbankQueryString,
		    headers: {
		    	'Accept': 'application/json',
		    	'Authorization':CLICKBANK_CONSTANTS.DEV_API_KEY + ':' + api_key
		    }
		  };

		console.log('About to request Clickbank [using API KEY from master]: ' + JSON.stringify(options)); 

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
	});
};

var parseClickbankResult = function (result){
	var resultJson = JSON.parse(result);
	if (resultJson == null){
		result = {
			sale : 0,
			refund : 0,
			chargeback : 0
		};
	} else{
		result = {
			sale : resultJson.accountData.quickStats.sale,
			refund : resultJson.accountData.quickStats.refund,
			chargeback : resultJson.accountData.quickStats.chargeback
		};
	}
	return result;

};



