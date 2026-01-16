const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../utils/dbWrapper');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post(
    '/register',
    [
        check('username', 'Le nom d\'utilisateur est requis').not().isEmpty(),
        check('email', 'Veuillez inclure un email valide').isEmail(),
        check('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        try {
            const existingUser = await db.findOne('users', { email });
            if (existingUser) {
                return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await db.create('users', {
                username,
                email,
                password: hashedPassword
            });

            const payload = { userId: user._id };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

            res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erreur serveur');
        }
    }
);

// Login
router.post(
    '/login',
    [
        check('email', 'Veuillez inclure un email valide').isEmail(),
        check('password', 'Le mot de passe est requis').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await db.findOne('users', { email });
            if (!user) {
                return res.status(400).json({ message: 'Identifiants invalides' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Identifiants invalides' });
            }

            const payload = { userId: user._id };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

            res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Erreur serveur');
        }
    }
);

// Get User Profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await db.findById('users', req.user.userId);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        // Remove password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router;
