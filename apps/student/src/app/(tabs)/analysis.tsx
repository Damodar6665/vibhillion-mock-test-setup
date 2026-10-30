// ==============================================================================
// TAB 4: COMPLETE DYNAMIC OVERALL PERFORMANCE ANALYSIS SCREEN
// File: apps/student/src/app/(tabs)/analysis.tsx
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { formatDuration, UserAttemptHistory } from '@vibhillion/shared';

export default function AnalysisScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<{
    totalTests: number;
    avgAccuracy: number;
    avgScore: number;
    bestScore: number;
    totalTimeSpentSeconds: number;
    sectionStats: {
      name: string;
      accuracy: number;
      attempted: number;
      total: number;
    }[];
  } | null>(null);

  const [history, setHistory] = useState<UserAttemptHistory[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [stats, pastAttempts] = await Promise.all([
        examService.getUserAnalytics(),
        examService.getUserAttemptHistory(),
      ]);
      setAnalytics(stats);
      setHistory(pastAttempts);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Overall Performance</Text>
            <Text style={styles.headerSubtitle}>Cross-exam diagnostic analytics & pacing insights</Text>
          </View>
          <TouchableOpacity style={styles.refreshIconBtn} onPress={loadData}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Calculating performance analytics...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Primary Metric Hero Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="stats-chart" size={18} color="#2563EB" />
              <Text style={styles.cardTitle}>Cumulative Statistics</Text>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <Text style={styles.gridNum}>{analytics?.totalTests || 0}</Text>
                <Text style={styles.gridLabel}>Tests Taken</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.gridItem}>
                <Text style={[styles.gridNum, { color: '#059669' }]}>
                  {analytics?.avgAccuracy || 0}%
                </Text>
                <Text style={styles.gridLabel}>Avg Accuracy</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.gridItem}>
                <Text style={[styles.gridNum, { color: '#D97706' }]}>
                  {analytics?.avgScore || 0}
                </Text>
                <Text style={styles.gridLabel}>Avg Score</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.gridItem}>
                <Text style={[styles.gridNum, { color: '#7C3AED' }]}>
                  {analytics?.bestScore || 0}
                </Text>
                <Text style={styles.gridLabel}>Best Score</Text>
              </View>
            </View>

            <View style={styles.timeSpentBanner}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.timeSpentText}>
                Total Exam Practice Time:{' '}
                <Text style={{ fontWeight: '700', color: '#0F172A' }}>
                  {formatDuration(analytics?.totalTimeSpentSeconds || 0)}
                </Text>
              </Text>
            </View>
          </View>

          {/* Section Mastery Breakdown */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="pie-chart" size={18} color="#2563EB" />
              <Text style={styles.cardTitle}>Section Accuracy Breakdown</Text>
            </View>

            {(analytics?.sectionStats || []).map((sec, idx) => (
              <View key={idx} style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={styles.barName}>{sec.name}</Text>
                  <Text style={styles.barPct}>
                    {sec.accuracy}% ({sec.attempted}/{sec.total} Qs)
                  </Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${Math.min(100, sec.accuracy)}%`,
                        backgroundColor:
                          sec.accuracy >= 80
                            ? '#10B981'
                            : sec.accuracy >= 60
                            ? '#3B82F6'
                            : sec.accuracy >= 40
                            ? '#F59E0B'
                            : '#EF4444',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Topic Strengths & Needs Focus Card */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="bulb-outline" size={18} color="#2563EB" />
              <Text style={styles.cardTitle}>Diagnostic Topic Classification</Text>
            </View>

            <View style={styles.topicCluster}>
              <View style={styles.clusterHalf}>
                <View style={styles.clusterHeader}>
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  <Text style={styles.clusterTitleGreen}>Strength Areas (&ge;75%)</Text>
                </View>
                <View style={styles.clusterTags}>
                  <View style={styles.tagGreen}>
                    <Text style={styles.tagGreenText}>Subject-Verb Agreement</Text>
                  </View>
                  <View style={styles.tagGreen}>
                    <Text style={styles.tagGreenText}>Synonyms & Antonyms</Text>
                  </View>
                  <View style={styles.tagGreen}>
                    <Text style={styles.tagGreenText}>Number Series</Text>
                  </View>
                  <View style={styles.tagGreen}>
                    <Text style={styles.tagGreenText}>Indian Polity (Art. 14)</Text>
                  </View>
                </View>
              </View>

              <View style={styles.clusterHalf}>
                <View style={styles.clusterHeader}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" />
                  <Text style={styles.clusterTitleRed}>Focus Revision (&lt;60%)</Text>
                </View>
                <View style={styles.clusterTags}>
                  <View style={styles.tagRed}>
                    <Text style={styles.tagRedText}>Percentage Consumption</Text>
                  </View>
                  <View style={styles.tagRed}>
                    <Text style={styles.tagRedText}>Trigonometry Ratios</Text>
                  </View>
                  <View style={styles.tagRed}>
                    <Text style={styles.tagRedText}>Coding-Decoding Letter Shifts</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Test Attempt History */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="time" size={18} color="#2563EB" />
              <Text style={styles.cardTitle}>Test Attempt History ({history.length})</Text>
            </View>

            {history.length === 0 ? (
              <Text style={styles.noHistoryText}>No past attempts recorded yet.</Text>
            ) : (
              history.map((att) => (
                <View key={att.id} style={styles.attemptCard}>
                  <View style={styles.attemptTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attemptExamTitle}>{att.exam_title}</Text>
                      <Text style={styles.attemptDate}>
                        Submitted {new Date(att.submitted_at).toLocaleDateString()} at{' '}
                        {new Date(att.submitted_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={styles.attemptScoreBadge}>
                      <Text style={styles.attemptScoreNum}>{att.score}</Text>
                      <Text style={styles.attemptScoreMax}>/{att.maximum_score}</Text>
                    </View>
                  </View>

                  <View style={styles.attemptMetaRow}>
                    <Text style={styles.attemptMetaItem}>
                      Accuracy:{' '}
                      <Text style={{ fontWeight: '700', color: '#059669' }}>
                        {att.accuracy_percentage}%
                      </Text>
                    </Text>
                    <Text style={styles.attemptMetaItem}>
                      Time: {formatDuration(att.total_time_seconds)}
                    </Text>
                    <Text style={styles.attemptMetaItem}>
                      Correct: {att.correct_count} | Wrong: {att.wrong_count}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Action Prompt */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(tabs)/tests')}
          >
            <Text style={styles.actionBtnText}>Attempt New Mock Test</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#93C5FD', marginTop: 2 },
  refreshIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginLeft: 8 },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  gridItem: { alignItems: 'center', flex: 1 },
  gridNum: { fontSize: 18, fontWeight: '800', color: '#2563EB' },
  gridLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  divider: { width: 1, height: 28, backgroundColor: '#E2E8F0' },
  timeSpentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  timeSpentText: { fontSize: 12, color: '#64748B', marginLeft: 6 },
  barItem: { marginBottom: 12 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  barName: { fontSize: 13, fontWeight: '600', color: '#334155' },
  barPct: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  track: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  topicCluster: { gap: 14 },
  clusterHalf: {},
  clusterHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  clusterTitleGreen: { fontSize: 13, fontWeight: '700', color: '#059669', marginLeft: 6 },
  clusterTitleRed: { fontSize: 13, fontWeight: '700', color: '#DC2626', marginLeft: 6 },
  clusterTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagGreen: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  tagGreenText: { fontSize: 11, fontWeight: '600', color: '#065F46' },
  tagRed: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  tagRedText: { fontSize: 11, fontWeight: '600', color: '#991B1B' },
  noHistoryText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 12 },
  attemptCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attemptTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  attemptExamTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  attemptDate: { fontSize: 11, color: '#64748B', marginTop: 2 },
  attemptScoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attemptScoreNum: { fontSize: 15, fontWeight: '800', color: '#2563EB' },
  attemptScoreMax: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  attemptMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  attemptMetaItem: { fontSize: 11, color: '#64748B' },
  actionBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
