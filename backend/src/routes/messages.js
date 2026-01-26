const express = require('express');
const db = require('../utils/dbWrapper');
const auth = require('../middleware/auth');
const router = express.Router();

// Get messages for a league
router.get('/:leagueId', auth, async (req, res) => {
    try {
        const messages = await db.find('messages', { leagueId: req.params.leagueId });

        // Populate sender info
        const enriched = await Promise.all(messages.map(async (msg) => {
            const sender = await db.findById('users', msg.userId);
            return {
                ...msg,
                username: sender ? sender.username : 'Inconnu'
            };
        }));

        // Sort by timestamp and limit to 50
        const sorted = enriched.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-50);
        res.json(sorted);
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

// Post a message
router.post('/', auth, async (req, res) => {
    const { leagueId, text } = req.body;
    try {
        const message = await db.create('messages', {
            leagueId,
            userId: req.user.userId,
            text,
            createdAt: new Date().toISOString()
        });

        // Return with username
        const user = await db.findById('users', req.user.userId);
        res.json({ ...message, username: user.username });
    } catch (err) {
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
