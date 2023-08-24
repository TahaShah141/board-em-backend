// -> MAIN NODE.JS SERVER

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const messagesRouter = require('./routes/messagesRouter');
const userRouter = require('./routes/userRouter');
const authRouter = require('./routes/authRouter');
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

//check if authorized token is provided
app.use(requireAuth)

//default path being /messages
app.get('/', (req, res) => res.redirect('/api/messages'));

//use messages router for /messages
app.use('/api/messages', messagesRouter);

//use user router for /user
app.use('/api/user', userRouter);

//connect to db and start listening for HTTP requests
mongoose.connect(process.env.MONGO_DB_URI)
    .then(() => {
        app.listen(process.env.PORT || 4000);
        console.log('connected and listening')
    })
    .catch((err) => console.log(err));