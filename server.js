// -> MAIN NODE.JS SERVER

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const messagesRouter = require('./routes/messagesRouter');
const userRouter = require('./routes/userRouter');
const authRouter = require('./routes/authRouter');
const boardRouter = require('./routes/boardRouter')
const publicRouter = require('./routes/publicRouter')
const requireAuth = require('./middleware/requireAuth')

//app object that runs the server
const app = express();

//parse incoming requests into JSON
app.use(express.json());

//adhere to cors
app.use(cors());
app.options('*', cors())

//use auth router for /auth
app.use('/api/auth', authRouter);

//for public board
app.use('/api/public', publicRouter);

//check if authorized token is provided
app.use(requireAuth)

//use messages router for /messages
app.use('/api/messages', messagesRouter);

//use user router for /user
app.use('/api/user', userRouter);

//use user router for /boards
app.use('/api/boards', boardRouter);

//connect to db and start listening for HTTP requests
mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => {
        app.listen(process.env.PORT);
        console.log('connected and listening')
    })
    .catch((err) => console.log(err));