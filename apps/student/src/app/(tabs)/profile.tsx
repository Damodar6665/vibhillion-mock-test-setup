// ==============================================================================
// TAB 5: COMPLETE STUDENT PROFILE & PREFERENCES SCREEN
// File: apps/student/src/app/(tabs)/profile.tsx
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { examService } from '@/services/examService';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, isConfigured } = useAuth();

  const [studentName, setStudentName] = useState('Aspirant Candidate');
  const [email, setEmail] = useState('student@vibhillion.ai');
  const [targetExam, setTargetExam] = useState('SSC CGL Tier 1');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTarget, setEditTarget] = useState('SSC CGL Tier 1');

  const [stats, setStats] = useState({ testsTaken: 0, bookmarksCount: 0, avgScore: 0 });

  useEffect(() => {
    async function loadProfile() {
      const p = await examService.getUserProfile();
      setStudentName(user?.user_metadata?.full_name || p.name);
      setEmail(user?.email || p.email);
      setTargetExam(p.targetExam);

      const [analytics, bms] = await Promise.all([
        examService.getUserAnalytics(),
        examService.getBookmarks(),
      ]);

      setStats({
        testsTaken: analytics.totalTests,
        bookmarksCount: bms.length,
        avgScore: analytics.avgScore,
      });
    }
    loadProfile();
  }, [user]);

  const handleOpenEdit = () => {
    setEditName(studentName);
    setEditTarget(targetExam);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    await examService.updateUserProfile({ name: editName.trim(), targetExam: editTarget });
    setStudentName(editName.trim());
    setTargetExam(editTarget);
    setIsEditModalOpen(false);
    Alert.alert('Success', 'Profile updated successfully.');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Local Cache',
      'This will reset your local attempt history and offline bookmarks. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            await examService.clearLocalCache();
            setStats({ testsTaken: 0, bookmarksCount: 0, avgScore: 0 });
            Alert.alert('Cache Cleared', 'Local data has been reset.');
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your account?', [
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

  const targetExamOptions = [
    'SSC CGL Tier 1',
    'SSC CHSL (10+2)',
    'SSC CPO (Sub-Inspector)',
    'SSC MTS & Havaldar',
    'RRB NTPC Graduate',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Profile</Text>
        <Text style={styles.headerSubtitle}>Account & Examination Preferences</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={36} color="#2563EB" />
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{studentName}</Text>
              <TouchableOpacity onPress={handleOpenEdit} style={styles.editPencilBtn}>
                <Ionicons name="pencil" size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{targetExam}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsCard}>
          <View style={styles.statCell}>
            <Text style={styles.statNum}>{stats.testsTaken}</Text>
            <Text style={styles.statLabel}>Tests Solved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: '#059669' }]}>{stats.avgScore}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statNum, { color: '#D97706' }]}>{stats.bookmarksCount}</Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
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
              {isConfigured ? 'Supabase Backend Connected' : 'Local Offline / Demo Mode'}
            </Text>
            <Text style={styles.statusDesc}>
              {isConfigured
                ? 'Your tests, scores, and bookmarks sync directly with Supabase Cloud PostgreSQL.'
                : 'Running on local offline mock dataset. Enter credentials in apps/student/.env to connect cloud database.'}
            </Text>
          </View>
        </View>

        {/* Navigation Menu Links */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/tests')}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="document-text" size={18} color="#2563EB" />
            </View>
            <Text style={styles.menuText}>Browse Mock Tests & PYQs</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/bookmarks')}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="bookmark" size={18} color="#D97706" />
            </View>
            <Text style={styles.menuText}>Revision Bookmarks</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/(tabs)/analysis')}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="analytics" size={18} color="#059669" />
            </View>
            <Text style={styles.menuText}>Deep Performance Report</Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={handleClearCache}>
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </View>
            <Text style={[styles.menuText, { color: '#DC2626' }]}>Clear Local Cache</Text>
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
            style={styles.signInBtn}
            onPress={() => router.push('/auth/login')}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.signInBtnText}>Sign In with Supabase</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Target Examination</Text>
            <View style={styles.targetOptionsWrap}>
              {targetExamOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.targetPill,
                    editTarget === opt && styles.targetPillActive,
                  ]}
                  onPress={() => setEditTarget(opt)}
                >
                  <Text
                    style={[
                      styles.targetPillText,
                      editTarget === opt && styles.targetPillTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#93C5FD', marginTop: 2 },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 40 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
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
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userName: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  editPencilBtn: { padding: 4 },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  roleText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCell: { alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statDivider: { width: 1, height: 26, backgroundColor: '#E2E8F0' },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  statusDesc: { fontSize: 12, color: '#64748B', lineHeight: 17, marginTop: 2 },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#334155' },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 12,
    borderRadius: 10,
  },
  logoutBtnText: { color: '#DC2626', fontWeight: '700', fontSize: 14, marginLeft: 8 },
  signInBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
  },
  signInBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
  },
  targetOptionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  targetPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  targetPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  targetPillText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  targetPillTextActive: { color: '#2563EB', fontWeight: '700' },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  cancelBtnText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  saveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
