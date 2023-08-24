// -> FILE THAT HANDLES ALL ROUTING REQUESTS FOR MESSAGES

const mongoose = require('mongoose');
const Message = require('../models/messageModel');


//create a new message and insert into db
const newMessage = async (req, res) => {

    const sender_id = req.user._id;
    const username = req.user.username
    const { title, content } = req.body;

    try {
        const message = await Message.create({sender_id, username, title, content});
        res.status(200).json(message);
    }
    catch (err) {
        res.status(400).json({error: "Failed to create a new Message. Please Fill all fields correctly"})
    }
}

//get all messages
const getAllMessages = async (req, res) => {
    const allMessages = await Message.find({}).sort({createdAt: -1});
    
    res.status(200).json(allMessages);
}

const getNewMessages = async (req, res) => {
    const { lastRequest } = req.body

    const newMessages = await Message.find({createdAt: {$gte: new Date(lastRequest)}})

    // res.status(200).json({lastRequest})
    res.status(200).json(newMessages)
}


//get a message by id
const getMessage = async (req, res) => {
    const { id: messageID } = req.params;

    if (!mongoose.isValidObjectId(messageID)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    const message = await Message.findById(messageID);

    if (!mongoose.isValidObjectId(messageID)) {
        return res.status(404).json({error: "No such message exists"});
    }

    res.status(200).json(message);
}


//delete a message by id
const deleteMessage = async (req, res) => {
    const { id: messageID } = req.params;

    if (!mongoose.isValidObjectId(messageID)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    const message = await Message.findByIdAndDelete(messageID);

    if (!mongoose.isValidObjectId(messageID)) {
        return res.status(404).json({error: "No such message exists"});
    }

    res.status(200).json(message);
}


//update a message by id
const updateMessage = async (req, res) => {
    const { id: messageID } = req.params;

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


module.exports = {
    getAllMessages,
    getNewMessages,
    getMessage,
    newMessage,
    deleteMessage, 
    updateMessage
}