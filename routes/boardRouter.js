// -> FILE THAT HANDLES ALL THE ROUTES STARTING WITH '/boards'

const {
    deleteBoard,
    editBoard,

    getBoardInfo,
    searchBoards,
    loginBoard,
    makeNewBoard,

    kickUser,
    updateUser,
    getJoinedBoards
} = require('../controllers/boardController')

const express = require("express");

//initializing the router
const router = express.Router();

//make new board
router.post('/new', makeNewBoard)


//search for a board by id or name
router.get('/search', searchBoards)

//get user's joined boards
router.get('/joined', getJoinedBoards)

//log into a board
router.post('/:board/login', loginBoard);

//get board info
router.get('/:board', getBoardInfo)

//get new messages by a user
router.delete('/:board', deleteBoard);

//kick a user from owned board
router.delete('/:board/:user', kickUser)

//restrict or enable a user from posting on owned board
router.patch('/:board/:user', updateUser)

//post a new message
router.patch('/:board', editBoard);

module.exports = router