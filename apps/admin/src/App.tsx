// ==============================================================================
// VIBHILLION ADMIN: ROUTING & PROTECTED ROUTES
// File: apps/admin/src/App.tsx
// ==============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/auth-context';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ExamsPage } from './pages/ExamsPage';
import { SectionsPage } from './pages/SectionsPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { SolutionsPage } from './pages/SolutionsPage';
import { PreviousYearPapersPage } from './pages/PreviousYearPapersPage';
import { AttemptsPage } from './pages/AttemptsPage';
import { ResultsPage } from './pages/ResultsPage';
import { TopicAnalysisPage } from './pages/TopicAnalysisPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-spinner">Verifying administrative authorization...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="sections" element={<SectionsPage />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="solutions" element={<SolutionsPage />} />
            <Route path="previous-year-papers" element={<PreviousYearPapersPage />} />
            <Route path="attempts" element={<AttemptsPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="topic-analysis" element={<TopicAnalysisPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
