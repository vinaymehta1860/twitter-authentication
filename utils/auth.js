const crypto = require('crypto');

const {
	createUser,
	deleteUserByEmail,
	fetchAllUsers,
	getUserByEmail,
	saveUser,
	updateUserByEmail,
	userWithEmailExists,
} = require('./dbqueries');

logData = (string, data) => {
	console.log(`${string}: ${data}`);
};

getRandomSalt = () => {
	return crypto.randomBytes(16).toString('hex');
};

getPasswordHash = (password, salt) => {
	return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
};

getSessionToken = (params = {}) => {
	const sessionToken = crypto
		.createHmac('sha256', params.email)
		.update(Date.now().toString())
		.digest('hex');

	return sessionToken;
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
		if (user.sessionToken === null) {
			const sessionToken = getSessionToken({ email: user.email });
			const currentTime = new Date();

			user.sessionToken = sessionToken;
			user.loginHistory.push(currentTime.toString());

			await saveUser(user);

			return user;
		} else {
			// If user already has a sessionToken, then don't create a new one and
			//  don't push a new entry in loginHostory array, just return the user
			//  and keep him in signed in state
			return user;
		}
	} else {
		return false;
	}
};

signoutUser = async (email) => {
	let user = await getUserByEmail(email);

	if (user) {
		user.sessionToken = null;

		user = await updateUserByEmail(email, user);

		return true;
	} else {
		return false;
	}
};

isSessionTokenValid = async (email, sessionToken) => {
	const user = await getUserByEmail(email);

	if (user) {
		if (sessionToken === user.sessionToken) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
};

module.exports = {
	doesUserWithEmailExists,
	getAllUsers,
	isSessionTokenValid,
	signinUser,
	signupUser,
	signoutUser,
};
