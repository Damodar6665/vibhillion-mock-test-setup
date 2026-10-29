// ==============================================================================
// SCREEN 8: RESULT SUMMARY SCREEN
// File: apps/student/src/app/exam/result.tsx
// ==============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '@vibhillion/shared';

export default function ExamResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const attemptId = (params.attemptId as string) || '';
  const examTitle = (params.examTitle as string) || 'SSC CGL T-1 (English)';
  const totalQuestions = Number(params.totalQuestions || 5);
  const attemptedCount = Number(params.attemptedCount || 0);
  const unattemptedCount = Number(params.unattemptedCount || 0);
  const correctCount = Number(params.correctCount || 0);
  const wrongCount = Number(params.wrongCount || 0);
  const finalScore = Number(params.finalScore || 0);
  const maximumScore = Number(params.maximumScore || 10);
  const accuracyPercentage = Number(params.accuracyPercentage || 0);
  const totalTimeSeconds = Number(params.totalTimeSeconds || 0);
  const rank = Number(params.rank || 1);
  const percentile = Number(params.percentile || 95.0);
  const answersJson = (params.answersJson as string) || '{}';

  const correctMarks = (correctCount * 2.0).toFixed(1);
  const negativeMarks = (wrongCount * 0.5).toFixed(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTag}>EXAM RESULT SUMMARY</Text>
        <Text style={styles.headerTitle}>{examTitle}</Text>
        <Text style={styles.headerSubtitle}>Submission final score and analytics</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Score Showcase Hero Card */}
        <View style={styles.scoreHeroCard}>
          <Text style={styles.heroScoreLabel}>Final Calculated Score</Text>
          <View style={styles.heroScoreRow}>
            <Text style={styles.heroScoreBig}>{finalScore.toFixed(1)}</Text>
            <Text style={styles.heroScoreTotal}>/ {maximumScore.toFixed(1)} Marks</Text>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroMetricsGrid}>
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricVal}>{accuracyPercentage.toFixed(1)}%</Text>
              <Text style={styles.heroMetricLabel}>Accuracy</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricVal}>Rank #{rank}</Text>
              <Text style={styles.heroMetricLabel}>{percentile}%ile</Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricVal}>{formatDuration(totalTimeSeconds)}</Text>
              <Text style={styles.heroMetricLabel}>Time Spent</Text>
            </View>
          </View>
        </View>

        {/* Breakdown of Marks */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Marking Breakdown Formula</Text>
          <View style={styles.formulaRow}>
            <View style={styles.formulaCell}>
              <Text style={styles.formulaLabel}>Positive Marks</Text>
              <Text style={[styles.formulaValue, { color: '#059669' }]}>+{correctMarks}</Text>
              <Text style={styles.formulaSub}>({correctCount} × 2.0)</Text>
            </View>
            <Text style={styles.formulaSign}>−</Text>
            <View style={styles.formulaCell}>
              <Text style={styles.formulaLabel}>Negative Penalty</Text>
              <Text style={[styles.formulaValue, { color: '#DC2626' }]}>−{negativeMarks}</Text>
              <Text style={styles.formulaSub}>({wrongCount} × 0.5)</Text>
            </View>
            <Text style={styles.formulaSign}>=</Text>
            <View style={styles.formulaCell}>
              <Text style={styles.formulaLabel}>Net Score</Text>
              <Text style={[styles.formulaValue, { color: '#2563EB' }]}>{finalScore.toFixed(1)}</Text>
              <Text style={styles.formulaSub}>Marks</Text>
            </View>
          </View>
        </View>

        {/* Question Stats Grid */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Questions Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="help-circle" size={20} color="#2563EB" />
              <Text style={styles.statNum}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>Total Qs</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="finger-print" size={20} color="#3B82F6" />
              <Text style={styles.statNum}>{attemptedCount}</Text>
              <Text style={styles.statLabel}>Attempted</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[styles.statNum, { color: '#10B981' }]}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Text style={[styles.statNum, { color: '#EF4444' }]}>{wrongCount}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="remove-circle-outline" size={20} color="#64748B" />
              <Text style={styles.statNum}>{unattemptedCount}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
          </View>
        </View>

        {/* Section Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Section Performance</Text>
          <View style={styles.secRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.secName}>English Comprehension</Text>
              <Text style={styles.secDetails}>
                {correctCount} Correct • {wrongCount} Wrong • {unattemptedCount} Skipped
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.secScore}>{finalScore.toFixed(1)} / {maximumScore.toFixed(1)}</Text>
              <Text style={styles.secAcc}>{accuracyPercentage.toFixed(1)}% Acc</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Screen 9 & Screen 10 */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.solutionBtn}
            onPress={() =>
              router.push({
                pathname: '/exam/solution',
                params: { attemptId, answersJson },
              })
            }
          >
            <Ionicons name="list" size={20} color="#FFFFFF" />
            <Text style={styles.solutionBtnText}>View Question-wise Solutions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.analysisBtn}
            onPress={() =>
              router.push({
                pathname: '/exam/performance',
                params: { attemptId, answersJson },
              })
            }
          >
            <Ionicons name="analytics" size={20} color="#2563EB" />
            <Text style={styles.analysisBtnText}>Deep Topic & Pacing Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(tabs)/tests')}
          >
            <Ionicons name="arrow-back" size={18} color="#64748B" />
            <Text style={styles.homeBtnText}>Back to Tests Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E3A8A' },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
  },
  headerTag: { fontSize: 11, fontWeight: '700', color: '#93C5FD', letterSpacing: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },
  headerSubtitle: { fontSize: 12, color: '#BFDBFE', marginTop: 2 },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  scoreHeroCard: {
    backgroundColor: '#1E40AF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroScoreLabel: { fontSize: 13, color: '#BFDBFE', fontWeight: '600' },
  heroScoreRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 },
  heroScoreBig: { fontSize: 44, fontWeight: '800', color: '#FFFFFF' },
  heroScoreTotal: { fontSize: 18, color: '#93C5FD', marginLeft: 8, fontWeight: '600' },
  heroDivider: { width: '100%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)', marginVertical: 16 },
  heroMetricsGrid: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center' },
  heroMetricItem: { alignItems: 'center' },
  heroMetricVal: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  heroMetricLabel: { fontSize: 11, color: '#BFDBFE', marginTop: 2 },
  heroMetricDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  formulaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  formulaCell: { alignItems: 'center', flex: 1 },
  formulaLabel: { fontSize: 11, color: '#64748B' },
  formulaValue: { fontSize: 17, fontWeight: '800', marginTop: 2 },
  formulaSub: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  formulaSign: { fontSize: 20, fontWeight: '700', color: '#94A3B8', paddingHorizontal: 4 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    marginHorizontal: 3,
  },
  statNum: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  statLabel: { fontSize: 10, color: '#64748B', marginTop: 2 },
  secRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  secName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  secDetails: { fontSize: 12, color: '#64748B', marginTop: 2 },
  secScore: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
  secAcc: { fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 2 },
  actionsContainer: { gap: 10, marginTop: 8 },
  solutionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  solutionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  analysisBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 8,
  },
  analysisBtnText: { color: '#2563EB', fontSize: 15, fontWeight: '700' },
  homeBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  homeBtnText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
});
