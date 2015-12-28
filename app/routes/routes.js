var express = require('express');
var passport = require("passport");

var pollCtrl = require('../controllers/poll-ctrl');
var accountCtrl = require('../controllers/account-ctrl');
var layout = require('../controllers/layout-ctrl').layout;

var router = express.Router();

/////////  GET routes  ///////////


// home route
router.get("/home", layout, function (req, res) {
	//console.log("glob",req.glob);
	res.render("home");
})

// home redirect
router.get("/", function (req, res) {
		res.redirect("/home");
	})
	// user proxy route - used after login/register as proxy to 
	// /user/:usename so we can get username
router.get("/user", accountCtrl.logCheck, function (req, res) {
	res.redirect("/user/" + req.user.username);
})

// real user route - render user polls
router.get("/user/:username", layout, accountCtrl.logCheck, pollCtrl.getUserPolls);

// login view
router.get("/login", layout, function (req, res) {
	res.render("login");
})

// logout - return to login
router.get("/logout", function (req, res) {
	req.logout();
	res.redirect('/login');
})

// register view
router.get("/register", layout, function (req, res) {
	res.render("register");
})

// login-fail route - return to login page with message 
router.get("/login-fail", layout, function (req, res) {
	return res.render('login');
})

// login-fail route - return to login page with message 
router.get("/register-fail", layout, function (req, res) {
	return res.render('register');
})

// list of public polls
router.get("/public-polls",layout, function (req, res) {
	return pollCtrl.getPublicPolls(req, res);
})

// new poll form
router.get("/new-poll", layout, accountCtrl.logCheck, function (req, res) {
	res.render("new-poll")
})

// remove poll
router.get("/remove-poll/:id", accountCtrl.logCheck, pollCtrl.removePoll);

// poll view - for voting
router.get("/poll/:id", layout, pollCtrl.getPollById);

// poll-results - just results
router.get("/poll-results/:id", layout, pollCtrl.pollResults);

// private poll verification form 
router.get("/verify/:id", layout, function (req, res) {
	res.render("verify", {
		id: req.params.id
	});
})


////////  POST routes  //////////

// voting 
router.post("/vote", pollCtrl.vote);

// login using account controller
router.post('/login', accountCtrl.authenticateAccount());

// register with account controller
router.post('/register', function (req, res) {
	return accountCtrl.registerAccount(req, res);
});

// submit poll
router.post("/poll-submit", accountCtrl.logCheck, pollCtrl.addPoll);

// private polls verification key
router.post("/verify", pollCtrl.verifyKey);

///////  oAuth routes  ///////////////////

// github
router.get('/auth/github', passport.authenticate('github', {
	scope: ['user:email']
}));

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