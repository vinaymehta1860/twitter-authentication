const bodyParser = require('body-parser'),
	crypto = require('crypto'),
	cors = require('cors'),
	cookieParser = require('cookie-parser'),
	express = require('express'),
	router = express.Router();

// Utility functions
const {
	doesUserWithEmailExists,
	getAllUsers,
	isSessionTokenValid,
	signinUser,
	signupUser,
	signoutUser,
} = require('../utils/auth');
const { logNewUser } = require('../utils/external-calls');

// Router configuration so that apis can use cookies that are passed in
router.use(
	cors({ credentials: true, origin: 'http://localhost:3001' }),
	bodyParser.json(),
	cookieParser('82e4e438a0705fabf61f9854e3b575af')
);

// Sample test route
router.get('/', async (req, res) => {
	console.log('Test route for registration');
	res.send('Check server console.');
});

// Common utility functions for sending out responses
sendSuccessResponse = (res = {}, options = {}) => {
	res.send({
		success: true,
		code: 200,
		message: options.message,
		payload: options.payload || undefined,
	});
};

// TODO: Define error codes that will be shared across backend and frontend for specific api calls
sendErrorResponse = (res = {}, options = {}) => {
	res.send({
		success: false,
		code: options.code,
		message: options.message,
	});
};

// Test route to get all the users
router.get('/users', async (req, res) => {
	const users = await getAllUsers();

	if (users.length) {
		sendSuccessResponse(res, {
			message: 'Users successfuly fetched',
			payload: users,
		});
	}
});

/**
 * Sign up route
 * @param {String} email
 * @param {String} password
 * @param {String} firstname
 * @param {String} lastname
 * @returns {Promise} which resolves to a user object
 */
router.post('/signup', async (req, res) => {
	const userExists = await doesUserWithEmailExists(req.body.email);

	if (userExists) {
		sendErrorResponse(res, { code: 101, message: 'User already exists.' });
	} else {
		const newUser = await signupUser(req.body);

		if (newUser) {
			const signedinUser = await signinUser(req.body.email, req.body.password);

			sendSuccessResponse(res, {
				message: 'User successfully created and signed in.',
				payload: signedinUser,
			});

			logNewUser(signedinUser);
		} else {
			sendErrorResponse(res, {
				code: 111,
				message:
					'Something went wrong while registering the user. Please check server console',
			});
		}
	}
});

/**
 * Sign in route
 * @param {String} email
 * @param {String} sessionToken
 * @returns {Promise} which resolves to user object given that sign in is successfull
 */
router.post('/signin', async (req, res) => {
	const userExists = await doesUserWithEmailExists(req.body.email);

	if (userExists) {
		const signedinUser = await signinUser(req.body.email, req.body.password);

		if (signedinUser) {
			sendSuccessResponse(res, {
				message: 'User successfuly signed in.',
				payload: signedinUser,
			});
		} else {
			sendErrorResponse(res, {
				code: 103,
				message: 'Incorrect password.',
			});
		}
	} else {
		sendErrorResponse(res, {
			code: 102,
			message: 'User with provided email address does not exist.',
		});
	}
});

/**
 * Sign out route
 * @param {String} email
 * @returns {Promise}
 */
router.post('/signout', async (req, res) => {
	const userExists = doesUserWithEmailExists(req.body.email);

	if (userExists) {
		await signoutUser(req.body.email);

		sendSuccessResponse(res, {
			message: 'User successfully logged out.',
		});
	} else {
		sendErrorResponse(res, {
			code: 102,
			message: 'User with provided email address does not exist.',
		});
	}
});

/**
 * TODO: Update this function to look for a user by his id and not email
 * Route to validate user's sessionToken
 * @param {String} email
 * @param {String} sessionToken
 * @returns {Promise} which resolves to either true or false depending on if the sessionToken is valid or not
 */
router.post('/validate/session', async (req, res) => {
	const userExists = doesUserWithEmailExists(req.body.email);

	if (userExists) {
		const isSessionValid = await isSessionTokenValid(
			req.body.email,
			req.body.sessionToken
		);

		if (isSessionValid) {
			sendSuccessResponse(res, {
				message: 'Session token is valid.',
			});
		} else {
			sendErrorResponse(res, {
				code: 104,
				message: 'Session token is not valid.',
			});
		}
	} else {
		sendErrorResponse(res, {
			code: 102,
			message: 'User with provided email address does not exist.',
		});
	}
});

module.exports = router;
