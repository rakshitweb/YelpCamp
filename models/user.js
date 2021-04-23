const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First Name cannot be Blank!']
    },
    lastName: {
        type: String,
        required: [true, 'Last Name cannot be Blank!']
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);