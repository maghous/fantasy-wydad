const express = require('express');
const db = require('../utils/dbWrapper');
const calculatePoints = require('../utils/calculatePoints');
const auth = require('../middleware/auth');

const router = express.Router();

// Get league ranking
router.get('/league/:leagueId', auth, async (req, res) => {
    try {
        const league = await db.findById('leagues', req.params.leagueId);
        if (!league) return res.status(404).json({ message: 'Ligue non trouvée' });

        const predictions = await db.find('predictions');
        const results = await db.find('results');

        // Get all users map
        const users = await db.find('users');
        const userMap = {};
        users.forEach(u => userMap[u._id] = u);

        const userPoints = {};

        predictions.forEach(pred => {
            // Check if user is in league
            if (!league.members.includes(pred.userId)) return;

            const result = results.find(r => r.matchId === pred.matchId);

            if (!userPoints[pred.userId]) {
                userPoints[pred.userId] = {
                    userId: userMap[pred.userId] || { _id: pred.userId, username: 'Unknown' },
                    points: 0,
                    predictions: 0,
                    exactScores: 0,
                    correctResults: 0
                };
            }

            userPoints[pred.userId].predictions++;

            if (result) {
                const { total, details } = calculatePoints(pred, result, league.scoring);
                userPoints[pred.userId].points += total;
                if (details.exactScore) userPoints[pred.userId].exactScores++;
                if (details.correctResult) userPoints[pred.userId].correctResults++;
            }
        });

        const ranking = Object.values(userPoints).sort((a, b) => b.points - a.points);
        res.json(ranking);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Get global ranking
router.get('/global', async (req, res) => {
    try {
        const defaultScoring = { exactScore: 5, perScorer: 3, correctResult: 1 };

        const predictions = await db.find('predictions');
        const results = await db.find('results');
        const users = await db.find('users');
        const userMap = {};
        users.forEach(u => userMap[u._id] = u);

        const userPoints = {};

        predictions.forEach(pred => {
            const result = results.find(r => r.matchId === pred.matchId);

            if (!userPoints[pred.userId]) {
                userPoints[pred.userId] = {
                    userId: userMap[pred.userId] || { _id: pred.userId, username: 'Unknown' },
                    points: 0,
                    predictions: 0,
                    exactScores: 0,
                    correctResults: 0
                };
            }

            userPoints[pred.userId].predictions++;

            if (result) {
                const { total, details } = calculatePoints(pred, result, defaultScoring);
                userPoints[pred.userId].points += total;
                if (details.exactScore) userPoints[pred.userId].exactScores++;
                if (details.correctResult) userPoints[pred.userId].correctResults++;
            }
        });

        const ranking = Object.values(userPoints).sort((a, b) => b.points - a.points);
        res.json(ranking);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
