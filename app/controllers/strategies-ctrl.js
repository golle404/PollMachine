var passport = require('passport');
var Account = require('../models/account');
var GithubStrategy = require('passport-github2').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var LocalStrategy = require('passport-local').Strategy;

var config = require('../oauth.js');

// local strategy
passport.use(new LocalStrategy(Account.authenticate()));

// github strategy - using token as password
passport.use(new GithubStrategy(config.github,
	function (accessToken, refreshToken, profile, done) {
		registerAccount(profile.username, accessToken, done);
}));

// twitter strategy - using token as password
passport.use(new TwitterStrategy(config.twitter,
	function (accessToken, refreshToken, profile, done) {
		registerAccount(profile.username, accessToken, done);
	}));

// serialize and deserialize
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// register account
function registerAccount(username, password, callback) {
	//check if username is already taken
	Account.findOne({
		username: username
	}, function (err, data) {
		// throw error if error
		if (err) {
			throw err;
		}
		// if user existes just log in
		if (!err && data !== null) {
			callback(null, data);
		} else {
			// if not than create one
			Account.register(new Account({
					username: username
				}),
				password,
				function (err, data) {
					callback(null, data);
				});
		}
	})
}
