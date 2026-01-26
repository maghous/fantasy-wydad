const express = require('express');
const db = require('../utils/dbWrapper');
const router = express.Router();

// Get top scorers based on real results
router.get('/top-scorers', async (req, res) => {
    try {
        const results = await db.find('results');
        const scorerCounts = {};

        results.forEach(result => {
            result.scorers?.forEach(player => {
                if (player) {
                    scorerCounts[player] = (scorerCounts[player] || 0) + 1;
                }
            });
        });

        const sortedScorers = Object.entries(scorerCounts)
            .map(([name, goals]) => ({ name, goals }))
            .sort((a, b) => b.goals - a.goals);

        res.json(sortedScorers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur serveur');
    }
});

// Get Top 5 Season Scorers (Manual)
router.get('/season-top', async (req, res) => {
    try {
        const scorers = await db.find('seasonscorers');
        res.json(scorers.sort((a, b) => b.goals - a.goals).slice(0, 5));
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

// Update Season Scorers (Admin only)
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
router.post('/season-top', [auth, admin], async (req, res) => {
    try {
        const { scorers } = req.body; // Array of {name, goals}

        // Clean data: strip _id to avoid duplicate key or validation errors after deletion
        const cleanScorers = scorers.map((s, i) => {
            const { _id, __v, createdAt, ...rest } = s;
            return { ...rest, order: i };
        });

        await db.deleteMany('seasonscorers');
        const created = await db.insertMany('seasonscorers', cleanScorers);
        res.json(created);
    } catch (err) {
        console.error('Save season top error:', err);
        res.status(500).send('Erreur serveur');
    }
});

// Get public statistics
router.get('/global', async (req, res) => {
    try {
        const users = await db.find('users');
        const upcomingMatches = await db.find('matches', { status: 'upcoming' });
        const finishedMatches = await db.find('matches', { status: 'finished' });

        // Find next match
        const nextMatch = upcomingMatches.sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        // Find last match result
        const lastMatch = finishedMatches.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        let lastMatchScorers = [];
        if (lastMatch) {
            const result = await db.find('results', { matchId: lastMatch._id.toString() });
            if (result.length > 0) {
                lastMatchScorers = result[0].scorers || [];
            }
        }

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
            } : null,
            lastMatch: lastMatch ? {
                opponent: lastMatch.opponent,
                scorers: lastMatchScorers
            } : null
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
