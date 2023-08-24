// -> FILE THAT HANDLES ALL ROUTING REQUESTS FOR USERS

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Message = require('../models/messageModel')

//get a message by id
const getUser = async (req, res) => {
    const { userID } = req.params;

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    const user = User.findById(userID);

    if (!user) {
        return res.status(404).json({error: "No such user exists"});
    }

    res.status(200).json(user);
}

const getUserMessages = async (req, res) => {
    let { id: userID  } = req.params
    if (!userID) userID = req.user._id

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(400).json({error: "Invalid ID"})
    }

    const user = await User.findById(userID)

    if (!user) {
        return res.status(404).json({error: "No such user exists"})
    }

    const messages = await Message.find({sender_id: userID}).sort({createdAt: -1})

    res.status(200).json(messages)
}

//delete a user by id
const deleteUser = async (req, res) => {
    const { userID } = req.params;

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    const user = User.findByIdAndDelete(userID);

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(404).json({error: "No such user exists"});
    }

    res.status(200).json(user);
}


//update a message by id
const updateUser = async (req, res) => {
    const { id: userID } = req.user._id;

    console.log('UPDATING USER', req.user.username)

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    const user = User.findByIdAndUpdate(userID, {
        ...req.body
    }, {new: true});

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(404).json({error: "No such user exists"});
    }

    res.status(200).json(user);
}


module.exports = {
    getUser,
    deleteUser,
    updateUser,
    getUserMessages
}