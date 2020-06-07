// User model
const users = require('../models/user');

fetchAllUsers = async () => {
	const allUsers = await users.find({});
	return allUsers;
};

userWithEmailExists = async (email) => {
	const userFound = await users.find({ email });
	return !(userFound.length === 0);
};

userWithIdExists = async (userId) => {
	const userFound = await users.findById(userId);
	console.log(`Result: ${userFound}`);
	return userFound;
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
	const newUser = new users(user);
	return newUser;
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
	fetchAllUsers,
	getUserByEmail,
	saveUser,
	updateUserByEmail,
	userWithEmailExists,
	userWithIdExists,
};
