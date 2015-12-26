var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// account shema
var Account = new Schema({
    username: String,
	domain: String,
    password: String
});

// passport plugin - local-mongoose
Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);