const { decode, sign, verify } = require('jsonwebtoken');

/**
 * Storing the secrets that will be used for creating access_token and refresh_token.
 * As security is not my main focus, hence storing these here. For a real world application
 * that must be stored in a more secured location
 */
const ACCESS_TOKEN_SECRET = 'ksdyfhskjvbsfuyhsbksfjhgfsgjkflsbgs';
const REFRESH_TOKEN_SECRET = 'asdasdjhsbfkshfsjfhsbksjgksjhgksfbg';

/**
 * Function that creates an acces_token by using a secret key
 * @param {String} userId
 * @param {String} email
 * @returns {String} access_token
 */
const createAccessToken = (userId) => {
	return sign({ userId }, ACCESS_TOKEN_SECRET, {
		expiresIn: '15m',
		subject: userId,
	});
};

/**
 * Function that creates an refresh_token by using a secret key
 * @param {String} userId
 * @param {String} email
 * @returns {String} access_token
 */
const createRefreshToken = (userId) => {
	return sign({ userId }, REFRESH_TOKEN_SECRET, {
		expiresIn: '15d',
		subject: userId,
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
		signed: true,
	});
};

/**
 * Function that clears the refresh_token cookie
 * @param {Object} responseObject
 */
const clearRefreshTokenCookie = (responseObject) => {
	responseObject.clearCookie('refreshtoken');
};

/**
 * Function that verifies the access_token
 * @param {String} token access_token that is sent by the client
 * @returns {Object} with two properties in it (userId and email)
 */
const verifyAccessToken = (token, userId) => {
	const tokenSubject = verify(token, ACCESS_TOKEN_SECRET);

	if (tokenSubject.userId === userId) {
		return true;
	} else {
		return false;
	}
};

/**
 * Function that verifies the refresh token
 * @param {String} token refresh_token that is sent by the client
 * @returns {Object} with two properties in it (userId and email)
 */
const verifyRefeshToken = (token, userId) => {
	const tokenSubject = verify(token, REFRESH_TOKEN_SECRET);

	if (tokenSubject.userId === userId) {
		return true;
	} else {
		return false;
	}
};

const verifySubjectOnAccessToken = (token, userId) => {
	return verify(token, ACCESS_TOKEN_SECRET, { subject: userId });
};

const verifySubjectOnRefreshToken = (token, userId) => {
	return verify(token, REFRESH_TOKEN_SECRET, { subject: userId });
};

module.exports = {
	createAccessToken,
	createRefreshToken,
	clearRefreshTokenCookie,
	decode,
	setRefreshTokenCookie,
	verifyAccessToken,
	verifyRefeshToken,
	verifySubjectOnAccessToken,
	verifySubjectOnRefreshToken,
};
