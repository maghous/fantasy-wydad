const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scoring: {
        exactScore: { type: Number, default: 5 },
        perScorer: { type: Number, default: 3 },
        correctResult: { type: Number, default: 1 },
        // Advanced Scoring
        firstScorer: { type: Number, default: 5 },
        lastScorer: { type: Number, default: 5 },
        brace: { type: Number, default: 8 },
        hatTrick: { type: Number, default: 15 },
        anytimeWinner: { type: Number, default: 5 },
        goalInterval: { type: Number, default: 3 },
        penaltyScorer: { type: Number, default: 4 }
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    joinCode: {
        type: String,
        unique: true,
        sparse: true // Allows multiple leagues without a code during migration if needed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add creator to members automatically
leagueSchema.pre('save', async function () {
    if (this.isNew && this.createdBy) {
        // Convert to strings for easier comparison or use .equals()
        const creatorId = this.createdBy.toString();
        const memberIds = this.members.map(m => m.toString());

        if (!memberIds.includes(creatorId)) {
            this.members.push(this.createdBy);
        }
    }
});

module.exports = mongoose.model('League', leagueSchema);
