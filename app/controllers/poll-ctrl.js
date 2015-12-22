var Poll = require("../models/poll.js");
var u = require('../utilities/utilities');


// create new poll
// data from new-poll form is sent in req.body
module.exports.addPoll = function (req, res) {
	//options array
	var options = [];
	for (option in req.body.options) {
		//add option to array of not empty
		if (req.body.options[option] != "") {
			options.push({
				option: req.body.options[option]
			});
		}
	}
	// entry model
	var entry = new Poll({
		owner: req.user.username,
		question: req.body.question,
		private: req.body.private || "off",
		privateKey: req.body.key,
		options: options
	});
	// save entry and redirect to user view
	entry.save(function (err, data) {
		u.handle(err);
		res.redirect("/user/" + req.user.username)
	});
}

//delete poll - redirect to user view
module.exports.removePoll = function (req, res) {
	Poll.findByIdAndRemove(req.params.id, function (err, data) {
		u.handle(err);
		res.redirect("/user/" + req.user.username);
	});

}

// user polls - for user view
module.exports.getUserPolls = function (req, res) {
	// param object
	var tp = u.templateParams(req);
	// find query
	var query = Poll.find();
	// query condition
	query.where({
		owner: req.user.username
	});
	// execute query
	query.exec(function (err, results) {
		u.handle(err)
			// add results to parameter object
			// if not empty
		if (results.length != 0) {
			tp.polls = results;
		}
		// render user view with parameters
		res.render("user", tp);
	})
}

// single poll data
module.exports.getPollById = function (req, res) {
	// if user is already voted redirect to pool results
	if (req.cookies["poll-voted-" + req.params.id]) {
		res.redirect("/poll-results/" + req.params.id);
	} else {
		// param object
		var tp = u.templateParams(req);
		// find poll
		pollById(req.params.id, function (data) {
			// if pool is public render view with data
			if (data.private === "off") {
				tp.poll = data;
				res.render("poll", tp);
			} else {
				// if poll is private check if user is verified
				// private key stored in cookie
				if (req.cookies["poll-key-" + req.params.id] === data.privateKey) {
					// if verified show poll
					tp.poll = data;
					res.render("poll", tp);
				} else {
					// if not verified redirect to verify form
					res.redirect("/verify/" + req.params.id);
				}
			}
		})
	}
}

// verify key for private poll
// data from verify form - stored in req.body
module.exports.verifyKey = function (req, res) {
	// param object
	var tp = u.templateParams(req);
	// find poll by id
	pollById(req.body.id, function (data) {
		// if keys match
		if (data.privateKey === req.body.key) {
			// set cookie and redirect to poll view 
			res.cookie("poll-key-" + req.body.id, data.privateKey)
			res.redirect("/poll/" + req.body.id);
		} else {
			// else back to verify view
			res.redirect("/verify/" + req.body.id);
		}
	})
}

// list of public polls
module.exports.getPublicPolls = function (req, res) {
	// param object
	var tp = u.templateParams(req);
	// model query
	var query = Poll.find();
	// query condition
	query.where({
		private: "off"
	});
	// run query
	query.exec(function (err, results) {
		u.handle(err);
		// add results to param object if any
		if (results.length != 0) {
			tp.polls = results;
		}
		// render public-polls view with params
		res.render("public-polls", tp);
	})
}

// register vote - data from poll view
// stored in req.params
module.exports.vote = function (req, res) {
	// check for cookie - if user is already voted
	// redirect him to poll-results
	if (req.cookies["poll-voted-" + req.params.pollId]) {
		res.redirect("/poll-results/" + req.params.pollId);
	} else {
		//if user has not votet yet
		// update object
		var update = {
			$inc: {}
		};
		update.$inc["options." + req.params.optionId + ".votes"] = 1;
		// find pool and update
		Poll.findByIdAndUpdate(req.params.pollId, update, function (err, data) {
			u.handle(err);
			// set cookie with poll id in name and voted option as value
			// we can use cookie to pervetn user from multiple voting
			// but also to show what option did thay voted on poll-result view
			res.cookie("poll-voted-" + req.params.pollId, req.params.optionId);
			// redirect to poll-result view
			res.redirect("/poll-results/" + req.params.pollId);
		})
	}
}

// poll results - just results with no option to vote
module.exports.pollResults = function (req, res) {
	// param object
	var tp = u.templateParams(req);
	// check cookie with poll id in name - if exists
	// user is already voted and we can show them their choise
	// store value in param object
	if (req.cookies["poll-voted-" + req.params.id]) {
		tp.voted = req.cookies["poll-voted-" + req.params.id];
	}
	pollById(req.params.id, function(data){
		tp.poll = data;
		res.render("poll-results", tp);
	})
}

////////////  helper functions  ///////////

// get poll by id
function pollById(id, callback) {
	Poll.findById(id, function (err, data) {
		u.handle(err);
		callback(data);
	});
}