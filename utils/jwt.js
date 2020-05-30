const { sign, verify } = require('jsonwebtoken');

/**
 * Storing the secrets that will be used for creating access_token and refresh_token.
 * As security is not my main focus, hence storing these here. For a real world application
 * that must be stored in a more secured location
 */
const ACCESS_TOKEN_SECRET = 'ksdyfhskjvbsfuyhsbksfjhgfsgjkflsbgs';
const REFESH_TOKEN_SECRET = 'asdasdjhsbfkshfsjfhsbksjgksjhgksfbg';

/**
 * Function that creates an acces_token by using a secret key
 * @param {String} userId
 * @param {String} email
 * @returns {String} access_token
 */
const createAccessToken = (userId, email) => {
	return sign({ userId, email }, ACCESS_TOKEN_SECRET, {
		expiresIn: '15m',
	});
};

/**
 * Function that creates an refresh_token by using a secret key
 * @param {String} userId
 * @param {String} email
 * @returns {String} access_token
 */
const createRefreshToken = (userId, email) => {
	return sign({ userId, email }, REFESH_TOKEN_SECRET, {
		expiresIn: '15d',
	});
};

/**
 * Function that sets refresh cookie on client's response object
 * @param {Object} responseObject
 * @param {String} token refresh_token to be set on the response object
 */
const setRefreshTokenCookie = (responseObject, token) => {
	responseObject.cookie('refreshtoken', token, {
		httpOnly: true,
		path: '/refresh_token',
	});
};

/**
 * Function that verifies the access_token
 * @param {String} token access_token that is sent by the client
 * @returns {Object} with two properties in it (userId and email)
 */
const verifyAccessToken = (token) => {
	return verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Function that verifies the refresh token
 * @param {String} token refresh_token that is sent by the client
 * @returns {Object} with two properties in it (userId and email)
 */
const verifyRefeshToken = (token) => {
	return verify(token, REFESH_TOKEN_SECRET);
};

module.exports = {
	createAccessToken,
	createRefreshToken,
	setRefreshTokenCookie,
	verifyAccessToken,
	verifyRefeshToken,
};
