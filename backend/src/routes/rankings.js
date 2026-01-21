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

        // Check membership
        const userId = req.user.userId.toString();
        const memberIds = league.members.map(m => m.toString());
        if (!memberIds.includes(userId)) {
            return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas membre de cette ligue.' });
        }

        const predictions = await db.find('predictions');
        const results = await db.find('results');

        // Get all users map
        const users = await db.find('users');
        const userMap = {};
        users.forEach(u => userMap[u._id] = u);

        const userPoints = {};

        predictions.forEach(pred => {
            // Check if user is in league
            const pUserId = pred.userId.toString();
            if (!memberIds.includes(pUserId)) return;

            const result = results.find(r => r.matchId.toString() === pred.matchId.toString());

            if (!userPoints[pUserId]) {
                userPoints[pUserId] = {
                    userId: userMap[pUserId] || { _id: pUserId, username: 'Unknown' },
                    points: 0,
                    predictions: 0,
                    exactScores: 0,
                    correctResults: 0
                };
            }

            userPoints[pUserId].predictions++;

            if (result) {
                const { total, details } = calculatePoints(pred, result, league.scoring);
                userPoints[pUserId].points += total;
                if (details.exactScore) userPoints[pUserId].exactScores++;
                if (details.correctResult) userPoints[pUserId].correctResults++;
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
            const pUserId = pred.userId.toString();
            const result = results.find(r => r.matchId.toString() === pred.matchId.toString());

            if (!userPoints[pUserId]) {
                userPoints[pUserId] = {
                    userId: userMap[pUserId] || { _id: pUserId, username: 'Unknown' },
                    points: 0,
                    predictions: 0,
                    exactScores: 0,
                    correctResults: 0
                };
            }

            userPoints[pUserId].predictions++;

            if (result) {
                const { total, details } = calculatePoints(pred, result, defaultScoring);
                userPoints[pUserId].points += total;
                if (details.exactScore) userPoints[pUserId].exactScores++;
                if (details.correctResult) userPoints[pUserId].correctResults++;
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
