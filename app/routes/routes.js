var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var pollCtrl = require('../controllers/poll-ctrl');

var router = express.Router();

/////////  GET routes  ///////////

// home route
router.get(["/", "/home"], function (req, res) {
		res.render("home", templateParams(req));
	})
	// user proxy route - used after login/register as proxy to 
	// /user/:usename so we can get username
router.get("/user", logCheck, function (req, res) {
		res.redirect("/user/" + req.user.username);
	})
	// real user route - render user polls
router.get("/user/:username", logCheck, pollCtrl.getUserPolls);
// login view
router.get("/login", function (req, res) {
		res.render("login", templateParams(req));
	})
	// logout - return to login
router.get("/logout", function (req, res) {
		req.logout();
		res.redirect('/login');
	})
	// register view
router.get("/register", function (req, res) {
		res.render("register", templateParams(req));
	})
	// login-fail route - return to login page with message 
router.get("/login-fail", function (req, res) {
		var tp = templateParams(req);
		tp.info = "Sorry. Username and password do not match. Try again.";
		return res.render('login', tp);
	})
	// list of public polls
router.get("/public-polls", function (req, res) {
		return pollCtrl.getPublicPolls(req, res);
	})
	// new poll form
router.get("/new-poll", logCheck, function (req, res) {
		res.render("new-poll", templateParams(req))
	})
	// remove poll
router.get("/remove-poll/:id", logCheck, pollCtrl.removePoll);
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

// login using passport
router.post('/login', passport.authenticate('local', {
	successRedirect: '/user',
	failureRedirect: '/login-fail'
}));
// register with passport
router.post('/register', function (req, res) {
	Account.register(new Account({
			username: req.body.username
		}),
		req.body.password,
		function (err, account) {
			if (err) {
				var prm = templateParams(req);
				prm.info = "Sorry. That username already exists. Try again.";
				return res.render('register', prm);
			}
			passport.authenticate('local')(req, res, function () {
				res.redirect('/user');
			});
		});
});

// submit poll
router.post("/poll-submit", logCheck, pollCtrl.addPoll);

// private polls verification key
router.post("/verify", pollCtrl.verifyKey);

//////////// utility functions /////////

// usual parameters for template 
//	- active for link  active class
// - username where needed
function templateParams(req) {
	var p = {};
	if (req.user) {
		p.username = req.user.username;
	}
	p.active = req.route.path;
	return p;
}
// middleware check if user is loged in
function logCheck(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect("/");
	}
}

// export router as module
module.exports = router;