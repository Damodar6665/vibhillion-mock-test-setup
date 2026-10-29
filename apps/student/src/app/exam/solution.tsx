// ==============================================================================
// SCREEN 9: QUESTION-WISE ANALYSIS & SOLUTIONS
// File: apps/student/src/app/exam/solution.tsx
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { QuestionAnalysis } from '@vibhillion/shared';

export default function ExamSolutionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const attemptId = (params.attemptId as string) || '';
  const answersJson = (params.answersJson as string) || '{}';

  const [solutions, setSolutions] = useState<QuestionAnalysis[]>([]);
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSolutions() {
      try {
        setLoading(true);
        let localAnswers = {};
        try {
          localAnswers = JSON.parse(answersJson);
        } catch {}

        const data = await examService.getSolutions(attemptId, localAnswers);
        setSolutions(data);
      } finally {
        setLoading(false);
      }
    }
    loadSolutions();
  }, [attemptId, answersJson]);

  const filteredSolutions = solutions.filter((item) => {
    if (filter === 'correct') return item.is_correct === true;
    if (filter === 'wrong') return item.user_selected_option_id && item.is_correct === false;
    if (filter === 'unattempted') return !item.user_selected_option_id;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Solutions & Explanations</Text>
          <Text style={styles.headerSubtitle}>Official answer keys and step-by-step guidance</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({solutions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'correct' && styles.filterPillActive]}
          onPress={() => setFilter('correct')}
        >
          <Text style={[styles.filterText, filter === 'correct' && styles.filterTextActive]}>
            Correct ({solutions.filter((s) => s.is_correct).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'wrong' && styles.filterPillActive]}
          onPress={() => setFilter('wrong')}
        >
          <Text style={[styles.filterText, filter === 'wrong' && styles.filterTextActive]}>
            Wrong ({solutions.filter((s) => s.user_selected_option_id && !s.is_correct).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'unattempted' && styles.filterPillActive]}
          onPress={() => setFilter('unattempted')}
        >
          <Text style={[styles.filterText, filter === 'unattempted' && styles.filterTextActive]}>
            Skipped ({solutions.filter((s) => !s.user_selected_option_id).length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading verified solutions...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {filteredSolutions.map((item) => {
            const isAttempted = Boolean(item.user_selected_option_id);
            const isCorrect = item.is_correct;

            return (
              <View key={item.question_id} style={styles.qCard}>
                {/* Q-Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.qNumBadge}>
                    <Text style={styles.qNumText}>Q{item.question_number}</Text>
                  </View>

                  <View style={styles.headerRight}>
                    {/* Status Badge */}
                    {isCorrect ? (
                      <View style={[styles.statusBadge, { backgroundColor: '#DEF7EC' }]}>
                        <Ionicons name="checkmark-circle" size={14} color="#03543F" />
                        <Text style={[styles.statusBadgeText, { color: '#03543F' }]}>Correct (+2.0)</Text>
                      </View>
                    ) : isAttempted ? (
                      <View style={[styles.statusBadge, { backgroundColor: '#FDE8E8' }]}>
                        <Ionicons name="close-circle" size={14} color="#9B1C1C" />
                        <Text style={[styles.statusBadgeText, { color: '#9B1C1C' }]}>Incorrect (-0.5)</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
                        <Ionicons name="remove-circle-outline" size={14} color="#4B5563" />
                        <Text style={[styles.statusBadgeText, { color: '#4B5563' }]}>Unattempted (0.0)</Text>
                      </View>
                    )}

                    <Text style={styles.timeSpentText}>
                      <Ionicons name="time-outline" size={12} color="#64748B" /> {item.time_spent_seconds}s
                    </Text>
                  </View>
                </View>

                {/* Topic & Subtopic */}
                <Text style={styles.topicBreadcrumb}>
                  {item.topic} • {item.subtopic}
                </Text>

                {/* Question Text */}
                <Text style={styles.qText}>{item.question_text}</Text>

                {/* Options List with Visual State */}
                <View style={styles.optionsList}>
                  {item.options.map((opt) => {
                    const isUserChoice = item.user_selected_option_id === opt.id;
                    const isCorrectAnswer = item.correct_option_id === opt.id;

                    let optBg = '#FFFFFF';
                    let optBorder = '#E2E8F0';
                    let labelBg = '#F1F5F9';
                    let labelColor = '#334155';

                    if (isCorrectAnswer) {
                      optBg = '#DEF7EC';
                      optBorder = '#10B981';
                      labelBg = '#10B981';
                      labelColor = '#FFFFFF';
                    } else if (isUserChoice && !isCorrectAnswer) {
                      optBg = '#FDE8E8';
                      optBorder = '#EF4444';
                      labelBg = '#EF4444';
                      labelColor = '#FFFFFF';
                    }

                    return (
                      <View
                        key={opt.id}
                        style={[styles.optionRow, { backgroundColor: optBg, borderColor: optBorder }]}
                      >
                        <View style={[styles.optionCircle, { backgroundColor: labelBg }]}>
                          <Text style={[styles.optionCircleText, { color: labelColor }]}>
                            {opt.label}
                          </Text>
                        </View>
                        <Text style={styles.optionText}>{opt.text}</Text>
                        {isCorrectAnswer && (
                          <View style={styles.badgeCorrect}>
                            <Text style={styles.badgeCorrectText}>Correct Answer</Text>
                          </View>
                        )}
                        {isUserChoice && !isCorrectAnswer && (
                          <View style={styles.badgeYourChoice}>
                            <Text style={styles.badgeYourChoiceText}>Your Choice</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Detailed Explanation */}
                <View style={styles.solutionBox}>
                  <View style={styles.solutionTitleRow}>
                    <Ionicons name="bulb" size={18} color="#D97706" />
                    <Text style={styles.solutionTitle}>Explanation:</Text>
                  </View>
                  <Text style={styles.solutionBody}>{item.explanation}</Text>

                  {/* Step by Step Breakdown */}
                  {item.solution_steps && item.solution_steps.length > 0 && (
                    <View style={styles.stepsWrap}>
                      <Text style={styles.stepsHeading}>Step-by-step Solution:</Text>
                      {item.solution_steps.map((st, i) => (
                        <Text key={i} style={styles.stepText}>
                          {i + 1}. {st}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Next Step Recommendation */}
                  {item.recommendation && (
                    <View style={styles.recommendationWrap}>
                      <Text style={styles.recLabel}>Recommendation:</Text>
                      <Text style={styles.recText}>{item.recommendation}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E3A8A' },
  header: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 11, color: '#BFDBFE', marginTop: 1 },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: { backgroundColor: '#2563EB' },
  filterText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '700' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  qCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  qNumBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qNumText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  timeSpentText: { fontSize: 11, color: '#64748B' },
  topicBreadcrumb: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 8 },
  qText: { fontSize: 15, color: '#0F172A', lineHeight: 22, fontWeight: '500', marginBottom: 14 },
  optionsList: { gap: 8, marginBottom: 14 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  optionCircleText: { fontSize: 12, fontWeight: '800' },
  optionText: { fontSize: 13, color: '#1E293B', flex: 1, lineHeight: 18 },
  badgeCorrect: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeCorrectText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  badgeYourChoice: { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeYourChoiceText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  solutionBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  solutionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  solutionTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  solutionBody: { fontSize: 13, color: '#78350F', lineHeight: 19 },
  stepsWrap: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#FDE68A', paddingTop: 6 },
  stepsHeading: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  stepText: { fontSize: 12, color: '#92400E', lineHeight: 17, marginBottom: 2 },
  recommendationWrap: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  recLabel: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  recText: { fontSize: 12, color: '#334155', marginTop: 2, lineHeight: 16 },
});
