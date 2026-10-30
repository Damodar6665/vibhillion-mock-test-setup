// ==============================================================================
// VIBHILLION AI: MOCK TESTS EXPLORER (MATCHING SCREENSHOTS 1, 2, 3)
// File: apps/student/src/app/(tabs)/tests.tsx
// ==============================================================================

import React, { useState } from 'react';
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

type SubView = 'categories' | 'subexams' | 'papers';

// Official Emblem Badges directly from the uploaded screenshots
const CategoryEmblem: React.FC<{ type: 'upsc' | 'ssc' | 'appsc' | 'rrb' }> = ({ type }) => {
  const sources = {
    upsc: require('@/assets/images/emblems/upsc.png'),
    ssc: require('@/assets/images/emblems/ssc.png'),
    appsc: require('@/assets/images/emblems/appsc.png'),
    rrb: require('@/assets/images/emblems/rrb.png'),
  };

  return (
    <View style={styles.emblemWrapper}>
      <Image
        source={sources[type]}
        style={styles.emblemImage}
        resizeMode="contain"
      />
    </View>
  );
};

export default function TestsScreen() {
  const router = useRouter();
  const [subView, setSubView] = useState<SubView>('categories');
  const [searchQuery, setSearchQuery] = useState('');

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

        {/* SEARCH BAR */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search exams..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* COMPETITIVE EXAMS HEADER */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="book-outline" size={18} color="#0D9488" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Competitive Exams</Text>
          </View>
          <Text style={styles.sectionBadgeText}>4 Categories  |  89+ Topics</Text>
        </View>

        {/* RECENT TESTS HORIZONTAL LIST */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Ionicons name="trophy-outline" size={17} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.recentTitle}>Recent Tests</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScrollContent}
          >
            {/* Card 1 */}
            <TouchableOpacity
              style={styles.recentCard}
              activeOpacity={0.8}
              onPress={() => handleSelectPaper('SSC CGL T-I (Held on 12 Sep 2025 S1) – English')}
            >
              <Text style={styles.recentCardTitle} numberOfLines={1}>SSC CGL T-I (H...</Text>
              <Text style={styles.recentCardDate}>29 Oct</Text>
              <Text style={styles.recentCardScore}>0%</Text>
              <Text style={styles.recentCardFraction}>0/100</Text>
            </TouchableOpacity>

            {/* Card 2 */}
            <TouchableOpacity
              style={styles.recentCard}
              activeOpacity={0.8}
              onPress={() => handleSelectPaper('UPSC 2015 Paper 1')}
            >
              <Text style={styles.recentCardTitle} numberOfLines={1}>UPSC 2015 Pap...</Text>
              <Text style={styles.recentCardDate}>29 Oct</Text>
              <Text style={styles.recentCardScore}>2%</Text>
              <Text style={styles.recentCardFraction}>5/100</Text>
            </TouchableOpacity>

            {/* Card 3 */}
            <TouchableOpacity
              style={styles.recentCard}
              activeOpacity={0.8}
              onPress={() => handleSelectPaper('UPSC 2015 Paper 2')}
            >
              <Text style={styles.recentCardTitle} numberOfLines={1}>UPSC 2015 Pap...</Text>
              <Text style={styles.recentCardDate}>21 Oct</Text>
              <Text style={styles.recentCardScore}>0%</Text>
              <Text style={styles.recentCardFraction}>1/100</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* ========================================================================= */}
        {/* VIEW 1: CATEGORIES GRID (SCREENSHOT 1) */}
        {/* ========================================================================= */}
        {subView === 'categories' && (
          <View style={styles.gridContainer}>
            {/* UPSC */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              onPress={() => setSubView('subexams')}
            >
              <CategoryEmblem type="upsc" />
              <View style={styles.gridCardText}>
                <Text style={styles.gridCardTitle}>UPSC</Text>
                <Text style={styles.gridCardSub}>1 exam blocks</Text>
              </View>
            </TouchableOpacity>

            {/* SSC (Main Target Flow) */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              onPress={() => setSubView('subexams')}
            >
              <CategoryEmblem type="ssc" />
              <View style={styles.gridCardText}>
                <Text style={styles.gridCardTitle}>SSC</Text>
                <Text style={styles.gridCardSub}>39 exam blocks</Text>
              </View>
            </TouchableOpacity>

            {/* APPSC */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              onPress={() => setSubView('subexams')}
            >
              <CategoryEmblem type="appsc" />
              <View style={styles.gridCardText}>
                <Text style={styles.gridCardTitle}>APPSC</Text>
                <Text style={styles.gridCardSub}>37 exam blocks</Text>
              </View>
            </TouchableOpacity>

            {/* RRB */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.85}
              onPress={() => setSubView('subexams')}
            >
              <CategoryEmblem type="rrb" />
              <View style={styles.gridCardText}>
                <Text style={styles.gridCardTitle}>RRB</Text>
                <Text style={styles.gridCardSub}>12 exam blocks</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SUB-EXAM LIST FOR SSC (SCREENSHOT 2) */}
        {/* ========================================================================= */}
        {subView === 'subexams' && (
          <View style={styles.subFlowContainer}>
            {/* Active Category Header Card */}
            <View style={styles.activeCategoryCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CategoryEmblem type="ssc" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.activeCatTitle}>SSC</Text>
                  <Text style={styles.activeCatSub}>39 exam blocks</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.allGroupsBtn}
                onPress={() => setSubView('categories')}
              >
                <Text style={styles.allGroupsBtnText}>All groups</Text>
              </TouchableOpacity>
            </View>

            {/* Sub-exam title */}
            <Text style={styles.chooseSubTitle}>Choose a sub-exam</Text>

            {/* Sub-exam cards */}
            <TouchableOpacity
              style={styles.subExamCard}
              activeOpacity={0.8}
              onPress={() => setSubView('papers')}
            >
              <Text style={styles.subExamTitle}>SSC CGL Previous Year Papers</Text>
              <Text style={styles.subExamCount}>20 mock tests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.subExamCard}
              activeOpacity={0.8}
              onPress={() => setSubView('papers')}
            >
              <Text style={styles.subExamTitle}>SSC CGL Mock Tests</Text>
              <Text style={styles.subExamCount}>3 mock tests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.subExamCard}
              activeOpacity={0.8}
              onPress={() => setSubView('papers')}
            >
              <Text style={styles.subExamTitle}>SSC CHSL Previous Year Papers</Text>
              <Text style={styles.subExamCount}>10 mock tests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.subExamCard}
              activeOpacity={0.8}
              onPress={() => setSubView('papers')}
            >
              <Text style={styles.subExamTitle}>SSC MTS Previous Year Papers</Text>
              <Text style={styles.subExamCount}>6 mock tests</Text>
            </TouchableOpacity>
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

            {/* Papers list */}
            {/* Paper 1: SSC CGL T-I (Held on 12 Sep 2025 S1) – English */}
            <TouchableOpacity
              style={styles.paperCard}
              activeOpacity={0.85}
              onPress={() => handleSelectPaper('SSC CGL T-I (Held on 12 Sep 2025 S1) – English')}
            >
              <View style={styles.paperIconBox}>
                <Ionicons name="document-text-outline" size={24} color="#0D9488" />
              </View>
              <View style={styles.paperInfo}>
                <Text style={styles.paperTitle}>
                  SSC CGL T-I (Held on 12 Sep 2025 S1) – English
                </Text>
                <View style={styles.paperMetaRow}>
                  <View style={styles.mediumBadge}>
                    <Text style={styles.mediumBadgeText}>Medium</Text>
                  </View>
                  <Text style={styles.paperDetailsText}>60 min 100 Qs</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Paper 2 */}
            <TouchableOpacity
              style={styles.paperCard}
              activeOpacity={0.85}
              onPress={() => handleSelectPaper('SSC CGL T-I Similar Paper (Held on 12 Sep 2025 S2) – English')}
            >
              <View style={styles.paperIconBox}>
                <Ionicons name="document-text-outline" size={24} color="#0D9488" />
              </View>
              <View style={styles.paperInfo}>
                <Text style={styles.paperTitle}>
                  SSC CGL T-I Similar Paper (Held on 12 Sep 2025 S2) – English
                </Text>
                <View style={styles.paperMetaRow}>
                  <View style={styles.mediumBadge}>
                    <Text style={styles.mediumBadgeText}>Medium</Text>
                  </View>
                  <Text style={styles.paperDetailsText}>60 min 100 Qs</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Paper 3 */}
            <TouchableOpacity
              style={styles.paperCard}
              activeOpacity={0.85}
              onPress={() => handleSelectPaper('SSC CGL Tier 1 2024 Set 1')}
            >
              <View style={styles.paperIconBox}>
                <Ionicons name="document-text-outline" size={24} color="#0D9488" />
              </View>
              <View style={styles.paperInfo}>
                <Text style={styles.paperTitle}>SSC CGL Tier 1 2024 Set 1</Text>
                <View style={styles.paperMetaRow}>
                  <View style={styles.mediumBadge}>
                    <Text style={styles.mediumBadgeText}>Medium</Text>
                  </View>
                  <Text style={styles.paperDetailsText}>60 min 100 Qs</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Paper 4 */}
            <TouchableOpacity
              style={styles.paperCard}
              activeOpacity={0.85}
              onPress={() => handleSelectPaper('SSC CGL Tier 1 2024 Set 2')}
            >
              <View style={styles.paperIconBox}>
                <Ionicons name="document-text-outline" size={24} color="#0D9488" />
              </View>
              <View style={styles.paperInfo}>
                <Text style={styles.paperTitle}>SSC CGL Tier 1 2024 Set 2</Text>
                <View style={styles.paperMetaRow}>
                  <View style={styles.mediumBadge}>
                    <Text style={styles.mediumBadgeText}>Medium</Text>
                  </View>
                  <Text style={styles.paperDetailsText}>60 min 99 Qs</Text>
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
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
  emblemBase: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
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
});
