const bodyParser = require('body-parser'),
	crypto = require('crypto'),
	cors = require('cors'),
	cookieParser = require('cookie-parser'),
	express = require('express'),
	router = express.Router();

// MongoDB User Object to use in file
var users = require('../models/user');

//Sample test route
router.get('/', async (req, res) => {
	console.log('Test route for registration');
	res.send('Check server console.');
});

module.exports = router;
