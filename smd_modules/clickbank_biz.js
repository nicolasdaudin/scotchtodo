var express = require('express');
var router = express.Router();
var moment = require('moment');
var querystring = require('querystring');
var https = require('https');

var UserProfile = require('../models.js').UserProfile;
var Earning = require('../models.js').Earning;

var email = 'nicolas.daudin@gmail.com';

// CLICKBANK CONSTANTS
var CONSTANTS = {
	HOST: 'api.clickbank.com',	
 	QUICKSTATS_PATH : '/rest/1.3/quickstats/count',
 	//DETAIL_PATH : '/rest/1.3/analytics/affiliate/subscription/trends',
 	DETAIL_PATH : '/rest/1.3/analytics/affiliate/affiliate',
 	SUBS_DETAIL_PATH: '/rest/1.3/analytics/affiliate/subscription/details',
 	TRENDS_PATH: '/rest/1.3/analytics/affiliate/subscription/trends',
 	
 	DEV_API_KEY : 'DEV-8Q6RMJUSUOCR3PRFF2QUGF1JGQ575UO2' // info from the app, need to be moved to constants file or to DB

};

var ClickbankBiz = function(){
	

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
			    host: CONSTANTS.HOST,	
			    method: 'GET',
			    path: CONSTANTS.QUICKSTATS_PATH + '?' + clickbankQueryString,
			    headers: {
			    	'Accept': 'application/json',
			    	'Authorization':CONSTANTS.DEV_API_KEY + ':' + api_key
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

	var saveEarning = function(email,date,amount){

		// inserting in table Earning
		Earning.create({
			email	:   email,
			source	:   "clickbank",
			date 	:   date,
			quantity  : amount
		}, function(err,earning){
			if (err){
				console.log('Error while inserting CLICKBANK Earning:' + err);
			} else {
				console.log('CLICKBANK Earning of amount['+amount+'] for date['+date+'] inserted !!!!!');
			}
		});
	};



	return {
		parse: parseClickbankResult,
		quick: clickbankQuick,
		saveEarning: saveEarning
	};  


}

module.exports.ClickbankBiz = ClickbankBiz;

/*
################################
OLD FUNCTIONS NOT USED ANYMORE
################################
*/

	// 	/*
	// 	https://api.clickbank.com/rest/1.3/analytics/affiliate/subscription/trends?account=nicdo77&startDate=2014-06-01&endDate=2014-10-20
	// 	{"totalCount":"3","data":{"row":[
	// 		{"avgActiveSubCnt":"3","avgSubAge":"47","avgSubValue":"54.4086","cancelSubCnt":"5","duration":"0","grossSales":"466.32","initialSaleAmt":"300.74","initialSaleCnt":"7","itemNo":"9","netSales":"466.32","nickname":"zcodesys","productId":"947658","recurringSaleAmt":"165.58","recurringSaleCnt":"4","totalSalesCnt":"11"},
	// 		{"avgActiveSubCnt":"2","avgSubAge":"37","avgSubValue":"29.8529","cancelSubCnt":"3","duration":"0","grossSales":"313.98","initialSaleAmt":"184.56","initialSaleCnt":"7","itemNo":"4","netSales":"313.98","nickname":"zcodesys","productId":"892422","recurringSaleAmt":"129.42","recurringSaleCnt":"5","totalSalesCnt":"12"},
	// 		{"avgActiveSubCnt":"0","avgSubAge":"28","avgSubValue":"0","cancelSubCnt":"0","duration":"0","grossSales":"0","initialSaleAmt":"0","initialSaleCnt":"0","itemNo":"1","netSales":"0","nickname":"zcodesys","productId":"902023","recurringSaleAmt":"0","recurringSaleCnt":"0","totalSalesCnt":"0"}]}}
	// 	*/
	// var clickbankAlltime = function(date_interval,callback){

	// 	/*****
	// 	ATTENTION J'AI PAS ADAPTË A L'USAGE DE MODEL.js
	// 	******/

	// 	var clickbankQueryData = {		
	// 		account 	: CONSTANTS.ACCOUNT 
	// 	};

	// 	if (date_interval.start != null){
	// 		clickbankQueryData.startDate = date_interval.start;
	// 		clickbankQueryData.endDate = date_interval.end;
	// 	}

	// 	var clickbankQueryString = querystring.stringify(clickbankQueryData);

	// 	var options = {
	// 	    host: CONSTANTS.HOST,	
	// 	    method: 'GET',
	// 	    path: CONSTANTS.TRENDS_PATH + '?' + clickbankQueryString,
	// 	    /*auth: dev_api_key + ':' + user_api_key,*/
	// 	    /*cert: fs.readFileSync('certs/clickbank.cer'),*/
	// 	    headers: {
	// 	    	'Accept': 'application/json',
	// 	    	'Authorization':CONSTANTS.DEV_API_KEY + ':' + CONSTANTS.USER_API.KEY
	// 	    }
	// 	  };

	// 	console.log('About to request Clickbank [using API KEY from ' + CONSTANTS.USER_API.TYPE + ']: ' + JSON.stringify(options)); 

	// 	//var clickbankResult; 
	// 	var cbreq = https.request(options, function(resCB) {
	// 		  console.log('RESP STATUS: ' + resCB.statusCode);
	// 		  console.log('RESP HEADERS: ' + JSON.stringify(resCB.headers));
	// 		  resCB.setEncoding('utf8');
	// 		  resCB.on('data', function (chunk) {
	// 		   console.log('BODY unparsed ' + chunk);
	// 		   // ==> TROP LONG, le chunk est coupé au milieu donc le JSON peut pas être interprete, c'est pourri et je sais pas comment fiare pour tout recevoir
	// 		   var chunkJson = JSON.parse(chunk);
	// 		   //var chunkJson = chunk;
	// 		    console.log('BODY: ' + chunkJson[0]);
	// 		    //console.log('ROW: ' + chunkJson.data.row);		    
	// 		    console.log('DATA: ' + JSON.stringify(chunkJson.data));		    
	// 		    //var dataJson = JSON.parse(chunkJson.data);
	// 		    //console.log('DATA JSON:' + dataJson)	    ;
	// 		    console.log('ROW: ' + JSON.stringify(chunkJson.data.row[0]));
	// 		    console.log('ROW2: ' + chunkJson.data.row[0].netSales);

	// 		    // sumando sales y refund




	// 		    callback(chunk);
	// 		  });
	// 		});
		
	// 	cbreq.on('error', function(e) {
	// 	  console.log('problem with request: ' + e);
	// 	});
		
	// 	cbreq.end();
	// };

	// var clickbankDetail = function(date_interval,callback){

	// 	/*****
	// 	ATTENTION J'AI PAS ADAPTË A L'USAGE DE MODEL.js
	// 	******/

	// 	var clickbankQueryData = {
	// 		startDate 	: date_interval.start,
	// 		endDate		: date_interval.end,
	// 		account 	: CONSTANTS.ACCOUNT/*,
	// 		summaryType : 'VENDOR_ONLY' //à enlever*/
	// 	};

	// 	var clickbankQueryString = querystring.stringify(clickbankQueryData);

	// 	var options = {
	// 	    host: CONSTANTS.HOST,	
	// 	    method: 'GET',
	// 	    path: CONSTANTS.DETAIL_PATH + '?' + clickbankQueryString,
	// 	    /*auth: dev_api_key + ':' + user_api_key,*/
	// 	    /*cert: fs.readFileSync('certs/clickbank.cer'),*/
	// 	    headers: {
	// 	    	'Accept': 'application/json',
	// 	    	'Authorization':CONSTANTS.DEV_API_KEY + ':' + CONSTANTS.USER_API.KEY
	// 	    }
	// 	  };

	// 	console.log('About to request Clickbank [using API KEY from ' + CONSTANTS.USER_API.TYPE + ']: ' + JSON.stringify(options)); 

	// 	//var clickbankResult; 
	// 	var cbreq = https.request(options, function(resCB) {
	// 		  console.log('RESP STATUS: ' + resCB.statusCode);
	// 		  console.log('RESP HEADERS: ' + JSON.stringify(resCB.headers));
	// 		  resCB.setEncoding('utf8');
	// 		  resCB.on('data', function (chunk) {
	// 		    console.log('BODY: ' + chunk);
	// 		    callback(chunk);
	// 		  });
	// 		});
		
	// 	cbreq.on('error', function(e) {
	// 	  console.log('problem with request: ' + e);
	// 	});
		
	// 	cbreq.end();
	// };