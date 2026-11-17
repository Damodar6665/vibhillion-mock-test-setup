// ==============================================================================
// VIBHILLION AI: NOT FOUND FALLBACK
// Redirects any unrecognized route to /tests
// ==============================================================================

import React from 'react';
import { Redirect } from 'expo-router';

export default function NotFoundRoute() {
  return <Redirect href="/tests" />;
}
