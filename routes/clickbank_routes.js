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


// get last 45 days
router.get('/import',function(req,res){
	console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Clickbank Import Data from site START');

	// yesterday
	var day = moment().subtract(1,'day').format('YYYY-MM-DD');
	var day_limit = moment().subtract(45,'day').format('YYYY-MM-DD');
	retrieveAndSaveDataForDay(day,day_limit,function(){
		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Clickbank Import Data from site DONE');
		res.send('Clickbank Import Data from site DONE');
	});
})


var retrieveAndSaveDataForDay = function (day,day_limit,callback){

	
	if (moment(day).isBefore(day_limit)){
		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Clickbank : Importation of data for day ' + day + ' DID NOT START. Limit of ' + day_limit + ' has been reached');
		callback();
	} else {
		console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Clickbank : Importation of data for day ' + day + ' STARTED');

		var day_before = moment(day).subtract(1,'day').format('YYYY-MM-DD');

		// value exists already, we do not import it from Clickbank
		ClickbankBiz.findEarning(email,day, function(earning){
			if (earning){
				console.log(moment().format('YYYY-MM-DD HH:mm:ss') + " Clickbank : Data for day " + day + " already exist. They won't be fetched.");
				retrieveAndSaveDataForDay(day_before,day_limit,callback);
			} else {
				// value does not exist, we import it
				ClickbankBiz.quick(day,function(err, result){
					
					if (err){
						console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' ERROR while importing Clickbank data for day ' + day + ' : ' + err);	
					} else {
						parsed = ClickbankBiz.parse(result);
						console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' Clickbank Amount imported for day ' + day + ' : ' + parsed.sale);	
						ClickbankBiz.saveEarning(email,day,parsed.sale);
					}
					
					
					retrieveAndSaveDataForDay(day_before,day_limit,callback)

				});
			}
		});
	}
}


module.exports = router;
