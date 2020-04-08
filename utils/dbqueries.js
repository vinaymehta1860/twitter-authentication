// User model
const users = require('../models/user');

userWithEmailExists = async (email) => {
	const userFound = await users.find({ email });
	return !(userFound.length === 0);
};

getUserByEmail = async (email) => {
	const user = await users.find({ email });

	if (user.length > 0) {
		return user[0];
	} else {
		return undefined;
	}
};

createUser = async (user) => {
	const createdUser = new users(user);
	return createdUser;
};

saveUser = async (user) => {
	await user.save();
	return true;
};

updateUserByEmail = async (email, user) => {
	const updatedUser = await users.findOneAndUpdate({ email }, user);
	await updatedUser.save();
	return updatedUser;
};

deleteUserByEmail = async (email) => {
	const deletedUser = await users.deleteOne({ email });

	return deletedUser;
};

module.exports = {
	createUser,
	deleteUserByEmail,
	getUserByEmail,
	saveUser,
	updateUserByEmail,
	userWithEmailExists,
};
