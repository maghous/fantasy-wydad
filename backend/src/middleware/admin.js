module.exports = (req, res, next) => {
    console.log(`[AdminCheck] URL: ${req.originalUrl}, User: ${req.user?.userId}, isAdmin: ${req.user?.isAdmin}`);

    if (req.user && req.user.isAdmin) {
        next();
    } else {
        console.warn(`[AdminCheck] Access denied for user: ${req.user?.userId}`);
        res.status(403).json({ message: 'Accès refusé. Droits administrateur requis.' });
    }
};
