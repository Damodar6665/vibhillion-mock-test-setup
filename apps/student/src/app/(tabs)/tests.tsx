// ==============================================================================
// SCREENS 2, 3, 4: TESTS PORTAL (CATEGORIES -> SUB-CATEGORY -> PAPERS)
// File: apps/student/src/app/(tabs)/tests.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { Category, Exam, ExamSection } from '@vibhillion/shared';

type Step = 'categories' | 'subcategories' | 'papers';

export default function TestsScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await examService.getCategories();
      // Initially show only SSC category as specified
      const sscOnly = data.filter(c => c.slug === 'ssc' || c.name.toUpperCase().includes('SSC'));
      setCategories(sscOnly.length > 0 ? sscOnly : data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = async (cat: Category) => {
    setSelectedCategory(cat);
    setCurrentStep('subcategories');
  };

  const handleSelectSubCategory = async () => {
    if (!selectedCategory) return;
    try {
      setLoading(true);
      const examData = await examService.getExamsByCategory(selectedCategory.id);
      setExams(examData);
      setCurrentStep('papers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExam = (exam: Exam, section?: ExamSection) => {
    // Navigate to Screen 5: Test Instructions
    router.push({
      pathname: '/exam/instructions',
      params: {
        examId: exam.id,
        sectionId: section ? section.id : (exam.sections && exam.sections[0]?.id) || 's0000001-0000-0000-0000-000000000001',
        sectionName: section ? section.name : 'English Comprehension',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Screen Header & Breadcrumb */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {currentStep !== 'categories' && (
            <TouchableOpacity
              onPress={() => {
                if (currentStep === 'papers') setCurrentStep('subcategories');
                else if (currentStep === 'subcategories') setCurrentStep('categories');
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>
              {currentStep === 'categories' && 'Exam Categories'}
              {currentStep === 'subcategories' && (selectedCategory?.name || 'SSC')}
              {currentStep === 'papers' && 'Previous Year Papers'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {currentStep === 'categories' && 'Select an exam category to continue'}
              {currentStep === 'subcategories' && 'Select exam preparation stream'}
              {currentStep === 'papers' && 'Select official paper shift and section'}
            </Text>
          </View>
        </View>

        {/* Step indicator pills */}
        <View style={styles.breadcrumbRow}>
          <TouchableOpacity
            style={[styles.crumbPill, currentStep === 'categories' && styles.crumbPillActive]}
            onPress={() => setCurrentStep('categories')}
          >
            <Text style={[styles.crumbText, currentStep === 'categories' && styles.crumbTextActive]}>
              1. Category
            </Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={14} color="#93C5FD" />
          <TouchableOpacity
            style={[styles.crumbPill, currentStep === 'subcategories' && styles.crumbPillActive]}
            onPress={() => selectedCategory && setCurrentStep('subcategories')}
            disabled={!selectedCategory}
          >
            <Text style={[styles.crumbText, currentStep === 'subcategories' && styles.crumbTextActive]}>
              2. Subcategory
            </Text>
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={14} color="#93C5FD" />
          <View style={[styles.crumbPill, currentStep === 'papers' && styles.crumbPillActive]}>
            <Text style={[styles.crumbText, currentStep === 'papers' && styles.crumbTextActive]}>
              3. Papers
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Fetching tests from database...</Text>
        </View>
      ) : (
        <ScrollView style={styles.contentContainer} contentContainerStyle={{ paddingBottom: 30 }}>
          {/* SCREEN 2: EXAM CATEGORIES */}
          {currentStep === 'categories' && (
            <View style={styles.stepSection}>
              <Text style={styles.stepPrompt}>Available Competitive Exam Categories</Text>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.card}
                  onPress={() => handleSelectCategory(cat)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name="school" size={28} color="#2563EB" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{cat.name}</Text>
                    <Text style={styles.cardDesc}>
                      {cat.description || 'Staff Selection Commission - Tier 1 & Tier 2'}
                    </Text>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>1 Stream Active</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* SCREEN 3: SSC SUBCATEGORY */}
          {currentStep === 'subcategories' && (
            <View style={styles.stepSection}>
              <Text style={styles.stepPrompt}>Select Exam Stream under {selectedCategory?.name}</Text>
              <TouchableOpacity
                style={styles.card}
                onPress={handleSelectSubCategory}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="time" size={28} color="#D97706" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>SSC CGL Previous Year Papers</Text>
                  <Text style={styles.cardDesc}>
                    Real examination papers with official sectional time limits and scoring patterns.
                  </Text>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagBadgeText}>1 Paper Available</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          )}

          {/* SCREEN 4: PREVIOUS-YEAR PAPERS */}
          {currentStep === 'papers' && (
            <View style={styles.stepSection}>
              <Text style={styles.stepPrompt}>Available Previous Year Papers</Text>
              {exams.map((exam) => (
                <View key={exam.id} style={styles.paperCard}>
                  <View style={styles.paperHeader}>
                    <View style={styles.yearBadge}>
                      <Text style={styles.yearBadgeText}>2025 • Shift 1</Text>
                    </View>
                    <Text style={styles.paperTag}>Official Shift</Text>
                  </View>

                  <Text style={styles.paperTitle}>{exam.title}</Text>
                  <Text style={styles.paperDesc}>{exam.description}</Text>

                  {/* Section Selection: English Section Initially */}
                  <View style={styles.sectionsContainer}>
                    <Text style={styles.sectionLabel}>Available Test Sections:</Text>
                    
                    <TouchableOpacity
                      style={styles.sectionPillActive}
                      onPress={() => handleSelectExam(exam)}
                    >
                      <View style={styles.secLeft}>
                        <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                        <View>
                          <Text style={styles.secTitle}>English Comprehension</Text>
                          <Text style={styles.secMeta}>25 Questions • 15 Mins • 50 Marks</Text>
                        </View>
                      </View>
                      <View style={styles.startBadge}>
                        <Text style={styles.startBadgeText}>Select</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Placeholder for future sections */}
                    <View style={styles.sectionPillDisabled}>
                      <View style={styles.secLeft}>
                        <Ionicons name="lock-closed" size={18} color="#94A3B8" />
                        <View>
                          <Text style={styles.secTitleDisabled}>General Intelligence & Reasoning</Text>
                          <Text style={styles.secMetaDisabled}>Admin can enable in panel</Text>
                        </View>
                      </View>
                      <Text style={styles.comingSoon}>Coming Soon</Text>
                    </View>

                    <View style={styles.sectionPillDisabled}>
                      <View style={styles.secLeft}>
                        <Ionicons name="lock-closed" size={18} color="#94A3B8" />
                        <View>
                          <Text style={styles.secTitleDisabled}>Quantitative Aptitude</Text>
                          <Text style={styles.secMetaDisabled}>Admin can enable in panel</Text>
                        </View>
                      </View>
                      <Text style={styles.comingSoon}>Coming Soon</Text>
                    </View>

                    <View style={styles.sectionPillDisabled}>
                      <View style={styles.secLeft}>
                        <Ionicons name="lock-closed" size={18} color="#94A3B8" />
                        <View>
                          <Text style={styles.secTitleDisabled}>General Awareness</Text>
                          <Text style={styles.secMetaDisabled}>Admin can enable in panel</Text>
                        </View>
                      </View>
                      <Text style={styles.comingSoon}>Coming Soon</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.launchBtn}
                    onPress={() => handleSelectExam(exam)}
                  >
                    <Text style={styles.launchBtnText}>Proceed with English Section</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    marginRight: 14,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#BFDBFE',
    marginTop: 2,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crumbPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  crumbPillActive: {
    backgroundColor: '#2563EB',
  },
  crumbText: {
    fontSize: 11,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  crumbTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stepSection: {
    padding: 16,
  },
  stepPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  tagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  paperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  yearBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  yearBadgeText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  paperTag: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  paperTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 6,
  },
  paperDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  sectionsContainer: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  sectionPillActive: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    marginBottom: 8,
  },
  secLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  secTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  secMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  startBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionPillDisabled: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    opacity: 0.6,
  },
  secTitleDisabled: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  secMetaDisabled: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  comingSoon: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  launchBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  launchBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
