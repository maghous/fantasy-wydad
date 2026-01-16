const calculatePoints = (prediction, realResult, scoring) => {
    if (!realResult) return { total: 0, details: { exactScore: false, correctResult: false } };

    let points = 0;
    let details = {
        exactScore: false,
        correctResult: false
    };

    // Check Result (Win/Draw/Lose)
    const predResult =
        Number(prediction.wydadScore) > Number(prediction.opponentScore)
            ? 'win'
            : Number(prediction.wydadScore) < Number(prediction.opponentScore)
                ? 'lose'
                : 'draw';

    const realRes =
        Number(realResult.wydadScore) > Number(realResult.opponentScore)
            ? 'win'
            : Number(realResult.wydadScore) < Number(realResult.opponentScore)
                ? 'lose'
                : 'draw';

    if (predResult === realRes) {
        points += scoring.correctResult;
        details.correctResult = true;
    }

    // Check Exact Score (Bonus)
    if (
        Number(prediction.wydadScore) === Number(realResult.wydadScore) &&
        Number(prediction.opponentScore) === Number(realResult.opponentScore)
    ) {
        points += scoring.exactScore;
        details.exactScore = true;
    }

    // Scorers
    prediction.scorers.forEach((scorer) => {
        if (realResult.scorers.includes(scorer)) {
            points += scoring.perScorer;
        }
    });

    return { total: points, details };
};

module.exports = calculatePoints;
