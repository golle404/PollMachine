// handle error shortcut
module.exports.handle = function(err) {
	if (err) {
		throw err;
	}
}
// usual parameters for template 
//	- active for link  active class
// - username where needed
module.exports.templateParams = function(req) {
	var p = {};
	if (req.user) {
		p.username = req.user.username;
	}
	p.active = req.route.path;
	return p;
}
// middleware check if user is loged in
module.exports.logCheck = function(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect("/");
	}
}