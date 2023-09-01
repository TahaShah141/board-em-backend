// -> FILE THAT HANDLES ALL ROUTING REQUESTS FOR MESSAGES

const mongoose = require('mongoose');
const Message = require('../models/messageModel');

const { 
    getValidBoard,
    canUserPost,
    canUserRead
} = require('../middleware/validate')

const getNewMessages = async (req, res) => {
    const { lastRequest } = req.query
    const { board } = req.params

    let filter = {createdAt: {$gt: new Date(lastRequest)}, board_id: new mongoose.Types.ObjectId(board)}

    const newMessages = await Message.find(filter).sort({createdAt: -1})

    res.status(200).json(newMessages)
}


//delete a message by id
const deleteMessage = async (req, res) => {
    const { message } = req.params;

    if (!mongoose.isValidObjectId(message)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    const m = await Message.findByIdAndDelete(message);

    if (!mongoose.isValidObjectId(message)) {
        return res.status(404).json({error: "No such message exists"});
    }

    res.status(200).json(m);
}


//edit a message by id
const editMessage = async (req, res) => {
    const { message: messageID } = req.params;

    if (!mongoose.isValidObjectId(messageID)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    const message = await Message.findByIdAndUpdate(messageID, {
        ...req.body
    }, {new: true});

    if (!mongoose.isValidObjectId(messageID)) {
        return res.status(404).json({error: "No such message exists"});
    }

    res.status(200).json(message);
}

const getBoardMessages = async (req, res) => {
    const { board } = req.params
    const user = req.user._id

    
    b = await getValidBoard(board)
    if (!b) return res.status(400).json({error: "No Such Board Exists"})
    
    
    if (!(await canUserRead(user, board)))
        return res.status(401).json({error: "Unauthorized access detected"})
    
    const messages = await Message.find({board_id: b._id}).sort({createdAt: -1})
    
    res.status(200).json(messages)
}

const postNewMessage = async (req, res) => {
    const { board } = req.params
    const { title, content } = req.body
    const sender_id = req.user._id
    const username = req.user.username

    b = await getValidBoard(board)
    if (!b) res.status(400).json({error: "No Such Board Exists"})

    if (!(await canUserPost(sender_id, board)))
        return res.status(401).json({error: "Unauthorized access detected"})
    
    try {
        const message = await Message.create({sender_id, board_id: b._id, username, title, content});
        return res.status(200).json(message);
    }
    catch (err) {
        return res.status(400).json({error: "Failed to create a new Message. Please Fill all fields correctly"})
    }    
}


module.exports = {
    getNewMessages,
    deleteMessage, 
    editMessage,
    postNewMessage,
    getBoardMessages
}