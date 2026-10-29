import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const ProtectedAdminRoute = ({ children }) => {
    const { user, isAdmin, isLoading } = useAuth();
    if (isLoading) {
        return _jsx("div", { className: "loading-spinner", children: "Verifying administrative authorization..." });
    }
    if (!user || !isAdmin) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export default function App() {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedAdminRoute, { children: _jsx(AdminLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "categories", element: _jsx(CategoriesPage, {}) }), _jsx(Route, { path: "exams", element: _jsx(ExamsPage, {}) }), _jsx(Route, { path: "sections", element: _jsx(SectionsPage, {}) }), _jsx(Route, { path: "questions", element: _jsx(QuestionsPage, {}) }), _jsx(Route, { path: "solutions", element: _jsx(SolutionsPage, {}) }), _jsx(Route, { path: "previous-year-papers", element: _jsx(PreviousYearPapersPage, {}) }), _jsx(Route, { path: "attempts", element: _jsx(AttemptsPage, {}) }), _jsx(Route, { path: "results", element: _jsx(ResultsPage, {}) }), _jsx(Route, { path: "topic-analysis", element: _jsx(TopicAnalysisPage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }) }));
}
