const mongoose = require('mongoose');

const seasonScorerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    goals: {
        type: Number,
        required: true,
        default: 0
    },
    order: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('SeasonScorer', seasonScorerSchema);
