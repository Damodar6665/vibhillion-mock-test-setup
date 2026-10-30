// ==============================================================================
// VIBHILLION AI: MAIN ENTRY POINT (REDIRECTS TO MOCK TESTS TAB MATCHING SCREENSHOT 1)
// File: apps/student/src/app/(tabs)/index.tsx
// ==============================================================================

import React from 'react';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  return <Redirect href="/(tabs)/tests" />;
}
