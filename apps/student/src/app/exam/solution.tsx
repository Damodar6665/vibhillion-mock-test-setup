// ==============================================================================
// SCREEN 9: QUESTION-WISE ANALYSIS & SOLUTIONS WITH TOPIC BREAKDOWN & WISHES
// File: apps/student/src/app/exam/solution.tsx
// ==============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { QuestionAnalysis } from '@vibhillion/shared';

interface TopicStat {
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  unattempted: number;
  accuracy: number;
  avgTime: number;
}

export default function ExamSolutionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const attemptId = (params.attemptId as string) || '';
  const answersJson = (params.answersJson as string) || '{}';

  const [solutions, setSolutions] = useState<QuestionAnalysis[]>([]);
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  const openOnlineReference = (url?: string) => {
    if (!url) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      Linking.openURL(url).catch((err) => console.warn('Could not open reference URL:', err));
    }
  };

  useEffect(() => {
    async function loadSolutions() {
      try {
        setLoading(true);
        let localAnswers = {};
        try {
          localAnswers = JSON.parse(answersJson);
        } catch {}

        const [data, bms] = await Promise.all([
          examService.getSolutions(attemptId, localAnswers),
          examService.getBookmarks(),
        ]);

        setSolutions(data);

        const bmMap: Record<string, boolean> = {};
        bms.forEach((b) => {
          bmMap[b.question_id] = true;
        });
        setBookmarkedMap(bmMap);
      } finally {
        setLoading(false);
      }
    }
    loadSolutions();
  }, [attemptId, answersJson]);

  const handleToggleBookmark = async (item: QuestionAnalysis) => {
    const isNowBookmarked = await examService.toggleBookmark({
      id: item.question_id,
      question_text: item.question_text,
      topic: item.topic,
      subtopic: item.subtopic,
      difficulty: item.difficulty,
      section_name: item.section_name,
      options: item.options,
      correct_option_id: item.correct_option_id,
      explanation: item.explanation,
      solution_steps: item.solution_steps,
    });

    setBookmarkedMap((prev) => ({
      ...prev,
      [item.question_id]: isNowBookmarked,
    }));
  };

  // Group and compute Topic-wise Performance Analysis
  const topicAnalysis: TopicStat[] = useMemo(() => {
    const map = new Map<
      string,
      { total: number; correct: number; wrong: number; unattempted: number; totalTime: number }
    >();

    solutions.forEach((s) => {
      const topic = s.topic || 'General';
      const cur = map.get(topic) || { total: 0, correct: 0, wrong: 0, unattempted: 0, totalTime: 0 };
      cur.total += 1;
      cur.totalTime += s.time_spent_seconds || 0;

      if (s.is_correct) {
        cur.correct += 1;
      } else if (s.user_selected_option_id) {
        cur.wrong += 1;
      } else {
        cur.unattempted += 1;
      }
      map.set(topic, cur);
    });

    return Array.from(map.entries())
      .map(([topic, data]) => {
        const attempted = data.correct + data.wrong;
        const accuracy = attempted > 0 ? Math.round((data.correct / attempted) * 100) : 0;
        const avgTime = data.total > 0 ? Math.round(data.totalTime / data.total) : 0;
        return {
          topic,
          ...data,
          accuracy,
          avgTime,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [solutions]);

  // Generate Question-wise Analysis with Wishes and Suggestions
  const getQuestionInsight = (item: QuestionAnalysis) => {
    const isAttempted = Boolean(item.user_selected_option_id);
    const isCorrect = item.is_correct;
    const time = item.time_spent_seconds || 0;
    const topicName = item.topic || 'General';

    const userOpt = item.options.find((o) => o.id === item.user_selected_option_id);
    const correctOpt = item.options.find((o) => o.id === item.correct_option_id);
    const userLabel = userOpt ? `Option ${userOpt.label}` : 'None';
    const correctLabel = correctOpt ? `Option ${correctOpt.label}` : 'Correct Option';

    if (isCorrect) {
      if (time <= 45) {
        // Suggestion Type 1: Correct + Less Time (Fast & Optimal)
        return {
          type: 'correct_fast' as const,
          title: '🌟 Great Speed & High Accuracy',
          badge: `⚡ Great speed • ${time}s`,
          wish: `Great work! You solved this question fast and correctly in just ${time}s. Keep up this quick pace in ${topicName}!`,
          borderColor: '#10B981',
          bgColor: '#ECFDF5',
          textColor: '#065F46',
          badgeBg: '#10B981',
          badgeText: '#FFFFFF',
          iconName: 'sparkles' as const,
          iconColor: '#059669',
        };
      } else {
        // Suggestion Type 2: Correct + More Time (Accurate but Slow)
        return {
          type: 'correct_slow' as const,
          title: '⏳ Do It Fast — Needs Speed Improvement',
          badge: `⏳ Do it fast • ${time}s`,
          wish: `Do it fast — You solved this correctly (+2.0 marks), but took ${time}s. Try to use shortcuts and quick calculation tricks to solve ${topicName} questions faster next time!`,
          borderColor: '#F59E0B',
          bgColor: '#FFFBEB',
          textColor: '#92400E',
          badgeBg: '#D97706',
          badgeText: '#FFFFFF',
          iconName: 'time' as const,
          iconColor: '#D97706',
        };
      }
    } else if (isAttempted) {
      // Suggestion: Wrong answer (-0.5 penalty) - WITH RED COLOURED TEXT
      return {
        type: 'wrong' as const,
        title: '⚠️ Needs Improvement — Error Diagnosis',
        badge: `❌ Needs improvement • -0.5 Penalty`,
        wish: `Needs improvement — You selected ${userLabel}, but the verified correct choice is ${correctLabel}. Need more practice on ${topicName} to avoid mistakes and save marks from negative penalty (-0.5)!`,
        borderColor: '#EF4444',
        bgColor: '#FEF2F2',
        textColor: '#DC2626', // RED COLOURED TEXT
        badgeBg: '#DC2626',
        badgeText: '#FFFFFF',
        iconName: 'bulb' as const,
        iconColor: '#DC2626',
      };
    } else {
      // Suggestion: Unattempted / Skipped (0.0 marks)
      return {
        type: 'skipped' as const,
        title: '📚 Need More Practice — Skipped Question',
        badge: `⚪ Need more practice • 0.0 Marks`,
        wish: `Need more practice — You skipped this question. Practice this topic concept in ${topicName} so you can solve it easily next time!`,
        borderColor: '#6366F1',
        bgColor: '#EEF2FF',
        textColor: '#3730A3',
        badgeBg: '#4F46E5',
        badgeText: '#FFFFFF',
        iconName: 'flag' as const,
        iconColor: '#4F46E5',
      };
    }
  };

  // Generate all 4 rules preview for the question (matching admin console)
  const getQuestionRulesPreview = (item: QuestionAnalysis) => {
    const isAttempted = Boolean(item.user_selected_option_id);
    const isCorrect = item.is_correct;
    const time = item.time_spent_seconds || 0;
    const topicName = item.topic || 'General Topic';
    const diff = item.difficulty ? item.difficulty.toLowerCase() : 'medium';

    return [
      {
        id: 'fast',
        title: '🌟 Great Speed & High Accuracy',
        badge: '⚡ Great speed • ≤45s',
        body: `Great work! Solved fast and accurately in under 45 seconds for ${topicName}.`,
        isMatch: isCorrect && time <= 45,
        bgColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        textColor: '#065F46',
        badgeBg: '#10B981',
        iconName: 'sparkles' as const,
      },
      {
        id: 'slow',
        title: '⏳ Do It Fast — Needs Speed Improvement',
        badge: '⏳ Do it fast • >45s',
        body: `Do it fast — Good job getting it right, but took over 45s. Use shortcuts and practice to solve it faster!`,
        isMatch: isCorrect && time > 45,
        bgColor: '#FFFBEB',
        borderColor: '#FDE68A',
        textColor: '#92400E',
        badgeBg: '#D97706',
        iconName: 'time' as const,
      },
      {
        id: 'wrong',
        title: '⚠️ Needs Improvement — Error Diagnosis',
        badge: '❌ Needs improvement • -0.5 Penalty',
        body: `Needs improvement — You got this wrong (-0.5 penalty). Need more practice on ${topicName} to avoid tricky mistakes.`,
        isMatch: isAttempted && !isCorrect,
        bgColor: '#FEF2F2',
        borderColor: '#FCA5A5',
        textColor: '#DC2626', // RED COLOURED TEXT
        badgeBg: '#DC2626',
        iconName: 'bulb' as const,
      },
      {
        id: 'skipped',
        title: '📚 Need More Practice — Skipped Question',
        badge: '⚪ Need more practice • 0.0 Marks',
        body: `Need more practice — You skipped this question. Learn the basics of ${topicName} so you can solve it next time!`,
        isMatch: !isAttempted,
        bgColor: '#EEF2FF',
        borderColor: '#C7D2FE',
        textColor: '#3730A3',
        badgeBg: '#4F46E5',
        iconName: 'flag' as const,
      },
    ];
  };

  const filteredSolutions = solutions.filter((item) => {
    if (filter === 'correct' && !item.is_correct) return false;
    if (filter === 'wrong' && (!item.user_selected_option_id || item.is_correct)) return false;
    if (filter === 'unattempted' && item.user_selected_option_id) return false;
    if (selectedTopic !== 'all' && item.topic !== selectedTopic) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Solutions & Performance Analysis</Text>
          <Text style={styles.headerSubtitle}>
            Topic-wise mastery, verified keys & personalized question wishes
          </Text>
        </View>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({solutions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'correct' && styles.filterPillActive]}
          onPress={() => setFilter('correct')}
        >
          <Text style={[styles.filterText, filter === 'correct' && styles.filterTextActive]}>
            Correct ({solutions.filter((s) => s.is_correct).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'wrong' && styles.filterPillActive]}
          onPress={() => setFilter('wrong')}
        >
          <Text style={[styles.filterText, filter === 'wrong' && styles.filterTextActive]}>
            Wrong ({solutions.filter((s) => s.user_selected_option_id && !s.is_correct).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'unattempted' && styles.filterPillActive]}
          onPress={() => setFilter('unattempted')}
        >
          <Text style={[styles.filterText, filter === 'unattempted' && styles.filterTextActive]}>
            Skipped ({solutions.filter((s) => !s.user_selected_option_id).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVE TOPIC FILTER INDICATOR */}
      {selectedTopic !== 'all' && (
        <View style={styles.activeTopicBanner}>
          <Text style={styles.activeTopicText}>
            Filtering by Topic: <Text style={{ fontWeight: '800' }}>{selectedTopic}</Text>
          </Text>
          <TouchableOpacity
            style={styles.clearTopicBtn}
            onPress={() => setSelectedTopic('all')}
          >
            <Ionicons name="close-circle" size={16} color="#0D9488" style={{ marginRight: 4 }} />
            <Text style={styles.clearTopicText}>Clear Filter</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.loadingText}>Analyzing test performance & verified solutions...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* ========================================================================= */}
          {/* TOPIC-WISE PERFORMANCE ANALYSIS SECTION */}
          {/* ========================================================================= */}
          <View style={styles.topicAnalysisCard}>
            <View style={styles.topicHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="analytics" size={20} color="#0D9488" style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.topicCardTitle}>Topic-wise Performance Analysis</Text>
                  <Text style={styles.topicCardSub}>
                    Tap any topic below to filter questions and review dedicated insights
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicScrollContent}
            >
              <TouchableOpacity
                style={[
                  styles.topicChip,
                  selectedTopic === 'all' && styles.topicChipActive,
                ]}
                onPress={() => setSelectedTopic('all')}
              >
                <Text
                  style={[
                    styles.topicChipName,
                    selectedTopic === 'all' && styles.topicChipNameActive,
                  ]}
                >
                  All Topics
                </Text>
                <Text
                  style={[
                    styles.topicChipCount,
                    selectedTopic === 'all' && styles.topicChipCountActive,
                  ]}
                >
                  {solutions.length} Qs
                </Text>
              </TouchableOpacity>

              {topicAnalysis.map((t) => {
                const isSelected = selectedTopic === t.topic;
                const isHigh = t.accuracy >= 70;
                const isLow = t.accuracy < 50;

                return (
                  <TouchableOpacity
                    key={t.topic}
                    style={[styles.topicChip, isSelected && styles.topicChipActive]}
                    onPress={() => setSelectedTopic(isSelected ? 'all' : t.topic)}
                  >
                    <View style={styles.topicTopRow}>
                      <Text
                        style={[styles.topicChipName, isSelected && styles.topicChipNameActive]}
                        numberOfLines={1}
                      >
                        {t.topic}
                      </Text>
                      <View
                        style={[
                          styles.accuracyBadge,
                          {
                            backgroundColor: isHigh
                              ? '#DEF7EC'
                              : isLow
                              ? '#FDE8E8'
                              : '#FEF3C7',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.accuracyBadgeText,
                            {
                              color: isHigh ? '#03543F' : isLow ? '#9B1C1C' : '#92400E',
                            },
                          ]}
                        >
                          {t.accuracy}%
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.max(t.accuracy, 5)}%`,
                            backgroundColor: isHigh
                              ? '#10B981'
                              : isLow
                              ? '#EF4444'
                              : '#F59E0B',
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={[styles.topicChipCount, isSelected && styles.topicChipCountActive]}
                    >
                      {t.correct}/{t.total} Correct • avg {t.avgTime}s
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* ========================================================================= */}
          {/* QUESTION-WISE ANALYSIS & SOLUTIONS LIST */}
          {/* ========================================================================= */}
          <View style={styles.questionSectionHeader}>
            <Text style={styles.questionSectionTitle}>
              Question-wise Solutions & Guidance ({filteredSolutions.length})
            </Text>
          </View>

          {filteredSolutions.map((item) => {
            const isAttempted = Boolean(item.user_selected_option_id);
            const isCorrect = item.is_correct;
            const insight = getQuestionInsight(item);

            return (
              <View key={item.question_id} style={styles.qCard}>
                {/* Q-Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.qNumBadge}>
                    <Text style={styles.qNumText}>Q{item.question_number}</Text>
                  </View>

                  <View style={styles.headerRight}>
                    {/* Status Badge */}
                    {isCorrect ? (
                      <View style={[styles.statusBadge, { backgroundColor: '#DEF7EC' }]}>
                        <Ionicons name="checkmark-circle" size={14} color="#03543F" />
                        <Text style={[styles.statusBadgeText, { color: '#03543F' }]}>
                          Correct (+2.0)
                        </Text>
                      </View>
                    ) : isAttempted ? (
                      <View style={[styles.statusBadge, { backgroundColor: '#FDE8E8' }]}>
                        <Ionicons name="close-circle" size={14} color="#9B1C1C" />
                        <Text style={[styles.statusBadgeText, { color: '#9B1C1C' }]}>
                          Incorrect (-0.5)
                        </Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
                        <Ionicons name="remove-circle-outline" size={14} color="#4B5563" />
                        <Text style={[styles.statusBadgeText, { color: '#4B5563' }]}>
                          Skipped (0.0)
                        </Text>
                      </View>
                    )}

                    <Text style={styles.timeSpentText}>
                      <Ionicons name="time-outline" size={12} color="#64748B" />{' '}
                      {item.time_spent_seconds || 0}s
                    </Text>

                    {/* Bookmark Toggle */}
                    <TouchableOpacity
                      onPress={() => handleToggleBookmark(item)}
                      style={{ padding: 4, marginLeft: 4 }}
                    >
                      <Ionicons
                        name={bookmarkedMap[item.question_id] ? 'bookmark' : 'bookmark-outline'}
                        size={18}
                        color={bookmarkedMap[item.question_id] ? '#0D9488' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Topic & Subtopic */}
                <Text style={styles.topicBreadcrumb}>
                  {item.topic} • {item.subtopic || 'General Concept'}
                </Text>

                {/* Question Text */}
                <Text style={styles.qText}>{item.question_text}</Text>

                {/* Question Image (If Present) */}
                {Boolean(item.image_url) && (
                  <View style={styles.questionImageWrapper}>
                    <Image
                      source={{ uri: item.image_url! }}
                      style={styles.questionImage}
                      resizeMode="contain"
                    />
                  </View>
                )}

                {/* Options List with Visual State */}
                <View style={styles.optionsList}>
                  {item.options.map((opt) => {
                    const isUserChoice = item.user_selected_option_id === opt.id;
                    const isCorrectAnswer = item.correct_option_id === opt.id;

                    let optBg = '#FFFFFF';
                    let optBorder = '#E2E8F0';
                    let labelBg = '#F1F5F9';
                    let labelColor = '#334155';

                    if (isCorrectAnswer) {
                      optBg = '#DEF7EC';
                      optBorder = '#10B981';
                      labelBg = '#10B981';
                      labelColor = '#FFFFFF';
                    } else if (isUserChoice && !isCorrectAnswer) {
                      optBg = '#FDE8E8';
                      optBorder = '#EF4444';
                      labelBg = '#EF4444';
                      labelColor = '#FFFFFF';
                    }

                    return (
                      <View
                        key={opt.id}
                        style={[styles.optionRow, { backgroundColor: optBg, borderColor: optBorder }]}
                      >
                        <View style={[styles.optionCircle, { backgroundColor: labelBg }]}>
                          <Text style={[styles.optionCircleText, { color: labelColor }]}>
                            {opt.label}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.optionText}>{opt.text}</Text>
                          {Boolean(opt.image_url) && (
                            <Image
                              source={{ uri: opt.image_url! }}
                              style={styles.optionImage}
                              resizeMode="contain"
                            />
                          )}
                        </View>
                        {isCorrectAnswer && (
                          <View style={styles.badgeCorrect}>
                            <Text style={styles.badgeCorrectText}>Correct Answer</Text>
                          </View>
                        )}
                        {isUserChoice && !isCorrectAnswer && (
                          <View style={styles.badgeYourChoice}>
                            <Text style={styles.badgeYourChoiceText}>Your Choice</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* ========================================================================= */}
                {/* QUESTION-WISE AI ANALYSIS & WISH / SUGGESTION CARD */}
                {/* ========================================================================= */}
                <View
                  style={[
                    styles.insightCard,
                    {
                      backgroundColor: insight.bgColor,
                      borderColor: insight.borderColor,
                    },
                  ]}
                >
                  <View style={styles.insightHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Ionicons
                        name={insight.iconName}
                        size={18}
                        color={insight.iconColor}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.insightTitle, { color: insight.textColor }]}>
                        {insight.title}
                      </Text>
                    </View>
                    <View style={[styles.insightBadge, { backgroundColor: insight.badgeBg }]}>
                      <Text style={[styles.insightBadgeText, { color: insight.badgeText }]}>
                        {insight.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.insightWishText, { color: insight.textColor }]}>
                    {insight.wish}
                  </Text>
                </View>

                {/* Detailed Explanation */}
                <View style={styles.solutionBox}>
                  <View style={styles.solutionTitleRow}>
                    <Ionicons name="bulb" size={18} color="#D97706" />
                    <Text style={styles.solutionTitle}>Official Explanation:</Text>
                  </View>
                  <Text style={styles.solutionBody}>{item.explanation}</Text>

                  {/* Step by Step Breakdown */}
                  {item.solution_steps && item.solution_steps.length > 0 && (
                    <View style={styles.stepsWrap}>
                      <Text style={styles.stepsHeading}>Step-by-step Solution:</Text>
                      {item.solution_steps.map((st, i) => (
                        <Text key={i} style={styles.stepText}>
                          {i + 1}. {st}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Analysis Container Suggestion */}
                  {item.recommendation && (
                    <View style={styles.recommendationWrap}>
                      <Text style={styles.recLabel}>Analysis & Suggestion:</Text>
                      <Text style={styles.recText}>{item.recommendation}</Text>
                    </View>
                  )}

                  {/* TOPIC-WISE ONLINE ANALYSIS & CURATED STUDY REFERENCE */}
                  {item.topic_analysis && (
                    <View style={styles.questionTopicOnlineCard}>
                      <View style={styles.questionTopicHeaderRow}>
                        <View style={styles.questionTopicBadgeWrap}>
                          <Ionicons name="book" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                          <Text style={styles.questionTopicBadgeText}>
                            {item.topic || item.topic_analysis.topic}
                            {item.subtopic || item.topic_analysis.subtopic
                              ? ` • ${item.subtopic || item.topic_analysis.subtopic}`
                              : ''}
                          </Text>
                        </View>
                        {item.topic_analysis.exam_weightage && (
                          <View style={styles.questionWeightageBadge}>
                            <Text style={styles.questionWeightageBadgeText}>
                              {item.topic_analysis.exam_weightage}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Concept Summary Box */}
                      <View style={styles.questionTopicConceptBox}>
                        <View style={styles.questionTopicBoxLabelRow}>
                          <Ionicons name="bulb-outline" size={13} color="#0369A1" style={{ marginRight: 4 }} />
                          <Text style={styles.questionTopicBoxLabel}>Topic Concept & Core Principle:</Text>
                        </View>
                        <Text style={styles.questionTopicConceptText}>
                          {item.topic_analysis.concept_summary}
                        </Text>
                      </View>

                      {/* Shortcut & Elimination Rule */}
                      <View style={styles.questionTopicRuleBox}>
                        <View style={styles.questionTopicBoxLabelRow}>
                          <Ionicons name="flash-outline" size={13} color="#047857" style={{ marginRight: 4 }} />
                          <Text style={[styles.questionTopicBoxLabel, { color: '#047857' }]}>
                            Shortcut & Elimination Rule:
                          </Text>
                        </View>
                        <Text style={styles.questionTopicRuleText}>
                          {item.topic_analysis.core_rule}
                        </Text>
                      </View>

                      {/* Clickable Online Study Reference */}
                      {item.topic_analysis.online_reference_url && (
                        <TouchableOpacity
                          style={styles.questionOnlineRefButton}
                          onPress={() => openOnlineReference(item.topic_analysis?.online_reference_url)}
                          activeOpacity={0.8}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                            <Ionicons name="globe-outline" size={14} color="#1D4ED8" style={{ marginRight: 6 }} />
                            <Text style={styles.questionOnlineRefButtonText} numberOfLines={1}>
                              {item.topic_analysis.online_reference_title ||
                                `Study ${item.topic} Online (Syllabus & Practice)`}
                            </Text>
                          </View>
                          <Ionicons name="open-outline" size={14} color="#1D4ED8" />
                        </TouchableOpacity>
                      )}

                      {/* Target Pacing Footer */}
                      <View style={styles.questionTopicAnalysisFooter}>
                        <Ionicons name="stopwatch-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                        <Text style={styles.questionTopicPacingText}>
                          Benchmark Pacing: ≤{item.topic_analysis.target_pacing_seconds || 45}s • Section: {item.section_name}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* ========================================================================= */}
                {/* AI QUESTION-WISE WISHES & ERROR DIAGNOSIS RULES PREVIEW */}
                {/* ========================================================================= */}
                <View style={styles.rulesPreviewContainer}>
                  <View style={styles.rulesPreviewHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 6 }}>
                      <Ionicons name="sparkles" size={15} color="#0D9488" style={{ marginRight: 6 }} />
                      <Text style={styles.rulesPreviewTitle}>
                        AI Question-wise Wishes & Error Diagnosis Rules Preview:
                      </Text>
                    </View>
                    <Text style={styles.rulesPreviewSub}>Evaluation Benchmarks</Text>
                  </View>

                  <View style={styles.rulesList}>
                    {getQuestionRulesPreview(item).map((rule) => (
                      <View
                        key={rule.id}
                        style={[
                          styles.ruleBox,
                          {
                            backgroundColor: rule.bgColor,
                            borderColor: rule.borderColor,
                            borderWidth: rule.isMatch ? 2 : 1,
                          },
                        ]}
                      >
                        <View style={styles.ruleTopRow}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 6 }}>
                            <Ionicons
                              name={rule.iconName}
                              size={13}
                              color={rule.badgeBg}
                              style={{ marginRight: 5 }}
                            />
                            <Text
                              style={[styles.ruleTitleText, { color: rule.textColor }]}
                              numberOfLines={1}
                            >
                              {rule.title}
                            </Text>
                          </View>
                          <View style={[styles.ruleBadge, { backgroundColor: rule.badgeBg }]}>
                            <Text style={styles.ruleBadgeText}>{rule.badge}</Text>
                          </View>
                        </View>

                        <Text style={[styles.ruleBodyText, { color: rule.textColor }]}>
                          "{rule.body}"
                        </Text>

                        {rule.isMatch && (
                          <View style={styles.appliedMatchChip}>
                            <Ionicons name="checkmark-circle" size={12} color="#065F46" style={{ marginRight: 4 }} />
                            <Text style={styles.appliedMatchText}>✓ Applied to Your Attempt</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0D9488',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeTopicBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderBottomWidth: 1,
    borderBottomColor: '#CCFBF1',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  activeTopicText: {
    fontSize: 12,
    color: '#0F766E',
  },
  clearTopicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearTopicText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  topicAnalysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  topicHeaderRow: {
    marginBottom: 10,
  },
  topicCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  topicCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  topicScrollContent: {
    gap: 10,
    paddingRight: 8,
  },
  topicChip: {
    width: 170,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  topicChipActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  topicTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  topicChipName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  topicChipNameActive: {
    color: '#0F766E',
  },
  accuracyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accuracyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  topicChipCount: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  topicChipCountActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  questionSectionHeader: {
    marginBottom: 10,
  },
  questionSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  qCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  qNumBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qNumText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D9488',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  timeSpentText: {
    fontSize: 11,
    color: '#64748B',
  },
  topicBreadcrumb: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
  },
  qText: {
    fontSize: 15,
    color: '#0F172A',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 14,
  },
  optionsList: {
    gap: 8,
    marginBottom: 14,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  optionCircleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  optionText: {
    fontSize: 13,
    color: '#1E293B',
    flex: 1,
    lineHeight: 18,
  },
  badgeCorrect: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeCorrectText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeYourChoice: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeYourChoiceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  insightCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  insightBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  insightBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  insightWishText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  solutionBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  solutionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  solutionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  solutionBody: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 19,
  },
  stepsWrap: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingTop: 6,
  },
  stepsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
    marginBottom: 2,
  },
  recommendationWrap: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0D9488',
  },
  recLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  recText: {
    fontSize: 12,
    color: '#334155',
    marginTop: 2,
    lineHeight: 16,
  },
  rulesPreviewContainer: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  rulesPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 4,
  },
  rulesPreviewTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  rulesPreviewSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  rulesList: {
    gap: 8,
  },
  ruleBox: {
    borderRadius: 10,
    padding: 10,
  },
  ruleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ruleTitleText: {
    fontSize: 11,
    fontWeight: '800',
  },
  ruleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ruleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ruleBodyText: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  appliedMatchChip: {
    marginTop: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  appliedMatchText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  questionImageWrapper: {
    marginVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 8,
  },
  questionImage: {
    width: '100%',
    height: 180,
  },
  optionImage: {
    width: '100%',
    height: 90,
    marginTop: 6,
    borderRadius: 4,
  },
  questionTopicOnlineCard: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  questionTopicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionTopicBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  questionTopicBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  questionWeightageBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionWeightageBadgeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  questionTopicConceptBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  questionTopicRuleBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  questionTopicBoxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  questionTopicBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  questionTopicConceptText: {
    fontSize: 11.5,
    color: '#0C4A6E',
    lineHeight: 16.5,
  },
  questionTopicRuleText: {
    fontSize: 11.5,
    color: '#064E3B',
    lineHeight: 16.5,
    fontWeight: '500',
  },
  questionOnlineRefButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  questionOnlineRefButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  questionTopicAnalysisFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  questionTopicPacingText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
});
