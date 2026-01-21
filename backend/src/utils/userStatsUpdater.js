const db = require('./dbWrapper');
const calculatePoints = require('./calculatePoints');

const BADGES = [
    { name: 'Novice', icon: '🌱', description: 'Premier pronostic effectué' },
    { name: 'Sniper', icon: '🎯', description: 'Score exact trouvé' },
    { name: 'Expert', icon: '🧠', description: 'Atteindre 100 points au total' },
    { name: 'Wydadi d\'Or', icon: '🏆', description: '5 pronostics corrects de suite' }
];

async function updateUserStats(userId) {
    const user = await db.findById('users', userId);
    if (!user) return;

    const predictions = await db.find('predictions', { userId });
    const results = await db.find('results');

    // Default scoring for global stats
    const scoring = { exactScore: 10, correctResult: 5, perScorer: 3 };

    let totalPoints = 0;
    let exactScores = 0;
    let correctResults = 0;
    let totalPredictions = predictions.length;

    predictions.forEach(pred => {
        const result = results.find(r => r.matchId.toString() === pred.matchId.toString());
        if (result) {
            const { total, details } = calculatePoints(pred, result, scoring);
            totalPoints += total;
            if (details.exactScore) exactScores++;
            if (details.correctResult) correctResults++;
        }
    });

    const newStats = {
        totalPoints,
        exactScores,
        correctResults,
        totalPredictions
    };

    // --- Badge Logic ---
    const currentBadges = user.badges || [];
    const newBadges = [...currentBadges];

    const hasBadge = (name) => currentBadges.some(b => b.name === name);

    // 1. Novice
    if (!hasBadge('Novice') && totalPredictions >= 1) {
        newBadges.push({ name: 'Novice', icon: '🌱', dateAwarded: new Date() });
    }

    // 2. Sniper
    if (!hasBadge('Sniper') && exactScores >= 1) {
        newBadges.push({ name: 'Sniper', icon: '🎯', dateAwarded: new Date() });
    }

    // 3. Expert
    if (!hasBadge('Expert') && totalPoints >= 100) {
        newBadges.push({ name: 'Expert', icon: '🧠', dateAwarded: new Date() });
    }

    // 4. Wydadi d'Or (5 consecutive correct results)
    if (!hasBadge('Wydadi d\'Or')) {
        // Sort predictions by match date (requires match info)
        const matches = await db.find('matches');
        const sortedPredictions = predictions
            .map(p => ({
                ...p,
                matchDate: new Date(matches.find(m => m._id.toString() === p.matchId.toString())?.date || 0)
            }))
            .sort((a, b) => a.matchDate - b.matchDate);

        let streak = 0;
        let maxStreak = 0;

        for (const pred of sortedPredictions) {
            const result = results.find(r => r.matchId.toString() === pred.matchId.toString());
            if (result) {
                const { details } = calculatePoints(pred, result, scoring);
                if (details.correctResult) {
                    streak++;
                    if (streak > maxStreak) maxStreak = streak;
                } else {
                    streak = 0;
                }
            }
        }

        if (maxStreak >= 5) {
            newBadges.push({ name: 'Wydadi d\'Or', icon: '🏆', dateAwarded: new Date() });
        }
    }

    await db.update('users', userId, {
        stats: newStats,
        badges: newBadges
    });

    // Create notifications for newly awarded badges
    if (newBadges.length > currentBadges.length) {
        const newlyAwarded = newBadges.slice(currentBadges.length);
        for (const badge of newlyAwarded) {
            await db.create('notifications', {
                userId,
                message: `Félicitations ! Vous avez débloqué le trophée : ${badge.name} ${badge.icon}`,
                type: 'badge'
            });
        }
    }

    return { stats: newStats, awarded: newBadges.length > currentBadges.length };
}

module.exports = { updateUserStats };
