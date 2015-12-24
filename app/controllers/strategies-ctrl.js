var passport = require('passport');
var Account = require('../models/account');
var GithubStrategy = require('passport-github2').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var LocalStrategy = require('passport-local').Strategy;

var config = require('../oauth.js');

// local strategy
passport.use(new LocalStrategy(Account.authenticate()));

// github strategy - using local-mogoose plugin for authentication
// token acts as passport
// see account-ctrl.js
passport.use(new GithubStrategy(config.github,
	function (accessToken, refreshToken, profile, done) {
	Account.authenticate()(profile.username, accessToken, done);
}));

// twitter strategy - using local-mogoose plugin for authentication
// token as passport
// see account-ctrl.js
passport.use(new TwitterStrategy(config.twitter,
	function (accessToken, refreshToken, profile, done) {
	Account.authenticate()(profile.username, accessToken, done);
}));

// serialize and deserialize
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());