const express = require('express');
const db = require('../utils/dbWrapper');
const admin = require('../middleware/admin');

const router = express.Router();

// Get result by match ID
router.get('/:matchId', async (req, res) => {
    try {
        const results = await db.find('results', { matchId: req.params.matchId });
        if (results.length === 0) return res.json(null);
        res.json(results[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Create/Update result (Admin only)
router.post('/', [auth, admin], async (req, res) => {
    const { matchId, wydadScore, opponentScore, scorers } = req.body;

    try {
        const existing = await db.find('results', { matchId });

        let result;
        if (existing.length > 0) {
            result = await db.update('results', existing[0]._id, {
                wydadScore,
                opponentScore,
                scorers
            });
        } else {
            result = await db.create('results', {
                matchId,
                wydadScore,
                opponentScore,
                scorers
            });

            // Update match status
            await db.update('matches', matchId, { status: 'finished' });
        }

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
