// -> FILE CONTAINING THE SCHEMA FOR A USER

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const validateAndEncrypt = require('../middleware/validate')

//Schema for a user that posts messages
const UserSchema = new Schema({
    username: {
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
UserSchema.statics.signup = async function(username, password) {

    let { username: Username, password: Password } = await validateAndEncrypt({username, password}, this)

    //creates a new user with encrypted password
    const user = await this.create({username: Username, password: Password});

    //signs up
    return user;
}

UserSchema.statics.login = async function(username, password) {
    
    //checks if all fields filled
    if (!username || !password) {
        throw Error("All fields must be filled")
    }

    let user;

    //checks if valid username entered
    user = await this.findOne({username})

    //checks if user found
    if (!user) {
        throw Error("Invalid Username")
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
