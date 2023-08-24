const bcrypt = require('bcrypt');
const validator = require('validator');

const User = require('../models/userModel')

const validateAndEncrypt = async ({username, password}, User, validateUsername=true) => {
    if (!User) User = require('../models/userModel')
    
    //checks if all fields filled
    if (!password || (validateUsername && !username)) {
        throw Error("All fields must be filled");
    }
    
    //checks if the username already exists
    if (validateUsername) {
        const existsUsername = await User.findOne({ username });
        
        if (existsUsername) {
            throw Error("Username already in use");
        }
    }
    
    //checks if raw password strong enough
    if (!validator.isStrongPassword(password)){
        throw Error ("Password not strong enough");
    }

    //add extra protection to the password so even same passwords are stored differently
    const salt = await bcrypt.genSalt(10);
    
    //encrypts the password
    const hash = await bcrypt.hash(password, salt);

    return { username, password: hash }
}

module.exports = validateAndEncrypt