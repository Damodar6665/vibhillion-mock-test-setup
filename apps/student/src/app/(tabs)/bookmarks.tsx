// ==============================================================================
// TAB 3: BOOKMARKS SCREEN
// File: apps/student/src/app/(tabs)/bookmarks.tsx
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BookmarksScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Bookmarks</Text>
        <Text style={styles.headerSubtitle}>Questions marked for revision</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.emptyCard}>
          <Ionicons name="bookmark-outline" size={56} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Bookmarks Saved Yet</Text>
          <Text style={styles.emptyText}>
            While solving mock tests in Timed or Practice mode, tap the Bookmark icon on any challenging question to review it here later.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)/tests')}
          >
            <Text style={styles.exploreBtnText}>Take a Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E3A8A' },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#93C5FD', marginTop: 2 },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 340,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  exploreBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exploreBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
});

