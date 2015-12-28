// get oauth parameters from API providers 
// and rename file to "oauth.js" (wuthout underscore)
// use existing callbackURL while testing on local machine
// replace with real domain in production
// test on http://127.0.0.1 rather on http://localhost

var ids = {
	github: {
		clientID: '',
		clientSecret: '',
		callbackURL: "http://127.0.0.1:3000/auth/github/callback"
	},
	twitter: {
		consumerKey: '',
		consumerSecret: '',
		callbackURL: "http://127.0.0.1:3000/auth/twitter/callback"
	}
};

module.exports = ids;