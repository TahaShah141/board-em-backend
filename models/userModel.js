// -> FILE CONTAINING THE SCHEMA FOR A USER

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const validator = require('validator');


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

    //checks if all fields filled
    if (!email || !password || !username) {
        throw Error("All fields must be filled");
    }

    //checks for valid email format
    if (!validator.isEmail(email)) {
        throw Error ("Please Enter a Valid Email");
    }
    
    //checks if the email already exists
    const existsEmail = await this.findOne({ email });
    
    if (existsEmail) {
        throw Error("Email already in use");
    }
    
    //checks if the username already exists
    const existsUsername = await this.findOne({ username });
    
    if (existsUsername) {
        throw Error("Username already in use");
    }
    
    //checks if raw password strong enough
    if (!validator.isStrongPassword(password)){
        throw Error ("Password not strong enough");
    }

    //add extra protection to the password so even same passwords are stored differently
    const salt = await bcrypt.genSalt(10);
    
    //encrypts the password
    const hash = await bcrypt.hash(password, salt);

    //creates a new user with encrypted password
    const user = await this.create({username, email, password: hash});

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
