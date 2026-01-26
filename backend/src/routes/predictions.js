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
    const { matchId, wydadScore, opponentScore, result, scorers, advancedEvents } = req.body;

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
                advancedEvents,
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
                scorers,
                advancedEvents
            });
        }

        res.json(prediction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

const calculatePoints = require('../utils/calculatePoints');
router.get('/breakdown/:matchId{/:leagueId}', auth, async (req, res) => {
    try {
        const { matchId, leagueId } = req.params;
        const prediction = await db.findOne('predictions', {
            userId: req.user.userId,
            matchId
        });

        if (!prediction) return res.status(404).json({ message: 'Pronostic non trouvé' });

        const result = await db.findOne('results', { matchId });
        if (!result) return res.status(404).json({ message: 'Résultat non encore publié' });

        // Default scoring values
        let scoring = {
            exactScore: 10,
            correctResult: 5,
            perScorer: 3,
            firstScorer: 5,
            lastScorer: 5,
            brace: 7,
            hatTrick: 12,
            anytimeWinner: 5,
            goalInterval: 3,
            penaltyScorer: 4
        };

        // If leagueId is provided, use league specific scoring
        if (leagueId && leagueId !== 'undefined') {
            const league = await db.findById('leagues', leagueId);
            if (league && league.scoring) {
                scoring = { ...scoring, ...league.scoring };
            }
        }

        // Run calculation (modifies prediction.advancedEvents in-place if they exist)
        const { total, details } = calculatePoints(prediction, result, scoring);

        // Build a nice breakdown object
        const breakdown = {
            total,
            items: [
                { label: 'Résultat Correct', points: details.correctResult ? scoring.correctResult : 0, reached: details.correctResult },
                { label: 'Score Exact (Bonus)', points: details.exactScore ? scoring.exactScore : 0, reached: details.exactScore },
            ]
        };

        // Scorers breakdown
        prediction.scorers.forEach(name => {
            const reached = result.scorers.includes(name);
            breakdown.items.push({
                label: `Buteur : ${name}`,
                points: reached ? scoring.perScorer : 0,
                reached
            });
        });

        // Advanced events breakdown
        if (prediction.advancedEvents) {
            prediction.advancedEvents.forEach(event => {
                const labelMap = {
                    'first_scorer': 'Premier Buteur',
                    'last_scorer': 'Dernier Buteur',
                    'brace': 'Doublé',
                    'hat_trick': 'Triplé',
                    'anytime_winner': 'Buteur & Gagne',
                    'penalty_scorer': 'Buteur Penalty'
                };

                let label = labelMap[event.type] || event.type;
                if (event.player) label += ` (${event.player})`;
                if (event.type.startsWith('interval')) {
                    const [s, e] = event.type.split('_').slice(1);
                    label = `But entre ${s}' et ${e}'`;
                }

                breakdown.items.push({
                    label,
                    points: event.pointsEarned || 0,
                    reached: (event.pointsEarned || 0) > 0
                });
            });
        }

        res.json(breakdown);
    } catch (err) {
        console.error('Breakdown error:', err);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
