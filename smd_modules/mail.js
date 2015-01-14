var express = require('express');
var router = express.Router();
var moment = require('moment');

var nodemailer = require("nodemailer");

// to let a Gmail address use as a SMTP server, the google account should have this enabled to 'enable':
// https://www.google.com/settings/security/lesssecureapps
// (let less secure apps access your Google account)
// might also be necessary to first enable access and unlock captcha via
// https://accounts.google.com/DisplayUnlockCaptcha
// all info are here: https://support.google.com/mail/answer/78754
// anyway the idea is to create an amazon address or something
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