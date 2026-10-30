// ==============================================================================
// TAB 3: COMPLETE INTERACTIVE BOOKMARKS & REVISION SCREEN
// File: apps/student/src/app/(tabs)/bookmarks.tsx
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { BookmarkItem } from '@vibhillion/shared';

export default function BookmarksScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await examService.getBookmarks();
      setBookmarks(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookmarks();
  };

  const handleRemoveBookmark = (questionId: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this question from your revision bookmarks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await examService.removeBookmark(questionId);
            setBookmarks((prev) => prev.filter((b) => b.question_id !== questionId));
          },
        },
      ]
    );
  };

  const topics = ['All', ...Array.from(new Set(bookmarks.map((b) => b.topic || 'General')))];

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesTopic = selectedTopic === 'All' || b.topic === selectedTopic;
    const matchesQuery =
      searchQuery.trim() === '' ||
      b.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.topic && b.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.subtopic && b.subtopic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTopic && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Revision Bookmarks</Text>
            <Text style={styles.headerSubtitle}>
              {bookmarks.length} {bookmarks.length === 1 ? 'question' : 'questions'} saved for review
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshIconBtn} onPress={loadBookmarks}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved questions, topics..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Topic Filter Pills */}
        {topics.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicScroll}>
            {topics.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.topicPill, selectedTopic === t && styles.topicPillActive]}
                onPress={() => setSelectedTopic(t)}
              >
                <Text style={[styles.topicPillText, selectedTopic === t && styles.topicPillTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Main Content */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading revision bookmarks...</Text>
        </View>
      ) : filteredBookmarks.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="bookmark-outline" size={48} color="#2563EB" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching bookmarks found' : 'No Bookmarks Saved Yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try searching with different keywords or switch the topic filter.'
                : 'While taking a test in Timed Mode, Practice Mode, or reviewing Solutions, tap the bookmark ribbon to save challenging questions here for instant revision.'}
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)/tests')}
            >
              <Ionicons name="flash-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.exploreBtnText}>Take a Practice Test</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredBookmarks.map((item, idx) => {
            const isExpanded = expandedId === item.question_id;

            return (
              <View key={item.id || item.question_id} style={styles.questionCard}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.metaRow}>
                    <View style={styles.badgeTopic}>
                      <Text style={styles.badgeTopicText}>{item.topic || 'General'}</Text>
                    </View>
                    {item.subtopic ? (
                      <View style={styles.badgeSubtopic}>
                        <Text style={styles.badgeSubtopicText}>{item.subtopic}</Text>
                      </View>
                    ) : null}
                    <View
                      style={[
                        styles.badgeDiff,
                        item.difficulty === 'hard'
                          ? styles.diffHard
                          : item.difficulty === 'medium'
                          ? styles.diffMed
                          : styles.diffEasy,
                      ]}
                    >
                      <Text style={styles.badgeDiffText}>
                        {(item.difficulty || 'medium').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleRemoveBookmark(item.question_id)}
                    style={styles.bookmarkActionBtn}
                  >
                    <Ionicons name="bookmark" size={20} color="#2563EB" />
                  </TouchableOpacity>
                </View>

                {/* Question Text */}
                <Text style={styles.questionNumberText}>Question {idx + 1}</Text>
                <Text style={styles.questionText}>{item.question_text}</Text>

                {/* Options List */}
                <View style={styles.optionsWrap}>
                  {(item.options || []).map((opt) => {
                    const isCorrect = opt.id === item.correct_option_id;
                    return (
                      <View
                        key={opt.id}
                        style={[
                          styles.optionItem,
                          isCorrect && styles.optionItemCorrect,
                        ]}
                      >
                        <View
                          style={[
                            styles.optionLabel,
                            isCorrect && styles.optionLabelCorrect,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionLabelText,
                              isCorrect && styles.optionLabelTextCorrect,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            isCorrect && styles.optionTextCorrect,
                          ]}
                        >
                          {opt.text}
                        </Text>
                        {isCorrect && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#059669"
                            style={styles.correctIcon}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Solution Toggle & Breakdown */}
                {item.explanation && (
                  <View style={styles.solutionSection}>
                    <TouchableOpacity
                      style={styles.toggleSolutionBtn}
                      onPress={() => setExpandedId(isExpanded ? null : item.question_id)}
                    >
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'bulb-outline'}
                        size={18}
                        color="#2563EB"
                      />
                      <Text style={styles.toggleSolutionText}>
                        {isExpanded ? 'Hide Solution & Steps' : 'View Solution & Explanation'}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.expandedSolutionBox}>
                        <Text style={styles.explanationTitle}>Official Explanation:</Text>
                        <Text style={styles.explanationText}>{item.explanation}</Text>

                        {item.solution_steps && item.solution_steps.length > 0 && (
                          <View style={styles.stepsWrap}>
                            <Text style={styles.stepsTitle}>Step-by-Step Derivation:</Text>
                            {item.solution_steps.map((st, sIdx) => (
                              <View key={sIdx} style={styles.stepRow}>
                                <Text style={styles.stepBullet}>{sIdx + 1}.</Text>
                                <Text style={styles.stepText}>{st}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
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
    marginBottom: 12,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0F172A' },
  topicScroll: { flexDirection: 'row', marginTop: 4 },
  topicPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginRight: 8,
  },
  topicPillActive: { backgroundColor: '#FFFFFF' },
  topicPillText: { fontSize: 12, fontWeight: '600', color: '#DBEAFE' },
  topicPillTextActive: { color: '#1E3A8A', fontWeight: '700' },
  centerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 360,
    width: '100%',
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  listContent: { padding: 16, paddingBottom: 32 },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  badgeTopic: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTopicText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  badgeSubtopic: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSubtopicText: { fontSize: 11, color: '#475569', fontWeight: '500' },
  badgeDiff: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  diffEasy: { backgroundColor: '#ECFDF5' },
  diffMed: { backgroundColor: '#FEF3C7' },
  diffHard: { backgroundColor: '#FEE2E2' },
  badgeDiffText: { fontSize: 10, fontWeight: '700', color: '#334155' },
  bookmarkActionBtn: { padding: 4 },
  questionNumberText: { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4 },
  questionText: { fontSize: 15, fontWeight: '600', color: '#0F172A', lineHeight: 22, marginBottom: 14 },
  optionsWrap: { gap: 8, marginBottom: 12 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionItemCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  optionLabel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  optionLabelCorrect: { backgroundColor: '#10B981' },
  optionLabelText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  optionLabelTextCorrect: { color: '#FFFFFF' },
  optionText: { flex: 1, fontSize: 13, color: '#334155' },
  optionTextCorrect: { color: '#065F46', fontWeight: '600' },
  correctIcon: { marginLeft: 8 },
  solutionSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  toggleSolutionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleSolutionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 6,
  },
  expandedSolutionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  explanationTitle: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  explanationText: { fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 8 },
  stepsWrap: { marginTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 6 },
  stepsTitle: { fontSize: 12, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  stepRow: { flexDirection: 'row', marginBottom: 3 },
  stepBullet: { fontSize: 12, fontWeight: '700', color: '#2563EB', width: 20 },
  stepText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },
});
