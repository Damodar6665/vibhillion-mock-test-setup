// ==============================================================================
// VIBHILLION AI: SCORING & ANALYSIS ENGINE
// File: packages/shared/src/scoring.ts
// ==============================================================================
/**
 * Calculates official exam score and accuracy according to project rules:
 * Final score = (correct answers * positive marks) - (wrong answers * negative penalty)
 * Accuracy % = (correct answers / attempted answers) * 100
 * Handles division by zero safely when attempted count is 0.
 */
export function calculateExamScore(input) {
    const { correctCount, wrongCount, positiveMarks, negativePenalty } = input;
    const attemptedCount = Math.max(0, correctCount + wrongCount);
    const correctMarks = Number((correctCount * positiveMarks).toFixed(2));
    const negativeMarks = Number((wrongCount * negativePenalty).toFixed(2));
    const finalScore = Number((correctMarks - negativeMarks).toFixed(2));
    let accuracyPercentage = 0;
    if (attemptedCount > 0) {
        accuracyPercentage = Number(((correctCount / attemptedCount) * 100).toFixed(2));
    }
    return {
        correctMarks,
        negativeMarks,
        finalScore,
        attemptedCount,
        accuracyPercentage,
    };
}
/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0)
        return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const pad = (n) => n.toString().padStart(2, '0');
    if (hrs > 0) {
        return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
}
/**
 * Calculates rank and percentile strictly from valid comparison dataset.
 * Avoids misrepresenting raw percentage as percentile.
 */
export function calculateRankAndPercentile(userScore, allScores) {
    if (!allScores || allScores.length === 0) {
        return { rank: 1, percentile: 100, totalParticipants: 1 };
    }
    const sortedScores = [...allScores].sort((a, b) => b - a);
    const total = sortedScores.length;
    // Rank: 1-indexed position of user
    let rank = 1;
    for (let i = 0; i < total; i++) {
        if (sortedScores[i] > userScore) {
            rank++;
        }
        else {
            break;
        }
    }
    // Percentile: (Number of people who scored lower than user / total) * 100
    const scoresBelow = sortedScores.filter(s => s < userScore).length;
    const percentile = Number(((scoresBelow / total) * 100).toFixed(2));
    return {
        rank,
        percentile,
        totalParticipants: total,
    };
}
/**
 * Generates transparent, rule-based topic-wise analysis and recommendations
 */
export function analyzeTopicPerformance(questions) {
    const topicMap = {};
    let totalTime = 0;
    let slowQuestions = [];
    questions.forEach(q => {
        const t = q.topic || 'General';
        if (!topicMap[t]) {
            topicMap[t] = { total: 0, attempted: 0, correct: 0, wrong: 0, time: 0 };
        }
        topicMap[t].total += 1;
        topicMap[t].time += q.time_spent_seconds;
        totalTime += q.time_spent_seconds;
        if (q.user_selected_option_id) {
            topicMap[t].attempted += 1;
            if (q.is_correct) {
                topicMap[t].correct += 1;
            }
            else {
                topicMap[t].wrong += 1;
            }
        }
        // Flag question taking > 90 seconds in competitive exam context
        if (q.time_spent_seconds > 90) {
            slowQuestions.push(q.question_number);
        }
    });
    const avgTime = questions.length > 0 ? Math.round(totalTime / questions.length) : 0;
    const topics = [];
    const weakTopics = [];
    const strongTopics = [];
    for (const [topicName, stats] of Object.entries(topicMap)) {
        const acc = stats.attempted > 0 ? Number(((stats.correct / stats.attempted) * 100).toFixed(1)) : 0;
        const avgT = stats.total > 0 ? Math.round(stats.time / stats.total) : 0;
        const isWeak = (acc < 50 && stats.attempted > 0) || (stats.attempted === 0);
        const isStrong = acc >= 75 && stats.attempted > 0;
        if (isWeak)
            weakTopics.push(topicName);
        if (isStrong)
            strongTopics.push(topicName);
        topics.push({
            topic: topicName,
            total_questions: stats.total,
            attempted: stats.attempted,
            correct: stats.correct,
            wrong: stats.wrong,
            accuracy: acc,
            average_time_seconds: avgT,
            is_weak: isWeak,
            is_strong: isStrong,
        });
    }
    // Generate transparent rule-based recommendations
    const recommendations = [];
    if (weakTopics.length > 0) {
        recommendations.push(`Prioritize revising foundational concepts in: ${weakTopics.join(', ')}.`);
    }
    if (slowQuestions.length > 0) {
        recommendations.push(`Improve pacing on questions ${slowQuestions.join(', ')} where solving time exceeded 90 seconds.`);
    }
    if (strongTopics.length > 0) {
        recommendations.push(`Maintain your edge in ${strongTopics.join(', ')} with regular speed drills.`);
    }
    if (recommendations.length === 0) {
        recommendations.push('Consistent performance across all tested topics. Focus on mock test endurance and time management.');
    }
    return {
        topics,
        weakTopics,
        strongTopics,
        recommendations,
        averageTimePerQuestion: avgTime,
        slowQuestions,
    };
}
