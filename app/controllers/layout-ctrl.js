// layout middleware
// setting some parameters used in layout template
module.exports.layout = function (req, res, next) {
	// get app locals
	var loc = req.app.locals.layout;
	// reset
	loc.username = null;
	loc.info = null;
	// username if loged in
	if (req.user) {
		loc.username = req.user.username;
	}
	// route path for active links
	loc.active = req.route.path;
	// page title
	loc.title = " -" + formatTitle(req.route.path);
	
	// info for special cases 
	if (req.route.path === "/login-fail") {
		loc.info = "Sorry. Username and password do not match. Try again.";
		loc.active = "/login";
	}else if(req.route.path === "/register-fail"){
		loc.info = "Sorry. That username already exists. Try again.";
		loc.active = "/register";
	}
	next();
}

//format title
function formatTitle(str) {
	return str.replace(/[/-]/g, " ").split(" ").map(function (v) {
		return v.charAt(0).toUpperCase() + v.slice(1);
	}).join(" ");
}