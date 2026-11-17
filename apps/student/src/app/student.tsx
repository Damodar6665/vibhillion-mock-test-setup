// ==============================================================================
// VIBHILLION AI: STUDENT ROUTE REDIRECT
// Redirects /student to /tests
// ==============================================================================

import React from 'react';
import { Redirect } from 'expo-router';

export default function StudentRoute() {
  return <Redirect href="/tests" />;
}
