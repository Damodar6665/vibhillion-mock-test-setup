// ==============================================================================
// TAB 5: PROFILE SCREEN
// File: apps/student/src/app/(tabs)/profile.tsx
// ==============================================================================

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, isConfigured } = useAuth();

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Vibhillion Student';
  const email = user?.email || 'student@vibhillion.ai';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <Text style={styles.headerSubtitle}>Account & Preferences</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={36} color="#2563EB" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{studentName}</Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Candidate (Student)</Text>
            </View>
          </View>
        </View>

        {/* Backend Status Banner */}
        <View style={styles.statusCard}>
          <Ionicons
            name={isConfigured ? 'cloud-done' : 'alert-circle'}
            size={22}
            color={isConfigured ? '#10B981' : '#F59E0B'}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.statusTitle}>
              {isConfigured ? 'Supabase Connected' : 'Demo / Offline Mode'}
            </Text>
            <Text style={styles.statusDesc}>
              {isConfigured
                ? 'Synced with Supabase Cloud PostgreSQL database.'
                : 'Using local offline mock data. Connect Supabase credentials in .env.'}
            </Text>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/tests')}>
            <Ionicons name="document-text-outline" size={20} color="#2563EB" />
            <Text style={styles.menuText}>My Active Tests</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/bookmarks')}>
            <Ionicons name="bookmark-outline" size={20} color="#2563EB" />
            <Text style={styles.menuText}>Revision Bookmarks</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/analysis')}>
            <Ionicons name="analytics-outline" size={20} color="#2563EB" />
            <Text style={styles.menuText}>Performance Report</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Auth Actions */}
        {user ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.loginBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1E3A8A' },
  header: { backgroundColor: '#1E3A8A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#93C5FD', marginTop: 2 },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  roleBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: '#92400E' },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  statusDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuText: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600', color: '#334155' },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutBtnText: { color: '#DC2626', fontSize: 14, fontWeight: '700' },
  loginBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
