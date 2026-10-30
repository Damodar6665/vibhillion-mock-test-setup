// ==============================================================================
// SCREEN 5: TEST INSTRUCTIONS & MODE SELECTION
// File: apps/student/src/app/exam/instructions.tsx
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
import { Exam } from '@vibhillion/shared';

export default function TestInstructionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examId = (params.examId as string) || 'e0000001-0000-0000-0000-000000000001';
  const sectionId = (params.sectionId as string) || 'a0000001-0000-0000-0000-000000000001';
  const sectionName = (params.sectionName as string) || 'English Comprehension';

  const [exam, setExam] = useState<Exam | null>(null);
  const [selectedMode, setSelectedMode] = useState<'timed' | 'practice'>('timed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExam() {
      try {
        setLoading(true);
        const data = await examService.getExamDetails(examId);
        setExam(data);
      } finally {
        setLoading(false);
      }
    }
    loadExam();
  }, [examId]);

  const handleStartTest = () => {
    if (selectedMode === 'timed') {
      router.push({
        pathname: '/exam/timed',
        params: { examId, sectionId, sectionName },
      });
    } else {
      router.push({
        pathname: '/exam/practice',
        params: { examId, sectionId, sectionName },
      });
    }
  };

  if (loading || !exam) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading test guidelines...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Test Instructions</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Test Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.examTag}>SSC CGL Tier-1 Previous Year Paper</Text>
          <Text style={styles.examTitle}>{exam.title}</Text>
          <Text style={styles.sectionHighlight}>Active Section: {sectionName}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>Total Questions</Text>
              <Text style={styles.metaValue}>25</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>Section Duration</Text>
              <Text style={styles.metaValue}>15 Mins</Text>
            </View>
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>Max Marks</Text>
              <Text style={styles.metaValue}>50.0</Text>
            </View>
          </View>
        </View>

        {/* Official Marking Scheme */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Marking Scheme</Text>

          <View style={styles.markingRow}>
            <View style={[styles.markingBadge, { backgroundColor: '#DEF7EC' }]}>
              <Ionicons name="add-circle" size={18} color="#03543F" />
              <Text style={[styles.markingBadgeText, { color: '#03543F' }]}>+2.0 Marks</Text>
            </View>
            <Text style={styles.markingDesc}>For each correct answer</Text>
          </View>

          <View style={styles.markingRow}>
            <View style={[styles.markingBadge, { backgroundColor: '#FDE8E8' }]}>
              <Ionicons name="remove-circle" size={18} color="#9B1C1C" />
              <Text style={[styles.markingBadgeText, { color: '#9B1C1C' }]}>-0.5 Marks</Text>
            </View>
            <Text style={styles.markingDesc}>Penalty for each incorrect answer</Text>
          </View>

          <View style={styles.markingRow}>
            <View style={[styles.markingBadge, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="ellipse-outline" size={18} color="#4B5563" />
              <Text style={[styles.markingBadgeText, { color: '#4B5563' }]}>0.0 Marks</Text>
            </View>
            <Text style={styles.markingDesc}>No penalty for unattempted questions</Text>
          </View>
        </View>

        {/* Mode Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Choose Exam Mode</Text>

          <TouchableOpacity
            style={[styles.modeCard, selectedMode === 'timed' && styles.modeCardActive]}
            onPress={() => setSelectedMode('timed')}
          >
            <View style={styles.modeRadio}>
              {selectedMode === 'timed' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.modeTextContainer}>
              <View style={styles.modeHeaderRow}>
                <Text style={styles.modeTitle}>Timed Mode</Text>
                <View style={styles.modePill}>
                  <Text style={styles.modePillText}>Exam Simulation</Text>
                </View>
              </View>
              <Text style={styles.modeDesc}>
                Strict decreasing countdown timer (15 mins). Auto-submits on timeout. Exact SSC CGL interface conditions.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, selectedMode === 'practice' && styles.modeCardActive]}
            onPress={() => setSelectedMode('practice')}
          >
            <View style={styles.modeRadio}>
              {selectedMode === 'practice' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.modeTextContainer}>
              <View style={styles.modeHeaderRow}>
                <Text style={styles.modeTitle}>Practice Mode</Text>
                <View style={[styles.modePill, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.modePillText, { color: '#92400E' }]}>Self-Paced</Text>
                </View>
              </View>
              <Text style={styles.modeDesc}>
                No time pressure. Timer counts forward from 00:00. View instant explanations and step-by-step solutions at your own pace.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* General Guidelines */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Exam Guidelines</Text>
          <Text style={styles.bulletText}>• You can navigate between questions using Previous and Next buttons.</Text>
          <Text style={styles.bulletText}>• Use 'Mark for Review' to bookmark questions for second checks.</Text>
          <Text style={styles.bulletText}>• Answers are saved automatically in real time.</Text>
          <Text style={styles.bulletText}>• Do not close the app or navigate away during timed examination.</Text>
        </View>
      </ScrollView>

      {/* Start Button Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
          <Text style={styles.startButtonText}>
            Start {selectedMode === 'timed' ? 'Timed Test' : 'Practice Session'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16, paddingBottom: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  examTag: { fontSize: 11, fontWeight: '700', color: '#2563EB', textTransform: 'uppercase' },
  examTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginTop: 4, lineHeight: 22 },
  sectionHighlight: { fontSize: 13, fontWeight: '600', color: '#059669', marginTop: 4 },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  metaCell: { alignItems: 'center', flex: 1 },
  metaLabel: { fontSize: 11, color: '#64748B' },
  metaValue: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  markingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  markingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    minWidth: 104,
  },
  markingBadgeText: { fontSize: 12, fontWeight: '700' },
  markingDesc: { fontSize: 13, color: '#334155', marginLeft: 10, flex: 1 },
  modeCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  modeCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  modeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  modeTextContainer: { flex: 1 },
  modeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modeTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  modePill: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  modePillText: { fontSize: 11, fontWeight: '700', color: '#03543F' },
  modeDesc: { fontSize: 12, color: '#64748B', lineHeight: 17 },
  bulletText: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 6 },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  startButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
