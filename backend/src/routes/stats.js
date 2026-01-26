const express = require('express');
const db = require('../utils/dbWrapper');
const router = express.Router();

// Get public statistics
router.get('/global', async (req, res) => {
    try {
        const users = await db.find('users');
        const matches = await db.find('matches', { status: 'upcoming' });

        // Find next match
        const nextMatch = matches.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        let matchStats = null;
        if (nextMatch) {
            const predictions = await db.find('predictions', { matchId: nextMatch._id.toString() });
            const total = predictions.length;

            if (total > 0) {
                const wins = predictions.filter(p => p.result === 'win').length;
                const draws = predictions.filter(p => p.result === 'draw').length;
                const losses = predictions.filter(p => p.result === 'lose').length;

                // Aggregate scorers
                const scorerCounts = {};
                predictions.forEach(p => {
                    p.scorers?.forEach(s => {
                        scorerCounts[s] = (scorerCounts[s] || 0) + 1;
                    });
                });

                const topScorer = Object.entries(scorerCounts)
                    .sort(([, a], [, b]) => b - a)[0];

                matchStats = {
                    totalPredictions: total,
                    winPercentage: Math.round((wins / total) * 100),
                    drawPercentage: Math.round((draws / total) * 100),
                    lossPercentage: Math.round((losses / total) * 100),
                    topPredictedScorer: topScorer ? { name: topScorer[0], count: topScorer[1] } : null
                };
            }
        }

        res.json({
            usersCount: users.length,
            nextMatch: nextMatch ? {
                opponent: nextMatch.opponent,
                date: nextMatch.date,
                stats: matchStats
            } : null
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
