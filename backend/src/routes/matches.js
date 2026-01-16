const express = require('express');
const db = require('../utils/dbWrapper');
const router = express.Router();

// Get all matches
router.get('/', async (req, res) => {
    try {
        const matches = await db.find('matches');
        // Sort logic would be here if needed
        res.json(matches);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Create match
router.post('/', async (req, res) => {
    const { opponent, date, location } = req.body;

    try {
        const match = await db.create('matches', {
            opponent,
            date,
            location,
            status: 'upcoming'
        });
        res.json(match);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Get match by ID
router.get('/:id', async (req, res) => {
    try {
        const match = await db.findById('matches', req.params.id);
        if (!match) return res.status(404).json({ message: 'Match non trouvé' });
        res.json(match);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
