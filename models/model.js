const mongoose = require('mongoose');

//this constructs the schema type for model
//defines the shape of docs in collection
const friendsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

//this defines the model for mongoDb
const Friend = mongoose.model('Friend', friendsSchema);
module.exports = Friend;