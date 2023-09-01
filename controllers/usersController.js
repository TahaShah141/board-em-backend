// -> FILE THAT HANDLES ALL ROUTING REQUESTS FOR USERS

const mongoose = require('mongoose');
const User = require('../models/userModel');
const Message = require('../models/messageModel')
const Board = require('../models/boardModel')

const { getValidUser, getValidBoard, idInside } = require('../middleware/validate')

//get a message by id
const getUser = async (req, res) => {
    const { user: userID } = req.params;

    const user = await getValidUser(userID)
    if (!user) res.status(400).json({error: "No such User exists"})
    else res.status(200).json(user);

}

const getUserMessages = async (req, res) => {
    let { user: userID  } = req.params
    if (!userID) userID = req.user._id

    const user = await getValidUser(userID)
    if (!user) return res.status(400).json({error: "No such User exists"})

    const boards = []

    //public board messages
    const publicID = new mongoose.Types.ObjectId("64e9c5b32e459c426e1ac3f9")
    const publicMessages = await Message.find({sender_id: user._id, board_id: publicID}).sort({createdAt: -1})

    boards.push({
        _id: publicID,
        name: "HOME",
        owner: null,
        messages: publicMessages
    })

    //boards joined
    const boardsJoined = await Board.find({authors: {$in: [user._id]}})
    for (let i in boardsJoined) {
        const board = boardsJoined[i]
        const owner = await getValidUser(board.owner_id)
        
        const messages = await Message.find({sender_id: user._id, board_id: board._id}).sort({createdAt: -1})

        boards.push({
            _id: board._id,
            name: board.name,
            owner: owner.username,
            messages
        })
    }

    //boards owned
    for (let i in user.boards) {
        const boardID = user.boards[i]
        const board = await getValidBoard(boardID)
        
        const messages = await Message.find({sender_id: user._id, board_id: boardID}).sort({createdAt: -1})
        
        boards.push({
            _id: board._id,
            name: board.name,
            owner: user.username,
            messages
        })
    }

    res.status(200).json(boards)
}


const getOwnedBoards = async (req, res) => {
    let { user: userID  } = req.params
    if (!userID) userID = req.user._id

    const user = await getValidUser(userID)
    if (!user) return res.status(400).json({error: "No Such User Found"})

    try {
        let boards = []
        for (let i in user.boards) {
            const boardID = user.boards[i]
            const board = await getValidBoard(boardID)
            if (!board.public) {
                let users = []
                for (let v in board.viewers) {
                    const viewer = board.viewers[v]
                    const u = await getValidUser(viewer)
                    if (u) {
                        let user = {_id: u._id, username: u.username, isAuthor:false}
                        if (idInside(viewer, board.authors)) {
                            user.isAuthor = true
                        }
                        users.push(user)
                    }
                }
                boards.push({
                    _id: board._id, 
                    name: board.name,
                    password: board.password,
                    public: false,
                    users
                })
            } else {
                boards.push({
                    _id: board._id, 
                    name: board.name,
                    password: board.password,
                    public: true,
                    users: []
                })
            }
        }
        res.status(200).json(boards)
    }
    catch (err) {
        res.status(400).json({error: err.message})
    }
}

//delete a user by id
const deleteUser = async (req, res) => {
    const { user: userID } = req.params;

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    const user = await User.findByIdAndDelete(userID);

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(404).json({error: "No such user exists"});
    }

    res.status(200).json(user);
}


//update a message by id
const updateUser = async (req, res) => {
    const userID = req.user._id;

    let { username: name } = {...req.body} 

    if (!mongoose.isValidObjectId(userID)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    try {
        const { username, password } = await User.validateAndEncrypt({...req.body}, (req.user.username!==name))

        const user = await User.findByIdAndUpdate(userID, { username, password }, {new: true});

        if (!user) {
            return res.status(404).json({error: "No such user exists"});
        }

        res.status(200).json(user);
    } catch (err) {
        return res.status(400).json({error: err.message});
    }
}


module.exports = {
    getUser,
    deleteUser,
    updateUser,
    getUserMessages,
    getOwnedBoards
}