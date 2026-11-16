// ==============================================================================
// VIBHILLION AI: MOCK TESTS EXPLORER (MATCHING SCREENSHOTS 1, 2, 3)
// File: apps/student/src/app/(tabs)/tests.tsx
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { examService } from '@/services/examService';
import { UserAttemptHistory, Exam, Category } from '@vibhillion/shared';

type SubView = 'categories' | 'subexams' | 'papers';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'paper' | 'subexam' | 'category';
  action: () => void;
}

// Official Emblem Badges directly from the uploaded screenshots
const CategoryEmblem: React.FC<{ type: string }> = ({ type }) => {
  const normalized = (type || '').toLowerCase();
  const sources: Record<string, any> = {
    upsc: require('@/assets/images/emblems/upsc.png'),
    ssc: require('@/assets/images/emblems/ssc.png'),
    appsc: require('@/assets/images/emblems/appsc.png'),
    rrb: require('@/assets/images/emblems/rrb.png'),
  };

  if (sources[normalized]) {
    return (
      <View style={styles.emblemWrapper}>
        <Image
          source={sources[normalized]}
          style={styles.emblemImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.emblemWrapper,
        {
          backgroundColor: '#F0FDFA',
          borderWidth: 1,
          borderColor: '#CCFBF1',
          justifyContent: 'center',
          alignItems: 'center',
        },
      ]}
    >
      <Ionicons name="school" size={24} color="#0D9488" />
    </View>
  );
};

export default function TestsScreen() {
  const router = useRouter();
  const [subView, setSubView] = useState<SubView>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState<UserAttemptHistory[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryExams, setCategoryExams] = useState<Exam[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);

  // Load live attempts, categories and exam configuration
  const loadData = async () => {
    try {
      const [history, examDetails, cats, allEx] = await Promise.all([
        examService.getUserAttemptHistory(),
        examService.getExamDetails('e0000001-0000-0000-0000-000000000001'),
        examService.getCategories(),
        examService.getAllExams(),
      ]);
      setRecentAttempts(history);
      setExam(examDetails);
      setCategories(cats);
      setAllExams(allEx);
    } catch {
      // Keep fallbacks
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectCategory = async (cat: Category) => {
    setSelectedCategory(cat);
    try {
      const examsInCat = await examService.getExamsByCategory(cat.id);
      setCategoryExams(examsInCat);
    } catch {
      setCategoryExams([]);
    }
    setSubView('subexams');
  };

  const handleSelectExam = (selectedExam: Exam) => {
    router.push({
      pathname: '/exam/instructions',
      params: {
        examId: selectedExam.id,
        paperTitle: selectedExam.title,
      },
    });
  };

  // Handle Paper Selection -> Navigate to Instructions screen
  const handleSelectPaper = (paperTitle: string) => {
    router.push({
      pathname: '/exam/instructions',
      params: {
        examId: 'e0000001-0000-0000-0000-000000000001',
        sectionId: 'a0000001-0000-0000-0000-000000000001',
        paperTitle,
      },
    });
  };

  // Search items database for live searching
  const searchItems: SearchItem[] = [
    {
      id: 'p1',
      title: 'SSC CGL T-I (Held on 12 Sep 2025 S1) – English',
      subtitle: `${Math.round((exam?.total_duration_seconds || 3600) / 60)} min ${exam?.total_questions || 100} Qs • Official Paper`,
      type: 'paper',
      action: () => handleSelectPaper('SSC CGL T-I (Held on 12 Sep 2025 S1) – English'),
    },
    {
      id: 'p2',
      title: 'SSC CGL Tier 1 2024 Set 1',
      subtitle: 'Previous Year Mock Paper • Medium',
      type: 'paper',
      action: () => handleSelectPaper('SSC CGL Tier 1 2024 Set 1'),
    },
    {
      id: 'p3',
      title: 'SSC CGL T-I Similar Paper (Held on 12 Sep 2025 S2) – English',
      subtitle: 'Shift 2 Practice Exam • Tier 1',
      type: 'paper',
      action: () => handleSelectPaper('SSC CGL T-I Similar Paper (Held on 12 Sep 2025 S2) – English'),
    },
    {
      id: 's1',
      title: 'SSC CGL Previous Year Papers',
      subtitle: '20 mock tests • Tier 1 Shift Papers',
      type: 'subexam',
      action: () => {
        setSubView('papers');
        setSearchQuery('');
      },
    },
    {
      id: 'c1',
      title: 'SSC (Staff Selection Commission)',
      subtitle: '39 exam blocks • Competitive Exams',
      type: 'category',
      action: () => {
        setSubView('subexams');
        setSearchQuery('');
      },
    },
  ];

  const filteredSearchItems =
    searchQuery.trim().length > 0
      ? searchItems.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
            item.subtitle.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
      : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BAR / TITLE */}
        <View style={styles.topHeader}>
          <Text style={styles.screenTitle}>Mock Tests</Text>
          <Text style={styles.screenSubtitle}>Practice with full-length exam simulations</Text>
        </View>

        {/* SEARCH BAR (WITH HOVER & FOCUS EFFECT) */}
        <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
          <Ionicons
            name="search-outline"
            size={20}
            color={isSearchFocused ? '#0D9488' : '#94A3B8'}
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search exams..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (filteredSearchItems.length > 0) {
                filteredSearchItems[0].action();
                setSearchQuery('');
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* SEARCH RESULTS DROPDOWN */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.searchResultsBox}>
            <View style={styles.searchHeaderRow}>
              <Text style={styles.searchResultsHeader}>Search Results</Text>
              <Text style={styles.searchResultCount}>
                {filteredSearchItems.length} match{filteredSearchItems.length === 1 ? '' : 'es'}
              </Text>
            </View>
            {filteredSearchItems.length === 0 ? (
              <View style={styles.searchEmptyBox}>
                <Ionicons name="search-outline" size={24} color="#CBD5E1" />
                <Text style={styles.searchEmptyText}>No exams found matching "{searchQuery}"</Text>
              </View>
            ) : (
              filteredSearchItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.searchResultItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    item.action();
                    setSearchQuery('');
                  }}
                >
                  <View style={styles.searchResultIconBox}>
                    <Ionicons
                      name={
                        item.type === 'paper'
                          ? 'document-text-outline'
                          : item.type === 'subexam'
                          ? 'albums-outline'
                          : 'school-outline'
                      }
                      size={18}
                      color="#0D9488"
                    />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.searchResultTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.searchResultSubtitle}>{item.subtitle}</Text>
                  </View>
                  <View
                    style={[
                      styles.searchTypePill,
                      item.type === 'paper'
                        ? styles.typePaper
                        : item.type === 'subexam'
                        ? styles.typeSubexam
                        : styles.typeCategory,
                    ]}
                  >
                    <Text
                      style={[
                        styles.searchTypePillText,
                        item.type === 'paper'
                          ? styles.textPaper
                          : item.type === 'subexam'
                          ? styles.textSubexam
                          : styles.textCategory,
                      ]}
                    >
                      {item.type === 'paper' ? 'Paper' : item.type === 'subexam' ? 'Sub-exam' : 'Category'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* COMPETITIVE EXAMS HEADER */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="book-outline" size={18} color="#0D9488" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Competitive Exams</Text>
          </View>
          <Text style={styles.sectionBadgeText}>
            {categories.length} Categor{categories.length === 1 ? 'y' : 'ies'}  |  {allExams.length} Exams
          </Text>
        </View>

        {/* RECENT TESTS HORIZONTAL LIST (ONLY SHOWS REAL ATTEMPTED EXAMS) */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Ionicons name="trophy-outline" size={17} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.recentTitle}>Recent Tests</Text>
          </View>

          {recentAttempts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScrollContent}
            >
              {recentAttempts.map((attempt) => {
                const dateStr = attempt.submitted_at
                  ? new Date(attempt.submitted_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                  : 'Recent';
                const scorePct = Math.round(
                  attempt.accuracy_percentage ??
                    (attempt.maximum_score ? (attempt.score / attempt.maximum_score) * 100 : 0)
                );
                const isPassing = scorePct >= 50;

                return (
                  <TouchableOpacity
                    key={attempt.id}
                    style={styles.recentCard}
                    activeOpacity={0.8}
                    onPress={() =>
                      handleSelectPaper(attempt.exam_title || 'SSC CGL T-I (Held on 12 Sep 2025 S1) – English')
                    }
                  >
                    <Text style={styles.recentCardTitle} numberOfLines={1}>
                      {attempt.exam_title?.slice(0, 14) || 'SSC CGL T-I'}...
                    </Text>
                    <Text style={styles.recentCardDate}>{dateStr}</Text>
                    <Text style={[styles.recentCardScore, { color: isPassing ? '#059669' : '#EF4444' }]}>
                      {scorePct}%
                    </Text>
                    <Text style={styles.recentCardFraction}>
                      {Math.round(attempt.score)}/{Math.round(attempt.maximum_score || 200)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyRecentCard}>
              <Ionicons name="time-outline" size={20} color="#0D9488" style={{ marginRight: 8 }} />
              <Text style={styles.emptyRecentText}>
                No tests attempted yet. Attempt your first mock test below!
              </Text>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* VIEW 1: DYNAMIC CATEGORIES (SSC, UPSC, APPSC, RRB & CUSTOM) */}
        {/* ========================================================================= */}
        {subView === 'categories' && (
          <View style={styles.gridContainer}>
            {categories.map((cat) => {
              const examCount = allExams.filter((e) => e.category_id === cat.id).length;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.gridCard}
                  activeOpacity={0.85}
                  onPress={() => handleSelectCategory(cat)}
                >
                  <CategoryEmblem type={cat.slug || cat.name} />
                  <View style={styles.gridCardText}>
                    <Text style={styles.gridCardTitle}>{cat.name}</Text>
                    <Text style={styles.gridCardSub}>
                      {examCount > 0 ? `${examCount} exam${examCount > 1 ? 's' : ''} available` : (cat.description || 'Competitive Exams')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DYNAMIC EXAMS FOR SELECTED CATEGORY */}
        {/* ========================================================================= */}
        {subView === 'subexams' && selectedCategory && (
          <View style={styles.subFlowContainer}>
            {/* Active Category Header Card */}
            <View style={styles.activeCategoryCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CategoryEmblem type={selectedCategory.slug || selectedCategory.name} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.activeCatTitle}>{selectedCategory.name}</Text>
                  <Text style={styles.activeCatSub}>
                    {categoryExams.length} exam{categoryExams.length !== 1 ? 's' : ''} configured
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.allGroupsBtn}
                onPress={() => setSubView('categories')}
              >
                <Text style={styles.allGroupsBtnText}>All Categories</Text>
              </TouchableOpacity>
            </View>

            {/* Sub-exam title */}
            <Text style={styles.chooseSubTitle}>Available Exams & Tests</Text>

            {categoryExams.length === 0 ? (
              <View style={styles.emptyRecentCard}>
                <Ionicons name="information-circle-outline" size={22} color="#0D9488" style={{ marginRight: 8 }} />
                <Text style={styles.emptyRecentText}>
                  No exams created in this category yet. Create exams in the admin portal to practice here.
                </Text>
              </View>
            ) : (
              categoryExams.map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  style={styles.subExamCard}
                  activeOpacity={0.8}
                  onPress={() => handleSelectExam(ex)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.subExamTitle}>{ex.title}</Text>
                      <Text style={styles.subExamCount}>
                        {ex.year ? `${ex.year} • ` : ''}{ex.session || 'Shift 1'} • {ex.total_questions || 100} Qs • {Math.round((ex.total_duration_seconds || 3600) / 60)} mins
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#0D9488" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: PAPERS LIST (SCREENSHOT 3) */}
        {/* ========================================================================= */}
        {subView === 'papers' && (
          <View style={styles.subFlowContainer}>
            {/* Active Sub-exam Header Card */}
            <View style={styles.activeCategoryCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <CategoryEmblem type="ssc" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.activeCatTitle} numberOfLines={1}>
                    SSC / SSC CGL Previous Year Papers
                  </Text>
                  <Text style={styles.activeCatSub}>39 exam blocks</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.allGroupsBtn}
                onPress={() => setSubView('subexams')}
              >
                <Text style={styles.allGroupsBtnText}>All sub-exams</Text>
              </TouchableOpacity>
            </View>

            {/* Papers list - Only Paper 1 remains */}
            {/* Paper 1: SSC CGL T-I (Held on 12 Sep 2025 S1) – English */}
            <TouchableOpacity
              style={styles.paperCard}
              activeOpacity={0.85}
              onPress={() => handleSelectPaper('SSC CGL T-I (Held on 12 Sep 2025 S1) – English')}
            >
              <View style={styles.paperIconBox}>
                <Image
                  source={require('@/assets/images/emblems/paper_icon.png')}
                  style={styles.paperIconImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.paperInfo}>
                <Text style={styles.paperTitle}>
                  SSC CGL T-I (Held on 12 Sep 2025 S1) – English
                </Text>
                <View style={styles.paperMetaRow}>
                  <View style={styles.mediumBadge}>
                    <Text style={styles.mediumBadgeText}>Medium</Text>
                  </View>
                  <Text style={styles.paperDetailsText}>
                    {Math.round((exam?.total_duration_seconds || 3600) / 60)} min {exam?.total_questions || 100} Qs
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 40,
  },
  topHeader: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '400',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
  },
  searchBarFocused: {
    borderColor: '#0D9488',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none' as any,
  },
  searchResultsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: 12,
    marginBottom: 20,
    marginTop: -10,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  searchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  searchResultsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchResultCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchResultIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchResultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchResultSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  searchTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  searchTypePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  typePaper: {
    backgroundColor: '#F0FDFA',
  },
  textPaper: {
    color: '#0D9488',
  },
  typeSubexam: {
    backgroundColor: '#EEF2FF',
  },
  textSubexam: {
    color: '#4F46E5',
  },
  typeCategory: {
    backgroundColor: '#FFF7ED',
  },
  textCategory: {
    color: '#EA580C',
  },
  searchEmptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchEmptyText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  recentSection: {
    marginBottom: 24,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  recentScrollContent: {
    paddingRight: 8,
    gap: 12,
  },
  recentCard: {
    width: 132,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  recentCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  recentCardDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  recentCardScore: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 2,
  },
  recentCardFraction: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyRecentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  emptyRecentText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    lineHeight: 18,
  },
  gridContainer: {
    gap: 12,
  },
  gridCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  gridCardText: {
    marginLeft: 10,
    flex: 1,
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  gridCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  subFlowContainer: {
    gap: 12,
  },
  activeCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
  },
  activeCatTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeCatSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  allGroupsBtn: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  allGroupsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  chooseSubTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 4,
  },
  subExamCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  subExamTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  subExamCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  paperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  paperIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paperInfo: {
    flex: 1,
  },
  paperTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  paperMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  mediumBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mediumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  paperDetailsText: {
    fontSize: 12,
    color: '#64748B',
  },
  emblemWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  paperIconImage: {
    width: 28,
    height: 28,
  },
});
