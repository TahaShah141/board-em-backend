// -> FILE CONTAINING THE SCHEMA FOR A BOARD

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Basic Schema for an uploaded Board
const BoardSchema = new Schema({
    owner_id: {
        type: mongoose.Types.ObjectId,
        index: true
    },
    name: {
        type: String,
        required: true,
        index: true
    },
    password: {
        type: String,
    },
    public: {
        type: Boolean,
        required: true
    },
    viewers: [mongoose.Types.ObjectId],
    authors: [mongoose.Types.ObjectId]
}, { timestamps: true });

module.exports = mongoose.model("Board", BoardSchema);
