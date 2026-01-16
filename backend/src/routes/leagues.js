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
        const league = await db.create('leagues', {
            name,
            scoring,
            createdBy: req.user.userId,
            members: [req.user.userId]
        });

        res.json(league);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Get league by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const league = await db.findById('leagues', req.params.id);
        if (!league) {
            return res.status(404).json({ message: 'Ligue non trouvée' });
        }

        // Check membership (optional but good for security)
        // if (!league.members.includes(req.user.userId)) return res.status(403)...

        res.json(league);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
