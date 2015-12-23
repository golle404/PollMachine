var express = require('express');
var passport = require("passport");

var pollCtrl = require('../controllers/poll-ctrl');
var accountCtrl = require('../controllers/account-ctrl');
var u = require('../utilities/utilities');

var router = express.Router();

/////////  GET routes  ///////////

// home route
router.get(["/", "/home"], function (req, res) {
	res.render("home", u.templateParams(req));
})

// user proxy route - used after login/register as proxy to 
// /user/:usename so we can get username
router.get("/user", u.logCheck, function (req, res) {
	res.redirect("/user/" + req.user.username);
})

// real user route - render user polls
router.get("/user/:username", u.logCheck, pollCtrl.getUserPolls);

// login view
router.get("/login", function (req, res) {
	res.render("login", u.templateParams(req));
})

// logout - return to login
router.get("/logout", function (req, res) {
	req.logout();
	res.redirect('/login');
})

// register view
router.get("/register", function (req, res) {
	res.render("register", u.templateParams(req));
})

// login-fail route - return to login page with message 
router.get("/login-fail", function (req, res) {
	var tp = u.templateParams(req);
	tp.info = "Sorry. Username and password do not match. Try again.";
	return res.render('login', tp);
})

// login-fail route - return to login page with message 
router.get("/register-fail", function (req, res) {
	var tp = u.templateParams(req);
	tp.info = "Sorry. That username already exists. Try again.";
	return res.render('register', tp);
})

// list of public polls
router.get("/public-polls", function (req, res) {
	return pollCtrl.getPublicPolls(req, res);
})

// new poll form
router.get("/new-poll", u.logCheck, function (req, res) {
	res.render("new-poll", u.templateParams(req))
})

// remove poll
router.get("/remove-poll/:id", u.logCheck, pollCtrl.removePoll);

// poll view - for voting
router.get("/poll/:id", pollCtrl.getPollById);

// poll-results - just results
router.get("/poll-results/:id", pollCtrl.pollResults);

// private poll verification form 
router.get("/verify/:id", function (req, res) {
	res.render("verify", {
		id: req.params.id
	});
})

// voting for optionId on pollId
router.get("/vote/:pollId/:optionId", pollCtrl.vote);

////////  POST routes  //////////

// login using account controller
router.post('/login', accountCtrl.authenticateAccount());

// register with account controller
router.post('/register', function (req, res) {
	return accountCtrl.registerAccount(req, res);
});

// submit poll
router.post("/poll-submit", u.logCheck, pollCtrl.addPoll);

// private polls verification key
router.post("/verify", pollCtrl.verifyKey);

///////  oAuth routes  ///////////////////

// github
router.get('/auth/github', passport.authenticate('github', {
	scope: ['user:email']
}), function (req, res) {});

router.get('/auth/github/callback',
	passport.authenticate('github', {
		failureRedirect: '/login-fail'
	}),
	function (req, res) {
		res.redirect('/user');
	});

// twitter
router.get('/auth/twitter', passport.authenticate('twitter'), function (req, res) {});

router.get('/auth/twitter/callback',
	passport.authenticate('twitter', {
		failureRedirect: '/login-fail'
	}),
	function (req, res) {
		res.redirect('/user');
	});







// export router as module
module.exports = router;