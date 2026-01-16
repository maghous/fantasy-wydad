const express = require('express');
const db = require('../utils/dbWrapper');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all predictions for user
router.get('/', auth, async (req, res) => {
    try {
        const predictions = await db.find('predictions', { userId: req.user.userId });

        // Manual populate matchId
        const populated = await Promise.all(predictions.map(async (p) => {
            const match = await db.findById('matches', p.matchId);
            return { ...p, matchId: match };
        }));

        res.json(populated);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Get prediction for specific match
router.get('/match/:matchId', auth, async (req, res) => {
    try {
        const predictions = await db.find('predictions', {
            userId: req.user.userId,
            matchId: req.params.matchId
        });

        res.json(predictions[0] || null);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Create or Update prediction
router.post('/', auth, async (req, res) => {
    const { matchId, wydadScore, opponentScore, result, scorers } = req.body;

    try {
        const existing = await db.find('predictions', {
            userId: req.user.userId,
            matchId
        });

        let prediction;
        if (existing.length > 0) {
            // Update
            prediction = await db.update('predictions', existing[0]._id, {
                wydadScore,
                opponentScore,
                result,
                scorers,
                timestamp: new Date().toISOString()
            });
        } else {
            // Create
            prediction = await db.create('predictions', {
                userId: req.user.userId,
                matchId,
                wydadScore,
                opponentScore,
                result,
                scorers
            });
        }

        res.json(prediction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
