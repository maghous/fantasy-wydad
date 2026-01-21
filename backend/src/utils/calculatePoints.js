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

    // Scorers (Anytime)
    prediction.scorers.forEach((scorerName) => {
        if (realResult.scorers.includes(scorerName)) {
            points += scoring.perScorer;
        }
    });

    // Advanced Events
    if (prediction.advancedEvents && realResult.events) {
        prediction.advancedEvents.forEach((event) => {
            let earned = 0;
            const matchEvents = realResult.events;

            switch (event.type) {
                case 'first_scorer':
                    const firstGoal = matchEvents.find(e => e.type === 'goal' || e.type === 'csc' || e.type === 'penalty');
                    if (firstGoal && firstGoal.player === event.player) {
                        earned = Number(scoring.firstScorer) || 0;
                    }
                    break;

                case 'last_scorer':
                    const goals = matchEvents.filter(e => e.type === 'goal' || e.type === 'csc' || e.type === 'penalty');
                    const lastGoal = goals[goals.length - 1];
                    if (lastGoal && lastGoal.player === event.player) {
                        earned = Number(scoring.lastScorer) || 0;
                    }
                    break;

                case 'brace': // 2+ goals
                    const braceCount = matchEvents.filter(e => e.player === event.player && (e.type === 'goal' || e.type === 'penalty')).length;
                    if (braceCount >= 2) {
                        earned = Number(scoring.brace) || 0;
                    }
                    break;

                case 'hat_trick': // 3+ goals
                    const hatCount = matchEvents.filter(e => e.player === event.player && (e.type === 'goal' || e.type === 'penalty')).length;
                    if (hatCount >= 3) {
                        earned = Number(scoring.hatTrick) || 0;
                    }
                    break;

                case 'anytime_winner':
                    const hasScored = matchEvents.some(e => e.player === event.player && (e.type === 'goal' || e.type === 'penalty'));
                    if (hasScored && realRes === 'win') {
                        earned = Number(scoring.anytimeWinner) || 0;
                    }
                    break;

                case 'interval_0_15':
                case 'interval_16_30':
                case 'interval_31_45':
                case 'interval_46_60':
                case 'interval_61_75':
                case 'interval_76_90':
                    const [start, end] = event.type.split('_').slice(1).map(Number);
                    const isInInterval = matchEvents.some(e =>
                        (e.type === 'goal' || e.type === 'penalty' || e.type === 'csc') &&
                        e.minute >= start && e.minute <= end
                    );
                    if (isInInterval) {
                        earned = Number(scoring.goalInterval) || 0;
                    }
                    break;

                case 'penalty_scorer':
                    const scoredPenalty = matchEvents.some(e => e.player === event.player && e.type === 'penalty' && e.goalType === 'penalty_scored');
                    if (scoredPenalty) {
                        earned = Number(scoring.penaltyScorer) || 0;
                    }
                    break;
            }

            points += earned;
            event.pointsEarned = earned; // Store for transparency
        });
    }

    return { total: points, details };
};

module.exports = calculatePoints;
