
var mongoose = require('mongoose');// mongoose for mongodb
var db = mongoose.connect('mongodb://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:27017/scotchtodo'); 	// connect to mongoDB database

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
	googleToken : {}
});


module.exports.UserProfile = UserProfile;