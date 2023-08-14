const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }
});

const Like = mongoose.model('Like', likeSchema);
module.exports = Like;