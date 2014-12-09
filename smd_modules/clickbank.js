var express = require('express');
var router = express.Router();
var moment = require('moment');
var querystring = require('querystring');
var https = require('https');

var UserProfile = require('../models.js').UserProfile;


// CLICKBANK CONSTANTS
var CLICKBANK_CONSTANTS = {
	HOST: 'api.clickbank.com',	
 	QUICKSTATS_PATH : '/rest/1.3/quickstats/count',
 	//DETAIL_PATH : '/rest/1.3/analytics/affiliate/subscription/trends',
 	DETAIL_PATH : '/rest/1.3/analytics/affiliate/affiliate',
 	SUBS_DETAIL_PATH: '/rest/1.3/analytics/affiliate/subscription/details',
 	TRENDS_PATH: '/rest/1.3/analytics/affiliate/subscription/trends',
 	
 	DEV_API_KEY : 'DEV-8Q6RMJUSUOCR3PRFF2QUGF1JGQ575UO2'

}


// default email to store and retrieve Clickbank info (until we implement user logins and profiles)
var email = 'nicolas.daudin@gmail.com';


// get clickbank data
router.get('/month',function(req,res){
	console.log('Clickbank method START');
	var host = 'api.clickbank.com';	
	var path = '/rest/1.3/quickstats/count';
	//var path = '/rest/1.3/debug';
	
	
	/*var user_api = {
		type:'master',
		key:'API-JBQIHA1OH2QH40PDQ9LLLAIR1S0BCAKT'
	};*/

	/*var user_api = {
		type:'nicdo77',
		key:'API-6A9LNO4L8VVINIUIFIC96JUUERB33UDK'
	};*/

	var startDate = moment().startOf('month').format('YYYY-MM-DD');
	var endDate = moment().format('YYYY-MM-DD');
	
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
			startDate: startDate,
			endDate: endDate,
			account: account
		};
		var clickbankQueryString = querystring.stringify(clickbankQueryData);


		var options = {
		    host: host,	
		    method: 'GET',
		    path: path + '?' + clickbankQueryString,	    
		    headers: {
		    	'Accept': 'application/json',
		    	'Authorization':CLICKBANK_CONSTANTS.DEV_API_KEY + ':' + api_key
		    }
		};


		console.log('REQUEST OPTIONS [using API KEY from master]: ' + JSON.stringify(options));

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
	});


	

	//res.send('success');
})


// get clickbank data
router.get('/sumup',function(req,res){
	console.log('Clickbank SUMUP method START');

	var current_month = {
		start :  moment().startOf('month').format('YYYY-MM-DD'),
		end : moment().format('YYYY-MM-DD')
	}	

	var one_month_ago = {
		start :  moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD'),
		end : moment().subtract(1,'month').endOf('month').format('YYYY-MM-DD'),
		name: moment().subtract(1,'month').format('MMMM')
	}	

	var two_month_ago = {
		start :  moment().subtract(2,'month').startOf('month').format('YYYY-MM-DD'),
		end : moment().subtract(2,'month').endOf('month').format('YYYY-MM-DD'),
		name: moment().subtract(2,'month').format('MMMM')
	}	

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

	var all_time = {
		start 	:  	'2014-06-01',
		end 	: 	moment().subtract(1,'day').format('YYYY-MM-DD')
	}
	
	/* to make everything parallel, check Fiber and WAITFOR
	https://github.com/luciotato/waitfor
	https://github.com/laverdet/node-fibers
	*/

	/* 
	https://api.clickbank.com/rest/1.3/analytics/affiliate/subscription/trends?account=nicdo77&startDate=2014-06-01&endDate=2014-10-10
	{"totalCount":"3","data":{"row":[
		{"avgActiveSubCnt":"2","avgSubAge":"34","avgSubValue":"39.1283","cancelSubCnt":"1","duration":"0","grossSales":"287.7","initialSaleAmt":"158.28","initialSaleCnt":"6","itemNo":"4","netSales":"287.7","nickname":"zcodesys","productId":"892422","recurringSaleAmt":"129.42","recurringSaleCnt":"5","totalSalesCnt":"11"},
		{"avgActiveSubCnt":"3","avgSubAge":"44","avgSubValue":"60.5129","cancelSubCnt":"3","duration":"0","grossSales":"466.32","initialSaleAmt":"300.74","initialSaleCnt":"7","itemNo":"9","netSales":"466.32","nickname":"zcodesys","productId":"947658","recurringSaleAmt":"165.58","recurringSaleCnt":"4","totalSalesCnt":"11"},
		{"avgActiveSubCnt":"0","avgSubAge":"28","avgSubValue":"0","cancelSubCnt":"0","duration":"0","grossSales":"0","initialSaleAmt":"0","initialSaleCnt":"0","itemNo":"1","netSales":"0","nickname":"zcodesys","productId":"902023","recurringSaleAmt":"0","recurringSaleCnt":"0","totalSalesCnt":"0"}]}}
	*/

	/*
	https://api.clickbank.com/rest/1.3/analytics/affiliate/subscription/trends?account=nicdo77&startDate=2014-06-01&endDate=2014-10-20
	{"totalCount":"3","data":{"row":[
		{"avgActiveSubCnt":"3","avgSubAge":"47","avgSubValue":"54.4086","cancelSubCnt":"5","duration":"0","grossSales":"466.32","initialSaleAmt":"300.74","initialSaleCnt":"7","itemNo":"9","netSales":"466.32","nickname":"zcodesys","productId":"947658","recurringSaleAmt":"165.58","recurringSaleCnt":"4","totalSalesCnt":"11"},
		{"avgActiveSubCnt":"2","avgSubAge":"37","avgSubValue":"29.8529","cancelSubCnt":"3","duration":"0","grossSales":"313.98","initialSaleAmt":"184.56","initialSaleCnt":"7","itemNo":"4","netSales":"313.98","nickname":"zcodesys","productId":"892422","recurringSaleAmt":"129.42","recurringSaleCnt":"5","totalSalesCnt":"12"},
		{"avgActiveSubCnt":"0","avgSubAge":"28","avgSubValue":"0","cancelSubCnt":"0","duration":"0","grossSales":"0","initialSaleAmt":"0","initialSaleCnt":"0","itemNo":"1","netSales":"0","nickname":"zcodesys","productId":"902023","recurringSaleAmt":"0","recurringSaleCnt":"0","totalSalesCnt":"0"}]}}
	*/

	/*

	https://api.clickbank.com/rest/1.3/analytics/affiliate/subscription/details?account=nicdo77&orderBy=purchase_date&sortDirection=ASC
	{"totalCount":"14","data":{"row":[
		{"affNickName":"nicdo77","cancelled":"true","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"87096945","futurePaymentsCount":"998","initialSaleAmount":"250.6","initialSaleCount":"0","itemNo":"1","nextPaymentDate":"2012-09-28T00:00:00-07:00","processedPaymentsCount":"1","pubNickName":"zcodesys","purchaseDate":"2012-08-28T00:00:00-07:00","rebillSaleAmount":"0","rebillSaleCount":"0","receipt":"YPQCFECQ","refundAmount":"-250.6","refundCount":"1","status":"CANCELED","subCancelDate":"2012-09-25T00:00:00-07:00","subEndDate":"2095-09-28T00:00:00-07:00","subValue":"0"},
		{"affNickName":"nicdo77","cancelled":"true","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"109868643","futurePaymentsCount":"996","initialSaleAmount":"62.74","initialSaleCount":"0","itemNo":"4","nextPaymentDate":"2014-09-14T00:00:00-07:00","processedPaymentsCount":"3","pubNickName":"zcodesys","purchaseDate":"2014-06-14T00:00:00-07:00","rebillSaleAmount":"125.04","rebillSaleCount":"0","receipt":"TRRLEK69","refundAmount":"-125.04","refundCount":"2","status":"CANCELED","subCancelDate":"2014-08-18T00:00:00-07:00","subEndDate":"2097-07-14T00:00:00-07:00","subValue":"26.86"},{"affNickName":"nicdo77","cancelled":"false","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"111443097","futurePaymentsCount":"996","initialSaleAmount":"100.32","initialSaleCount":"0","itemNo":"9","nextPaymentDate":"2014-10-11T00:00:00-07:00","processedPaymentsCount":"3","pubNickName":"zcodesys","purchaseDate":"2014-07-11T00:00:00-07:00","rebillSaleAmount":"194.07","rebillSaleCount":"0","receipt":"WLFDVETK","refundAmount":"0","refundCount":"0","status":"ACTIVE","subEndDate":"2097-08-11T00:00:00-07:00","subValue":"125.96"},{"affNickName":"nicdo77","cancelled":"false","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"112867378","futurePaymentsCount":"998","initialSaleAmount":"100.32","initialSaleCount":"0","itemNo":"9","nextPaymentDate":"2014-09-12T00:00:00-07:00","processedPaymentsCount":"1","pubNickName":"zcodesys","purchaseDate":"2014-08-12T00:00:00-07:00","rebillSaleAmount":"0","rebillSaleCount":"0","receipt":"LJYFVE85","refundAmount":"0","refundCount":"0","status":"ACTIVE","subEndDate":"2097-09-12T00:00:00-07:00","subValue":"42.73"},{"affNickName":"nicdo77","cancelled":"true","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"113120929","futurePaymentsCount":"998","initialSaleAmount":"79","initialSaleCount":"0","itemNo":"9","nextPaymentDate":"2014-10-03T00:00:00-07:00","processedPaymentsCount":"1","pubNickName":"zcodesys","purchaseDate":"2014-08-19T00:00:00-07:00","rebillSaleAmount":"0","rebillSaleCount":"0","receipt":"6ZHW89EF","refundAmount":"0","refundCount":"0","status":"CANCELED","subCancelDate":"2014-10-03T00:00:00-07:00","subEndDate":"2097-09-19T00:00:00-07:00","subValue":"43.25"},{"affNickName":"nicdo77","cancelled":"false","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"113192212","futurePaymentsCount":"997","initialSaleAmount":"62.22","initialSaleCount":"0","itemNo":"4","nextPaymentDate":"2014-10-20T00:00:00-07:00","processedPaymentsCount":"2","pubNickName":"zcodesys","purchaseDate":"2014-08-20T00:00:00-07:00","rebillSaleAmount":"60.24","rebillSaleCount":"0","receipt":"7CMW8TEQ","refundAmount":"0","refundCount":"0","status":"ACTIVE","subEndDate":"2097-09-20T00:00:00-07:00","subValue":"51.7"},{"affNickName":"nicdo77","cancelled":"false","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"113445634","futurePaymentsCount":"997","initialSaleAmount":"100.31","initialSaleCount":"0","itemNo":"9","nextPaymentDate":"2014-10-27T00:00:00-07:00","processedPaymentsCount":"2","pubNickName":"zcodesys","purchaseDate":"2014-08-27T00:00:00-07:00","rebillSaleAmount":"96.86","rebillSaleCount":"0","receipt":"9GNW8PEC","refundAmount":"0","refundCount":"0","status":"ACTIVE","subEndDate":"2097-09-27T00:00:00-07:00","subValue":"83.97"},{"affNickName":"nicdo77","cancelled":"false","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"113481140","futurePaymentsCount":"997","initialSaleAmount":"83.59","initialSaleCount":"0","itemNo":"9","nextPaymentDate":"2014-10-28T00:00:00-07:00","processedPaymentsCount":"2","pubNickName":"zcodesys","purchaseDate":"2014-08-28T00:00:00-07:00","rebillSaleAmount":"80.68","rebillSaleCount":"0","receipt":"57YW8QEZ","refundAmount":"0","refundCount":"0","status":"ACTIVE","subEndDate":"2097-09-28T00:00:00-07:00","subValue":"84.95"},{"affNickName":"nicdo77","cancelled":"false","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"113500399","futurePaymentsCount":"997","initialSaleAmount":"62.22","initialSaleCount":"0","itemNo":"4","nextPaymentDate":"2014-10-29T00:00:00-07:00","processedPaymentsCount":"2","pubNickName":"zcodesys","purchaseDate":"2014-08-29T00:00:00-07:00","rebillSaleAmount":"59.91","rebillSaleCount":"0","receipt":"PJTKE7MX","refundAmount":"0","refundCount":"0","status":"ACTIVE","subEndDate":"2097-09-29T00:00:00-07:00","subValue":"51.56"},{"affNickName":"nicdo77","cancelled":"false","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"113947118","futurePaymentsCount":"997","initialSaleAmount":"62.23","initialSaleCount":"0","itemNo":"4","nextPaymentDate":"2014-11-09T00:00:00-08:00","processedPaymentsCount":"2","pubNickName":"zcodesys","purchaseDate":"2014-09-09T00:00:00-07:00","rebillSaleAmount":"61.09","rebillSaleCount":"0","receipt":"SG3KE74P","refundAmount":"0","refundCount":"0","status":"ACTIVE","subEndDate":"2097-10-09T00:00:00-07:00","subValue":"52.08"},{"affNickName":"nicdo77","cancelled":"true","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"114079217","futurePaymentsCount":"998","initialSaleAmount":"100.31","initialSaleCount":"0","itemNo":"9","nextPaymentDate":"2014-10-13T00:00:00-07:00","processedPaymentsCount":"1","pubNickName":"zcodesys","purchaseDate":"2014-09-13T00:00:00-07:00","rebillSaleAmount":"0","rebillSaleCount":"0","receipt":"62368ZEG","refundAmount":"-100.31","refundCount":"1","status":"CANCELED","subCancelDate":"2014-10-02T00:00:00-07:00","subEndDate":"2097-10-13T00:00:00-07:00","subValue":"0"},{"affNickName":"nicdo77","cancelled":"false","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"114574632","futurePaymentsCount":"998","initialSaleAmount":"62.23","initialSaleCount":"0","itemNo":"4","nextPaymentDate":"2014-10-25T00:00:00-07:00","processedPaymentsCount":"1","pubNickName":"zcodesys","purchaseDate":"2014-09-25T00:00:00-07:00","rebillSaleAmount":"0","rebillSaleCount":"0","receipt":"VNK88PEJ","refundAmount":"0","refundCount":"0","status":"ACTIVE","subEndDate":"2097-10-25T00:00:00-07:00","subValue":"26.29"},{"affNickName":"nicdo77","cancelled":"true","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"114690809","futurePaymentsCount":"998","initialSaleAmount":"100.31","initialSaleCount":"0","itemNo":"9","nextPaymentDate":"2014-10-29T00:00:00-07:00","processedPaymentsCount":"1","pubNickName":"zcodesys","purchaseDate":"2014-09-29T00:00:00-07:00","rebillSaleAmount":"0","rebillSaleCount":"0","receipt":"SX87E7CQ","refundAmount":"0","refundCount":"0","status":"CANCELED","subCancelDate":"2014-10-08T00:00:00-07:00","subEndDate":"2097-10-29T00:00:00-07:00","subValue":"42.73"},{"affNickName":"nicdo77","cancelled":"false","chargebackAmount":"0","chargebackCount":"0","customerDisplayName":"--","customerFirstName":"--","customerLastName":"--","duration":"999","frequency":"EVERY MONTH","ftxnId":"115116276","futurePaymentsCount":"998","initialSaleAmount":"62.22","initialSaleCount":"0","itemNo":"4","nextPaymentDate":"2014-11-09T00:00:00-08:00","processedPaymentsCount":"1","pubNickName":"zcodesys","purchaseDate":"2014-10-09T00:00:00-07:00","rebillSaleAmount":"0","rebillSaleCount":"0","receipt":"QCV2E7RS","refundAmount":"0","refundCount":"0","status":"ACTIVE","subEndDate":"2097-11-09T00:00:00-08:00","subValue":"26.28"}]}}
	*/
	
	function allData(){
		console.log('Answering back ....');
		res.send({
			today: today,
			yesterday: yesterday,
			two_days_ago: two_days_ago,
			current_month: current_month
		});
	}

	var queriesToBeDone = 4; 


	function parseClickbankResult(result){
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

	}

	clickbankQuick(current_month,function(result){		
		current_month.result = parseClickbankResult(result);
		console.log('Clickbank MONTH result: ' + current_month.result);
		if (--queriesToBeDone === 0) allData();

	});

	clickbankQuick(today,function(result){
		today.result = parseClickbankResult(result);
		console.log('Clickbank TODAY result: ' + today.result);
		if (--queriesToBeDone === 0) allData();
	});

	clickbankQuick(yesterday,function(result){
		yesterday.result = parseClickbankResult(result);
		console.log('Clickbank YESTERDAY result: ' + yesterday.result);
		if (--queriesToBeDone === 0) allData();
	});

	clickbankQuick(two_days_ago,function(result){
		two_days_ago.result = parseClickbankResult(result);
		console.log('Clickbank TWO_DAYS_AGO result: ' + two_days_ago.result);
		if (--queriesToBeDone === 0) allData();
	});

	/**
	clickbankQuick(all_time,function(result){
		all_time.result = JSON.parse(result);
		console.log('Clickbank ALL TIME result: ' + all_time.result);
		if (--queriesToBeDone === 0) allData();
	});
	*/
	
	/** TRY AGAIN
	clickbankAlltime(all_time,function(result){
		all_time.result = JSON.parse(result);
		console.log('Clickbank ALL TIME result: ' + all_time.result);
		if (--queriesToBeDone === 0) allData();
	})
	*/
	

	/* DETAIL with DETAIL_PATH : '/rest/1.3/analytics/affiliate/affiliate', no funciona */
	/*
	clickbankQuick(one_month_ago,function(result){
		one_month_ago.result = result;
		console.log('Clickbank LAST MONTH result: ' + one_month_ago.result);
	});

	clickbankQuick(two_month_ago,function(result){
		two_month_ago.result = result;
		console.log('Clickbank TWO MONTHS AGO result: ' + two_month_ago.result);
	});
*/

})


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

	/*
	https://api.clickbank.com/rest/1.3/analytics/affiliate/subscription/trends?account=nicdo77&startDate=2014-06-01&endDate=2014-10-20
	{"totalCount":"3","data":{"row":[
		{"avgActiveSubCnt":"3","avgSubAge":"47","avgSubValue":"54.4086","cancelSubCnt":"5","duration":"0","grossSales":"466.32","initialSaleAmt":"300.74","initialSaleCnt":"7","itemNo":"9","netSales":"466.32","nickname":"zcodesys","productId":"947658","recurringSaleAmt":"165.58","recurringSaleCnt":"4","totalSalesCnt":"11"},
		{"avgActiveSubCnt":"2","avgSubAge":"37","avgSubValue":"29.8529","cancelSubCnt":"3","duration":"0","grossSales":"313.98","initialSaleAmt":"184.56","initialSaleCnt":"7","itemNo":"4","netSales":"313.98","nickname":"zcodesys","productId":"892422","recurringSaleAmt":"129.42","recurringSaleCnt":"5","totalSalesCnt":"12"},
		{"avgActiveSubCnt":"0","avgSubAge":"28","avgSubValue":"0","cancelSubCnt":"0","duration":"0","grossSales":"0","initialSaleAmt":"0","initialSaleCnt":"0","itemNo":"1","netSales":"0","nickname":"zcodesys","productId":"902023","recurringSaleAmt":"0","recurringSaleCnt":"0","totalSalesCnt":"0"}]}}
	*/
var clickbankAlltime = function(date_interval,callback){

	/*****
	ATTENTION J'AI PAS ADAPTË A L'USAGE DE MODEL.js
	******/

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
	    path: CLICKBANK_CONSTANTS.TRENDS_PATH + '?' + clickbankQueryString,
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
		   console.log('BODY unparsed ' + chunk);
		   // ==> TROP LONG, le chunk est coupé au milieu donc le JSON peut pas être interprete, c'est pourri et je sais pas comment fiare pour tout recevoir
		   var chunkJson = JSON.parse(chunk);
		   //var chunkJson = chunk;
		    console.log('BODY: ' + chunkJson[0]);
		    //console.log('ROW: ' + chunkJson.data.row);		    
		    console.log('DATA: ' + JSON.stringify(chunkJson.data));		    
		    //var dataJson = JSON.parse(chunkJson.data);
		    //console.log('DATA JSON:' + dataJson)	    ;
		    console.log('ROW: ' + JSON.stringify(chunkJson.data.row[0]));
		    console.log('ROW2: ' + chunkJson.data.row[0].netSales);

		    // sumando sales y refund




		    callback(chunk);
		  });
		});
	
	cbreq.on('error', function(e) {
	  console.log('problem with request: ' + e);
	});
	
	cbreq.end();
};

var clickbankDetail = function(date_interval,callback){

	/*****
	ATTENTION J'AI PAS ADAPTË A L'USAGE DE MODEL.js
	******/

	var clickbankQueryData = {
		startDate 	: date_interval.start,
		endDate		: date_interval.end,
		account 	: CLICKBANK_CONSTANTS.ACCOUNT/*,
		summaryType : 'VENDOR_ONLY' //à enlever*/
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

module.exports = router;