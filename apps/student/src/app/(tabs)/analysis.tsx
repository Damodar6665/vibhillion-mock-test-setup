// ==============================================================================
// TAB 4: ANALYSIS SCREEN
// File: apps/student/src/app/(tabs)/analysis.tsx
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AnalysisScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Overall Performance Analysis</Text>
        <Text style={styles.headerSubtitle}>Cross-exam analytics & weak-area tracker</Text>
      </View>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Performance Overview</Text>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Text style={styles.gridNum}>1</Text>
              <Text style={styles.gridLabel}>Tests Taken</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridNum}>81.8%</Text>
              <Text style={styles.gridLabel}>Avg Accuracy</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridNum}>34.0</Text>
              <Text style={styles.gridLabel}>Avg Score</Text>
            </View>
          </View>
        </View>

        {/* Section Accuracy */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Section Accuracy Breakdown</Text>
          <View style={styles.barItem}>
            <View style={styles.barHeader}>
              <Text style={styles.barName}>English Comprehension</Text>
              <Text style={styles.barPct}>80% (4/5)</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: '80%', backgroundColor: '#10B981' }]} />
            </View>
          </View>
          <View style={styles.barItem}>
            <View style={styles.barHeader}>
              <Text style={styles.barName}>Reasoning</Text>
              <Text style={styles.barPct}>Not attempted</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: '0%', backgroundColor: '#94A3B8' }]} />
            </View>
          </View>
        </View>

        {/* Action Prompt */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/(tabs)/tests')}
        >
          <Text style={styles.actionBtnText}>Attempt More Tests</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E3A8A' },
  header: { backgroundColor: '#1E3A8A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#93C5FD', marginTop: 2 },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  gridItem: { alignItems: 'center', flex: 1 },
  gridNum: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  gridLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  barItem: { marginBottom: 14 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barName: { fontSize: 13, fontWeight: '600', color: '#334155' },
  barPct: { fontSize: 12, color: '#64748B' },
  track: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  actionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
