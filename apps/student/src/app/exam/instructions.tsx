// ==============================================================================
// VIBHILLION AI: TEST INSTRUCTIONS (MATCHING SCREENSHOTS 4 & 5)
// File: apps/student/src/app/exam/instructions.tsx
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TestInstructionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examId = (params.examId as string) || 'e0000001-0000-0000-0000-000000000001';
  const paperTitle =
    (params.paperTitle as string) || 'SSC CGL T-I (Held on 12 Sep 2025 S1) – English';

  const [hasAgreed, setHasAgreed] = useState(false);

  const handleContinue = () => {
    if (!hasAgreed) return;
    router.push({
      pathname: '/exam/configure',
      params: {
        examId,
        paperTitle,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0D9488" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {paperTitle}
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO ICON & TITLE */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="document-text-outline" size={32} color="#0D9488" />
          </View>
          <Text style={styles.paperTitleText}>{paperTitle}</Text>
          <Text style={styles.categorySubText}>SSC</Text>
        </View>

        {/* 3 STAT BADGES */}
        <View style={styles.statBadgesRow}>
          {/* Duration */}
          <View style={[styles.statBadge, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="time-outline" size={22} color="#0D9488" />
            <Text style={[styles.statValue, { color: '#0F172A' }]}>60</Text>
            <Text style={styles.statLabel}>minutes</Text>
          </View>

          {/* Total Questions */}
          <View style={[styles.statBadge, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="disc-outline" size={22} color="#EA580C" />
            <Text style={[styles.statValue, { color: '#0F172A' }]}>100</Text>
            <Text style={styles.statLabel}>questions</Text>
          </View>

          {/* Difficulty */}
          <View style={[styles.statBadge, { backgroundColor: '#FAF5FF' }]}>
            <Text style={[styles.statValue, { color: '#D97706', fontSize: 16, marginTop: 4 }]}>
              Medium
            </Text>
            <Text style={styles.statLabel}>difficulty</Text>
          </View>
        </View>

        {/* MARKING SCHEME CARD */}
        <Text style={styles.sectionHeaderTitle}>Marking scheme</Text>
        <View style={styles.cardContainer}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Duration</Text>
            <Text style={styles.tableValue}>60 minutes</Text>
          </View>
          <View style={styles.tableDivider} />

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Total questions</Text>
            <Text style={styles.tableValue}>100</Text>
          </View>
          <View style={styles.tableDivider} />

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Marks per question</Text>
            <Text style={[styles.tableValue, { color: '#059669', fontWeight: '700' }]}>+2</Text>
          </View>
          <View style={styles.tableDivider} />

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Negative marking</Text>
            <Text style={[styles.tableValue, { color: '#DC2626', fontWeight: '700' }]}>
              -0.5 per wrong answer
            </Text>
          </View>
          <View style={styles.tableDivider} />

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Unattempted</Text>
            <Text style={styles.tableValue}>No penalty</Text>
          </View>
        </View>

        {/* QUESTION PALETTE LEGEND */}
        <Text style={styles.sectionHeaderTitle}>Question palette</Text>
        <View style={styles.cardContainer}>
          <View style={styles.legendRow}>
            <View style={[styles.legendSquare, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendLabel}>Answered</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendSquare, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendLabel}>Not answered (visited but skipped)</Text>
          </View>

          <View style={styles.legendRow}>
            <View style={[styles.legendSquare, { backgroundColor: '#A855F7' }]} />
            <Text style={styles.legendLabel}>Marked for review</Text>
          </View>

          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendSquare,
                { backgroundColor: '#A855F7', position: 'relative' },
              ]}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: '#22C55E',
                }}
              />
            </View>
            <Text style={styles.legendLabel}>Answered + marked for review</Text>
          </View>

          <View style={styles.legendRow}>
            <View
              style={[
                styles.legendSquare,
                { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#CBD5E1' },
              ]}
            />
            <Text style={styles.legendLabel}>Not visited yet</Text>
          </View>
        </View>

        {/* INSTRUCTIONS LIST */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
          <Ionicons name="list" size={18} color="#0D9488" style={{ marginRight: 6 }} />
          <Text style={[styles.sectionHeaderTitle, { marginTop: 0, marginBottom: 0 }]}>
            Instructions
          </Text>
        </View>

        <View style={styles.cardContainer}>
          {[
            'The test contains 100 questions to be attempted in 60 minutes.',
            'Each correct answer carries 2 mark. 0.5 marks deducted for incorrect answers.',
            'Navigate between questions using the question palette (grid icon in the bottom bar).',
            'Use "Mark" in the top bar to flag a question for review; the palette shows marked questions in purple.',
            '"Mark & Next" marks the current question and advances in one tap - useful when you want to come back later.',
            'Answers are auto-saved as you work. Reopening the app resumes your saved attempt; timed tests keep running. Choosing Quit ends the attempt.',
          ].map((instruction, idx) => (
            <View key={idx} style={styles.instructionRow}>
              <View style={styles.numBadge}>
                <Text style={styles.numBadgeText}>{idx + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {/* WARNING BANNER */}
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={20} color="#D97706" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={styles.warningText}>
            In timed mode, the timer cannot be paused. Refreshing or reopening the app does not reset time.
          </Text>
        </View>

        {/* AGREEMENT CHECKBOX */}
        <TouchableOpacity
          style={styles.checkboxRow}
          activeOpacity={0.8}
          onPress={() => setHasAgreed(!hasAgreed)}
        >
          <View
            style={[
              styles.checkboxBox,
              hasAgreed && { backgroundColor: '#0D9488', borderColor: '#0D9488' },
            ]}
          >
            {hasAgreed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I have read and understood all the instructions above. I am ready to begin the test.
          </Text>
        </TouchableOpacity>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
          style={[styles.continueBtn, !hasAgreed && styles.continueBtnDisabled]}
          activeOpacity={hasAgreed ? 0.85 : 1}
          onPress={handleContinue}
          disabled={!hasAgreed}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
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
  heroSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  paperTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 24,
  },
  categorySubText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '500',
  },
  statBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  statBadge: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 10,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tableLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  tableValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  legendSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 12,
  },
  legendLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  numBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  numBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  instructionText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 12,
    color: '#B45309',
    flex: 1,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 6,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    lineHeight: 18,
  },
  continueBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 26,
    paddingVertical: 14,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnDisabled: {
    backgroundColor: '#94D3CD',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
