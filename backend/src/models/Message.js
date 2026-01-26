const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    leagueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);
