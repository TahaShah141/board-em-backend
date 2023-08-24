// -> FILE THAT HANDLES ALL THE ROUTES STARTING WITH '/user'

const express = require("express");

//controller functions for users api
const {
    getUser,
    deleteUser,
    updateUser,
    getUserMessages
} = require("../controllers/usersController");

//initializing the router
const router = express.Router();

//edit/update a User by id
router.patch('/', updateUser);

//get the user's messages
router.get('/messages', getUserMessages);

//get a user by id
router.get('/:id', getUser);

//get a user's messages by his id
router.get('/:id/messages', getUserMessages);

//delete a user by id
router.delete('/:id', deleteUser);

module.exports = router