const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    wydadScore: {
        type: Number,
        required: true
    },
    opponentScore: {
        type: Number,
        required: true
    },
    result: {
        type: String,
        enum: ['win', 'draw', 'lose'],
        required: true
    },
    scorers: [{
        type: String
    }],
    advancedEvents: [{
        category: { type: String, required: true }, // 'buteur', 'time', 'combination'
        type: { type: String, required: true },     // 'anytime', 'first', 'brace', 'interval_0_15', etc.
        player: String,                             // Name of the player (optional for some types)
        value: Number,                              // For 'exact_k' or numeric values
        pointsEarned: { type: Number, default: 0 }  // To store points allocated per event
    }],
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Ensure one prediction per user per match
predictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);
