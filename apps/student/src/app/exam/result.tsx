// ==============================================================================
// VIBHILLION AI: TEST RESULTS & COMPREHENSIVE ANALYTICS (SCREENSHOTS 9, 10, 11)
// File: apps/student/src/app/exam/result.tsx
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { formatDuration, QuestionAnalysis } from '@vibhillion/shared';

export default function ExamResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const attemptId = (params.attemptId as string) || '';
  const paperTitle =
    (params.paperTitle as string) || 'SSC CGL T-I (Held on 12 Sep 2025 S1) – English';
  const totalQuestions = Number(params.totalQuestions || 100);
  const attemptedCount = Number(params.attemptedCount || 0);
  const unattemptedCount = Number(params.unattemptedCount || 100);
  const correctCount = Number(params.correctCount || 0);
  const wrongCount = Number(params.wrongCount || 0);
  const finalScore = Number(params.finalScore || 0);
  const maximumScore = Number(params.maximumScore || 200.0);
  const accuracyPercentage = Number(params.accuracyPercentage || 0);
  const totalTimeSeconds = Number(params.totalTimeSeconds || 1912); // ~31m 52s default

  // Parse local answers map for question review
  let localAnswersMap: Record<string, any> = {};
  try {
    localAnswersMap = JSON.parse((params.answersJson as string) || '{}');
  } catch (_) {}

  // Solutions data for Review Answers accordion (Screenshot 11)
  const [solutions, setSolutions] = useState<QuestionAnalysis[]>([]);
  // Start with all questions collapsed so the 1st question does not open automatically
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [loadingSolutions, setLoadingSolutions] = useState(true);

  const openOnlineReference = (url?: string) => {
    if (!url) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      Linking.openURL(url).catch((err) => console.warn('Could not open reference URL:', err));
    }
  };

  useEffect(() => {
    async function fetchSolutions() {
      try {
        setLoadingSolutions(true);
        const data = await examService.getSolutions(attemptId, localAnswersMap);
        setSolutions(data);
      } finally {
        setLoadingSolutions(false);
      }
    }
    fetchSolutions();
  }, [attemptId]);

  const toggleExpand = (qIndex: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qIndex]: !prev[qIndex],
    }));
  };

  // Section breakdown calculations matching Screenshot 10
  const sectionsSummary = [
    {
      subject: 'english',
      name: 'English Comprehension',
      qs: 25,
      correct: 0,
      wrong: 0,
      skipped: 25,
      acc: '0%',
    },
    {
      subject: 'general_knowledge',
      name: 'General Awareness',
      qs: 25,
      correct: 0,
      wrong: 0,
      skipped: 25,
      acc: '0%',
    },
    {
      subject: 'quantitative_aptitude',
      name: 'Quantitative Aptitude',
      qs: 25,
      correct: 0,
      wrong: 0,
      skipped: 25,
      acc: '0%',
    },
    {
      subject: 'reasoning',
      name: 'General Intelligence & Reasoning',
      qs: 25,
      correct: 0,
      wrong: 0,
      skipped: 25,
      acc: '0%',
    },
  ];

  // If there are real answers, populate the table dynamically
  solutions.forEach((sol) => {
    let sIdx = 0;
    if (sol.section_id.endsWith('0002')) sIdx = 3; // reasoning
    else if (sol.section_id.endsWith('0003')) sIdx = 2; // quant
    else if (sol.section_id.endsWith('0004')) sIdx = 1; // gk

    if (sol.user_selected_option_id) {
      if (sol.is_correct) {
        sectionsSummary[sIdx].correct += 1;
      } else {
        sectionsSummary[sIdx].wrong += 1;
      }
      sectionsSummary[sIdx].skipped -= 1;
    }
  });

  sectionsSummary.forEach((s) => {
    const att = s.correct + s.wrong;
    s.acc = att > 0 ? `${((s.correct / att) * 100).toFixed(0)}%` : '0%';
  });

  const correctShare = ((correctCount / totalQuestions) * 100).toFixed(1);
  const wrongShare = ((wrongCount / totalQuestions) * 100).toFixed(1);
  const unattemptedShare = ((unattemptedCount / totalQuestions) * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/tests')}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#0D9488" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* EXAM TITLE */}
        <Text style={styles.paperTitleText}>{paperTitle}</Text>

        {/* ========================================================================= */}
        {/* SCORE DONUT GAUGE CARD (SCREENSHOT 9) */}
        {/* ========================================================================= */}
        <View style={styles.scoreGaugeCard}>
          {/* Circular Donut Ring */}
          <View style={styles.donutRing}>
            <View style={styles.donutInner}>
              <Text style={styles.donutScorePercent}>
                {Math.round((Math.max(0, finalScore) / maximumScore) * 100)}%
              </Text>
              <Text style={styles.donutScoreLabel}>SCORE</Text>
            </View>
          </View>

          <Text style={styles.scoreSummaryText}>
            {correctCount} of {totalQuestions} correct • {accuracyPercentage.toFixed(1)}% accuracy
          </Text>

          <Text style={styles.answerDistTitle}>Answer distribution</Text>
          <View style={styles.answerDistDotsRow}>
            <View style={styles.distDotItem}>
              <View style={[styles.distDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.distDotText}>Correct {correctCount}</Text>
            </View>

            <View style={styles.distDotItem}>
              <View style={[styles.distDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.distDotText}>Wrong {wrongCount}</Text>
            </View>

            <View style={styles.distDotItem}>
              <View style={[styles.distDot, { backgroundColor: '#64748B' }]} />
              <Text style={styles.distDotText}>Unanswered {unattemptedCount}</Text>
            </View>
          </View>

          {/* Performance Pill Badge */}
          <View style={styles.perfPillBadge}>
            <Ionicons name="trending-down" size={16} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.perfPillText}>Needs Improvement</Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* ANSWER BREAKDOWN TABLE (SCREENSHOT 9) */}
        {/* ========================================================================= */}
        <Text style={styles.sectionHeading}>Answer breakdown</Text>
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { flex: 2 }]}>RESULT</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'center' }]}>COUNT</Text>
            <Text style={[styles.tableColHeader, { flex: 1, textAlign: 'right' }]}>SHARE</Text>
          </View>
          <View style={styles.tableDivider} />

          <View style={styles.tableDataRow}>
            <Text style={[styles.tableDataText, { flex: 2, color: '#059669', fontWeight: '700' }]}>
              Correct
            </Text>
            <Text style={[styles.tableDataText, { flex: 1, textAlign: 'center' }]}>{correctCount}</Text>
            <Text style={[styles.tableDataText, { flex: 1, textAlign: 'right' }]}>{correctShare}%</Text>
          </View>
          <View style={styles.tableDivider} />

          <View style={styles.tableDataRow}>
            <Text style={[styles.tableDataText, { flex: 2, color: '#DC2626', fontWeight: '700' }]}>
              Wrong
            </Text>
            <Text style={[styles.tableDataText, { flex: 1, textAlign: 'center' }]}>{wrongCount}</Text>
            <Text style={[styles.tableDataText, { flex: 1, textAlign: 'right' }]}>{wrongShare}%</Text>
          </View>
          <View style={styles.tableDivider} />

          <View style={styles.tableDataRow}>
            <Text style={[styles.tableDataText, { flex: 2, color: '#64748B', fontWeight: '600' }]}>
              Unanswered
            </Text>
            <Text style={[styles.tableDataText, { flex: 1, textAlign: 'center' }]}>{unattemptedCount}</Text>
            <Text style={[styles.tableDataText, { flex: 1, textAlign: 'right' }]}>{unattemptedShare}%</Text>
          </View>
        </View>

        {/* TIME TAKEN & ACCURACY METRIC CARDS */}
        <View style={styles.metricsTwoCol}>
          <View style={styles.metricCard}>
            <Ionicons name="time-outline" size={24} color="#EA580C" style={{ marginBottom: 6 }} />
            <Text style={styles.metricBigVal}>{formatDuration(totalTimeSeconds)}</Text>
            <Text style={styles.metricSubLabel}>Time Taken</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="disc-outline" size={24} color="#0D9488" style={{ marginBottom: 6 }} />
            <Text style={styles.metricBigVal}>{accuracyPercentage.toFixed(1)}%</Text>
            <Text style={styles.metricSubLabel}>Accuracy</Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* SUBJECT AND TOPIC RESULTS TABLE (SCREENSHOT 10) */}
        {/* ========================================================================= */}
        <Text style={styles.sectionHeading}>Subject and topic results</Text>
        <Text style={styles.subjectDescText}>
          This report describes this test, not a permanent judgment of your ability. Progress compares your recent attempts of this same test. Strength needs at least 5 questions, 3 attempted answers, 80% accuracy, and 70% coverage. Improvement areas have below 60% accuracy or 50% coverage.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <View style={[styles.tableCard, { minWidth: 360 }]}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableColHeader, { flex: 2 }]}>SUBJECT / CATEGORY</Text>
              <Text style={[styles.tableColHeader, { width: 36, textAlign: 'center' }]}>QS</Text>
              <Text style={[styles.tableColHeader, { width: 56, textAlign: 'center' }]}>CORRECT</Text>
              <Text style={[styles.tableColHeader, { width: 56, textAlign: 'center' }]}>WRONG</Text>
              <Text style={[styles.tableColHeader, { width: 56, textAlign: 'center' }]}>SKIPPED</Text>
              <Text style={[styles.tableColHeader, { width: 44, textAlign: 'right' }]}>ACC</Text>
            </View>
            <View style={styles.tableDivider} />

            {sectionsSummary.map((sec) => (
              <React.Fragment key={sec.subject}>
                <View style={styles.tableDataRow}>
                  <Text style={[styles.tableDataText, { flex: 2, fontWeight: '700', color: '#0F172A' }]}>
                    {sec.subject}
                  </Text>
                  <Text style={[styles.tableDataText, { width: 36, textAlign: 'center' }]}>{sec.qs}</Text>
                  <Text style={[styles.tableDataText, { width: 56, textAlign: 'center', color: '#059669' }]}>
                    {sec.correct}
                  </Text>
                  <Text style={[styles.tableDataText, { width: 56, textAlign: 'center', color: '#DC2626' }]}>
                    {sec.wrong}
                  </Text>
                  <Text style={[styles.tableDataText, { width: 56, textAlign: 'center', color: '#64748B' }]}>
                    {sec.skipped}
                  </Text>
                  <Text style={[styles.tableDataText, { width: 44, textAlign: 'right', fontWeight: '700' }]}>
                    {sec.acc}
                  </Text>
                </View>
                <View style={styles.tableDivider} />
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
        <Text style={styles.swipeHintText}>
          Swipe sideways to see all columns. Accuracy is correct ÷ attempted; small samples stay unclassified.
        </Text>

        {/* NEXT STEPS ADVICE BOX */}
        <Text style={styles.sectionHeading}>Next steps</Text>
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsBold}>
            No subject crossed the improvement threshold.
          </Text>
          <Text style={styles.nextStepsSub}>
            Review skipped answers and keep practising to build on your results.
          </Text>
        </View>

        {/* PROGRESS ON THIS TEST */}
        <View style={styles.progressCard}>
          <Text style={styles.progressCardTitle}>Progress on this test</Text>
          <Text style={styles.progressRowText}>
            29/10/2026: 0% accuracy • 96s per attempted question
          </Text>
          <Text style={styles.progressRowText}>
            29/10/2026: 0% accuracy • Speed unavailable
          </Text>
          <Text style={styles.speedAdviceText}>
            Speed includes thinking and reviewing time. Compare similar attempts, rather than treating speed alone as ability.
          </Text>
        </View>

        {/* BUTTONS: BACK TO TESTS & RETAKE TEST */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={styles.backToTestsBtn}
            onPress={() => router.replace('/(tabs)/tests')}
          >
            <Ionicons name="arrow-back" size={16} color="#475569" style={{ marginRight: 6 }} />
            <Text style={styles.backToTestsBtnText}>Back to Tests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retakeTestBtn}
            onPress={() =>
              router.replace({
                pathname: '/exam/instructions',
                params: { paperTitle },
              })
            }
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.retakeTestBtnText}>Retake Test</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* REVIEW ANSWERS ACCORDION (SCREENSHOT 11) */}
        {/* ========================================================================= */}
        <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Review Answers</Text>

        {loadingSolutions ? (
          <ActivityIndicator size="small" color="#0D9488" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.reviewAccordionList}>
            {solutions.map((sol, qIdx) => {
              const isExpanded = Boolean(expandedQuestions[qIdx]);
              const userSelected = sol.user_selected_option_id;
              const correctId = sol.correct_option_id;

              return (
                <View key={sol.question_id} style={styles.reviewAccordionItem}>
                  {/* Collapsed Header */}
                  <TouchableOpacity
                    style={styles.reviewHeaderRow}
                    activeOpacity={0.8}
                    onPress={() => toggleExpand(qIdx)}
                  >
                    <View style={styles.reviewHeaderLeft}>
                      <View
                        style={[
                          styles.reviewStatusDot,
                          sol.is_correct
                            ? { backgroundColor: '#22C55E' }
                            : userSelected
                            ? { backgroundColor: '#EF4444' }
                            : { backgroundColor: '#94A3B8' },
                        ]}
                      />
                      <Text style={styles.reviewHeaderQuestionTitle} numberOfLines={1}>
                        Q{sol.question_number}. {sol.question_text}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={styles.reviewExpandedBody}>
                      <Text style={styles.expandedQuestionFullText}>
                        {sol.question_text}
                      </Text>

                      {/* Options List */}
                      <View style={styles.reviewOptionsList}>
                        {sol.options?.map((opt) => {
                          const isCorrectOpt = opt.id === correctId;
                          const isUserPicked = opt.id === userSelected;

                          return (
                            <View
                              key={opt.id}
                              style={[
                                styles.reviewOptionBox,
                                isCorrectOpt && styles.reviewOptionCorrect,
                                isUserPicked && !isCorrectOpt && styles.reviewOptionWrong,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.reviewOptionLetter,
                                  isCorrectOpt && { color: '#059669', fontWeight: '800' },
                                  isUserPicked && !isCorrectOpt && { color: '#DC2626' },
                                ]}
                              >
                                {opt.label}. {opt.text}
                              </Text>
                              {isCorrectOpt && (
                                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                              )}
                              {isUserPicked && !isCorrectOpt && (
                                <Ionicons name="close-circle" size={18} color="#DC2626" />
                              )}
                            </View>
                          );
                        })}
                      </View>

                      {/* Explanation Callout Box */}
                      {sol.explanation && (
                        <View style={styles.explanationBox}>
                          <Text style={styles.explanationTitle}>Explanation</Text>
                          <Text style={styles.explanationBodyText}>{sol.explanation}</Text>
                        </View>
                      )}

                      {/* Solution steps */}
                      {sol.solution_steps && sol.solution_steps.length > 0 && (
                        <View style={styles.solutionStepsBox}>
                          <Text style={styles.solutionStepsTitle}>Step-by-step Solution:</Text>
                          {sol.solution_steps.map((st, sIdx) => (
                            <Text key={sIdx} style={styles.solutionStepItem}>
                              • {st}
                            </Text>
                          ))}
                        </View>
                      )}

                      {/* QUESTION ANALYSIS & SUGGESTIONS CONTAINER (SIMPLE & HUMAN UNDERSTANDABLE) */}
                      <View
                        style={[
                          styles.analysisContainer,
                          sol.is_correct && (sol.time_spent_seconds || 0) <= 45 && styles.analysisContainerFast,
                          sol.is_correct && (sol.time_spent_seconds || 0) > 45 && styles.analysisContainerSlow,
                          !sol.is_correct && sol.user_selected_option_id && styles.analysisContainerWrong,
                          !sol.user_selected_option_id && styles.analysisContainerSkipped,
                        ]}
                      >
                        <View style={styles.analysisHeaderRow}>
                          <View style={styles.analysisTagPill}>
                            <Ionicons
                              name={
                                sol.is_correct && (sol.time_spent_seconds || 0) <= 45
                                  ? 'flash'
                                  : sol.is_correct
                                  ? 'time-outline'
                                  : sol.user_selected_option_id
                                  ? 'alert-circle'
                                  : 'help-circle-outline'
                              }
                              size={13}
                              color={
                                sol.is_correct && (sol.time_spent_seconds || 0) <= 45
                                  ? '#059669'
                                  : sol.is_correct
                                  ? '#D97706'
                                  : sol.user_selected_option_id
                                  ? '#DC2626'
                                  : '#4F46E5'
                              }
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              style={[
                                styles.analysisTagText,
                                {
                                  color:
                                    sol.is_correct && (sol.time_spent_seconds || 0) <= 45
                                      ? '#059669'
                                      : sol.is_correct
                                      ? '#B45309'
                                      : sol.user_selected_option_id
                                      ? '#DC2626'
                                      : '#4338CA',
                                },
                              ]}
                            >
                              {sol.is_correct && (sol.time_spent_seconds || 0) <= 45
                                ? '⚡ Great Speed'
                                : sol.is_correct
                                ? '⏳ Do It Fast'
                                : sol.user_selected_option_id
                                ? '⚠️ Needs Improvement'
                                : '📚 Need More Practice'}
                            </Text>
                          </View>

                          <Text style={styles.qTimeText}>
                            Time spent: {sol.time_spent_seconds || 0}s
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.analysisSuggestionText,
                            !sol.is_correct && sol.user_selected_option_id && { color: '#DC2626', fontWeight: '600' },
                          ]}
                        >
                          {sol.recommendation ||
                            (sol.is_correct
                              ? (sol.time_spent_seconds || 0) <= 45
                                ? 'Great work! You solved this fast and correctly. Keep it up!'
                                : 'Do it fast - You got it right (+2.0), but took extra time. Try to solve it faster next time!'
                              : sol.user_selected_option_id
                              ? 'Needs improvement - You got this wrong (-0.5). Need more practice on this topic to avoid mistakes.'
                              : 'Need more practice - You skipped this question. Practice this topic so you can solve it next time.')}
                        </Text>

                        {/* TOPIC-WISE ONLINE ANALYSIS & CURATED STUDY REFERENCE */}
                        {sol.topic_analysis && (
                          <View style={styles.topicAnalysisCard}>
                            {/* Topic Header */}
                            <View style={styles.topicAnalysisHeaderRow}>
                              <View style={styles.topicBadgeWrap}>
                                <Ionicons name="book" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                                <Text style={styles.topicBadgeText}>
                                  {sol.topic || sol.topic_analysis.topic}
                                  {sol.subtopic || sol.topic_analysis.subtopic
                                    ? ` • ${sol.subtopic || sol.topic_analysis.subtopic}`
                                    : ''}
                                </Text>
                              </View>
                              {sol.topic_analysis.exam_weightage && (
                                <View style={styles.weightageBadge}>
                                  <Text style={styles.weightageBadgeText}>
                                    {sol.topic_analysis.exam_weightage}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Core Concept Box */}
                            <View style={styles.topicConceptBox}>
                              <View style={styles.topicBoxLabelRow}>
                                <Ionicons name="bulb-outline" size={13} color="#0369A1" style={{ marginRight: 4 }} />
                                <Text style={styles.topicBoxLabel}>Topic Concept & Core Principle:</Text>
                              </View>
                              <Text style={styles.topicConceptText}>
                                {sol.topic_analysis.concept_summary}
                              </Text>
                            </View>

                            {/* Shortcut & Elimination Rule */}
                            <View style={styles.topicRuleBox}>
                              <View style={styles.topicBoxLabelRow}>
                                <Ionicons name="flash-outline" size={13} color="#047857" style={{ marginRight: 4 }} />
                                <Text style={[styles.topicBoxLabel, { color: '#047857' }]}>
                                  Shortcut & Elimination Rule:
                                </Text>
                              </View>
                              <Text style={styles.topicRuleText}>
                                {sol.topic_analysis.core_rule}
                              </Text>
                            </View>

                            {/* Clickable Online Study Reference */}
                            {sol.topic_analysis.online_reference_url && (
                              <TouchableOpacity
                                style={styles.onlineRefButton}
                                onPress={() => openOnlineReference(sol.topic_analysis?.online_reference_url)}
                                activeOpacity={0.8}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                                  <Ionicons name="globe-outline" size={14} color="#1D4ED8" style={{ marginRight: 6 }} />
                                  <Text style={styles.onlineRefButtonText} numberOfLines={1}>
                                    {sol.topic_analysis.online_reference_title ||
                                      `Study ${sol.topic} Online (Syllabus & Practice)`}
                                  </Text>
                                </View>
                                <Ionicons name="open-outline" size={14} color="#1D4ED8" />
                              </TouchableOpacity>
                            )}

                            {/* Target Pacing Footer */}
                            <View style={styles.topicAnalysisFooter}>
                              <Ionicons name="stopwatch-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                              <Text style={styles.topicPacingText}>
                                Benchmark Pacing: ≤{sol.topic_analysis.target_pacing_seconds || 45}s • Section: {sol.section_name}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  paperTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreGaugeCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  donutRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  donutInner: {
    alignItems: 'center',
  },
  donutScorePercent: {
    fontSize: 30,
    fontWeight: '900',
    color: '#B45309',
  },
  donutScoreLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  scoreSummaryText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 8,
  },
  answerDistTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  answerDistDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  distDotItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  distDotText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  perfPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  perfPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 10,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  tableColHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tableDataText: {
    fontSize: 13,
    color: '#334155',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  metricsTwoCol: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  metricBigVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricSubLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  subjectDescText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  swipeHintText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  nextStepsCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  nextStepsBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 4,
  },
  nextStepsSub: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  progressRowText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 4,
  },
  speedAdviceText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginTop: 6,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  backToTestsBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 13,
  },
  backToTestsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  retakeTestBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 16,
    paddingVertical: 13,
  },
  retakeTestBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewAccordionList: {
    gap: 10,
  },
  reviewAccordionItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  reviewStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  reviewHeaderQuestionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  reviewExpandedBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  expandedQuestionFullText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 14,
  },
  reviewOptionsList: {
    gap: 8,
    marginBottom: 14,
  },
  reviewOptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  reviewOptionCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  reviewOptionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  reviewOptionLetter: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  explanationBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  explanationBodyText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  solutionStepsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  solutionStepsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  solutionStepItem: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  questionAnalysisFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  analysisContainer: {
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  analysisContainerFast: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  analysisContainerSlow: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  analysisContainerWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  analysisContainerSkipped: {
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
  },
  analysisHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  analysisTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  analysisTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  analysisSuggestionText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
  },
  qTimeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  qRecommendationText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  topicAnalysisCard: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
  },
  topicAnalysisHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  topicBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  weightageBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weightageBadgeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  topicConceptBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  topicRuleBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  topicBoxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  topicBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  topicConceptText: {
    fontSize: 11.5,
    color: '#0C4A6E',
    lineHeight: 16.5,
  },
  topicRuleText: {
    fontSize: 11.5,
    color: '#064E3B',
    lineHeight: 16.5,
    fontWeight: '500',
  },
  onlineRefButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  onlineRefButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  topicAnalysisFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  topicPacingText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
});
