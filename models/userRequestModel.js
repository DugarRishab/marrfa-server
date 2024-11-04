const mongoose = require('mongoose');
const validator = require('validator');

const requestSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'Blog needs a name'],
        trim: true,
	},
	date: {
		type: Date,
		default: Date.now()
	},
	 email: {
            type: String,
            required: [true, 'Every Request must have a email'],
            
            validate: [validator.isEmail, 'Invalid Email'],
            lowercase: true,
        },
	phone: {
		number: {
			type: Number
		},
		code: {
			type: String
		}
	},
	query: {
		type: String
	},
});

const UserRequest = mongoose.model('UserRequest', requestSchema);
module.exports = UserRequest;