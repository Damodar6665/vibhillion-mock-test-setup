// ==============================================================================
// SCREEN 1: MAIN HOME SCREEN
// File: apps/student/src/app/(tabs)/index.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { examService } from '@/services/examService';
import { Category } from '@vibhillion/shared';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, exams] = await Promise.all([
        examService.getCategories(),
        examService.getRecentExams(),
      ]);
      setCategories(cats);
      setRecentExams(exams);
    } catch (err) {
      console.warn('Error loading home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Aspirant';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#2563EB']} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{studentName} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.profileBadge}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="person-circle" size={44} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Quick Metrics Banner */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerItem}>
              <Text style={styles.bannerNumber}>{categories.length}</Text>
              <Text style={styles.bannerLabel}>Active Category</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerItem}>
              <Text style={styles.bannerNumber}>1,248+</Text>
              <Text style={styles.bannerLabel}>Total Aspirants</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerItem}>
              <Text style={styles.bannerNumber}>81.8%</Text>
              <Text style={styles.bannerLabel}>Avg Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Main Action: Explore Tests CTA */}
        <View style={styles.sectionContainer}>
          <View style={styles.ctaCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Ready to practice?</Text>
              <Text style={styles.ctaSubtitle}>
                Take the latest SSC CGL Tier-1 Previous Year Paper with real sectional timing.
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push('/(tabs)/tests')}
              >
                <Text style={styles.ctaButtonText}>Open Tests Portal</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Ionicons name="school-outline" size={64} color="#93C5FD" style={styles.ctaIcon} />
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Competitive Exam Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tests')}>
              <Text style={styles.seeAllText}>View All ({categories.length})</Text>
            </TouchableOpacity>
          </View>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => router.push('/(tabs)/tests')}
            >
              <View style={styles.categoryIconWrap}>
                <Ionicons name="ribbon" size={28} color="#2563EB" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryDesc}>{cat.description || 'Staff Selection Commission Exams'}</Text>
                <Text style={styles.categoryCount}>1 Mock Test Available</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Exams & Performance Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Exams & Papers</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tests')}>
              <Text style={styles.seeAllText}>Browse</Text>
            </TouchableOpacity>
          </View>

          {recentExams.map((exam) => (
            <View key={exam.id} style={styles.examCard}>
              <View style={styles.examCardHeader}>
                <View style={styles.badgeWrap}>
                  <Text style={styles.badgeText}>SSC CGL T-1</Text>
                </View>
                <Text style={styles.participantCount}>
                  <Ionicons name="people-outline" size={13} color="#64748B" /> 1,248 participants
                </Text>
              </View>

              <Text style={styles.examTitle}>{exam.title}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="help-circle-outline" size={16} color="#64748B" />
                  <Text style={styles.metaText}>{exam.total_questions || 25} Questions</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <Text style={styles.metaText}>{exam.total_duration_minutes || 15} Mins</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="checkmark-done" size={16} color="#10B981" />
                  <Text style={styles.metaText}>English Sec</Text>
                </View>
              </View>

              <View style={styles.examCardFooter}>
                <View>
                  <Text style={styles.recentScoreLabel}>Top Score / Avg</Text>
                  <Text style={styles.recentScoreVal}>48.0 / 34.0 Marks</Text>
                </View>
                <TouchableOpacity
                  style={styles.startExamBtn}
                  onPress={() => router.push('/(tabs)/tests')}
                >
                  <Text style={styles.startExamBtnText}>Select Paper</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#93C5FD',
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  profileBadge: {
    padding: 2,
  },
  bannerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bannerItem: {
    alignItems: 'center',
    flex: 1,
  },
  bannerNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerLabel: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2,
  },
  bannerDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  ctaCard: {
    backgroundColor: '#1E40AF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: '#DBEAFE',
    lineHeight: 18,
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  ctaIcon: {
    marginLeft: 8,
    opacity: 0.85,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 4,
  },
  examCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeWrap: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  participantCount: {
    fontSize: 12,
    color: '#64748B',
  },
  examTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  examCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentScoreLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  recentScoreVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  startExamBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startExamBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
