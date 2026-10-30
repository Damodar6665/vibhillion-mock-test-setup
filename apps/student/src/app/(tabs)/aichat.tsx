import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AIChatScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="chatbubbles" size={40} color="#0D9488" />
        </View>
        <Text style={styles.title}>AI Exam Tutor</Text>
        <Text style={styles.subtitle}>
          Interactive AI Doubt Resolution & Instant Question Explanations are integrated inside mock tests!
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(tabs)/tests')}>
          <Text style={styles.btnText}>Go to Mock Tests</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#CCFBF1', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24, maxWidth: 300 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0D9488', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});

