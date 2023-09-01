// -> THIS MIDDLEWARE CHECKS IF THE REQUEST SENT CARRIES A VALID TOKEN

const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const requireAuth = async (req, res, next) => {

    //extracts the auth header
    const { authorization } = req.headers

    //checks if header present
    if (!authorization) {
        return res.status(401).json({error: "Authorization token required"})
    }

    //extracts token from header
    const token = authorization.split(' ')[1]

    //verifies the token and assigns the user data (id only) to request
    try {
         const { _id } = jwt.verify(token, process.env.SECRET)

         req.user = await User.findById(_id)

         //to carry on with the request
         next()
    } 
    catch (err) {
        return res.status(401).json({error: err})
    }
}

module.exports = requireAuth