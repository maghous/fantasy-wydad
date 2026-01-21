const express = require('express');
const db = require('../utils/dbWrapper');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all leagues for user
router.get('/', auth, async (req, res) => {
    try {
        const leagues = await db.find('leagues', { members: req.user.userId });

        // Populate createdBy (simple version)
        const leaguesWithCreator = await Promise.all(leagues.map(async (league) => {
            const creator = await db.findById('users', league.createdBy);
            return {
                ...league,
                createdBy: creator ? { username: creator.username } : null
            };
        }));

        res.json(leaguesWithCreator);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Create a league
router.post('/', auth, async (req, res) => {
    const { name, scoring } = req.body;

    try {
        // Generate a random 6-character join code
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const league = await db.create('leagues', {
            name,
            scoring,
            joinCode,
            createdBy: req.user.userId,
            members: [req.user.userId]
        });

        res.json(league);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Join a league by code
router.post('/join', auth, async (req, res) => {
    const { code } = req.body;

    try {
        if (!code) {
            return res.status(400).json({ message: 'Code de ligue requis' });
        }

        const league = await db.findOne('leagues', { joinCode: code.toUpperCase() });

        if (!league) {
            return res.status(404).json({ message: 'Ligue non trouvée avec ce code' });
        }

        // Check if already a member
        // In hybrid DB, members might be string IDs or ObjectIds
        const userId = req.user.userId.toString();
        const memberIds = league.members.map(m => m.toString());

        if (memberIds.includes(userId)) {
            return res.status(400).json({ message: 'Vous êtes déjà membre de cette ligue' });
        }

        // Add member
        const updatedLeague = await db.update('leagues', league._id, {
            members: [...league.members, req.user.userId]
        });

        res.json(updatedLeague);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

// Get league by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const league = await db.findById('leagues', req.params.id);
        if (!league) {
            return res.status(404).json({ message: 'Ligue non trouvée' });
        }

        // Check membership (security)
        const userId = req.user.userId.toString();
        const memberIds = league.members.map(m => m.toString());

        if (!memberIds.includes(userId)) {
            return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas membre de cette ligue.' });
        }

        res.json(league);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
