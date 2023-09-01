// -> FILE THAT HANDLES ALL ROUTING REQUESTS FOR BOARD

const mongoose = require('mongoose');
const { getValidBoard, getValidUser, isUserOwner, idInside, canUserPost } = require('../middleware/validate')

const User = require('../models/userModel');
const Board = require('../models/boardModel');


const makeNewBoard = async (req, res) => {
    const { name, password, public } = req.body

    const owner_id = req.user._id

    try {
        const board = await Board.create({ owner_id, name, password, public });
        const user = await getValidUser(owner_id)
        const newBoards = [...user.boards, board._id]

        await User.findByIdAndUpdate(user._id, {boards: newBoards})
        res.status(200).json(board);
    }
    catch (err) {
        res.status(400).json({error: err.message})
    }
}

const editBoard = async (req, res) => {
    const { board } = req.params;
    
    if (!mongoose.isValidObjectId(board)) {
        return res.status(400).json({error: "Invalid ID"});
    }

    if (!isUserOwner(req.user._id, board)) 
        return res.status(401).json({error: "Unauthorized access detected"})
    
    const b = await Board.findByIdAndUpdate(board, {
        ...req.body
    }, {new: true});
    
    if (!mongoose.isValidObjectId(board)) {
        return res.status(404).json({error: "No such board exists"});
    }
    
    res.status(200).json(b);
}

const deleteBoard = async (req, res) => {
    const { board } = req.params;
    
    if (!isUserOwner(req.user._id, board)) 
        return res.status(401).json({error: "Unauthorized access detected"})
    
    if (!mongoose.isValidObjectId(board)) {
        return res.status(400).json({error: "Invalid ID"});
    }
    
    const b = await Board.findByIdAndDelete(board)
    await User.findByIdAndUpdate(req.user._id, {boards: req.user.boards.filter(board => board._id.toString() !== b._id.toString())})

    if (!mongoose.isValidObjectId(board)) {
        return res.status(404).json({error: "No such board exists"});
    }

    res.status(200).json(b);
}

const getBoardInfo = async (req, res) => {
    const { board } = req.params
    const b = await getValidBoard(board)

    if (b) {
        const allowed = await canUserPost(req.user._id, b._id)
        res.status(200).json({...b._doc, allowed})
    }
    else res.status(400).json({error: "No Such Board Exists"})
}

const loginBoard = async (req, res) => {
    const { board: boardID } = req.params
    const userID = req.user._id
    const { password } = req.body

    const board = await getValidBoard(boardID)
    const owner = await getValidUser(board.owner_id)

    if (idInside(userID, board.viewers)) return res.status(200).json({_id: board._id, name: board.name, owner: owner.username, loggedIn: true})

    if (password === board.password) {
        try {
            const board = await Board.findByIdAndUpdate(boardID, {$push: {viewers: userID}}, { new: true })
            return res.status(200).json({_id: board._id, name: board.name, owner: owner.username, loggedIn: true})
        }
        catch (err) {
            return res.status(400).json({error: err.message})
        }
    } else {
        return res.status(400).json({error: "Password Incorrect"})
    } 
}

const kickUser = async (req, res) => {
    const {board, user} = req.params
    const owner_id = req.user._id
    
    const b = await getValidBoard(board)
    
    if (!b) return res.status(400).json({error: "No Such Board exists"})
    if (!(await isUserOwner(owner_id, board))) return res.status(401).json({error: "Unauthorized access detected"})
    
    const newAuthors = b.authors.filter(userID => userID.toString() !== user)
    const newViewers = b.viewers.filter(userID => userID.toString() !== user)

    const newBoard = await Board.findByIdAndUpdate(board, {authors: newAuthors, viewers: newViewers}, {new: true})

    res.status(200).json(newBoard)
}

const updateUser = async (req, res) => {
    const {board, user} = req.params
    const owner_id = req.user._id
    const {isAuthor} = req.body
    
    const b = await getValidBoard(board)
    
    if (!b) return res.status(400).json({error: "No Such Board exists"})
    if (!(await isUserOwner(owner_id, board))) return res.status(401).json({error: "Unauthorized access detected"})
    const newAuthors = isAuthor ? //if author 
    idInside(user, b.authors) ? //if already author
    b.authors : //no update
    [...b.authors, new mongoose.Types.ObjectId(user)]: //else add author
    b.authors.filter(userID => userID.toString() !== user) //else remove author

    const newBoard = await Board.findByIdAndUpdate(board, {authors: newAuthors}, {new: true})

    res.status(200).json(newBoard)
}

const searchBoards = async (req, res) => {
    const { query } = req.query
    const requestID = req.user._id
    const boards = []
    if (mongoose.isValidObjectId(query)) {
        const board = await getValidBoard(query)
        if (!board) {
            const user = await getValidUser(query)
    
            for (let i in user.boards) {
                const boardID = user.boards[i]
    
                const board = await getValidBoard(boardID)
                if (board) boards.push(board)
            }
        } else boards.push(board) 
    }
    else {
        const boardsFound = await Board.find({name: query})
        boards.push(...boardsFound)
        
        const usersFound = await User.find({username: query})

        for (let u in usersFound) {
            const user = usersFound[u]
            for (let i in user.boards) {
                const boardID = user.boards[i]
    
                const board = await getValidBoard(boardID)
                if (board) boards.push(board)
            }
        }
    }

    const toReturn = []
    for (let b in boards) {
        const board = boards[b]

        const owner = await getValidUser(board.owner_id)

        const loggedIn = board.public || requestID.toString() === board.owner_id.toString() || idInside(requestID, board.viewers) 

        toReturn.push({
            _id: board._id,
            name: board.name,
            owner: owner.username,
            loggedIn
        })
    }
    res.status(200).json(toReturn)
}

const getJoinedBoards = async (req, res) => {
    const userID = req.user._id
    const boardsJoined = await Board.find({viewers: {$in: [userID]}})

    const toReturn = []
    for (let b in boardsJoined) {
        const board = boardsJoined[b]

        const owner = await getValidUser(board.owner_id)
        toReturn.push({
            _id: board._id,
            name: board.name,
            owner: owner.username,
            loggedIn: true 
        })
    }
    res.status(200).json(toReturn)
}

module.exports = {
    makeNewBoard,
    getBoardInfo,
    searchBoards,
    deleteBoard,
    getJoinedBoards,
    editBoard,
    loginBoard,
    kickUser,
    updateUser
} 