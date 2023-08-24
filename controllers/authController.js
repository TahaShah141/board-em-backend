// -> FILE THAT HANDLES ALL ROUTING REQUESTS FOR AUTH

const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

//creates a jwt token
const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '1d'});
}

//tries to login the user
const loginUser = async (req, res) => {
    const { credentials, password } = req.body;

    try {
        const user = await User.login(credentials, password);
        
        const token = createToken(user._id)

        const username = user.username;

        res.status(200).json({username, token});
    }
    catch (err) {
        res.status(400).json({error: err.message})
    }
}

//tries to sign up a new user
const signupUser = async (req, res) => {
    const { username, email, password } = req.body

    try {
        const user = await User.signup(username, email, password);

        const token = createToken(user._id)

        res.status(200).json({username, token});
    } 
    catch (err) {
        res.status(400).json({error: err.message})
    }
}

module.exports = { loginUser, signupUser }