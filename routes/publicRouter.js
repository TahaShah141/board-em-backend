// -> FILE THAT HANDLES ALL THE ROUTES STARTING WITH '/public'

const express = require("express");

//controller functions for public board api
const {
    getPublicMessages,
    getPublicBoard,
    postPublicMessage,
    getNewPublicMessages
} = require("../controllers/publicController");

const requireAuth = require("../middleware/requireAuth");

//initializing the router
const router = express.Router();

//get new messages 
router.get('/new', getNewPublicMessages)

//edit/update a User by id
router.get('/board', getPublicBoard);

//get the user's messages
router.get('/messages', getPublicMessages);

//only logged in users can post
router.use(requireAuth)

//get a user by id
router.post('/messages', postPublicMessage);


module.exports = router