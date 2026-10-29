// ==============================================================================
// SCREEN 10: PERFORMANCE & TOPIC ANALYSIS
// File: apps/student/src/app/exam/performance.tsx
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
import { analyzeTopicPerformance, TopicPerformance } from '@vibhillion/shared';

export default function ExamPerformanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const attemptId = (params.attemptId as string) || '';
  const answersJson = (params.answersJson as string) || '{}';

  const [loading, setLoading] = useState(true);
  const [topicStats, setTopicStats] = useState<TopicPerformance[]>([]);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [strongTopics, setStrongTopics] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [avgTime, setAvgTime] = useState(0);
  const [slowQuestions, setSlowQuestions] = useState<number[]>([]);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        setLoading(true);
        let localAnswers = {};
        try {
          localAnswers = JSON.parse(answersJson);
        } catch {}

        const questions = await examService.getSolutions(attemptId, localAnswers);
        const analysis = analyzeTopicPerformance(questions);

        setTopicStats(analysis.topics);
        setWeakTopics(analysis.weakTopics);
        setStrongTopics(analysis.strongTopics);
        setRecommendations(analysis.recommendations);
        setAvgTime(analysis.averageTimePerQuestion);
        setSlowQuestions(analysis.slowQuestions);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [attemptId, answersJson]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Performance Analysis</Text>
          <Text style={styles.headerSubtitle}>Topic-wise breakdown & pacing diagnostics</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Analyzing test attempt...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Diagnostic Speed Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pacing & Speed Diagnostics</Text>
            <View style={styles.speedRow}>
              <View style={styles.speedBox}>
                <Ionicons name="speedometer-outline" size={24} color="#2563EB" />
                <Text style={styles.speedNum}>{avgTime}s</Text>
                <Text style={styles.speedLabel}>Avg per Question</Text>
              </View>
              <View style={styles.speedBox}>
                <Ionicons name="hourglass-outline" size={24} color={slowQuestions.length > 0 ? '#EF4444' : '#10B981'} />
                <Text style={styles.speedNum}>{slowQuestions.length}</Text>
                <Text style={styles.speedLabel}>Slow Qs (&gt;90s)</Text>
              </View>
            </View>

            {slowQuestions.length > 0 && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={16} color="#DC2626" />
                <Text style={styles.warningText}>
                  Questions {slowQuestions.join(', ')} exceeded recommended 90s solving threshold.
                </Text>
              </View>
            )}
          </View>

          {/* Topic Strengths & Weaknesses */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Skill Strengths & Weaknesses</Text>
            
            <View style={styles.tagSection}>
              <Text style={styles.tagSectionLabel}>Strong Topics (≥ 75% accuracy):</Text>
              <View style={styles.tagWrap}>
                {strongTopics.length > 0 ? (
                  strongTopics.map((t, idx) => (
                    <View key={idx} style={[styles.badgePill, { backgroundColor: '#DEF7EC' }]}>
                      <Ionicons name="checkmark-circle" size={14} color="#03543F" />
                      <Text style={[styles.badgePillText, { color: '#03543F' }]}>{t}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyNote}>No topics reached ≥ 75% threshold yet.</Text>
                )}
              </View>
            </View>

            <View style={[styles.tagSection, { marginTop: 12 }]}>
              <Text style={styles.tagSectionLabel}>Focus Areas (&lt; 50% accuracy):</Text>
              <View style={styles.tagWrap}>
                {weakTopics.length > 0 ? (
                  weakTopics.map((t, idx) => (
                    <View key={idx} style={[styles.badgePill, { backgroundColor: '#FDE8E8' }]}>
                      <Ionicons name="alert-circle" size={14} color="#9B1C1C" />
                      <Text style={[styles.badgePillText, { color: '#9B1C1C' }]}>{t}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyNote}>No weak topics identified in this session!</Text>
                )}
              </View>
            </View>
          </View>

          {/* Detailed Topic Accuracy Bars */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Topic-wise Performance Detail</Text>
            {topicStats.map((item, idx) => (
              <View key={idx} style={styles.topicItem}>
                <View style={styles.topicHeader}>
                  <Text style={styles.topicName}>{item.topic}</Text>
                  <Text style={styles.topicScoreText}>
                    {item.correct}/{item.attempted} ({item.accuracy}%)
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(100, Math.max(5, item.accuracy))}%`,
                        backgroundColor:
                          item.accuracy >= 75
                            ? '#10B981'
                            : item.accuracy >= 50
                            ? '#3B82F6'
                            : '#EF4444',
                      },
                    ]}
                  />
                </View>

                <View style={styles.topicMetaRow}>
                  <Text style={styles.topicMeta}>Total: {item.total_questions} Qs</Text>
                  <Text style={styles.topicMeta}>Avg Time: {item.average_time_seconds}s</Text>
                  <Text style={styles.topicMeta}>Wrong: {item.wrong}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Actionable Rule-Based Recommendations */}
          <View style={styles.recommendationsCard}>
            <View style={styles.recHeaderRow}>
              <Ionicons name="sparkles" size={20} color="#2563EB" />
              <Text style={styles.recCardTitle}>Targeted Revision Strategy</Text>
            </View>
            <Text style={styles.recSub}>
              Based on empirical question times, error patterns, and syllabus weightage:
            </Text>

            {recommendations.map((rec, idx) => (
              <View key={idx} style={styles.recItem}>
                <Ionicons name="chevron-forward-circle" size={16} color="#2563EB" />
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Action Footer */}
          <TouchableOpacity
            style={styles.backTestsBtn}
            onPress={() => router.replace('/(tabs)/tests')}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            <Text style={styles.backTestsBtnText}>Return to Tests</Text>
          </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  speedRow: { flexDirection: 'row', gap: 12 },
  speedBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  speedNum: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  speedLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: { fontSize: 12, color: '#991B1B', flex: 1 },
  tagSection: { marginBottom: 6 },
  tagSectionLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 6 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgePillText: { fontSize: 11, fontWeight: '700' },
  emptyNote: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic' },
  topicItem: { marginBottom: 14 },
  topicHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  topicName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  topicScoreText: { fontSize: 12, fontWeight: '600', color: '#2563EB' },
  barTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  topicMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  topicMeta: { fontSize: 11, color: '#64748B' },
  recommendationsCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 20,
  },
  recHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  recCardTitle: { fontSize: 15, fontWeight: '700', color: '#1E3A8A' },
  recSub: { fontSize: 12, color: '#3B82F6', marginBottom: 12 },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  recText: { fontSize: 13, color: '#1E3A8A', lineHeight: 18, flex: 1 },
  backTestsBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  backTestsBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
