var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var pollCtrl = require('../controllers/poll-ctrl');

var router = express.Router();

router.get("/user", logCheck, function (req, res) {
	res.redirect("/user/"+req.user.username);
})
router.get("/user/:username",logCheck, function(req, res){
	return pollCtrl.getUserPolls(req, res);
})
router.get("/new-poll",logCheck, function(req, res){
	res.render("new-poll", templateParams(req))
})
router.get("/remove-poll/:id",logCheck, function(req, res){
	return pollCtrl.removePoll(req, res);
})
router.get("/poll/:id", function(req, res){
	return pollCtrl.getPollById(req, res);
})
router.get("/poll-results/:id", function(req, res){
	return pollCtrl.pollResults(req,res);
})
router.get("/verify/:id", function(req, res){
	res.render("verify", {id: req.params.id});
})
router.post("/verify", pollCtrl.verifyKey);

router.get("/vote/:pollId/:optionId", pollCtrl.vote);

router.get("/", function (req, res) {
	res.render("home", templateParams(req));
})
router.get("/public-polls", function (req, res) {
	return pollCtrl.getPublicPolls(req, res);
})
router.get("/login", function (req, res) {
	res.render("login", templateParams(req));
})
router.get("/logout", function (req, res) {
	req.logout();
	res.redirect('/login');
})
router.get("/register", function (req, res) {
	res.render("register", templateParams(req));
})

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
				res.redirect('/');
			});
		});
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/user',
	failureRedirect: '/login-fail'
}), function (req, res, next) {

});
router.post("/poll-submit", function(req, res){
	return pollCtrl.addPoll(req, res);
})
router.get("/login-fail", function(req,res){
	var prm = templateParams(req);
	prm.info = "Sorry. Username and password do not match. Try again.";
	return res.render('login', prm);
})
function templateParams(req) {
	var p = {};
	if (req.user) {
		p.username = req.user.username;
	}
	p.active = req.route.path;
	return p;
}

function logCheck(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect("/");
	}
}

module.exports = router;