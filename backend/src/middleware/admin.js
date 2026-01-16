module.exports = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
    }
};
