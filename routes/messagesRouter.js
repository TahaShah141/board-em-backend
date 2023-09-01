// -> FILE THAT HANDLES ALL THE ROUTES STARTING WITH '/messages'

const express = require("express");

//controller functions for messages api
const {
    getNewMessages,
    deleteMessage, 
    editMessage,
    getBoardMessages,
    postNewMessage
} = require("../controllers/messagesController");

//initializing the router
const router = express.Router();

//delete a message by id
router.delete('/message/:message', deleteMessage);

//edit/update a message by id
router.patch('/message/:message', editMessage);

//get all messages
router.get('/:board', getBoardMessages);

//get all messages
router.post('/:board', postNewMessage);

//get new messages
router.get('/:board/new', getNewMessages);

module.exports = router