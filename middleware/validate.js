const mongoose = require('mongoose')
const User = require('../models/userModel')
const Board = require('../models/boardModel')


//if mongoose ID inside an array
const idInside = (id, array) => { 
    id = id.toString()
    for (let i in array) {
        if (array[i].toString() === id) return true 
    }
    return false
}

//if user owner of board
const isUserOwner = async (userID, boardID) => {
    const user = await getValidUser(userID)
    if (!user) return false

    const boards = user.boards

    return idInside(boardID, boards)
}

//if user can view messages of board
const canUserRead = async (userID, boardID) => {
    const board = await getValidBoard(boardID)
    if (!board) return false

    const user = await getValidUser(userID)
    if (!user) return false

    return (board.public || board.owner_id.toString() === userID.toString() || idInside(userID, board.viewers))
}


//if user can post messages on board
const canUserPost = async (userID, boardID) => {
    const board = await getValidBoard(boardID)
    if (!board) return false

    const user = await getValidUser(userID)
    if (!user) return false

    return (board.public || board.owner_id.toString() === userID.toString() || idInside(userID, board.authors))
}


//validates a userid
const getValidUser = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return null
    }
    
    const user = await User.findById(id)

    if (!user) {
        return null
    }

    return user
}


//validates a boardId
const getValidBoard = async (id) => {
    if (!mongoose.isValidObjectId(id)) {
        return null
    }

    const board = await Board.findById(id)

    if (!board) {
        return null
    }

    return board
}


module.exports = {
    idInside,
    getValidUser,
    getValidBoard,
    isUserOwner,
    canUserPost,
    canUserRead
}