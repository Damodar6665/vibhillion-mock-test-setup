// ==============================================================================
// VIBHILLION AI: 5-BUTTON BOTTOM NAVIGATION LAYOUT
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
        tabBarActiveTintColor: '#2563EB',
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
          fontSize: 12,
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
            <Ionicons name={props.focused ? 'home' : 'home-outline'} size={24} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Tests',
          tabBarIcon: (props: any) => (
            <Ionicons name={props.focused ? 'document-text' : 'document-text-outline'} size={24} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: (props: any) => (
            <Ionicons name={props.focused ? 'bookmark' : 'bookmark-outline'} size={24} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: (props: any) => (
            <Ionicons name={props.focused ? 'bar-chart' : 'bar-chart-outline'} size={24} color={props.color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: (props: any) => (
            <Ionicons name={props.focused ? 'person' : 'person-outline'} size={24} color={props.color} />
          ),
        }}
      />
    </Tabs>
  );
}
