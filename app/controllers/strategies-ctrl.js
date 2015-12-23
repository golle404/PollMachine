var passport = require('passport');
var Account = require('../models/account');
var GithubStrategy = require('passport-github2').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var LocalStrategy = require('passport-local').Strategy;


var config = require('../oauth.js');


passport.use(new LocalStrategy(Account.authenticate()));

passport.use(new GithubStrategy(config.github,
	function (accessToken, refreshToken, profile, done) {
	registerAccount(profile.username, accessToken, done)
}));

passport.use(new TwitterStrategy(config.twitter,
	function (accessToken, refreshToken, profile, done) {
	registerAccount(profile.username, accessToken, done)
}));

function registerAccount(username, password, callback) {
	Account.findOne({
			username: username
		}, function (err, data) {
			if (err) {
				throw err;
			}
			if (!err && data !== null) {
				callback(null, data);
			} else {
				Account.register(new Account({
						username: username
					}),
					password,
					function (err, account) {
						callback(null, data);
					});
			}
		})
}

passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());