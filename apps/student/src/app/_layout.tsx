// ==============================================================================
// VIBHILLION AI: ROOT APP LAYOUT
// File: apps/student/src/app/_layout.tsx
// ==============================================================================

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/context/auth-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after initialization
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="exam/instructions" options={{ headerShown: false }} />
        <Stack.Screen name="exam/timed" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="exam/practice" options={{ headerShown: false }} />
        <Stack.Screen name="exam/result" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="exam/solution" options={{ headerShown: false }} />
        <Stack.Screen name="exam/performance" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
