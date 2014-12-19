
var mongoose = require('mongoose');// mongoose for mongodb
var db = mongoose.connect('mongodb://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:27017/scotchtodo'); 	// connect to mongoDB database
require('mongoose-currency').loadType(mongoose);
var Currency = mongoose.Types.Currency;
// Define Schemas =============================
/*var TodoSchema = new mongoose.Schema({
	text : String,
	done: Boolean
});

var GoogleCredentialsSchema = new mongoose.Schema({

});

var UserProfileSchema = new mongoose.Schema({
	email : String,
	googleToken : [GoogleCredentialsSchema]
});*/



// Define models ==============================
var Todo = db.model('Todo',{
	text : String,
	done: Boolean
});
module.exports.Todo = Todo;

var UserProfile = db.model('UserProfile',{
	email : String,
	google : {}, // for some reasons we can't define here access_token, refresh_token and account_id
	clickbank: {
		account_name: String,
		api_key: String
	}
});
module.exports.UserProfile = UserProfile;

var Earning = db.model('Earning',{	
	email : String,
	source: String,
	date : Date,
	quantity : Currency
});
module.exports.Earning = Earning;


