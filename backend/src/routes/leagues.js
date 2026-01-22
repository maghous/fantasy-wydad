const express = require('express');
const db = require('../utils/dbWrapper');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all leagues for user
router.get('/', auth, async (req, res) => {
    try {
        const leagues = await db.find('leagues', { members: req.user.userId });

        // Populate createdBy and members (usernames only)
        const enrichedLeagues = await Promise.all(leagues.map(async (league) => {
            const creator = await db.findById('users', league.createdBy);

            // Fetch all members' usernames
            const membersData = await Promise.all(league.members.map(async (mId) => {
                const user = await db.findById('users', mId);
                return user ? { _id: user._id, username: user.username } : null;
            }));

            return {
                ...league,
                createdBy: creator ? { username: creator.username } : null,
                members: membersData.filter(m => m !== null)
            };
        }));

        res.json(enrichedLeagues);
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

        // Populate members usernames
        const membersData = await Promise.all(league.members.map(async (mId) => {
            const user = await db.findById('users', mId);
            return user ? { _id: user._id, username: user.username } : null;
        }));

        const enrichedLeague = {
            ...league,
            members: membersData.filter(m => m !== null)
        };

        res.json(enrichedLeague);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Leave a league
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const league = await db.findById('leagues', req.params.id);
        if (!league) {
            return res.status(404).json({ message: 'Ligue non trouvée' });
        }

        // Check if user is the creator (Owner cannot leave)
        if (league.createdBy.toString() === req.user.userId.toString()) {
            return res.status(400).json({ message: 'Le créateur ne peut pas quitter sa propre ligue. Supprimez-la plutôt.' });
        }

        // Remove member
        const updatedMembers = league.members.filter(m => m.toString() !== req.user.userId.toString());

        await db.update('leagues', league._id, {
            members: updatedMembers
        });

        res.json({ message: 'Vous avez quitté la ligue avec succès' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

module.exports = router;
