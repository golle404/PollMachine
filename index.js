var express = require("express");
var less = require("less-middleware");
var path = require("path");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var session = require("express-session");

// routes
var routes = require('./app/routes/routes');

// strategies
var strategies = require("./app/controllers/strategies-ctrl");

// express app
var app = express();

// using jade as template engine
app.set('views', path.join(__dirname, '/app/views'));
app.set("view engine", "jade");

// less as css postprocessor
app.use(less(path.join(__dirname, '/public')));


// parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser("karamba"));

// middlewares
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

//session
app.use(session({
	secret: 'pollmachinesession',
	resave: false,
	saveUninitialized: false
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

// local vars for layoout template
// will be populated by layout-ctrl middleware
app.locals.layout = {
	username: null,
	active: null,
	title: null,
	info: null
};

// router
app.use('/', routes);

// static routes
app.use(express.static(path.join(__dirname, '/public')));

// connect to db
mongoose.connect('mongodb://localhost/auth-app');
// disconect db on exit
process.on('SIGINT', function () {
	mongoose.connection.close(function () {
		console.log('Mongoose default connection disconnected through app termination');
		process.exit(0);
	});
});

// listen
var port = process.env.PORT || 3000;
var ip = process.env.IP || "127.0.0.1"
app.listen(port, ip, function () {
	console.log("Server listening at", ip + ":" + port);
});