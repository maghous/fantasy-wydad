const mongoose = require('mongoose');

const motmVoteSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    playerName: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Ensure one vote per user per match
motmVoteSchema.index({ matchId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('MotMVote', motmVoteSchema);
