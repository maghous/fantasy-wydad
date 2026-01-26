const express = require('express');
const db = require('../utils/dbWrapper');
const auth = require('../middleware/auth');
const router = express.Router();

// Get MOTM results for a match
router.get('/results/:matchId', async (req, res) => {
    try {
        const votes = await db.find('motmvotes', { matchId: req.params.matchId });
        const result = await db.findOne('results', { matchId: req.params.matchId });

        if (!result) return res.status(404).json({ message: 'Résultat non disponible' });

        // Aggregate votes
        const aggregate = {};
        votes.forEach(v => {
            aggregate[v.playerName] = (aggregate[v.playerName] || 0) + 1;
        });

        const sorted = Object.entries(aggregate)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        res.json({
            results: sorted,
            totalVotes: votes.length,
            isClosed: (Date.now() - new Date(result.createdAt).getTime()) > 24 * 60 * 60 * 1000
        });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Post a vote
router.post('/vote', auth, async (req, res) => {
    const { matchId, playerName } = req.body;

    try {
        const result = await db.findOne('results', { matchId });
        if (!result) return res.status(400).json({ message: 'Sondage non ouvert' });

        // Check 24h limit
        const diff = Date.now() - new Date(result.createdAt).getTime();
        if (diff > 24 * 60 * 60 * 1000) {
            return res.status(400).json({ message: 'Le sondage est fermé (24h écoulées)' });
        }

        // Check if user already voted
        const existing = await db.findOne('motmvotes', { matchId, userId: req.user.userId });
        if (existing) {
            return res.status(400).json({ message: 'Vous avez déjà voté pour ce match' });
        }

        const vote = await db.create('motmvotes', {
            matchId,
            userId: req.user.userId,
            playerName
        });

        res.json({ success: true, vote });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Get all winners
router.get('/winners', async (req, res) => {
    try {
        const votes = await db.find('motmvotes');
        const matches = await db.find('matches', { status: 'finished' });

        const winners = matches.map(match => {
            const matchVotes = votes.filter(v => v.matchId.toString() === match._id.toString());
            if (matchVotes.length === 0) return null;

            const counts = {};
            matchVotes.forEach(v => counts[v.playerName] = (counts[v.playerName] || 0) + 1);

            const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
            return {
                matchId: match._id,
                opponent: match.opponent,
                date: match.date,
                winner: winner[0],
                votes: winner[1]
            };
        }).filter(w => w !== null);

        res.json(winners.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Check if user voted
router.get('/myvk/:matchId', auth, async (req, res) => {
    try {
        const vote = await db.findOne('motmvotes', { matchId: req.params.matchId, userId: req.user.userId });
        res.json({ voted: !!vote, playerName: vote?.playerName });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
