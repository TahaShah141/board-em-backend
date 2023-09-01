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
    password: {
        type: String,
        required: true
    },
    boards: [mongoose.Types.ObjectId]
}, { timestamps: true });



UserSchema.statics.validateAndEncrypt = async function({username, password}, validateUsername=true) {
    
    //checks if all fields filled
    if (!password || (validateUsername && !username)) {
        throw Error("All fields must be filled");
    }
    
    //checks if the username already exists
    if (validateUsername) {
        const existsUsername = await this.findOne({ username });
        
        if (existsUsername) {
            throw Error("Username already in use");
        }
    }
    
    //checks if raw password strong enough
    if (!validator.isStrongPassword(password, { minSymbols: 0 })){
        throw Error ("Password not strong enough");
    }

    //add extra protection to the password so even same passwords are stored differently
    const salt = await bcrypt.genSalt(10);
    
    //encrypts the password
    const hash = await bcrypt.hash(password, salt);

    return { username, password: hash }
}

//signup method for users
UserSchema.statics.signup = async function(username, password) {
    let { username: Username, password: Password } = await this.validateAndEncrypt({username, password})

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
