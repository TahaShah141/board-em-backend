// -> FILE THAT HANDLES ALL THE ROUTES STARTING WITH '/user'

const express = require("express");

//controller functions for users api
const {
    getUser,
    deleteUser,
    updateUser,
    getUserMessages,
    getOwnedBoards
} = require("../controllers/usersController");

//initializing the router
const router = express.Router();

//edit/update a User by id
router.patch('/change', updateUser);

//get messages sent by a user, segmented by boards
router.get('/messages', getUserMessages)

//get boards made by user
router.get('/boards/owned', getOwnedBoards)

//get a user by id
router.get('/:user', getUser);

//delete a user by id
router.delete('/:user', deleteUser);

module.exports = router