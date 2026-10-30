// ==============================================================================
// SCREEN 7: PRACTICE MODE SESSION
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
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { formatDuration, Question } from '@vibhillion/shared';

interface PracticeAnswerState {
  optionId: string | null;
  timeSpent: number;
  revealed: boolean;
}

export default function PracticeExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examId = (params.examId as string) || 'e0000001-0000-0000-0000-000000000001';
  const sectionId = (params.sectionId as string) || 'a0000001-0000-0000-0000-000000000001';
  const sectionName = (params.sectionName as string) || 'English Comprehension';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, PracticeAnswerState>>({});
  const [attemptId, setAttemptId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Practice mode: Elapsed timer starts at 00:00 and increments forward
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const questionStartTimeRef = useRef<number>(Date.now());
  const [showPalette, setShowPalette] = useState(false);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function initPractice() {
      try {
        setLoading(true);
        const [qData, attempt] = await Promise.all([
          examService.getExamQuestions(examId, sectionId),
          examService.startAttempt(examId, 'practice'),
        ]);

        setQuestions(qData);
        setAttemptId(attempt.id);

        const initialAnswers: Record<string, PracticeAnswerState> = {};
        qData.forEach((q: Question) => {
          initialAnswers[q.id] = { optionId: null, timeSpent: 0, revealed: false };
        });
        setAnswers(initialAnswers);

        // Load existing bookmarks
        examService.getBookmarks().then((bms) => {
          const bmMap: Record<string, boolean> = {};
          bms.forEach((b) => (bmMap[b.question_id] = true));
          setBookmarkedMap(bmMap);
        });
      } finally {
        setLoading(false);
        questionStartTimeRef.current = Date.now();
      }
    }
    initPractice();
  }, [examId, sectionId]);

  const handleToggleBookmarkCurrent = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const isNow = await examService.toggleBookmark({
      id: currentQ.id,
      question_text: currentQ.question_text,
      topic: currentQ.topic,
      subtopic: currentQ.subtopic,
      difficulty: currentQ.difficulty,
      section_name: sectionName,
      options: currentQ.options,
      explanation: currentQ.explanation,
      solution_steps: currentQ.solution_steps,
    });
    setBookmarkedMap((prev) => ({ ...prev, [currentQ.id]: isNow }));
  };

  // Elapsed timer (No countdown, runs forward)
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

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

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        optionId: prev[currentQ.id]?.optionId === optionId ? null : optionId,
      },
    }));
  };

  const handleToggleReveal = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        revealed: !prev[currentQ.id]?.revealed,
      },
    }));
  };

  const handleNavigateQuestion = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    recordQuestionTime();
    setCurrentIndex(nextIndex);
  };

  const handleFinishPractice = async () => {
    recordQuestionTime();
    try {
      // Map practice answers to format expected by submitAttempt
      const mapped: Record<string, { optionId: string | null; timeSpent: number; marked: boolean }> = {};
      Object.entries(answers).forEach(([k, v]) => {
        mapped[k] = { optionId: v.optionId, timeSpent: v.timeSpent, marked: false };
      });

      const summary = await examService.submitAttempt(attemptId, mapped);

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
          totalTimeSeconds: elapsedSeconds,
          rank: 1,
          percentile: 100,
          answersJson: JSON.stringify(mapped),
        },
      });
    } catch (err: any) {
      console.warn('Finish practice error:', err);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading practice mode...</Text>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[currentQ.id];

  // Map known correct answers for practice reveal mode
  const correctOptionIds: Record<string, string> = {
    'b0000001-0000-0000-0000-000000000001': 'o2',
    'b0000001-0000-0000-0000-000000000002': 'o5',
    'b0000001-0000-0000-0000-000000000003': 'o11',
    'b0000001-0000-0000-0000-000000000004': 'o14',
    'b0000001-0000-0000-0000-000000000005': 'o17',
  };
  const correctOptionId = correctOptionIds[currentQ.id];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Top Bar with Elapsed Time */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topSectionName}>{sectionName}</Text>
          <View style={styles.practiceBadge}>
            <Text style={styles.practiceBadgeText}>PRACTICE MODE</Text>
          </View>
        </View>

        <View style={styles.timerBadge}>
          <Ionicons name="stopwatch-outline" size={16} color="#059669" />
          <Text style={styles.timerText}>
            Elapsed: {formatDuration(elapsedSeconds)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.paletteTrigger}
          onPress={() => setShowPalette(true)}
        >
          <Ionicons name="grid" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Sub Header */}
      <View style={styles.subHeader}>
        <Text style={styles.qIndexText}>
          Question {currentIndex + 1} of {questions.length}
        </Text>
        <TouchableOpacity
          style={[styles.revealBtn, currentAnswer?.revealed && styles.revealBtnActive]}
          onPress={handleToggleReveal}
        >
          <Ionicons
            name={currentAnswer?.revealed ? 'bulb' : 'bulb-outline'}
            size={16}
            color={currentAnswer?.revealed ? '#D97706' : '#2563EB'}
          />
          <Text
            style={[
              styles.revealBtnText,
              currentAnswer?.revealed && styles.revealBtnTextActive,
            ]}
          >
            {currentAnswer?.revealed ? 'Hide Solution' : 'Reveal Solution'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Question Body */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionCard}>
          <View style={styles.qMetaRow}>
            <View style={styles.diffBadge}>
              <Text style={styles.diffText}>{currentQ.difficulty.toUpperCase()}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={styles.topicText}>{currentQ.topic} • {currentQ.subtopic}</Text>
              <TouchableOpacity onPress={handleToggleBookmarkCurrent} style={{ padding: 4 }}>
                <Ionicons
                  name={bookmarkedMap[currentQ.id] ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={bookmarkedMap[currentQ.id] ? '#2563EB' : '#94A3B8'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.questionText}>{currentQ.question_text}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsList}>
          {currentQ.options?.map((opt) => {
            const isSelected = currentAnswer?.optionId === opt.id;
            const isCorrect = opt.id === correctOptionId;
            const showCorrect = currentAnswer?.revealed && isCorrect;
            const showWrong = currentAnswer?.revealed && isSelected && !isCorrect;

            let cardBorder = '#E2E8F0';
            let cardBg = '#FFFFFF';
            if (showCorrect) {
              cardBorder = '#10B981';
              cardBg = '#DEF7EC';
            } else if (showWrong) {
              cardBorder = '#EF4444';
              cardBg = '#FDE8E8';
            } else if (isSelected) {
              cardBorder = '#2563EB';
              cardBg = '#EFF6FF';
            }

            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.optionCard, { borderColor: cardBorder, backgroundColor: cardBg }]}
                onPress={() => handleSelectOption(opt.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.optionLabelCircle,
                    isSelected && { backgroundColor: '#2563EB' },
                    showCorrect && { backgroundColor: '#10B981' },
                    showWrong && { backgroundColor: '#EF4444' },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabelText,
                      (isSelected || showCorrect || showWrong) && { color: '#FFFFFF' },
                    ]}
                  >
                    {opt.option_label}
                  </Text>
                </View>
                <Text style={styles.optionText}>{opt.option_text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detailed Explanation if Revealed */}
        {currentAnswer?.revealed && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Ionicons name="information-circle" size={20} color="#2563EB" />
              <Text style={styles.explanationTitle}>Explanation & Solution</Text>
            </View>
            <Text style={styles.explanationBody}>{currentQ.explanation}</Text>

            {currentQ.solution_steps && currentQ.solution_steps.length > 0 && (
              <View style={styles.stepsContainer}>
                <Text style={styles.stepsTitle}>Step-by-Step Breakdown:</Text>
                {currentQ.solution_steps.map((step, idx) => (
                  <Text key={idx} style={styles.stepItem}>
                    {idx + 1}. {step}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
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

        <TouchableOpacity style={styles.finishBtn} onPress={handleFinishPractice}>
          <Text style={styles.finishBtnText}>Finish Practice</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navBtn, styles.nextBtn]}
            onPress={handleFinishPractice}
          >
            <Text style={styles.nextBtnText}>Done</Text>
            <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, styles.nextBtn]}
            onPress={() => handleNavigateQuestion(currentIndex + 1)}
          >
            <Text style={styles.nextBtnText}>Next</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Question Palette Modal */}
      <Modal visible={showPalette} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.paletteContainer}>
            <View style={styles.paletteHeader}>
              <Text style={styles.paletteTitle}>Practice Questions</Text>
              <TouchableOpacity onPress={() => setShowPalette(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.gridContainer}>
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isSelected = Boolean(ans?.optionId);
                return (
                  <TouchableOpacity
                    key={q.id}
                    style={[
                      styles.paletteButton,
                      isSelected && { backgroundColor: '#2563EB' },
                      idx === currentIndex && { borderWidth: 2, borderColor: '#0F172A' },
                    ]}
                    onPress={() => {
                      handleNavigateQuestion(idx);
                      setShowPalette(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.paletteButtonText,
                        isSelected && { color: '#FFFFFF' },
                      ]}
                    >
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
              <Text style={styles.closePaletteBtnText}>Return to Practice</Text>
            </TouchableOpacity>
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
  practiceBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  practiceBadgeText: { fontSize: 9, fontWeight: '800', color: '#92400E' },
  timerBadge: {
    backgroundColor: '#DEF7EC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  timerText: { fontSize: 13, fontWeight: '700', color: '#03543F' },
  paletteTrigger: { padding: 6 },
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
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    gap: 4,
  },
  revealBtnActive: { backgroundColor: '#FEF3C7' },
  revealBtnText: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  revealBtnTextActive: { color: '#92400E' },
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
  topicText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  questionText: { fontSize: 16, color: '#0F172A', lineHeight: 24, fontWeight: '500' },
  optionsList: { gap: 10, marginBottom: 16 },
  optionCard: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  optionLabelCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabelText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  optionText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },
  explanationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    marginTop: 6,
    marginBottom: 20,
  },
  explanationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  explanationTitle: { fontSize: 14, fontWeight: '700', color: '#1E3A8A' },
  explanationBody: { fontSize: 13, color: '#334155', lineHeight: 20 },
  stepsContainer: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  stepsTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  stepItem: { fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 4 },
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
  finishBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  finishBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  nextBtn: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  nextBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
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
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingVertical: 10 },
  paletteButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paletteButtonText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  closePaletteBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  closePaletteBtnText: { fontSize: 14, fontWeight: '600', color: '#334155' },
});
