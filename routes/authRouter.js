// -> FILE THAT HANDLES ALL THE ROUTES STARTING WITH '/auth'

const express = require("express");

//controller functions for auth api
const {
    signupUser,
    loginUser
} = require("../controllers/authController");

//initializing the router
const router = express.Router();

//signup
router.post('/signup', signupUser);

//login
router.post('/login', loginUser)


module.exports = router