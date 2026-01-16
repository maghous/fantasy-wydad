const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    opponent: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    competition: {
        type: String,
        enum: ['Botola', 'CAF'],
        required: true
    },
    round: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['upcoming', 'finished'],
        default: 'upcoming'
    }
});

module.exports = mongoose.model('Match', matchSchema);
