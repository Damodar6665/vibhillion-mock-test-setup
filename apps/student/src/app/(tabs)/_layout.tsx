// ==============================================================================
// VIBHILLION AI: 5-BUTTON BOTTOM NAVIGATION LAYOUT (MATCHING MOCK TESTS DESIGN)
// File: apps/student/src/app/(tabs)/_layout.tsx
// ==============================================================================

import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D9488', // Teal accent matching screenshots
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: (props: any) => (
            <Ionicons name={props.focused ? 'home' : 'home-outline'} size={23} color={props.color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tests"
        options={{
          title: 'Tests',
          tabBarIcon: (props: any) => (
            <Ionicons name={props.focused ? 'document-text' : 'document-text-outline'} size={23} color={props.color} />
          ),
        }}
      />

      <Tabs.Screen
        name="aichat"
        options={{
          title: 'AI Chat',
          tabBarIcon: (props: any) => (
            <Ionicons name={props.focused ? 'sparkles' : 'sparkles-outline'} size={23} color={props.color} />
          ),
        }}
      />

      <Tabs.Screen
        name="materials"
        options={{
          title: 'Materials',
          tabBarIcon: (props: any) => (
            <Ionicons name={props.focused ? 'book' : 'book-outline'} size={23} color={props.color} />
          ),
        }}
      />

      <Tabs.Screen
        name="news"
        options={{
          title: 'News',
          tabBarIcon: (props: any) => (
            <Ionicons name={props.focused ? 'newspaper' : 'newspaper-outline'} size={23} color={props.color} />
          ),
        }}
      />

      {/* Internal sub-screens hidden from tab bar */}
      <Tabs.Screen
        name="bookmarks"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
