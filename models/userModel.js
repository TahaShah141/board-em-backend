// -> FILE CONTAINING THE SCHEMA FOR A USER

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const validator = require('validator');

const validateAndEncrypt = require('../middleware/validate')

//Schema for a user that posts messages
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

//signup method for users
UserSchema.statics.signup = async function(username, email, password) {

    let { username: Username, email: Email, password: Password } = await validateAndEncrypt({username, email, password}, this)

    //creates a new user with encrypted password
    const user = await this.create({username: Username, email: Email, password: Password});

    //signs up
    return user;
}

UserSchema.statics.login = async function(credentials, password) {
    
    //checks if all fields filled
    if (!credentials || !password) {
        throw Error("All fields must be filled")
    }

    let user;

    //checks if valid email entered
    if (validator.isEmail(credentials)) {
        user = await this.findOne({email: credentials})
    }
    else { //else checks if valid username entered
        user = await this.findOne({username: credentials})
    }

    //checks if user found
    if (!user) {
        throw Error("Invalid Email or Username")
    }

    //matches against the encrypted password
    const match = await bcrypt.compare(password, user.password);

    //checks if passwords actually match
    if (!match) {
        throw Error("Incorrect Password");
    }

    //logs in
    return user;
}


module.exports = mongoose.model("User", UserSchema);
