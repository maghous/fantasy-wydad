const express = require('express');
const db = require('../utils/dbWrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get notification for current user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await db.find('notifications', { userId: req.user.userId });
        // Sort by date (desc)
        const sorted = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(sorted);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
    try {
        const notifications = await db.find('notifications', { userId: req.user.userId, isRead: false });
        for (const notif of notifications) {
            await db.update('notifications', notif._id, { isRead: true });
        }
        res.json({ message: 'Notifications marquées comme lues' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

// Send reminder (Admin only)
router.post('/remind/:matchId', [auth, admin], async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await db.findById('matches', matchId);
        if (!match) return res.status(404).json({ message: 'Match non trouvé' });

        const users = await db.find('users');
        const predictions = await db.find('predictions');

        // Filter predictions for this match
        const matchPredictions = predictions.filter(p => p.matchId.toString() === matchId);

        // Identify users without prediction
        const usersWithPrediction = matchPredictions.map(p => p.userId.toString());
        const targetUsers = users.filter(u => !usersWithPrediction.includes(u._id.toString()));

        let count = 0;
        for (const user of targetUsers) {
            await db.create('notifications', {
                userId: user._id,
                message: `📢 Dernier rappel ! N'oubliez pas de faire votre pronostic pour le match Wydad vs ${match.opponent} ! ⚽`,
                type: 'system'
            });
            count++;
        }

        res.json({ message: `${count} rappels envoyés avec succès.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
