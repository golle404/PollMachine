var express = require("express");
var path = require("path");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require("express-session");
var LocalStrategy = require('passport-local').Strategy;
var GithubStrategy = require('passport-github2').Strategy;
var config = require('./oauth.js');


var routes = require('./app/routes/routes');
var less = require("less-middleware");

var app = express();

app.set('views', path.join(__dirname, '/app/views'));
app.set("view engine", "jade");

app.use(less(path.join(__dirname, '/public')));

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser("karamba"));
app.use(session({
	secret: 'voatingong sseessiioonn',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.use(express.static(path.join(__dirname, '/public')));
app.use("/user", express.static(path.join(__dirname, '/public')));
app.use("/new-poll", express.static(path.join(__dirname, '/public')));
app.use("/poll", express.static(path.join(__dirname, '/public')));
app.use("/poll-results", express.static(path.join(__dirname, '/public')));
app.use("/verify", express.static(path.join(__dirname, '/public')));


var Account = require('./app/models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

passport.use(new GithubStrategy({
  clientID: config.github.clientID,
  clientSecret: config.github.clientSecret,
  callbackURL: config.github.callbackURL
},
function(accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    return done(null, profile);
  });
}
));


mongoose.connect('mongodb://localhost/auth-app');

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("Server listening at",process.env.IP || "0.0.0.0" + ":" + process.env.PORT || 3000);
});