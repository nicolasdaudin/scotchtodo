var express = require('express');
var router = express.Router();
var moment = require('moment');

var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP",{
	service:"Gmail",
	auth:{
		user:"nichecolas",
		pass:"qug5WIEJ"
	}
});

var email = 'nicolas.daudin@gmail.com';


// send an email
router.get('/send',function(req,res){
	var mailOptions = {
		from: 'Social Dashboard <socialdashboard@gmail.com>',
		to : "nicolas.daudin@gmail.com",
		subject : "[Social Dashboard] Earnings from yesterday",
		text: "Hi, these are your earnings. Are you happy?",
		html: "Hi, <strong>these</strong> are your <strong>earnings</strong>. Happy?"
	};

	smtpTransport.sendMail(mailOptions,function(err,resp){
		if (err){
			console.log(moment().format('YYYY-MM-DD hh:mm:ss') + 'Error while sending email: ' + err);
			res.end("error");
		} else {
			console.log(moment().format('YYYY-MM-DD hh:mm:ss') + 'Message successfully sent: ' + resp.message);
			res.end("sent");
		}
	})
})


module.exports = router;