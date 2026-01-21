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
    }],
    events: [{
        type: { type: String, required: true }, // 'goal', 'penalty', 'card', 'csc'
        player: String,                         // Player involved
        minute: Number,                         // Minute of the event
        goalType: String,                       // 'head', 'foot', 'freekick', 'corner'
        order: Number                           // 1 for first goal, etc.
    }]
});

module.exports = mongoose.model('MatchResult', matchResultSchema);
