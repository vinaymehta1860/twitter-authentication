var express = require('express'),
	cors = require('cors'),
	mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);
var db = mongoose
	.connect('mongodb://localhost/twitter-authentication', {
		useNewUrlParser: true,
		useFindAndModify: false,
		useUnifiedTopology: true,
	})
	.then(
		function () {
			//Successfull connection to mongoDB database.
			console.log('Successfully connected to MongoDB Database.');
		},
		function (err) {
			//Error while connecting to MongoDB database.
			console.log(err);
		}
	);

const authenticationHandler = require('./services/authentication');

var app = express();

app.use(function (req, res, next) {
	cors();
	next();
});

// Individual file mapping for each module
app.use('/twitter/authentication', authenticationHandler);

app.listen(4000, function () {
	console.log('Server running on port 4000');
});
