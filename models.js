
var mongoose = require('mongoose');// mongoose for mongodb
var db = mongoose.connect('mongodb://ec2-54-183-136-164.us-west-1.compute.amazonaws.com:27017/scotchtodo'); 	// connect to mongoDB database

// Define model =============================
var Todo = db.model('Todo',{
	text : String,
	done: Boolean
});
module.exports.Todo = Todo;

var UserProfile = db.model('UserProfile',{
	email : String,
	googleToken : String
});


module.exports.UserProfile = UserProfile;