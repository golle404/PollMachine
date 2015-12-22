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
				res.redirect("/register");
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