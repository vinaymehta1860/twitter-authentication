const bodyParser = require('body-parser'),
	crypto = require('crypto'),
	cors = require('cors'),
	cookieParser = require('cookie-parser'),
	express = require('express'),
	router = express.Router();

// Utility functions
const {
	doesUserWithIdExists,
	doesUserWithEmailExists,
	getAllUsers,
	isSessionTokenValid,
	signinUser,
	signupUser,
	signoutUser,
} = require('../utils/auth');

const {
	createAccessToken,
	createRefreshToken,
	clearRefreshTokenCookie,
	setRefreshTokenCookie,
	verifyAccessToken,
	verifyRefeshToken,
	verifySubjectOnRefreshToken,
} = require('../utils/jwt');

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
			const { signedinUser, access_token, refresh_token } = await signinUser(
				req.body.email,
				req.body.password
			);

			// Set the cookie on responseObject
			setRefreshTokenCookie(res, refresh_token);

			sendSuccessResponse(res, {
				message: 'User successfully created and signed in.',
				payload: { signedinUser, access_token },
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
		const { signedinUser, access_token, refresh_token } = await signinUser(
			req.body.email,
			req.body.password
		);

		// Set the cookie on responseObject
		setRefreshTokenCookie(res, refresh_token);

		if (signedinUser) {
			sendSuccessResponse(res, {
				message: 'User successfuly signed in.',
				payload: { signedinUser, access_token },
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

		// Clear the cookie from response object
		clearRefreshTokenCookie(res);

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
 * Function that validates access token. NEVER TO BE USED BY CLIENTS. IT'S JUST FOR TESTING.
 * @param {String} userId query param to be sent along with request uri
 * @param {String} access_token access_token to be sent along with header in request as `Bearer <access_token>`
 */
router.post('/validateAccessToken/:userId', async (req, res) => {
	try {
		const authorizationHeader = req.headers.authorization;
		const access_token = authorizationHeader.split(' ')[1];

		const isTokenValid = await verifyAccessToken(
			access_token,
			req.params.userId
		);

		if (isTokenValid) {
			res.send({
				success: true,
				payload: { message: 'Token verified' },
			});
		} else {
			res.send({ success: false });
		}
	} catch (err) {
		console.log(`Error: ${err}`);

		res.send({
			success: false,
			message: err,
		});
	}
});

/**
 * Function that clients can use to get new access_token by passing in refresh_token
 * @param {String} userId query param to be sent along with request uri
 * @param {String} refresh_token refresh_token to be sent along with header in request as `Bearer <refresh_token>`
 */
router.get('/getRefreshToken/:userId', async (req, res) => {
	try {
		// Get the refresh token from cookie
		const refresh_token = req.cookies.refreshtoken;

		if (verifyRefeshToken(refresh_token, req.params.userId)) {
			// Check if the user with userId exists or not
			if (doesUserWithIdExists(req.params.userId)) {
				// Clear the refresh token from cookie
				clearRefreshTokenCookie(res);

				const new_access_token = createAccessToken(req.params.userId);
				const new_refresh_token = createRefreshToken(req.params.userId);

				// Set the refresh token on response object
				setRefreshTokenCookie(res, new_refresh_token);

				sendSuccessResponse(res, {
					message: 'Refresh token successfully created.',
					payload: new_access_token,
				});
			} else {
				sendErrorResponse(res, {
					code: 402,
					message: "User with provided userId doesn't exist",
				});
			}
		} else {
			sendErrorResponse(res, {
				code: 402,
				message: `Refresh token on cookie is not valid. Sign in again.`,
			});
		}
	} catch (err) {
		console.log(
			`Error while creating refresh token. Sign in again. Error: ${err}`
		);

		sendErrorResponse(res, {
			code: 401,
			message: `Error while creating refresh token. Sign in again. Error description: ${err}`,
		});
	}
});

/**
 * Function that validates refresh token. NEVER TO BE USED BY CLIENTS. IT'S JUST FOR TESTING.
 * @param {String} userId query param to be sent along with request uri
 * @param {String} refresh_token token string to be sent in cookie along with request
 */
router.post('/validateRefreshToken/:userId', async (req, res) => {
	try {
		// Get the refresh token from cookie
		const refresh_token = req.signedCookies.refreshtoken;

		if (verifyRefeshToken(refresh_token, req.params.userId)) {
			sendSuccessResponse(res, {
				message: 'Refresh token successfully validated.',
			});
		} else {
			sendErrorResponse(res, {
				code: 402,
				message: `Refresh token on cookie is not valid. Sign in again.`,
			});
		}
	} catch (err) {
		console.log(
			`Error while creating refresh token. Sign in again. Error: ${err}`
		);

		sendErrorResponse(res, {
			code: 401,
			message: `Error while creating refresh token. Sign in again. Error description: ${err}`,
		});
	}
});

module.exports = router;
