const axios = require('axios');

/**
 * Function that will call the endpoint in tweet service to log a new user
 */
logNewUser = async (user = {}) => {
	const loggedUser = await axios({
		url: 'http://localhost:8080/tweets/users',
		method: 'post',
		data: {
			id: user.id,
			firstname: user.firstname,
			lastname: user.lastname,
			email: user.email,
		},
	});

	if (loggedUser.status === 200) {
		console.log(
			`New user successfully logged to tweet service. Response: ${JSON.stringify(
				loggedUser.data
			)}`
		);
	} else {
		console.log(
			`Failure in logging new user to tweet service. Response: ${JSON.stringify(
				loggedUser.data
			)}`
		);
	}
};

module.exports = {
	logNewUser,
};
