const crypto = require('crypto');

const {
	createUser,
	deleteUserByEmail,
	fetchAllUsers,
	getUserByEmail,
	saveUser,
	updateUserByEmail,
	userWithEmailExists,
	userWithIdExists,
} = require('./dbqueries');

const {
	createAccessToken,
	createRefreshToken,
	setRefreshTokenCookie,
} = require('./jwt');

logData = (string, data) => {
	console.log(`${string}: ${data}`);
};

getRandomSalt = () => {
	return crypto.randomBytes(16).toString('hex');
};

getPasswordHash = (password, salt) => {
	return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
};

verifyPassword = (password, passwordHash, salt) => {
	const hash = crypto
		.pbkdf2Sync(password, salt, 1000, 64, 'sha512')
		.toString('hex');

	if (hash === passwordHash) {
		return true;
	} else {
		return false;
	}
};

getAllUsers = async () => {
	return fetchAllUsers();
};

doesUserWithEmailExists = async (email) => {
	return userWithEmailExists(email);
};

signupUser = async (user = {}) => {
	const salt = getRandomSalt();
	const passwordHash = getPasswordHash(user.password, salt);

	user = Object.assign(user, {
		salt: salt,
		passwordHash: passwordHash,
	});

	const newUser = await createUser(user);
	await saveUser(newUser);

	return newUser;
};

signinUser = async (email, password) => {
	let user = await getUserByEmail(email);

	const isPasswordCorrect = verifyPassword(
		password,
		user.passwordHash,
		user.salt
	);

	if (isPasswordCorrect) {
		const currentTime = new Date();
		const access_token = createAccessToken(user.id);
		const refresh_token = createRefreshToken(user.id);

		user.loginHistory.push(currentTime.toString());

		await saveUser(user);

		return {
			signedinUser: user,
			access_token,
			refresh_token,
		};
	} else {
		return false;
	}
};

signoutUser = async (email) => {
	let user = await getUserByEmail(email);

	if (user) {
		user = await updateUserByEmail(email, user);

		return true;
	} else {
		return false;
	}
};

doesUserWithIdExists = async (userId) => {
	return userWithIdExists(userId);
};

module.exports = {
	doesUserWithEmailExists,
	doesUserWithIdExists,
	getAllUsers,
	signinUser,
	signupUser,
	signoutUser,
};
