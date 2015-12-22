var pollShema = require("../models/poll.js");

module.exports.addPoll = function (req, res) {
	var options = [];
	for (option in req.body.options) {
		if (req.body.options[option] != "") {
			options.push({
				option: req.body.options[option]
			});
		}
	}
	var entry = new pollShema({
		owner: req.user.username,
		question: req.body.question,
		private: req.body.private || "off",
		privateKey: req.body.key,
		options: options
	});

	entry.save(function (err, data) {
		handle(err)
		res.redirect("/user/" + req.user.username)
	});
}

module.exports.removePoll = function (req, res) {
	pollShema.findByIdAndRemove(req.params.id, function (err, data) {
		handle(err);
		res.redirect("/user/" + req.user.username);
	});

}

module.exports.getUserPolls = function (req, res) {

	var tp = templateParams(req);
	var query = pollShema.find();

	query.where({
		owner: req.user.username
	});

	query.exec(function (err, results) {
		handle(err)
		if (results.length != 0) {
			tp.polls = results;
		}
		res.render("user", tp);
	})
}

module.exports.getPollById = function (req, res) {
	if (req.cookies["poll-voted-" + req.params.id]) {
		res.redirect("/poll-results/" + req.params.id);
	} else {
		var tp = templateParams(req);
		pollShema.findById(req.params.id, function (err, data) {
			handle(err);
			if (data.private === "off") {
				tp.poll = data;
				res.render("poll", tp);
			} else {
				if (req.cookies["poll-key-" + req.params.id] === data.privateKey) {
					tp.poll = data;
					res.render("poll", tp);
				} else {
					res.redirect("/verify/" + req.params.id);
				}
			}
		});
	}
}
module.exports.verifyKey = function (req, res) {
	var tp = templateParams(req);
	pollShema.findById(req.body.id, function (err, data) {
		handle(err);
		if (data.privateKey === req.body.key) {
			res.cookie("poll-key-" + req.body.id, data.privateKey)
			res.redirect("/poll/" + req.body.id);
		} else {
			res.redirect("/verify/" + req.body.id);
		}
	});
}


module.exports.getPublicPolls = function (req, res) {

	var tp = templateParams(req);
	var query = pollShema.find();

	query.where({
		private: "off"
	});

	query.exec(function (err, results) {
		handle(err);
		if (results.length != 0) {
			tp.polls = results;
		}
		res.render("public-polls", tp);
	})
}

module.exports.vote = function (req, res) {
	if (req.cookies["poll-voted-" + req.params.pollId]) {
		res.redirect("/poll-results/" + req.params.pollId);
	} else {
		var update = {
			$inc: {}
		};
		update.$inc["options." + req.params.optionId + ".votes"] = 1;

		pollShema.findByIdAndUpdate(req.params.pollId, update, function (err, data) {
			handle(err);
			res.cookie("poll-voted-" + req.params.pollId, req.params.optionId)
			res.redirect("/poll-results/" + req.params.pollId);
		})
	}

}
module.exports.pollResults = function (req, res) {
	var tp = templateParams(req);
	if (req.cookies["poll-voted-" + req.params.id]) {
		tp.voted = req.cookies["poll-voted-" + req.params.id];
	}
	pollShema.findById(req.params.id, function (err, data) {
		handle(err);
		tp.poll = data;
		res.render("poll-results", tp);
	});
}

function handle(err) {
	if (err) {
		throw err;
	}
}

function templateParams(req) {
	var p = {};
	if (req.user) {
		p.username = req.user.username;
	}
	p.active = req.route.path;
	return p;
}