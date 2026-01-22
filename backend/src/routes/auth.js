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
        check('password', 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre')
            .isLength({ min: 8 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
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
                password: hashedPassword,
                isAdmin: false // Admin should be set manually in DB for security
            });

            const payload = { userId: user._id, isAdmin: user.isAdmin };
            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error('JWT_SECRET is not defined');

            const token = jwt.sign(payload, secret, { expiresIn: '7d' });

            res.json({ token, user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin } });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
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

            const isAdmin = user.isAdmin || false;
            const payload = { userId: user._id, isAdmin: isAdmin };

            const secret = process.env.JWT_SECRET;
            if (!secret) throw new Error('JWT_SECRET is not defined');

            const token = jwt.sign(payload, secret, { expiresIn: '7d' });

            res.json({ token, user: { id: user._id, username: user.username, email: user.email, isAdmin: isAdmin } });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
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

// Forgot Password
router.post('/forgot-password',
    [check('email', 'Veuillez inclure un email valide').isEmail()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email } = req.body;
        try {
            const user = await db.findOne('users', { email: email.toLowerCase() });
            if (!user) return res.status(404).json({ message: 'Aucun utilisateur avec cet email' });

            const crypto = require('crypto');
            const token = crypto.randomBytes(20).toString('hex');

            await db.update('users', user._id, {
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 3600000 // 1 hour
            });

            // Note: In a real app, send email here. For now, return token for testing/demo.
            res.json({ message: 'Token de réinitialisation généré', token });
        } catch (err) {
            console.error(err);
            res.status(500).send('Erreur serveur');
        }
    }
);

// Reset Password
router.post('/reset-password/:token',
    [check('password', 'Le mot de passe doit contenir au moins 8 caractères').isLength({ min: 8 })],
    async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;

        try {
            const user = await db.findOne('users', {
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) return res.status(400).json({ message: 'Token invalide ou expiré' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await db.update('users', user._id, {
                password: hashedPassword,
                resetPasswordToken: undefined,
                resetPasswordExpires: undefined
            });

            res.json({ message: 'Mot de passe mis à jour avec succès' });
        } catch (err) {
            console.error(err);
            res.status(500).send('Erreur serveur');
        }
    }
);

// Temporary Secret Promotion Route (Use this to become admin online)
// URL: /api/auth/promote-secret/[email]/[SEED_SECRET]
router.get('/promote-secret/:email/:secret', async (req, res) => {
    const { email, secret } = req.params;

    // Check if the secret matches the one in .env
    if (secret !== process.env.SEED_SECRET) {
        return res.status(403).json({ message: 'Secret invalide' });
    }

    try {
        const user = await db.findOne('users', { email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé sur ce serveur' });
        }

        await db.update('users', user._id, { isAdmin: true });
        res.json({ message: `L'utilisateur ${email} est maintenant ADMINISTRATEUR !` });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la promotion', error: err.message });
    }
});

module.exports = router;
