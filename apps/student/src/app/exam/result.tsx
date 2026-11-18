// ==============================================================================
// VIBHILLION AI: TEST RESULTS & COMPREHENSIVE ANALYTICS (SCREENSHOTS 9, 10, 11)
// File: apps/student/src/app/exam/result.tsx
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { formatDuration, QuestionAnalysis } from '@vibhillion/shared';

export default function ExamResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const attemptId = (params.attemptId as string) || '';
  const paperTitle =
    (params.paperTitle as string) || 'SSC CGL T-I (Held on 12 Sep 2025 S1) – English';
  const totalQuestions = Number(params.totalQuestions || 100);
  const attemptedCount = Number(params.attemptedCount || 0);
  const unattemptedCount = Number(params.unattemptedCount || 100);
  const correctCount = Number(params.correctCount || 0);
  const wrongCount = Number(params.wrongCount || 0);
  const finalScore = Number(params.finalScore || 0);
  const maximumScore = Number(params.maximumScore || 200.0);
  const accuracyPercentage = Number(params.accuracyPercentage || 0);
  const totalTimeSeconds = Number(params.totalTimeSeconds || 1912); // ~31m 52s default

  // Parse local answers map for question review
  let localAnswersMap: Record<string, any> = {};
  try {
    localAnswersMap = JSON.parse((params.answersJson as string) || '{}');
  } catch (_) {}

  // Solutions data for Review Answers accordion (Screenshot 11)
  const [solutions, setSolutions] = useState<QuestionAnalysis[]>([]);
  // Start with all questions collapsed so the 1st question does not open automatically
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [loadingSolutions, setLoadingSolutions] = useState(true);

  // Interactive filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'correct' | 'wrong' | 'unattempted' | 'answered'>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedTopicSectionFilter, setSelectedTopicSectionFilter] = useState<string>('all');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const scrollViewRef = React.useRef<any>(null);
  const [reviewYPos, setReviewYPos] = useState<number>(0);

  // Resolve the specific topic name for each uploaded question
  // (Promotes specific subtopic when topic merely repeats the broad section name like "Reasoning" or "Quantitative Aptitude")
  const resolveEffectiveTopicName = React.useCallback((s: QuestionAnalysis): string => {
    const cleanTopic = (s.topic || '').trim();
    const cleanSub = (s.subtopic || '').trim();
    const secLower = (s.section_name || '').toLowerCase().trim();
    const topicLower = cleanTopic.toLowerCase();

    const isBroadSection =
      Boolean(cleanTopic) &&
      (topicLower === secLower ||
        (secLower.length > 3 && (secLower.includes(topicLower) || topicLower.includes(secLower))) ||
        ['reasoning', 'quantitative aptitude', 'general awareness', 'english', 'arithmetic', 'math', 'maths'].includes(
          topicLower
        ));

    const isSubSpecific =
      Boolean(cleanSub) &&
      !['general', 'concept', 'concept application', 'core concept', 'untitled'].includes(cleanSub.toLowerCase());

    if (isBroadSection && isSubSpecific) {
      return cleanSub;
    }
    if (cleanTopic && !['general', 'general topic', 'untitled'].includes(topicLower)) {
      return cleanTopic;
    }
    if (isSubSpecific) {
      return cleanSub;
    }
    return s.section_name ? `${s.section_name} (Core)` : 'General Topic';
  }, []);

  const scrollToReview = () => {
    if (reviewYPos > 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: reviewYPos - 20, animated: true });
    }
  };

  const openOnlineReference = (url?: string) => {
    if (!url) return;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      Linking.openURL(url).catch((err) => console.warn('Could not open reference URL:', err));
    }
  };

  useEffect(() => {
    async function fetchSolutions() {
      try {
        setLoadingSolutions(true);
        const data = await examService.getSolutions(attemptId, localAnswersMap);
        setSolutions(data);
      } finally {
        setLoadingSolutions(false);
      }
    }
    fetchSolutions();
  }, [attemptId]);

  // Dynamic real counts computed from live solutions data
  const realCorrectCount = solutions.length > 0 ? solutions.filter((s) => s.is_correct).length : correctCount;
  const realWrongCount = solutions.length > 0 ? solutions.filter((s) => !s.is_correct && Boolean(s.user_selected_option_id)).length : wrongCount;
  const realUnattemptedCount = solutions.length > 0 ? solutions.filter((s) => !s.user_selected_option_id).length : unattemptedCount;
  const realAnsweredCount = solutions.length > 0 ? solutions.filter((s) => Boolean(s.user_selected_option_id)).length : attemptedCount;
  const totalCount = solutions.length > 0 ? solutions.length : totalQuestions;

  const realCorrectShare = totalCount > 0 ? Math.round((realCorrectCount / totalCount) * 100) : 0;
  const realWrongShare = totalCount > 0 ? Math.round((realWrongCount / totalCount) * 100) : 0;
  const realUnattemptedShare = totalCount > 0 ? Math.round((realUnattemptedCount / totalCount) * 100) : 0;
  const realAnsweredShare = totalCount > 0 ? Math.round((realAnsweredCount / totalCount) * 100) : 0;

  // Dynamic Topic-Wise Summary across ALL uploaded questions (keyed per section + specific topic name)
  const topicsSummary = React.useMemo(() => {
    const map = new Map<
      string,
      {
        topic: string;
        sectionName: string;
        qs: number;
        answered: number;
        correct: number;
        wrong: number;
        skipped: number;
      }
    >();

    solutions.forEach((s) => {
      const topicName = resolveEffectiveTopicName(s);
      const secName = s.section_name || 'General';
      const key = `${secName}|||${topicName}`.toLowerCase();

      if (!map.has(key)) {
        map.set(key, {
          topic: topicName,
          sectionName: secName,
          qs: 0,
          answered: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
        });
      }
      const entry = map.get(key)!;
      entry.qs += 1;
      if (s.user_selected_option_id) {
        entry.answered += 1;
        if (s.is_correct) entry.correct += 1;
        else entry.wrong += 1;
      } else {
        entry.skipped += 1;
      }
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        acc: item.answered > 0 ? `${Math.round((item.correct / item.answered) * 100)}%` : '—',
      }))
      .sort((a, b) => b.qs - a.qs || a.topic.localeCompare(b.topic));
  }, [solutions, resolveEffectiveTopicName]);

  // Unique section filter tabs derived from uploaded questions across all 4 sections
  const topicSectionTabs = React.useMemo(() => {
    const map = new Map<string, { sectionName: string; topicCount: number; qs: number }>();
    topicsSummary.forEach((t) => {
      if (!map.has(t.sectionName)) {
        map.set(t.sectionName, { sectionName: t.sectionName, topicCount: 0, qs: 0 });
      }
      const item = map.get(t.sectionName)!;
      item.topicCount += 1;
      item.qs += t.qs;
    });
    return Array.from(map.values());
  }, [topicsSummary]);

  // Filtered topics list & pills matching selected Section filter
  const filteredTopicsSummary = React.useMemo(() => {
    if (selectedTopicSectionFilter === 'all') return topicsSummary;
    return topicsSummary.filter(
      (t) => t.sectionName.toLowerCase() === selectedTopicSectionFilter.toLowerCase()
    );
  }, [topicsSummary, selectedTopicSectionFilter]);

  const handleSelectTopicToViewQuestions = (
    topicName: string,
    sectionName?: string,
    targetStatus: 'all' | 'answered' | 'correct' | 'wrong' | 'unattempted' = 'all'
  ) => {
    const isSame =
      selectedTopicFilter.toLowerCase() === topicName.toLowerCase() &&
      statusFilter === targetStatus &&
      targetStatus === 'all';

    if (isSame) {
      setSelectedTopicFilter('all');
      return;
    }

    setSelectedTopicFilter(topicName);
    setSelectedSubjectFilter(sectionName || 'all');
    setStatusFilter(targetStatus);

    // Auto-expand the matching topic's uploaded questions for instant visibility
    const toExpand: Record<string, boolean> = {};
    solutions.forEach((s) => {
      const qTopic = resolveEffectiveTopicName(s);
      const secMatch = !sectionName || (s.section_name || '').toLowerCase() === sectionName.toLowerCase();
      if (secMatch && qTopic.toLowerCase() === topicName.toLowerCase()) {
        const qKey = s.question_id || `q-${s.question_number}`;
        toExpand[qKey] = true;
      }
    });
    setExpandedQuestions((prev) => ({ ...prev, ...toExpand }));
    scrollToReview();
  };

  // Filter questions dynamically based on selected status bucket, subject, and topic
  const filteredSolutions = React.useMemo(() => {
    let list = solutions;

    if (selectedSubjectFilter !== 'all') {
      list = list.filter((s) => {
        const secName = s.section_name || '';
        return (
          secName.toLowerCase().includes(selectedSubjectFilter.toLowerCase()) ||
          (s.topic && s.topic.toLowerCase().includes(selectedSubjectFilter.toLowerCase()))
        );
      });
    }

    if (selectedTopicFilter !== 'all') {
      list = list.filter((s) => {
        const topicName = resolveEffectiveTopicName(s);
        return topicName.toLowerCase() === selectedTopicFilter.toLowerCase();
      });
    }

    if (statusFilter === 'answered') {
      return list.filter((s) => Boolean(s.user_selected_option_id));
    }
    if (statusFilter === 'correct') {
      return list.filter((s) => s.is_correct);
    }
    if (statusFilter === 'wrong') {
      return list.filter((s) => !s.is_correct && Boolean(s.user_selected_option_id));
    }
    if (statusFilter === 'unattempted') {
      return list.filter((s) => !s.user_selected_option_id);
    }
    return list;
  }, [solutions, statusFilter, selectedSubjectFilter, selectedTopicFilter, resolveEffectiveTopicName]);

  const toggleExpand = (qKey: string | number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qKey]: !prev[qKey],
    }));
  };

  // Section breakdown calculations matching Screenshot 10
  const sectionsSummary = [
    {
      subject: 'english',
      name: 'English Comprehension',
      qs: 25,
      answered: 0,
      correct: 0,
      wrong: 0,
      skipped: 25,
      acc: '0%',
    },
    {
      subject: 'general_knowledge',
      name: 'General Awareness',
      qs: 25,
      answered: 0,
      correct: 0,
      wrong: 0,
      skipped: 25,
      acc: '0%',
    },
    {
      subject: 'quantitative_aptitude',
      name: 'Quantitative Aptitude',
      qs: 25,
      answered: 0,
      correct: 0,
      wrong: 0,
      skipped: 25,
      acc: '0%',
    },
    {
      subject: 'reasoning',
      name: 'General Intelligence & Reasoning',
      qs: 25,
      answered: 0,
      correct: 0,
      wrong: 0,
      skipped: 25,
      acc: '0%',
    },
  ];

  // If there are real answers, populate the table dynamically
  solutions.forEach((sol) => {
    let sIdx = 0;
    if (sol.section_id.endsWith('0002')) sIdx = 3; // reasoning
    else if (sol.section_id.endsWith('0003')) sIdx = 2; // quant
    else if (sol.section_id.endsWith('0004')) sIdx = 1; // gk

    if (sol.user_selected_option_id) {
      sectionsSummary[sIdx].answered += 1;
      if (sol.is_correct) {
        sectionsSummary[sIdx].correct += 1;
      } else {
        sectionsSummary[sIdx].wrong += 1;
      }
      sectionsSummary[sIdx].skipped -= 1;
    }
  });

  sectionsSummary.forEach((s) => {
    const att = s.answered;
    s.acc = att > 0 ? `${((s.correct / att) * 100).toFixed(0)}%` : '0%';
  });

  const correctShare = ((correctCount / totalQuestions) * 100).toFixed(1);
  const wrongShare = ((wrongCount / totalQuestions) * 100).toFixed(1);
  const unattemptedShare = ((unattemptedCount / totalQuestions) * 100).toFixed(1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/tests')}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#0D9488" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* EXAM TITLE */}
        <Text style={styles.paperTitleText}>{paperTitle}</Text>

        {/* ========================================================================= */}
        {/* SCORE DONUT GAUGE CARD (SCREENSHOT 9) */}
        {/* ========================================================================= */}
        <View style={styles.scoreGaugeCard}>
          {/* Circular Donut Ring */}
          <View style={styles.donutRing}>
            <View style={styles.donutInner}>
              <Text style={styles.donutScorePercent}>
                {Math.round((Math.max(0, finalScore) / maximumScore) * 100)}%
              </Text>
              <Text style={styles.donutScoreLabel}>SCORE</Text>
            </View>
          </View>

          <Text style={styles.scoreSummaryText}>
            {correctCount} of {totalQuestions} correct • {accuracyPercentage.toFixed(1)}% accuracy
          </Text>

          <Text style={styles.answerDistTitle}>Answer distribution</Text>
          <View style={styles.answerDistDotsRow}>
            {/* Answered first */}
            <TouchableOpacity
              style={styles.distDotItem}
              onPress={() => {
                setStatusFilter('answered');
                setSelectedSubjectFilter('all');
                scrollToReview();
              }}
            >
              <View style={[styles.distDot, { backgroundColor: '#0D9488' }]} />
              <Text style={styles.distDotText}>Answered {realAnsweredCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.distDotItem}
              onPress={() => {
                setStatusFilter('correct');
                setSelectedSubjectFilter('all');
                scrollToReview();
              }}
            >
              <View style={[styles.distDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.distDotText}>Correct {realCorrectCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.distDotItem}
              onPress={() => {
                setStatusFilter('wrong');
                setSelectedSubjectFilter('all');
                scrollToReview();
              }}
            >
              <View style={[styles.distDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.distDotText}>Wrong {realWrongCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.distDotItem}
              onPress={() => {
                setStatusFilter('unattempted');
                setSelectedSubjectFilter('all');
                scrollToReview();
              }}
            >
              <View style={[styles.distDot, { backgroundColor: '#64748B' }]} />
              <Text style={styles.distDotText}>Unanswered {realUnattemptedCount}</Text>
            </TouchableOpacity>
          </View>

          {/* Performance Pill Badge */}
          <View style={styles.perfPillBadge}>
            <Ionicons name="trending-down" size={16} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.perfPillText}>Needs Improvement</Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 4-STATUS PERFORMANCE BREAKDOWN TABLE (CLICKABLE NUMBERS & ROWS TO FILTER) */}
        {/* ========================================================================= */}
        <View style={styles.breakdownTitleRow}>
          <Text style={styles.sectionHeading}>Performance & Question Status Breakdown</Text>
          <Text style={styles.breakdownSubhint}>
            Tap any row or number below to directly display and review the related questions
          </Text>
        </View>

        <View style={styles.tableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { flex: 2.2 }]}>STATUS CATEGORY</Text>
            <Text style={[styles.tableColHeader, { width: 60, textAlign: 'center' }]}>QS</Text>
            <Text style={[styles.tableColHeader, { width: 55, textAlign: 'center' }]}>SHARE</Text>
            <Text style={[styles.tableColHeader, { flex: 1.8, textAlign: 'right' }]}>SCORING IMPACT</Text>
          </View>
          <View style={styles.tableDivider} />

          {/* Row 1: Answered (Attempted) FIRST as requested */}
          <TouchableOpacity
            style={[styles.interactiveTableRow, statusFilter === 'answered' && styles.interactiveTableRowActive]}
            activeOpacity={0.7}
            onPress={() => {
              setStatusFilter(statusFilter === 'answered' ? 'all' : 'answered');
              setSelectedSubjectFilter('all');
              scrollToReview();
            }}
          >
            <View style={{ flex: 2.2, flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.statusDotIcon, { backgroundColor: '#CCFBF1', borderColor: '#99F6E4' }]}>
                <Ionicons name="checkbox" size={14} color="#0D9488" />
              </View>
              <Text style={[styles.tableDataText, { fontWeight: '700', color: '#0D9488', marginLeft: 8 }]}>
                Answered (Attempted)
              </Text>
              {statusFilter === 'answered' && (
                <View style={styles.activeFilterPill}>
                  <Text style={styles.activeFilterPillText}>FILTERED</Text>
                </View>
              )}
            </View>

            {/* Clickable Number Pill */}
            <TouchableOpacity
              style={[styles.numberCellPill, { backgroundColor: '#CCFBF1', borderColor: '#99F6E4' }]}
              onPress={() => {
                setStatusFilter('answered');
                setSelectedSubjectFilter('all');
                scrollToReview();
              }}
            >
              <Text style={[styles.numberCellText, { color: '#0F766E' }]}>
                {realAnsweredCount}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.tableDataText, { width: 55, textAlign: 'center', color: '#64748B' }]}>
              {realAnsweredShare}%
            </Text>
            <Text style={[styles.tableDataText, { flex: 1.8, textAlign: 'right', fontWeight: '700', color: '#0D9488' }]}>
              Net: {(realCorrectCount * 2 - realWrongCount * 0.5).toFixed(1)} marks
            </Text>
          </TouchableOpacity>
          <View style={styles.tableDivider} />

          {/* Row 2: Correct */}
          <TouchableOpacity
            style={[styles.interactiveTableRow, statusFilter === 'correct' && styles.interactiveTableRowActive]}
            activeOpacity={0.7}
            onPress={() => {
              setStatusFilter(statusFilter === 'correct' ? 'all' : 'correct');
              setSelectedSubjectFilter('all');
              scrollToReview();
            }}
          >
            <View style={{ flex: 2.2, flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.statusDotIcon, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                <Ionicons name="checkmark-circle" size={14} color="#059669" />
              </View>
              <Text style={[styles.tableDataText, { fontWeight: '700', color: '#059669', marginLeft: 8 }]}>
                Correct
              </Text>
              {statusFilter === 'correct' && (
                <View style={styles.activeFilterPill}>
                  <Text style={styles.activeFilterPillText}>FILTERED</Text>
                </View>
              )}
            </View>

            {/* Clickable Number Pill */}
            <TouchableOpacity
              style={[styles.numberCellPill, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}
              onPress={() => {
                setStatusFilter('correct');
                setSelectedSubjectFilter('all');
                scrollToReview();
              }}
            >
              <Text style={[styles.numberCellText, { color: '#059669' }]}>
                {realCorrectCount}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.tableDataText, { width: 55, textAlign: 'center', color: '#64748B' }]}>
              {realCorrectShare}%
            </Text>
            <Text style={[styles.tableDataText, { flex: 1.8, textAlign: 'right', fontWeight: '700', color: '#059669' }]}>
              +{(realCorrectCount * 2).toFixed(1)} marks
            </Text>
          </TouchableOpacity>
          <View style={styles.tableDivider} />

          {/* Row 3: Wrong */}
          <TouchableOpacity
            style={[styles.interactiveTableRow, statusFilter === 'wrong' && styles.interactiveTableRowActive]}
            activeOpacity={0.7}
            onPress={() => {
              setStatusFilter(statusFilter === 'wrong' ? 'all' : 'wrong');
              setSelectedSubjectFilter('all');
              scrollToReview();
            }}
          >
            <View style={{ flex: 2.2, flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.statusDotIcon, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                <Ionicons name="close-circle" size={14} color="#DC2626" />
              </View>
              <Text style={[styles.tableDataText, { fontWeight: '700', color: '#DC2626', marginLeft: 8 }]}>
                Wrong
              </Text>
              {statusFilter === 'wrong' && (
                <View style={styles.activeFilterPill}>
                  <Text style={styles.activeFilterPillText}>FILTERED</Text>
                </View>
              )}
            </View>

            {/* Clickable Number Pill */}
            <TouchableOpacity
              style={[styles.numberCellPill, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}
              onPress={() => {
                setStatusFilter('wrong');
                setSelectedSubjectFilter('all');
                scrollToReview();
              }}
            >
              <Text style={[styles.numberCellText, { color: '#DC2626' }]}>
                {realWrongCount}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.tableDataText, { width: 55, textAlign: 'center', color: '#64748B' }]}>
              {realWrongShare}%
            </Text>
            <Text style={[styles.tableDataText, { flex: 1.8, textAlign: 'right', fontWeight: '700', color: '#DC2626' }]}>
              -{(realWrongCount * 0.5).toFixed(1)} penalty
            </Text>
          </TouchableOpacity>
          <View style={styles.tableDivider} />

          {/* Row 4: Skipped / Unattempted */}
          <TouchableOpacity
            style={[styles.interactiveTableRow, statusFilter === 'unattempted' && styles.interactiveTableRowActive]}
            activeOpacity={0.7}
            onPress={() => {
              setStatusFilter(statusFilter === 'unattempted' ? 'all' : 'unattempted');
              setSelectedSubjectFilter('all');
              scrollToReview();
            }}
          >
            <View style={{ flex: 2.2, flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.statusDotIcon, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                <Ionicons name="help-circle" size={14} color="#4F46E5" />
              </View>
              <Text style={[styles.tableDataText, { fontWeight: '700', color: '#4F46E5', marginLeft: 8 }]}>
                Skipped / Unattempted
              </Text>
              {statusFilter === 'unattempted' && (
                <View style={styles.activeFilterPill}>
                  <Text style={styles.activeFilterPillText}>FILTERED</Text>
                </View>
              )}
            </View>

            {/* Clickable Number Pill */}
            <TouchableOpacity
              style={[styles.numberCellPill, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}
              onPress={() => {
                setStatusFilter('unattempted');
                setSelectedSubjectFilter('all');
                scrollToReview();
              }}
            >
              <Text style={[styles.numberCellText, { color: '#4F46E5' }]}>
                {realUnattemptedCount}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.tableDataText, { width: 55, textAlign: 'center', color: '#64748B' }]}>
              {realUnattemptedShare}%
            </Text>
            <Text style={[styles.tableDataText, { flex: 1.8, textAlign: 'right', fontWeight: '600', color: '#64748B' }]}>
              0 marks (Safe)
            </Text>
          </TouchableOpacity>
        </View>

        {/* TIME TAKEN & ACCURACY METRIC CARDS */}
        <View style={styles.metricsTwoCol}>
          <View style={styles.metricCard}>
            <Ionicons name="time-outline" size={24} color="#EA580C" style={{ marginBottom: 6 }} />
            <Text style={styles.metricBigVal}>{formatDuration(totalTimeSeconds)}</Text>
            <Text style={styles.metricSubLabel}>Time Taken</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="disc-outline" size={24} color="#0D9488" style={{ marginBottom: 6 }} />
            <Text style={styles.metricBigVal}>{accuracyPercentage.toFixed(1)}%</Text>
            <Text style={styles.metricSubLabel}>Accuracy</Text>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* SUBJECT AND TOPIC RESULTS TABLE (SCREENSHOT 10) */}
        {/* ========================================================================= */}
        <Text style={styles.sectionHeading}>Subject and topic results</Text>
        <Text style={styles.subjectDescText}>
          This report describes this test, not a permanent judgment of your ability. Progress compares your recent attempts of this same test. Tap any number or subject name to inspect the corresponding questions.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <View style={[styles.tableCard, { minWidth: 440 }]}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableColHeader, { flex: 2.2 }]}>SUBJECT / CATEGORY</Text>
              <Text style={[styles.tableColHeader, { width: 44, textAlign: 'center' }]}>QS</Text>
              <Text style={[styles.tableColHeader, { width: 52, textAlign: 'center', color: '#0D9488' }]}>ANSWERED</Text>
              <Text style={[styles.tableColHeader, { width: 52, textAlign: 'center', color: '#059669' }]}>CORRECT</Text>
              <Text style={[styles.tableColHeader, { width: 52, textAlign: 'center', color: '#DC2626' }]}>WRONG</Text>
              <Text style={[styles.tableColHeader, { width: 52, textAlign: 'center', color: '#4F46E5' }]}>SKIPPED</Text>
              <Text style={[styles.tableColHeader, { width: 44, textAlign: 'right' }]}>ACC</Text>
            </View>
            <View style={styles.tableDivider} />

            {sectionsSummary.map((sec) => (
              <React.Fragment key={sec.subject}>
                <View style={styles.tableDataRow}>
                  {/* Clickable Subject Name */}
                  <TouchableOpacity
                    style={{ flex: 2.2 }}
                    onPress={() => {
                      setSelectedSubjectFilter(selectedSubjectFilter === sec.name ? 'all' : sec.name);
                      setStatusFilter('all');
                      scrollToReview();
                    }}
                  >
                    <Text
                      style={[
                        styles.tableDataText,
                        { fontWeight: '700', color: selectedSubjectFilter === sec.name ? '#0D9488' : '#0F172A' },
                      ]}
                    >
                      {sec.name}
                    </Text>
                  </TouchableOpacity>

                  {/* Clickable Total Questions */}
                  <TouchableOpacity
                    style={[styles.subjectNumberPill, { borderColor: '#E2E8F0', width: 40 }]}
                    onPress={() => {
                      setSelectedSubjectFilter(sec.name);
                      setStatusFilter('all');
                      scrollToReview();
                    }}
                  >
                    <Text style={[styles.tableDataText, { fontWeight: '800' }]}>{sec.qs}</Text>
                  </TouchableOpacity>

                  {/* Clickable Answered */}
                  <TouchableOpacity
                    style={[styles.subjectNumberPill, { borderColor: '#99F6E4', backgroundColor: '#F0FDFA', width: 48 }]}
                    onPress={() => {
                      setSelectedSubjectFilter(sec.name);
                      setStatusFilter('answered');
                      scrollToReview();
                    }}
                  >
                    <Text style={[styles.tableDataText, { fontWeight: '800', color: '#0D9488' }]}>
                      {sec.answered}
                    </Text>
                  </TouchableOpacity>

                  {/* Clickable Correct */}
                  <TouchableOpacity
                    style={[styles.subjectNumberPill, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5', width: 48 }]}
                    onPress={() => {
                      setSelectedSubjectFilter(sec.name);
                      setStatusFilter('correct');
                      scrollToReview();
                    }}
                  >
                    <Text style={[styles.tableDataText, { fontWeight: '800', color: '#059669' }]}>
                      {sec.correct}
                    </Text>
                  </TouchableOpacity>

                  {/* Clickable Wrong */}
                  <TouchableOpacity
                    style={[styles.subjectNumberPill, { borderColor: '#FECACA', backgroundColor: '#FEF2F2', width: 48 }]}
                    onPress={() => {
                      setSelectedSubjectFilter(sec.name);
                      setStatusFilter('wrong');
                      scrollToReview();
                    }}
                  >
                    <Text style={[styles.tableDataText, { fontWeight: '800', color: '#DC2626' }]}>
                      {sec.wrong}
                    </Text>
                  </TouchableOpacity>

                  {/* Clickable Skipped */}
                  <TouchableOpacity
                    style={[styles.subjectNumberPill, { borderColor: '#C7D2FE', backgroundColor: '#EEF2FF', width: 48 }]}
                    onPress={() => {
                      setSelectedSubjectFilter(sec.name);
                      setStatusFilter('unattempted');
                      scrollToReview();
                    }}
                  >
                    <Text style={[styles.tableDataText, { fontWeight: '800', color: '#4F46E5' }]}>
                      {sec.skipped}
                    </Text>
                  </TouchableOpacity>

                  {/* Accuracy */}
                  <Text style={[styles.tableDataText, { width: 44, textAlign: 'right', fontWeight: '700' }]}>
                    {sec.acc}
                  </Text>
                </View>
                <View style={styles.tableDivider} />
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
        <Text style={styles.swipeHintText}>
          Swipe sideways to see all columns. Accuracy is correct ÷ attempted; small samples stay unclassified.
        </Text>

        {/* ========================================================================= */}
        {/* TOPIC-WISE ANALYSIS (FILTER BY SECTION -> CLICK ANY TOPIC NAME -> VIEW QS) */}
        {/* ========================================================================= */}
        {topicsSummary.length > 0 && (
          <>
            <Text style={[styles.sectionHeading, { marginTop: 22 }]}>
              Topic-wise analysis ({filteredTopicsSummary.length} of {topicsSummary.length} Topics)
            </Text>
            <Text style={styles.subjectDescText}>
              Filter topic names by section, then tap any Topic Name pill or row to display its uploaded questions in Review Answers below.
            </Text>

            {/* Step 1: Section Filter Pills across all 4 sections */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 10 }}
              contentContainerStyle={{ flexDirection: 'row', gap: 6, paddingVertical: 2 }}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedTopicSectionFilter === 'all' && {
                    backgroundColor: '#4F46E5',
                    borderColor: '#4F46E5',
                  },
                ]}
                onPress={() => setSelectedTopicSectionFilter('all')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedTopicSectionFilter === 'all' && { color: '#FFFFFF' },
                  ]}
                >
                  All Sections ({topicsSummary.length} Topics)
                </Text>
              </TouchableOpacity>
              {topicSectionTabs.map((secTab) => {
                const isSecSelected =
                  selectedTopicSectionFilter.toLowerCase() === secTab.sectionName.toLowerCase();
                return (
                  <TouchableOpacity
                    key={secTab.sectionName}
                    style={[
                      styles.filterChip,
                      isSecSelected && {
                        backgroundColor: '#4F46E5',
                        borderColor: '#4F46E5',
                      },
                    ]}
                    onPress={() =>
                      setSelectedTopicSectionFilter(isSecSelected ? 'all' : secTab.sectionName)
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSecSelected && { color: '#FFFFFF' },
                      ]}
                    >
                      {secTab.sectionName} ({secTab.topicCount})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Step 2: Filtered Topic Name Pills — click any topic name to display its questions */}
            <View style={[styles.filterChipsRow, { marginBottom: 12 }]}>
              {filteredTopicsSummary.map((t) => {
                const isTopicSelected =
                  selectedTopicFilter.toLowerCase() === t.topic.toLowerCase();
                return (
                  <TouchableOpacity
                    key={`topic-chip-${t.sectionName}-${t.topic}`}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isTopicSelected ? '#0D9488' : '#FFFFFF',
                        borderColor: isTopicSelected ? '#0F766E' : '#CBD5E1',
                      },
                    ]}
                    onPress={() => handleSelectTopicToViewQuestions(t.topic, t.sectionName, 'all')}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: isTopicSelected ? '#FFFFFF' : '#0F766E' },
                      ]}
                    >
                      {t.topic} ({t.qs})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              <View style={[styles.tableCard, { minWidth: 460 }]}>
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColHeader, { flex: 2.4 }]}>TOPIC NAME (CLICK TO VIEW)</Text>
                  <Text style={[styles.tableColHeader, { width: 44, textAlign: 'center' }]}>QS</Text>
                  <Text style={[styles.tableColHeader, { width: 52, textAlign: 'center', color: '#0D9488' }]}>ANSWERED</Text>
                  <Text style={[styles.tableColHeader, { width: 52, textAlign: 'center', color: '#059669' }]}>CORRECT</Text>
                  <Text style={[styles.tableColHeader, { width: 52, textAlign: 'center', color: '#DC2626' }]}>WRONG</Text>
                  <Text style={[styles.tableColHeader, { width: 52, textAlign: 'center', color: '#4F46E5' }]}>SKIPPED</Text>
                  <Text style={[styles.tableColHeader, { width: 44, textAlign: 'right' }]}>ACC</Text>
                </View>
                <View style={styles.tableDivider} />

                {filteredTopicsSummary.map((t) => {
                  const isTopicSelected = selectedTopicFilter.toLowerCase() === t.topic.toLowerCase();
                  return (
                    <React.Fragment key={`${t.sectionName}-${t.topic}`}>
                      <View
                        style={[
                          styles.tableDataRow,
                          isTopicSelected && { backgroundColor: '#F0FDFA', borderRadius: 6 },
                        ]}
                      >
                        {/* Clickable Topic Name */}
                        <TouchableOpacity
                          style={{ flex: 2.4, paddingRight: 6 }}
                          onPress={() => handleSelectTopicToViewQuestions(t.topic, t.sectionName, 'all')}
                        >
                          <Text
                            style={[
                              styles.tableDataText,
                              {
                                fontWeight: '700',
                                color: isTopicSelected ? '#0D9488' : '#0F766E',
                                textDecorationLine: 'underline',
                              },
                            ]}
                          >
                            {t.topic}
                          </Text>
                          <Text style={{ fontSize: 10, color: '#64748B', marginTop: 1 }}>
                            {t.sectionName}
                          </Text>
                        </TouchableOpacity>

                        {/* Total Qs Pill */}
                        <TouchableOpacity
                          style={[styles.subjectNumberPill, { borderColor: '#C7D2FE', backgroundColor: '#EEF2FF', width: 40 }]}
                          onPress={() => handleSelectTopicToViewQuestions(t.topic, t.sectionName, 'all')}
                        >
                          <Text style={[styles.tableDataText, { fontWeight: '800', color: '#3730A3' }]}>
                            {t.qs}
                          </Text>
                        </TouchableOpacity>

                        {/* Answered Pill */}
                        <TouchableOpacity
                          style={[styles.subjectNumberPill, { borderColor: '#99F6E4', backgroundColor: '#F0FDFA', width: 46 }]}
                          onPress={() => handleSelectTopicToViewQuestions(t.topic, t.sectionName, 'answered')}
                        >
                          <Text style={[styles.tableDataText, { fontWeight: '800', color: '#0D9488' }]}>
                            {t.answered}
                          </Text>
                        </TouchableOpacity>

                        {/* Correct Pill */}
                        <TouchableOpacity
                          style={[styles.subjectNumberPill, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5', width: 46 }]}
                          onPress={() => handleSelectTopicToViewQuestions(t.topic, t.sectionName, 'correct')}
                        >
                          <Text style={[styles.tableDataText, { fontWeight: '800', color: '#059669' }]}>
                            {t.correct}
                          </Text>
                        </TouchableOpacity>

                        {/* Wrong Pill */}
                        <TouchableOpacity
                          style={[styles.subjectNumberPill, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', width: 46 }]}
                          onPress={() => handleSelectTopicToViewQuestions(t.topic, t.sectionName, 'wrong')}
                        >
                          <Text style={[styles.tableDataText, { fontWeight: '800', color: '#DC2626' }]}>
                            {t.wrong}
                          </Text>
                        </TouchableOpacity>

                        {/* Skipped Pill */}
                        <TouchableOpacity
                          style={[styles.subjectNumberPill, { borderColor: '#C7D2FE', backgroundColor: '#EEF2FF', width: 46 }]}
                          onPress={() => handleSelectTopicToViewQuestions(t.topic, t.sectionName, 'unattempted')}
                        >
                          <Text style={[styles.tableDataText, { fontWeight: '800', color: '#4F46E5' }]}>
                            {t.skipped}
                          </Text>
                        </TouchableOpacity>

                        {/* Accuracy */}
                        <Text style={[styles.tableDataText, { width: 44, textAlign: 'right', fontWeight: '700' }]}>
                          {t.acc}
                        </Text>
                      </View>
                      <View style={styles.tableDivider} />
                    </React.Fragment>
                  );
                })}
              </View>
            </ScrollView>
          </>
        )}

        {/* NEXT STEPS ADVICE BOX */}
        <Text style={styles.sectionHeading}>Next steps</Text>
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsBold}>
            No subject crossed the improvement threshold.
          </Text>
          <Text style={styles.nextStepsSub}>
            Review skipped answers and keep practising to build on your results.
          </Text>
        </View>

        {/* PROGRESS ON THIS TEST */}
        <View style={styles.progressCard}>
          <Text style={styles.progressCardTitle}>Progress on this test</Text>
          <Text style={styles.progressRowText}>
            29/10/2026: 0% accuracy • 96s per attempted question
          </Text>
          <Text style={styles.progressRowText}>
            29/10/2026: 0% accuracy • Speed unavailable
          </Text>
          <Text style={styles.speedAdviceText}>
            Speed includes thinking and reviewing time. Compare similar attempts, rather than treating speed alone as ability.
          </Text>
        </View>

        {/* BUTTONS: BACK TO TESTS & RETAKE TEST */}
        <View style={styles.bottomButtonsRow}>
          <TouchableOpacity
            style={styles.backToTestsBtn}
            onPress={() => router.replace('/(tabs)/tests')}
          >
            <Ionicons name="arrow-back" size={16} color="#475569" style={{ marginRight: 6 }} />
            <Text style={styles.backToTestsBtnText}>Back to Tests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retakeTestBtn}
            onPress={() =>
              router.replace({
                pathname: '/exam/instructions',
                params: { paperTitle },
              })
            }
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.retakeTestBtnText}>Retake Test</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* REVIEW ANSWERS ACCORDION (SCREENSHOT 11) WITH 4-STATUS FILTERING */}
        {/* ========================================================================= */}
        <View onLayout={(e) => setReviewYPos(e.nativeEvent.layout.y)}>
          <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Review Answers & Topic Explanations</Text>

          {/* 4-STATUS FILTER CHIPS (ANSWERED FIRST AS REQUESTED) */}
          <View style={styles.filterChipsRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === 'all' && selectedSubjectFilter === 'all' && selectedTopicFilter === 'all' && styles.filterChipActive,
              ]}
              onPress={() => {
                setStatusFilter('all');
                setSelectedSubjectFilter('all');
                setSelectedTopicFilter('all');
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === 'all' && selectedSubjectFilter === 'all' && selectedTopicFilter === 'all' && styles.filterChipTextActive,
                ]}
              >
                All ({totalCount})
              </Text>
            </TouchableOpacity>

            {selectedTopicFilter !== 'all' && (
              <TouchableOpacity
                style={[styles.filterChip, { backgroundColor: '#0D9488', borderColor: '#0F766E' }]}
                onPress={() => setSelectedTopicFilter('all')}
              >
                <Text style={[styles.filterChipText, { color: '#FFFFFF', fontWeight: '700' }]}>
                  Topic: {selectedTopicFilter} ×
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.filterChip, statusFilter === 'answered' && styles.filterChipActiveAnswered]}
              onPress={() => setStatusFilter('answered')}
            >
              <Text style={[styles.filterChipText, statusFilter === 'answered' && styles.filterChipTextActiveAnswered]}>
                Answered (Attempted) ({realAnsweredCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, statusFilter === 'correct' && styles.filterChipActiveCorrect]}
              onPress={() => setStatusFilter('correct')}
            >
              <Text style={[styles.filterChipText, statusFilter === 'correct' && styles.filterChipTextActiveCorrect]}>
                Correct ({realCorrectCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, statusFilter === 'wrong' && styles.filterChipActiveWrong]}
              onPress={() => setStatusFilter('wrong')}
            >
              <Text style={[styles.filterChipText, statusFilter === 'wrong' && styles.filterChipTextActiveWrong]}>
                Wrong ({realWrongCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, statusFilter === 'unattempted' && styles.filterChipActiveUnattempted]}
              onPress={() => setStatusFilter('unattempted')}
            >
              <Text style={[styles.filterChipText, statusFilter === 'unattempted' && styles.filterChipTextActiveUnattempted]}>
                Skipped / Unattempted ({realUnattemptedCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active Filter Notice Banner */}
          {(statusFilter !== 'all' || selectedSubjectFilter !== 'all' || selectedTopicFilter !== 'all') && (
            <View style={styles.activeFilterNoticeBox}>
              <Ionicons name="filter" size={15} color="#0D9488" style={{ marginRight: 6 }} />
              <Text style={styles.activeFilterNoticeText}>
                Showing{' '}
                <Text style={{ fontWeight: '800' }}>
                  {filteredSolutions.length}{' '}
                  {statusFilter === 'answered'
                    ? 'ANSWERED (ATTEMPTED)'
                    : statusFilter === 'unattempted'
                    ? 'SKIPPED / UNATTEMPTED'
                    : statusFilter.toUpperCase()}
                </Text>
                {selectedTopicFilter !== 'all' ? ` • Topic: "${selectedTopicFilter}"` : ''}
                {selectedSubjectFilter !== 'all' ? ` in ${selectedSubjectFilter}` : ''} questions
              </Text>
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => {
                  setStatusFilter('all');
                  setSelectedSubjectFilter('all');
                  setSelectedTopicFilter('all');
                }}
              >
                <Text style={styles.clearFilterBtnText}>Show All ({totalCount}) ✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* QUESTION NUMBER QUICK-SELECT PALETTE */}
          {filteredSolutions.length > 0 && (
            <View style={styles.questionPaletteContainer}>
              <View style={styles.questionPaletteHeader}>
                <Ionicons name="apps-outline" size={13} color="#475569" style={{ marginRight: 5 }} />
                <Text style={styles.questionPaletteLabel}>
                  Question Numbers ({filteredSolutions.length} questions):
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.questionPaletteScroll}
              >
                {filteredSolutions.map((sol) => {
                  const qKey = sol.question_id || `q-${sol.question_number}`;
                  const isExpanded = Boolean(expandedQuestions[qKey]);
                  const isCorrect = sol.is_correct;
                  const isAttempted = Boolean(sol.user_selected_option_id);

                  return (
                    <TouchableOpacity
                      key={qKey}
                      style={[
                        styles.paletteNumberBadge,
                        isCorrect && styles.paletteNumberCorrect,
                        !isCorrect && isAttempted && styles.paletteNumberWrong,
                        !isAttempted && styles.paletteNumberSkipped,
                        isExpanded && styles.paletteNumberSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        setExpandedQuestions((prev) => ({
                          ...prev,
                          [qKey]: !prev[qKey],
                        }));
                      }}
                    >
                      <Text
                        style={[
                          styles.paletteNumberText,
                          isCorrect && styles.paletteTextCorrect,
                          !isCorrect && isAttempted && styles.paletteTextWrong,
                          !isAttempted && styles.paletteTextSkipped,
                          isExpanded && { fontWeight: '900' },
                        ]}
                      >
                        Q{sol.question_number}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {loadingSolutions ? (
          <ActivityIndicator size="small" color="#0D9488" style={{ marginVertical: 20 }} />
        ) : filteredSolutions.length === 0 ? (
          <View style={styles.emptyFilteredBox}>
            <Ionicons name="filter-circle-outline" size={36} color="#94A3B8" />
            <Text style={styles.emptyFilteredText}>
              No questions found for status "{statusFilter}".
            </Text>
            <TouchableOpacity
              style={[styles.clearFilterBtn, { marginTop: 10 }]}
              onPress={() => setStatusFilter('all')}
            >
              <Text style={styles.clearFilterBtnText}>Reset to All Questions</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.reviewAccordionList}>
            {filteredSolutions.map((sol) => {
              const qKey = sol.question_id || `q-${sol.question_number}`;
              const isExpanded = Boolean(expandedQuestions[qKey]);
              const userSelected = sol.user_selected_option_id;
              const correctId = sol.correct_option_id;

              return (
                <View key={qKey} style={styles.reviewAccordionItem}>
                  {/* Collapsed Header */}
                  <TouchableOpacity
                    style={styles.reviewHeaderRow}
                    activeOpacity={0.8}
                    onPress={() => toggleExpand(qKey)}
                  >
                    <View style={styles.reviewHeaderLeft}>
                      <View
                        style={[
                          styles.reviewStatusDot,
                          sol.is_correct
                            ? { backgroundColor: '#22C55E' }
                            : userSelected
                            ? { backgroundColor: '#EF4444' }
                            : { backgroundColor: '#94A3B8' },
                        ]}
                      />
                      <Text style={styles.reviewHeaderQuestionTitle} numberOfLines={1}>
                        Q{sol.question_number}. {sol.question_text}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <View style={styles.reviewExpandedBody}>
                      <Text style={styles.expandedQuestionFullText}>
                        {sol.question_text}
                      </Text>

                      {/* Options List */}
                      <View style={styles.reviewOptionsList}>
                        {sol.options?.map((opt) => {
                          const isCorrectOpt = opt.id === correctId;
                          const isUserPicked = opt.id === userSelected;

                          return (
                            <View
                              key={opt.id}
                              style={[
                                styles.reviewOptionBox,
                                isCorrectOpt && styles.reviewOptionCorrect,
                                isUserPicked && !isCorrectOpt && styles.reviewOptionWrong,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.reviewOptionLetter,
                                  isCorrectOpt && { color: '#059669', fontWeight: '800' },
                                  isUserPicked && !isCorrectOpt && { color: '#DC2626' },
                                ]}
                              >
                                {opt.label}. {opt.text}
                              </Text>
                              {isCorrectOpt && (
                                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                              )}
                              {isUserPicked && !isCorrectOpt && (
                                <Ionicons name="close-circle" size={18} color="#DC2626" />
                              )}
                            </View>
                          );
                        })}
                      </View>

                      {/* Explanation Callout Box */}
                      {sol.explanation && (
                        <View style={styles.explanationBox}>
                          <Text style={styles.explanationTitle}>Explanation</Text>
                          <Text style={styles.explanationBodyText}>{sol.explanation}</Text>
                        </View>
                      )}

                      {/* Solution steps */}
                      {sol.solution_steps && sol.solution_steps.length > 0 && (
                        <View style={styles.solutionStepsBox}>
                          <Text style={styles.solutionStepsTitle}>Step-by-step Solution:</Text>
                          {sol.solution_steps.map((st, sIdx) => (
                            <Text key={sIdx} style={styles.solutionStepItem}>
                              • {st}
                            </Text>
                          ))}
                        </View>
                      )}

                      {/* QUESTION ANALYSIS & SUGGESTIONS CONTAINER (SIMPLE & HUMAN UNDERSTANDABLE) */}
                      <View
                        style={[
                          styles.analysisContainer,
                          sol.is_correct && (sol.time_spent_seconds || 0) <= 45 && styles.analysisContainerFast,
                          sol.is_correct && (sol.time_spent_seconds || 0) > 45 && styles.analysisContainerSlow,
                          !sol.is_correct && sol.user_selected_option_id && styles.analysisContainerWrong,
                          !sol.user_selected_option_id && styles.analysisContainerSkipped,
                        ]}
                      >
                        <View style={styles.analysisHeaderRow}>
                          <View style={styles.analysisTagPill}>
                            <Ionicons
                              name={
                                sol.is_correct && (sol.time_spent_seconds || 0) <= 45
                                  ? 'flash'
                                  : sol.is_correct
                                  ? 'time-outline'
                                  : sol.user_selected_option_id
                                  ? 'alert-circle'
                                  : 'help-circle-outline'
                              }
                              size={13}
                              color={
                                sol.is_correct && (sol.time_spent_seconds || 0) <= 45
                                  ? '#059669'
                                  : sol.is_correct
                                  ? '#D97706'
                                  : sol.user_selected_option_id
                                  ? '#DC2626'
                                  : '#4F46E5'
                              }
                              style={{ marginRight: 4 }}
                            />
                            <Text
                              style={[
                                styles.analysisTagText,
                                {
                                  color:
                                    sol.is_correct && (sol.time_spent_seconds || 0) <= 45
                                      ? '#059669'
                                      : sol.is_correct
                                      ? '#B45309'
                                      : sol.user_selected_option_id
                                      ? '#DC2626'
                                      : '#4338CA',
                                },
                              ]}
                            >
                              {sol.is_correct && (sol.time_spent_seconds || 0) <= 45
                                ? '⚡ Great Speed'
                                : sol.is_correct
                                ? '⏳ Do It Fast'
                                : sol.user_selected_option_id
                                ? '⚠️ Needs Improvement'
                                : '📚 Need More Practice'}
                            </Text>
                          </View>

                          <Text style={styles.qTimeText}>
                            Time spent: {sol.time_spent_seconds || 0}s
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.analysisSuggestionText,
                            !sol.is_correct && sol.user_selected_option_id && { color: '#DC2626', fontWeight: '600' },
                          ]}
                        >
                          {sol.recommendation ||
                            (sol.is_correct
                              ? (sol.time_spent_seconds || 0) <= 45
                                ? 'Great work! You solved this fast and correctly. Keep it up!'
                                : 'Do it fast - You got it right (+2.0), but took extra time. Try to solve it faster next time!'
                              : sol.user_selected_option_id
                              ? 'Needs improvement - You got this wrong (-0.5). Need more practice on this topic to avoid mistakes.'
                              : 'Need more practice - You skipped this question. Practice this topic so you can solve it next time.')}
                        </Text>

                        {/* TOPIC-WISE ONLINE ANALYSIS & CURATED STUDY REFERENCE */}
                        {sol.topic_analysis && (
                          <View style={styles.topicAnalysisCard}>
                            {/* Topic Header */}
                            <View style={styles.topicAnalysisHeaderRow}>
                              <View style={styles.topicBadgeWrap}>
                                <Ionicons name="book" size={12} color="#0284C7" style={{ marginRight: 4 }} />
                                <Text style={styles.topicBadgeText}>
                                  {sol.topic || sol.topic_analysis.topic}
                                  {sol.subtopic || sol.topic_analysis.subtopic
                                    ? ` • ${sol.subtopic || sol.topic_analysis.subtopic}`
                                    : ''}
                                </Text>
                              </View>
                              {sol.topic_analysis.exam_weightage && (
                                <View style={styles.weightageBadge}>
                                  <Text style={styles.weightageBadgeText}>
                                    {sol.topic_analysis.exam_weightage}
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Core Concept Box */}
                            <View style={styles.topicConceptBox}>
                              <View style={styles.topicBoxLabelRow}>
                                <Ionicons name="bulb-outline" size={13} color="#0369A1" style={{ marginRight: 4 }} />
                                <Text style={styles.topicBoxLabel}>Topic Concept & Core Principle:</Text>
                              </View>
                              <Text style={styles.topicConceptText}>
                                {sol.topic_analysis.concept_summary}
                              </Text>
                            </View>

                            {/* Shortcut & Elimination Rule */}
                            <View style={styles.topicRuleBox}>
                              <View style={styles.topicBoxLabelRow}>
                                <Ionicons name="flash-outline" size={13} color="#047857" style={{ marginRight: 4 }} />
                                <Text style={[styles.topicBoxLabel, { color: '#047857' }]}>
                                  Shortcut & Elimination Rule:
                                </Text>
                              </View>
                              <Text style={styles.topicRuleText}>
                                {sol.topic_analysis.core_rule}
                              </Text>
                            </View>

                            {/* Clickable Online Study Reference */}
                            {sol.topic_analysis.online_reference_url && (
                              <TouchableOpacity
                                style={styles.onlineRefButton}
                                onPress={() => openOnlineReference(sol.topic_analysis?.online_reference_url)}
                                activeOpacity={0.8}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                                  <Ionicons name="globe-outline" size={14} color="#1D4ED8" style={{ marginRight: 6 }} />
                                  <Text style={styles.onlineRefButtonText} numberOfLines={1}>
                                    {sol.topic_analysis.online_reference_title ||
                                      `Study ${sol.topic} Online (Syllabus & Practice)`}
                                  </Text>
                                </View>
                                <Ionicons name="open-outline" size={14} color="#1D4ED8" />
                              </TouchableOpacity>
                            )}

                            {/* Target Pacing Footer */}
                            <View style={styles.topicAnalysisFooter}>
                              <Ionicons name="stopwatch-outline" size={12} color="#64748B" style={{ marginRight: 4 }} />
                              <Text style={styles.topicPacingText}>
                                Benchmark Pacing: ≤{sol.topic_analysis.target_pacing_seconds || 45}s • Section: {sol.section_name}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
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
  paperTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreGaugeCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  donutRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  donutInner: {
    alignItems: 'center',
  },
  donutScorePercent: {
    fontSize: 30,
    fontWeight: '900',
    color: '#B45309',
  },
  donutScoreLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  scoreSummaryText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 8,
  },
  answerDistTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  answerDistDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  distDotItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  distDotText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  perfPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  perfPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    marginTop: 10,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  tableColHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tableDataText: {
    fontSize: 13,
    color: '#334155',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  metricsTwoCol: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  metricBigVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricSubLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  subjectDescText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  swipeHintText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  nextStepsCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  nextStepsBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 4,
  },
  nextStepsSub: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  progressCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  progressRowText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 4,
  },
  speedAdviceText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginTop: 6,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  backToTestsBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 13,
  },
  backToTestsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  retakeTestBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 16,
    paddingVertical: 13,
  },
  retakeTestBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewAccordionList: {
    gap: 10,
  },
  reviewAccordionItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  reviewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  reviewStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  reviewHeaderQuestionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  reviewExpandedBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  expandedQuestionFullText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 14,
  },
  reviewOptionsList: {
    gap: 8,
    marginBottom: 14,
  },
  reviewOptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  reviewOptionCorrect: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  reviewOptionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  reviewOptionLetter: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  explanationBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  explanationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  explanationBodyText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  solutionStepsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  solutionStepsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  solutionStepItem: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  questionAnalysisFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  analysisContainer: {
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  analysisContainerFast: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  analysisContainerSlow: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  analysisContainerWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  analysisContainerSkipped: {
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
  },
  analysisHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  analysisTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  analysisTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  analysisSuggestionText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
  },
  qTimeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  qRecommendationText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  topicAnalysisCard: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
  },
  topicAnalysisHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  topicBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  weightageBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  weightageBadgeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  topicConceptBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  topicRuleBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  topicBoxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  topicBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  topicConceptText: {
    fontSize: 11.5,
    color: '#0C4A6E',
    lineHeight: 16.5,
  },
  topicRuleText: {
    fontSize: 11.5,
    color: '#064E3B',
    lineHeight: 16.5,
    fontWeight: '500',
  },
  onlineRefButton: {
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
  onlineRefButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  topicAnalysisFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  topicPacingText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  breakdownTitleRow: {
    marginTop: 10,
    marginBottom: 4,
  },
  breakdownSubhint: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  interactiveTableRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  interactiveTableRowActive: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  statusDotIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterPill: {
    backgroundColor: '#0D9488',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  activeFilterPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipActiveCorrect: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterChipActiveWrong: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  filterChipActiveUnattempted: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterChipActiveAnswered: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipTextActiveCorrect: {
    color: '#FFFFFF',
  },
  filterChipTextActiveWrong: {
    color: '#FFFFFF',
  },
  filterChipTextActiveUnattempted: {
    color: '#FFFFFF',
  },
  filterChipTextActiveAnswered: {
    color: '#FFFFFF',
  },
  activeFilterNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  activeFilterNoticeText: {
    fontSize: 12,
    color: '#0F766E',
    flex: 1,
  },
  clearFilterBtn: {
    backgroundColor: '#0D9488',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearFilterBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyFilteredBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    marginVertical: 12,
  },
  emptyFilteredText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  numberCellPill: {
    width: 48,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  numberCellText: {
    fontSize: 13,
    fontWeight: '800',
  },
  subjectNumberPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionPaletteContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  questionPaletteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionPaletteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  questionPaletteScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  paletteNumberBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  paletteNumberCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  paletteNumberWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  paletteNumberSkipped: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  paletteNumberSelected: {
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  paletteNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  paletteTextCorrect: {
    color: '#059669',
  },
  paletteTextWrong: {
    color: '#DC2626',
  },
  paletteTextSkipped: {
    color: '#64748B',
  },
});
