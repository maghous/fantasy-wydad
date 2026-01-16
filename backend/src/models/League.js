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
        correctResult: { type: Number, default: 1 }
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add creator to members automatically
leagueSchema.pre('save', function (next) {
    if (this.isNew && !this.members.includes(this.createdBy)) {
        this.members.push(this.createdBy);
    }
    next();
});

module.exports = mongoose.model('League', leagueSchema);
