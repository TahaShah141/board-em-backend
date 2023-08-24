// -> FILE CONTAINING THE SCHEMA FOR A MESSAGE

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Basic Schema for an uploaded message
const MessageSchema = new Schema({
    sender_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true });


module.exports = mongoose.model("Message", MessageSchema);
