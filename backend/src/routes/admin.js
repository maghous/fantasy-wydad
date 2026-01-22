const express = require('express');
const db = require('../utils/dbWrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get global statistics (Admin only)
router.get('/stats', [auth, admin], async (req, res) => {
    try {
        const users = await db.find('users');
        const leagues = await db.find('leagues');
        const predictions = await db.find('predictions');
        const matches = await db.find('matches');

        res.json({
            usersCount: users.length,
            leaguesCount: leagues.length,
            predictionsCount: predictions.length,
            matchesCount: matches.length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
