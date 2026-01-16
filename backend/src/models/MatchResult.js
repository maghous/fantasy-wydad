const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        unique: true
    },
    wydadScore: {
        type: Number,
        required: true
    },
    opponentScore: {
        type: Number,
        required: true
    },
    scorers: [{
        type: String
    }]
});

module.exports = mongoose.model('MatchResult', matchResultSchema);
