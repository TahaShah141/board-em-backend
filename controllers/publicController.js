// -> FILE THAT HANDLES ALL ROUTING REQUESTS FOR BOARD

const mongoose = require('mongoose');
const {getValidBoard} = require('../middleware/validate')

const Message = require('../models/messageModel');

const board = new mongoose.Types.ObjectId("64e9c5b32e459c426e1ac3f9")

const getNewPublicMessages = async (req, res) => {
    const { lastRequest } = req.query
    let filter = {createdAt: {$gt: new Date(lastRequest)}, board_id: board}
    const newMessages = await Message.find(filter).sort({createdAt: -1})

    res.status(200).json(newMessages)
}

const getPublicBoard = async (req, res) => {
    const b = await getValidBoard(board)

    if (b) res.status(200).json({...b._doc, allowed:true})
    else res.status(400).json({error: "No Such Board Exists"})
}

const getPublicMessages = async (req, res) => {
    const messages = await Message.find({board_id: board}).sort({createdAt: -1})
    res.status(200).json(messages)
}

const postPublicMessage = async (req, res) => {
    const { title, content } = req.body
    const sender_id = req.user._id
    const username = req.user.username

    b = await getValidBoard(board)
    if (!b) return res.status(400).json({error: "No Such Board Exists"})
    
    try {
        const message = await Message.create({sender_id, board_id: b._id, username, title, content});
        res.status(200).json(message);
    }
    catch (err) {
        res.status(400).json({error: "Failed to create a new Message. Please Fill all fields correctly"})
    }
}


module.exports = {
    getPublicBoard,
    getPublicMessages,
    postPublicMessage,
    getNewPublicMessages
}