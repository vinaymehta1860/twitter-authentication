var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var user = new Schema({
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	salt: { type: String },
	passwordHash: { type: String },
	email: { type: String, unique: true, required: true },
	sessionToken: { type: String, default: null },
	dateCreated: { type: String, default: new Date().toString() },
	loginHistory: [String],
});

user.index({ email: 1, type: 1 });

module.exports = mongoose.model('user', user);
