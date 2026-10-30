// ==============================================================================
// VIBHILLION AI: PRACTICE EXAMINATION ENGINE (COUNT-UP TIMER, NO TIME LIMIT)
// File: apps/student/src/app/exam/practice.tsx
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { formatDuration, Question } from '@vibhillion/shared';

interface AnswerState {
  optionId: string | null;
  timeSpent: number;
  marked: boolean;
  visited: boolean;
}

const SECTION_TABS = [
  { id: 'english', name: 'English', start: 0, count: 25 },
  { id: 'reasoning', name: 'Reasoning', start: 25, count: 25 },
  { id: 'quant', name: 'Quant', start: 50, count: 25 },
  { id: 'ga', name: 'General Awareness', start: 75, count: 25 },
];

export default function PracticeExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examId = (params.examId as string) || 'e0000001-0000-0000-0000-000000000001';
  const paperTitle =
    (params.paperTitle as string) || 'SSC CGL T-I (Held on 12 Sep 2025 S1) – English';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [attemptId, setAttemptId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Practice Mode: Starts from 00:00 and counts UP without time limit
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    async function loadTest() {
      try {
        setLoading(true);
        const [qData, attempt] = await Promise.all([
          examService.getExamQuestions(examId),
          examService.startAttempt(examId, 'practice'),
        ]);

        setQuestions(qData);
        setAttemptId(attempt.id);

        const initialAnswers: Record<string, AnswerState> = {};
        qData.forEach((q: Question, idx: number) => {
          initialAnswers[q.id] = {
            optionId: null,
            timeSpent: 0,
            marked: false,
            visited: idx === 0,
          };
        });
        setAnswers(initialAnswers);
      } finally {
        setLoading(false);
        questionStartTimeRef.current = Date.now();
      }
    }
    loadTest();
  }, [examId]);

  // Elapsed timer counting UP forward
  useEffect(() => {
    if (loading || isSubmitting) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isSubmitting]);

  const recordTimeSpent = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const elapsed = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        timeSpent: (prev[currentQ.id]?.timeSpent || 0) + elapsed,
      },
    }));
    questionStartTimeRef.current = Date.now();
  };

  const handleSelectOption = (optionId: string) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => {
      const isSelected = prev[currentQ.id]?.optionId === optionId;
      return {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          optionId: isSelected ? null : optionId,
          visited: true,
        },
      };
    });
  };

  const handleToggleMark = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        marked: !prev[currentQ.id]?.marked,
        visited: true,
      },
    }));
  };

  const handleClear = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        optionId: null,
      },
    }));
  };

  const handleNavigate = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    recordTimeSpent();

    const targetQ = questions[targetIdx];
    setAnswers((prev) => ({
      ...prev,
      [targetQ.id]: {
        ...prev[targetQ.id],
        visited: true,
      },
    }));

    setCurrentIndex(targetIdx);
  };

  const handleFinalSubmit = async () => {
    recordTimeSpent();
    try {
      setIsSubmitting(true);
      setShowSubmitModal(false);

      const summary = await examService.submitAttempt(attemptId, answers);

      router.replace({
        pathname: '/exam/result',
        params: {
          attemptId: summary.attempt_id,
          paperTitle,
          totalQuestions: String(summary.total_questions),
          attemptedCount: String(summary.attempted_count),
          unattemptedCount: String(summary.unattempted_count),
          correctCount: String(summary.correct_count),
          wrongCount: String(summary.wrong_count),
          finalScore: String(summary.final_score),
          maximumScore: String(summary.maximum_score),
          accuracyPercentage: String(summary.accuracy_percentage),
          totalTimeSeconds: String(elapsedSeconds),
          answersJson: JSON.stringify(answers),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <SafeAreaView style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Loading Practice Session...</Text>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ?.id] || { optionId: null, timeSpent: 0, marked: false, visited: true };

  let answeredCount = 0;
  let markedCount = 0;
  let unansweredCount = 0;

  questions.forEach((q) => {
    const a = answers[q.id];
    if (a?.optionId) answeredCount++;
    else unansweredCount++;
    if (a?.marked) markedCount++;
  });

  const activeSectionTab =
    currentIndex < 25
      ? 0
      : currentIndex < 50
      ? 1
      : currentIndex < 75
      ? 2
      : 3;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.quitBtn}>
          <Text style={styles.quitText}>Exit</Text>
        </TouchableOpacity>

        <View style={styles.timerCenter}>
          <Text style={styles.timerText}>{formatDuration(elapsedSeconds)}</Text>
          <Text style={styles.questionIndexText}>
            Practice Q {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        <TouchableOpacity onPress={handleToggleMark} style={styles.markBtn}>
          <Ionicons
            name={currentAnswer.marked ? 'flag' : 'flag-outline'}
            size={18}
            color={currentAnswer.marked ? '#A855F7' : '#64748B'}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.markText, currentAnswer.marked && { color: '#A855F7' }]}>
            Mark
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUB-HEADER / PROGRESS BAR */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          {answeredCount}/{questions.length} answered • Practice Mode (Untimed)
        </Text>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(answeredCount / questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* 4 SECTION TABS */}
      <View style={styles.sectionTabsRow}>
        {SECTION_TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.sectionTabBtn,
              activeSectionTab === idx && styles.sectionTabBtnActive,
            ]}
            onPress={() => handleNavigate(tab.start)}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSectionTab === idx && styles.sectionTabTextActive,
              ]}
              numberOfLines={1}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MAIN QUESTION SCROLLABLE AREA */}
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionBadgePill}>
          <Text style={styles.sectionBadgeText}>{currentQ.topic || 'Reasoning'}</Text>
        </View>

        <Text style={styles.questionText}>{currentQ.question_text}</Text>

        <View style={styles.optionsList}>
          {currentQ.options?.map((opt) => {
            const isSelected = currentAnswer.optionId === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                activeOpacity={0.8}
                onPress={() => handleSelectOption(opt.id)}
              >
                <View style={[styles.optionCircle, isSelected && styles.optionCircleSelected]}>
                  <Text style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
                    {opt.option_label}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {opt.option_text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, currentIndex === 0 && { opacity: 0.3 }]}
            onPress={() => handleNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back" size={16} color="#64748B" />
            <Text style={styles.actionBtnText}>Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleClear}>
            <Ionicons name="trash-outline" size={16} color="#64748B" />
            <Text style={styles.actionBtnText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setShowPaletteModal(true)}
          >
            <Ionicons name="grid-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.primaryNextBtn}
          activeOpacity={0.85}
          onPress={() => {
            if (currentIndex === questions.length - 1) {
              setShowSubmitModal(true);
            } else {
              handleNavigate(currentIndex + 1);
            }
          }}
        >
          <Text style={styles.primaryNextBtnText}>
            {currentIndex === questions.length - 1 ? 'Finish Practice' : 'Next >'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUBMIT MODAL */}
      <Modal
        visible={showSubmitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.submitModalCard}>
            <Text style={styles.submitModalTitle}>Finish Practice Session?</Text>

            <View style={styles.submitTable}>
              <View style={styles.submitTableRow}>
                <Text style={styles.submitTableLabel}>Total Questions</Text>
                <Text style={styles.submitTableVal}>{questions.length}</Text>
              </View>
              <View style={styles.submitTableDivider} />

              <View style={styles.submitTableRow}>
                <Text style={styles.submitTableLabel}>Answered</Text>
                <Text style={[styles.submitTableVal, { color: '#0D9488' }]}>{answeredCount}</Text>
              </View>
              <View style={styles.submitTableDivider} />

              <View style={styles.submitTableRow}>
                <Text style={styles.submitTableLabel}>Unanswered</Text>
                <Text style={[styles.submitTableVal, { color: '#64748B' }]}>{unansweredCount}</Text>
              </View>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.continueTestBtn}
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={styles.continueTestBtnText}>Keep Practicing</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.finalSubmitBtn}
                onPress={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.finalSubmitBtnText}>View Results</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PALETTE MODAL */}
      <Modal
        visible={showPaletteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaletteModal(false)}
      >
        <View style={styles.paletteModalBackdrop}>
          <View style={styles.paletteModalCard}>
            <View style={styles.paletteModalHeader}>
              <Text style={styles.paletteModalTitle}>Question Palette (100 Qs)</Text>
              <TouchableOpacity onPress={() => setShowPaletteModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <View style={styles.paletteGrid}>
                {questions.map((q, qIdx) => {
                  const a = answers[q.id];
                  const isCur = qIdx === currentIndex;
                  const isAns = Boolean(a?.optionId);

                  return (
                    <TouchableOpacity
                      key={q.id}
                      style={[
                        styles.paletteCell,
                        {
                          backgroundColor: isAns ? '#22C55E' : '#FFFFFF',
                          borderColor: isAns ? '#22C55E' : '#CBD5E1',
                        },
                        isCur && { borderWidth: 2.5, borderColor: '#0F172A' },
                      ]}
                      onPress={() => {
                        setShowPaletteModal(false);
                        handleNavigate(qIdx);
                      }}
                    >
                      <Text style={[styles.paletteCellText, { color: isAns ? '#FFFFFF' : '#475569' }]}>
                        {qIdx + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { fontSize: 14, color: '#64748B', marginTop: 12 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  quitBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  quitText: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  timerCenter: { alignItems: 'center' },
  timerText: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  questionIndexText: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
  markBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8 },
  markText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  subHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subHeaderText: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 6 },
  progressBarTrack: { height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: 4, backgroundColor: '#0D9488', borderRadius: 2 },
  sectionTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 6,
  },
  sectionTabBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  sectionTabBtnActive: { backgroundColor: '#CCFBF1' },
  sectionTabText: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  sectionTabTextActive: { color: '#0D9488', fontWeight: '700' },
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  mainScrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  sectionBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#CCFBF1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  sectionBadgeText: { fontSize: 12, fontWeight: '700', color: '#0D9488' },
  questionText: { fontSize: 16, fontWeight: '700', color: '#0F172A', lineHeight: 24, marginBottom: 20 },
  optionsList: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  optionCardSelected: { borderColor: '#0D9488', backgroundColor: '#F0FDFA' },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionCircleSelected: { backgroundColor: '#0D9488' },
  optionLetter: { fontSize: 13, fontWeight: '700', color: '#475569' },
  optionLetterSelected: { color: '#FFFFFF' },
  optionText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },
  optionTextSelected: { color: '#0F172A', fontWeight: '600' },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10 },
  actionBtnText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  primaryNextBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 24,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryNextBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  submitModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },
  submitModalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  submitTable: { marginBottom: 20 },
  submitTableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  submitTableLabel: { fontSize: 13, color: '#64748B' },
  submitTableVal: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  submitTableDivider: { height: 1, backgroundColor: '#F1F5F9' },
  modalButtonsRow: { flexDirection: 'row', gap: 12 },
  continueTestBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueTestBtnText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  finalSubmitBtn: {
    flex: 1,
    backgroundColor: '#0D9488',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  finalSubmitBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  paletteModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  paletteModalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  paletteModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  paletteModalTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  paletteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 },
  paletteCell: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  paletteCellText: { fontSize: 11, fontWeight: '700' },
});
