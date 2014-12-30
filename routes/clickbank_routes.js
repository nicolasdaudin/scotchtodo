var express = require('express');
var router = express.Router();
var moment = require('moment');

var ClickbankBiz = require('../smd_modules/clickbank_biz.js').ClickbankBiz();
// default email to store and retrieve Clickbank info (until we implement user logins and profiles)
var email = 'nicolas.daudin@gmail.com';



// get clickbank data
router.get('/sumup',function(req,res){
	console.log('Clickbank SUMUP method START');

	var current_month = {
		start :  moment().startOf('month').format('YYYY-MM-DD'),
		end : moment().format('YYYY-MM-DD')/*'2014-12-28'*/
	}	

	var today = {
		start 	:  	moment().format('YYYY-MM-DD'),/*'2014-12-28'*/
		end 	: 	moment().format('YYYY-MM-DD')/*'2014-12-28'*/
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

	var queriesToBeDone = 4; 

	ClickbankBiz.quick(current_month,function(result){		
		current_month.result = ClickbankBiz.parse(result);
		console.log('Clickbank MONTH result: ' + current_month.result);
		if (--queriesToBeDone === 0) allData(res,today,yesterday,two_days_ago,current_month);

	});

	ClickbankBiz.quick(today,function(result){
		today.result = ClickbankBiz.parse(result);
		console.log('Clickbank TODAY result: ' + today.result);
		if (--queriesToBeDone === 0) allData(res,today,yesterday,two_days_ago,current_month);
	});

	ClickbankBiz.quick(yesterday,function(result){
		yesterday.result = ClickbankBiz.parse(result);
		console.log('Clickbank YESTERDAY result: ' + yesterday.result);
		if (--queriesToBeDone === 0) allData(res,today,yesterday,two_days_ago,current_month);
	});

	ClickbankBiz.quick(two_days_ago,function(result){
		two_days_ago.result = ClickbankBiz.parse(result);
		console.log('Clickbank TWO_DAYS_AGO result: ' + two_days_ago.result);
		if (--queriesToBeDone === 0) allData(res,today,yesterday,two_days_ago,current_month);
	});

})

// set clickbank's yesterday data in DB
router.post('/yesterday',function(req,res){
	console.log('Clickbank YESTERDAY in DB method START');
	
	//var yesterday = moment().subtract(1,'day').format('YYYY-MM-DD');
	var yesterday = moment().subtract(1,'day').format('YYYY-MM-DD');

	ClickbankBiz.quick(yesterday,function(result){
		parsed = ClickbankBiz.parse(result);
		console.log('Clickbank YESTERDAY in DB result: ' + parsed);	

		ClickbankBiz.saveEarning(email,yesterday,parsed.sale);
	});

})


var allData = function (res,today,yesterday,two_days_ago,current_month){
	console.log('Answering back ....');
	res.send({
		today: today,
		yesterday: yesterday,
		two_days_ago: two_days_ago,
		current_month: current_month
	});
}





module.exports = router;
