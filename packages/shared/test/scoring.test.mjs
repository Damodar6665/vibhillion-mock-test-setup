// ==============================================================================
// VIBHILLION AI: SCORING ENGINE UNIT TESTS
// File: packages/shared/test/scoring.test.mjs
// ==============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExamScore,
  formatDuration,
  calculateRankAndPercentile,
  analyzeTopicPerformance,
} from '../dist/index.js';

test('calculateExamScore: standard SSC CGL scoring (+2 correct, -0.5 wrong)', () => {
  const result = calculateExamScore({
    correctCount: 18,
    wrongCount: 4,
    unattemptedCount: 3,
    positiveMarks: 2.0,
    negativePenalty: 0.5,
  });

  assert.equal(result.attemptedCount, 22);
  assert.equal(result.correctMarks, 36.0);
  assert.equal(result.negativeMarks, 2.0);
  assert.equal(result.finalScore, 34.0);
  assert.equal(result.accuracyPercentage, 81.82);
});

test('calculateExamScore: handles zero attempts without division by zero', () => {
  const result = calculateExamScore({
    correctCount: 0,
    wrongCount: 0,
    unattemptedCount: 25,
    positiveMarks: 2.0,
    negativePenalty: 0.5,
  });

  assert.equal(result.attemptedCount, 0);
  assert.equal(result.correctMarks, 0);
  assert.equal(result.negativeMarks, 0);
  assert.equal(result.finalScore, 0);
  assert.equal(result.accuracyPercentage, 0);
});

test('calculateExamScore: all wrong penalty calculation', () => {
  const result = calculateExamScore({
    correctCount: 0,
    wrongCount: 10,
    unattemptedCount: 15,
    positiveMarks: 2.0,
    negativePenalty: 0.5,
  });

  assert.equal(result.attemptedCount, 10);
  assert.equal(result.correctMarks, 0);
  assert.equal(result.negativeMarks, 5.0);
  assert.equal(result.finalScore, -5.0);
  assert.equal(result.accuracyPercentage, 0);
});

test('formatDuration: formats seconds correctly', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(900), '15:00');
  assert.equal(formatDuration(3665), '01:01:05');
});

test('calculateRankAndPercentile: ranks candidates and calculates percentile', () => {
  const allScores = [180, 160, 150, 140, 120, 100, 80, 60, 40, 20];
  
  // User scored 160 -> rank 2, 8 people scored below him out of 10 -> 80%
  const res = calculateRankAndPercentile(160, allScores);
  assert.equal(res.rank, 2);
  assert.equal(res.percentile, 80.0);
  assert.equal(res.totalParticipants, 10);
});

test('analyzeTopicPerformance: identifies weak and strong topics', () => {
  const mockQuestions = [
    {
      question_id: '1',
      question_number: 1,
      question_text: 'Q1',
      difficulty: 'easy',
      topic: 'Grammar',
      subtopic: 'Tenses',
      marks: 2,
      negative_marks: 0.5,
      section_id: 'sec1',
      section_name: 'English',
      options: [],
      user_selected_option_id: 'opt1',
      correct_option_id: 'opt1',
      is_correct: true,
      marks_awarded: 2,
      time_spent_seconds: 45,
    },
    {
      question_id: '2',
      question_number: 2,
      question_text: 'Q2',
      difficulty: 'hard',
      topic: 'Vocabulary',
      subtopic: 'Antonyms',
      marks: 2,
      negative_marks: 0.5,
      section_id: 'sec1',
      section_name: 'English',
      options: [],
      user_selected_option_id: 'opt2',
      correct_option_id: 'opt3',
      is_correct: false,
      marks_awarded: -0.5,
      time_spent_seconds: 110, // Slow question
    },
  ];

  const analysis = analyzeTopicPerformance(mockQuestions);
  assert.equal(analysis.slowQuestions.length, 1);
  assert.equal(analysis.slowQuestions[0], 2);
  assert.ok(analysis.weakTopics.includes('Vocabulary'));
  assert.ok(analysis.strongTopics.includes('Grammar'));
  assert.ok(analysis.recommendations.length > 0);
});
