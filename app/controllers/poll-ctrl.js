var Poll = require("../models/poll.js");


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
		handle(err);
		res.redirect("/user/" + req.user.username)
	});
}

//delete poll - redirect to user view
module.exports.removePoll = function (req, res) {
	Poll.findByIdAndRemove(req.params.id, function (err, data) {
		handle(err);
		res.redirect("/user/" + req.user.username);
	});

}

// user polls - for user view
module.exports.getUserPolls = function (req, res) {
	console.log(req.protocol, req.originalUrl, req.get("host"));
	// template data
	var templateData = {}
		// find query
	var query = Poll.find();
	// query condition
	query.where({
		owner: req.user.username
	});
	// execute query
	query.exec(function (err, data) {
		handle(err)
			// add results to parameter object
			// if not empty
		if (data.length != 0) {
			var results = formatPolls(data, req);
			/*var results = data.map(function (v) {
				// calculate total votes
				v.totalVotes = v.options.reduce(function (p, c) {
						return p += c.votes;
					}, 0)
					// created before
				v.createdBefore = createdBefore(v.created);
				// tweet link
				v.tweet = "https://twitter.com/intent/tweet?text=";
				v.tweet += v.question;
				v.tweet += " -  vote here - ";
				v.tweet += req.protocol + "://" + req.get("host") + "/poll/" + v.id;
				return v;
			})*/
			templateData.polls = results;
		}
		// render user view with parameters
		res.render("user", templateData);
	})
}

// single poll data
module.exports.getPollById = function (req, res) {
	// if user is already voted redirect to pool results
	if (req.cookies["poll-voted-" + req.params.id]) {
		res.redirect("/poll-results/" + req.params.id);
	} else {
		// template data
		var templateData = {};
		// find poll
		pollById(req.params.id, function (data) {
			// if pool is public render view with data
			if (data.private === "off") {
				templateData.poll = data;
				res.render("poll", templateData);
			} else {
				// if poll is private check if user is verified
				// private key stored in cookie
				if (req.cookies["poll-key-" + req.params.id] === data.privateKey) {
					// if verified show poll
					templateData.poll = data;
					res.render("poll", templateData);
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
	// template data object
	var templateData = {}
		// model query
	var query = Poll.find();
	// query condition
	query.where({
		private: "off"
	});
	// run query
	query.exec(function (err, data) {
		handle(err);
		// add data to templateData object if any
		if (data.length != 0) {
			var results = formatPolls(data, req);
			templateData.polls = results;
		}
		// render public-polls view with templateDatas
		res.render("public-polls", templateData);
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
		//if user has not voted yet
		// update object
		var update = {
			$inc: {}
		};
		update.$inc["options." + req.body.optionId + ".votes"] = 1;
		// find pool and update
		Poll.findByIdAndUpdate(req.body.pollId, update, function (err, data) {
			handle(err);
			// set cookie with poll id in name and voted option as value
			// we can use cookie to pervetn user from multiple voting
			// but also to show what option did thay voted on poll-result view
			res.cookie("poll-voted-" + req.body.pollId, req.body.optionId);
			// redirect to poll-result view
			res.redirect("/poll-results/" + req.body.pollId);
		})
	}
}
module.exports.vote2 = function(req, res){
	console.log(req.body);
	res.redirect("/public-polls");
}
// poll results - just results with no option to vote
module.exports.pollResults = function (req, res) {
	// param object
	var templateData = {}
		// check cookie with poll id in name - if exists
		// user is already voted and we can show them their choise
		// store value in param object
	if (req.cookies["poll-voted-" + req.params.id]) {
		templateData.voted = req.cookies["poll-voted-" + req.params.id];
	}
	pollById(req.params.id, function (data) {
		templateData.poll = data;
		res.render("poll-results", templateData);
	})
}

////////////  helper functions  ///////////

// get poll by id
function pollById(id, callback) {
	Poll.findById(id, function (err, data) {
		handle(err);
		callback(data);
	});
}

// handle error shortcut
var handle = function (err) {
	if (err) {
		throw err;
	}
}

// format date time
function createdBefore(date) {
	var now = new Date();
	var then = new Date(date);
	var diff = (now - then) / 1000;

	if (diff < 1) {
		return "1 second";
	}
	var unitSeconds = [
    [31556926, 'years'],
    [2629744, 'months'],
    [86400, 'days'],
    [3600, 'hours'],
    [60, 'minutes'],
    [1, 'seconds']
  ];
	var result = unitSeconds.reduce(function (p, c) {
		var dv = Math.floor(diff / c[0]);
		if (dv > 0) {
			if (dv === 1) {
				c[1] = c[1].slice(0, -1);
			}
			p.push([dv, c[1]]);
		}
		return p;
	}, [])[0].join(" ");
	return result;
}

//format poll list
function formatPolls(polls, req) {
	return polls.map(function (v) {
		// calculate total votes
		v.totalVotes = v.options.reduce(function (p, c) {
				return p += c.votes;
			}, 0)
			// created before
		v.createdBefore = createdBefore(v.created);
		// tweet link
		v.tweet = "https://twitter.com/intent/tweet?text=";
		v.tweet += v.question;
		v.tweet += " -  vote here - ";
		v.tweet += req.protocol + "://" + req.get("host") + "/poll/" + v.id;
		return v;
	})
}