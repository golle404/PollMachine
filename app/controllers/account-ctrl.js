var Account = require("../models/account.js");
var passport = require("passport");

// account registration with passport
module.exports.registerAccount = function (req, res) {
	Account.register(new Account({
			username: req.body.username
		}),
		req.body.password,
		function (err, account) {
			if (err) {
				// if unsucessful return to registration-fail view
				res.redirect("/register-fail");
			}
		//if succesfull authenticate and redirect to user 
			passport.authenticate('local')(req, res, function () {
				res.redirect('/user');
			});
		});
}

// account authentication with passport 
module.exports.authenticateAccount = function (req, res) {
	return passport.authenticate('local', {
		successRedirect: '/user',
		failureRedirect: '/login-fail'
	})
}

// check is user loged in - middleware
module.exports.logCheck = function(req, res, next){
	if (req.user) {
		next();
	} else {
		res.redirect("/login");
	}
}
// prevent authenticated user to access login/register page
module.exports.logoutCheck = function(req, res, next){
	if (req.user) {
		res.render("logout");
	} else {
		next();
	}
}