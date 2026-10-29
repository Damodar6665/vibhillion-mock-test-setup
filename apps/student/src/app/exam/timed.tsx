// ==============================================================================
// SCREEN 6: TIMED MODE EXAMINATION ENGINE
// File: apps/student/src/app/exam/timed.tsx
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

export default function TimedExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examId = (params.examId as string) || 'e0000001-0000-0000-0000-000000000001';
  const sectionId = (params.sectionId as string) || 's0000001-0000-0000-0000-000000000001';
  const sectionName = (params.sectionName as string) || 'English Comprehension';

  // Test states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [attemptId, setAttemptId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timers (Section timer & Total timer in seconds)
  // Section duration: 15 mins (900s), Total duration: 60 mins (3600s)
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState(900);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(3600);

  // Question palette modal
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Question start time tracking for per-question time spent
  const questionStartTimeRef = useRef<number>(Date.now());

  // Initialize Exam & Questions
  useEffect(() => {
    async function initExam() {
      try {
        setLoading(true);
        const [qData, attempt] = await Promise.all([
          examService.getExamQuestions(examId, sectionId),
          examService.startAttempt(examId, 'timed'),
        ]);

        setQuestions(qData);
        setAttemptId(attempt.id);

        // Initialize answer states
        const initialAnswers: Record<string, AnswerState> = {};
        qData.forEach((q: Question, idx: number) => {
          initialAnswers[q.id] = {
            optionId: null,
            timeSpent: 0,
            marked: false,
            visited: idx === 0, // Mark first question visited
          };
        });
        setAnswers(initialAnswers);
      } finally {
        setLoading(false);
        questionStartTimeRef.current = Date.now();
      }
    }
    initExam();
  }, [examId, sectionId]);

  // Main countdown timer interval
  useEffect(() => {
    if (loading || isSubmitting) return;

    const timer = setInterval(() => {
      setSectionTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSectionTimeout();
          return 0;
        }
        return prev - 1;
      });

      setTotalTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit('Total exam duration expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isSubmitting]);

  // Record time spent on current question when leaving it
  const recordQuestionTime = () => {
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
      const nextState = {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          optionId: prev[currentQ.id]?.optionId === optionId ? null : optionId,
          visited: true,
        },
      };

      // Persist answer asynchronously
      examService.recordAnswer(
        attemptId,
        currentQ.id,
        nextState[currentQ.id].optionId,
        nextState[currentQ.id].timeSpent,
        nextState[currentQ.id].marked
      );

      return nextState;
    });
  };

  const handleToggleMarkForReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => {
      const isMarked = !prev[currentQ.id]?.marked;
      const nextState = {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          marked: isMarked,
          visited: true,
        },
      };

      examService.recordAnswer(
        attemptId,
        currentQ.id,
        nextState[currentQ.id].optionId,
        nextState[currentQ.id].timeSpent,
        isMarked
      );

      return nextState;
    });
  };

  const handleClearResponse = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        optionId: null,
      },
    }));

    examService.recordAnswer(
      attemptId,
      currentQ.id,
      null,
      answers[currentQ.id]?.timeSpent || 0,
      answers[currentQ.id]?.marked || false
    );
  };

  const handleNavigateQuestion = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    recordQuestionTime();

    const targetQ = questions[nextIndex];
    setAnswers((prev) => ({
      ...prev,
      [targetQ.id]: {
        ...prev[targetQ.id],
        visited: true,
      },
    }));

    setCurrentIndex(nextIndex);
  };

  const handleSectionTimeout = () => {
    Alert.alert(
      'Section Time Expired',
      'The time limit for this section has ended. Submitting section answers.',
      [{ text: 'OK', onPress: () => handleFinalSubmit() }]
    );
  };

  const handleAutoSubmit = (reason: string) => {
    Alert.alert('Time Up', `${reason}. Your answers are being submitted.`, [
      { text: 'OK', onPress: () => handleFinalSubmit() },
    ]);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    recordQuestionTime();
    setIsSubmitting(true);
    setShowSubmitModal(false);

    try {
      const summary = await examService.submitAttempt(attemptId, answers);

      // Navigate to Screen 8: Result Screen
      router.replace({
        pathname: '/exam/result',
        params: {
          attemptId,
          examTitle: summary.exam_title,
          totalQuestions: summary.total_questions,
          attemptedCount: summary.attempted_count,
          unattemptedCount: summary.unattempted_count,
          correctCount: summary.correct_count,
          wrongCount: summary.wrong_count,
          finalScore: summary.final_score,
          maximumScore: summary.maximum_score,
          accuracyPercentage: summary.accuracy_percentage,
          totalTimeSeconds: summary.total_time_seconds,
          rank: summary.rank || 1,
          percentile: summary.percentile || 95,
          answersJson: JSON.stringify(answers),
        },
      });
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit test. Please retry.');
      setIsSubmitting(false);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading examination paper...</Text>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ.id];

  // Palette Counts
  let answeredCount = 0;
  let markedCount = 0;
  let unattemptedCount = 0;

  questions.forEach((q) => {
    const a = answers[q.id];
    if (a?.optionId) answeredCount++;
    else unattemptedCount++;
    if (a?.marked) markedCount++;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top Bar with Timers */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topSectionName}>{sectionName}</Text>
          <Text style={styles.topTotalTime}>
            Total Left: {formatDuration(totalTimeRemaining)}
          </Text>
        </View>

        <View style={styles.timerBadge}>
          <Ionicons name="time" size={16} color="#DC2626" />
          <Text style={styles.timerText}>
            Sec: {formatDuration(sectionTimeRemaining)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.paletteTrigger}
          onPress={() => setShowPalette(true)}
        >
          <Ionicons name="grid" size={20} color="#FFFFFF" />
          <Text style={styles.paletteTriggerText}>Grid</Text>
        </TouchableOpacity>
      </View>

      {/* Sub-header with Q-number and Mark for review */}
      <View style={styles.subHeader}>
        <Text style={styles.qIndexText}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <View style={styles.subHeaderActions}>
          <TouchableOpacity
            style={[styles.reviewBtn, currentAnswer?.marked && styles.reviewBtnActive]}
            onPress={handleToggleMarkForReview}
          >
            <Ionicons
              name={currentAnswer?.marked ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={currentAnswer?.marked ? '#8B5CF6' : '#64748B'}
            />
            <Text
              style={[
                styles.reviewBtnText,
                currentAnswer?.marked && styles.reviewBtnTextActive,
              ]}
            >
              {currentAnswer?.marked ? 'Marked' : 'Mark for Review'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearBtn} onPress={handleClearResponse}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Question Body */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionCard}>
          <View style={styles.qMetaRow}>
            <View style={styles.diffBadge}>
              <Text style={styles.diffText}>{currentQ.difficulty.toUpperCase()}</Text>
            </View>
            <Text style={styles.marksText}>+2.0, -0.5</Text>
          </View>

          <Text style={styles.questionText}>{currentQ.question_text}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          {currentQ.options?.map((opt) => {
            const isSelected = currentAnswer?.optionId === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleSelectOption(opt.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.optionLabelCircle, isSelected && styles.optionLabelCircleSelected]}
                >
                  <Text
                    style={[styles.optionLabelText, isSelected && styles.optionLabelTextSelected]}
                  >
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

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => handleNavigateQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={18} color={currentIndex === 0 ? '#94A3B8' : '#334155'} />
          <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.submitTestBtn}
          onPress={() => setShowSubmitModal(true)}
        >
          <Text style={styles.submitTestBtnText}>Submit</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navBtn, styles.saveNextBtn]}
            onPress={() => setShowSubmitModal(true)}
          >
            <Text style={styles.saveNextBtnText}>Finish</Text>
            <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, styles.saveNextBtn]}
            onPress={() => handleNavigateQuestion(currentIndex + 1)}
          >
            <Text style={styles.saveNextBtnText}>Save & Next</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* QUESTION PALETTE MODAL */}
      <Modal visible={showPalette} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.paletteContainer}>
            <View style={styles.paletteHeader}>
              <Text style={styles.paletteTitle}>Question Palette ({questions.length})</Text>
              <TouchableOpacity onPress={() => setShowPalette(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {/* Legend */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendLabel}>Answered ({answeredCount})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendLabel}>Not Answered ({unattemptedCount})</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.legendLabel}>Review ({markedCount})</Text>
              </View>
            </View>

            {/* Question Grid */}
            <ScrollView contentContainerStyle={styles.gridContainer}>
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                let bg = '#F1F5F9';
                let txtColor = '#334155';

                if (ans?.marked) {
                  bg = '#8B5CF6';
                  txtColor = '#FFFFFF';
                } else if (ans?.optionId) {
                  bg = '#10B981';
                  txtColor = '#FFFFFF';
                } else if (ans?.visited) {
                  bg = '#EF4444';
                  txtColor = '#FFFFFF';
                }

                if (idx === currentIndex) {
                  // Current question border
                }

                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[
                      styles.paletteButton,
                      { backgroundColor: bg },
                      idx === currentIndex && styles.paletteButtonCurrent,
                    ]}
                    onPress={() => {
                      handleNavigateQuestion(idx);
                      setShowPalette(false);
                    }}
                  >
                    <Text style={[styles.paletteButtonText, { color: txtColor }]}>
                      {idx + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.closePaletteBtn}
              onPress={() => setShowPalette(false)}
            >
              <Text style={styles.closePaletteBtnText}>Back to Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CONFIRM SUBMISSION MODAL */}
      <Modal visible={showSubmitModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalCard}>
            <Ionicons name="alert-circle" size={48} color="#2563EB" />
            <Text style={styles.confirmTitle}>Submit Examination?</Text>
            <Text style={styles.confirmDesc}>
              Are you sure you want to finalize your submission? Once submitted, your answers cannot be modified.
            </Text>

            <View style={styles.confirmSummaryRow}>
              <View style={styles.confirmStat}>
                <Text style={styles.confirmStatNum}>{answeredCount}</Text>
                <Text style={styles.confirmStatLabel}>Answered</Text>
              </View>
              <View style={styles.confirmStat}>
                <Text style={styles.confirmStatNum}>{unattemptedCount}</Text>
                <Text style={styles.confirmStatLabel}>Unattempted</Text>
              </View>
              <View style={styles.confirmStat}>
                <Text style={styles.confirmStatNum}>{markedCount}</Text>
                <Text style={styles.confirmStatLabel}>Review</Text>
              </View>
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelModalBtnText}>Resume Test</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmSubmitBtn}
                onPress={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmSubmitBtnText}>Yes, Submit Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E3A8A' },
  topBar: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topSectionName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  topTotalTime: { fontSize: 11, color: '#93C5FD', marginTop: 1 },
  timerBadge: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  timerText: { fontSize: 13, fontWeight: '700', color: '#DC2626' },
  paletteTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  paletteTriggerText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  subHeader: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  qIndexText: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  subHeaderActions: { flexDirection: 'row', gap: 8 },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 4,
  },
  reviewBtnActive: { borderColor: '#8B5CF6', backgroundColor: '#F5F3FF' },
  reviewBtnText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  reviewBtnTextActive: { color: '#8B5CF6', fontWeight: '700' },
  clearBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  clearBtnText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  scrollArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  qMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  diffBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  diffText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
  marksText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  questionText: { fontSize: 16, color: '#0F172A', lineHeight: 24, fontWeight: '500' },
  optionsList: { gap: 10, marginBottom: 20 },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  optionCardSelected: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  optionLabelCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabelCircleSelected: { backgroundColor: '#2563EB' },
  optionLabelText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  optionLabelTextSelected: { color: '#FFFFFF' },
  optionText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },
  optionTextSelected: { color: '#1E3A8A', fontWeight: '600' },
  footer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 4,
  },
  navBtnDisabled: { borderColor: '#E2E8F0', opacity: 0.5 },
  navBtnText: { fontSize: 13, fontWeight: '600', color: '#334155' },
  navBtnTextDisabled: { color: '#94A3B8' },
  saveNextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  saveNextBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  submitTestBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitTestBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paletteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    padding: 18,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paletteTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 11, color: '#64748B' },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
  paletteButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paletteButtonCurrent: {
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  paletteButtonText: { fontSize: 14, fontWeight: '700' },
  closePaletteBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  closePaletteBtnText: { fontSize: 14, fontWeight: '600', color: '#334155' },
  confirmModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  confirmTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 12 },
  confirmDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginTop: 6 },
  confirmSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginVertical: 16,
  },
  confirmStat: { alignItems: 'center' },
  confirmStatNum: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  confirmStatLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  modalActionsRow: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelModalBtnText: { color: '#334155', fontWeight: '600', fontSize: 14 },
  confirmSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  confirmSubmitBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
