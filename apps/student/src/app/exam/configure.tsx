// ==============================================================================
// VIBHILLION AI: CONFIGURE TEST (MATCHING SCREENSHOT 6)
// File: apps/student/src/app/exam/configure.tsx
// ==============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ConfigureTestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examId = (params.examId as string) || 'e0000001-0000-0000-0000-000000000001';
  const paperTitle =
    (params.paperTitle as string) || 'SSC CGL T-I (Held on 12 Sep 2025 S1) – English';

  const [mode, setMode] = useState<'timed' | 'practice'>('timed');

  const handleStart = () => {
    if (mode === 'timed') {
      router.push({
        pathname: '/exam/timed',
        params: {
          examId,
          paperTitle,
        },
      });
    } else {
      router.push({
        pathname: '/exam/practice',
        params: {
          examId,
          paperTitle,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0D9488" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Test</Text>
      </View>

      <View style={styles.container}>
        {/* PAPER DETAILS */}
        <View style={styles.paperDetailsBox}>
          <Text style={styles.paperTitle}>{paperTitle}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>60 min</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>100 questions</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={[styles.metaText, { color: '#D97706', fontWeight: '700' }]}>
              Medium
            </Text>
          </View>
        </View>

        {/* SELECT TEST MODE SECTION */}
        <Text style={styles.sectionTitle}>Select Test Mode</Text>

        <View style={styles.modesRow}>
          {/* Timed Mode */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              mode === 'timed' && styles.modeCardActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setMode('timed')}
          >
            <View
              style={[
                styles.modeIconCircle,
                mode === 'timed' ? { backgroundColor: '#CCFBF1' } : { backgroundColor: '#F1F5F9' },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={26}
                color={mode === 'timed' ? '#0D9488' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.modeName,
                mode === 'timed' && { color: '#0D9488' },
              ]}
            >
              Timed Mode
            </Text>
            <Text style={styles.modeSub}>Countdown timer</Text>
          </TouchableOpacity>

          {/* Practice Mode */}
          <TouchableOpacity
            style={[
              styles.modeCard,
              mode === 'practice' && styles.modeCardActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setMode('practice')}
          >
            <View
              style={[
                styles.modeIconCircle,
                mode === 'practice' ? { backgroundColor: '#CCFBF1' } : { backgroundColor: '#F1F5F9' },
              ]}
            >
              <Ionicons
                name="book-outline"
                size={26}
                color={mode === 'practice' ? '#0D9488' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.modeName,
                mode === 'practice' && { color: '#0D9488' },
              ]}
            >
              Practice Mode
            </Text>
            <Text style={styles.modeSub}>No time limit</Text>
          </TouchableOpacity>
        </View>

        {/* SCORING INFO CALLOUT */}
        <View style={styles.infoBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="information-circle-outline" size={20} color="#0D9488" style={{ marginRight: 6 }} />
            <Text style={styles.infoTitle}>Scoring Info</Text>
          </View>
          <Text style={styles.infoBullet}>
            +2 per correct answer, -0.5 per wrong, 0 for unattempted.
          </Text>
          <Text style={styles.infoBullet}>
            Progress auto-saved every 30 seconds.
          </Text>
          <Text style={styles.infoBullet}>
            {mode === 'timed'
              ? 'Timed mode: 60-minute countdown; the test auto-submits when it hits zero.'
              : 'Practice mode: Starts from 00:00 without time limit; learn at your own pace.'}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* START TEST BUTTON */}
        <TouchableOpacity
          style={styles.startBtn}
          activeOpacity={0.85}
          onPress={handleStart}
        >
          <Ionicons name="play-circle-outline" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.startBtnText}>Start Test</Text>
        </TouchableOpacity>

        <Text style={styles.agreementCaption}>
          By starting, you agree to complete the test in one sitting.
        </Text>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  paperDetailsBox: {
    marginBottom: 24,
  },
  paperTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  modesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  modeCardActive: {
    borderColor: '#0D9488',
    backgroundColor: '#F0FDFA',
  },
  modeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modeSub: {
    fontSize: 11,
    color: '#64748B',
  },
  infoBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0D9488',
  },
  infoBullet: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 4,
  },
  startBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 28,
    paddingVertical: 14,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 10,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  agreementCaption: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

