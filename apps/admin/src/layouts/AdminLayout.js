import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ==============================================================================
// VIBHILLION ADMIN: RESPONSIVE ADMIN LAYOUT & SIDEBAR
// File: apps/admin/src/layouts/AdminLayout.tsx
// ==============================================================================
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Layers, FileSpreadsheet, FolderTree, HelpCircle, KeyRound, History, UsersRound, BarChart3, LineChart, Settings, LogOut, Menu, X, ShieldCheck, CheckCircle2, AlertTriangle, } from 'lucide-react';
import { useAuth } from '../context/auth-context';
export const AdminLayout = () => {
    const { user, isConfigured, signOut } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'Categories', path: '/categories', icon: Layers },
        { label: 'Exams', path: '/exams', icon: FileSpreadsheet },
        { label: 'Sections', path: '/sections', icon: FolderTree },
        { label: 'Questions', path: '/questions', icon: HelpCircle },
        { label: 'Answer Keys & Solutions', path: '/solutions', icon: KeyRound },
        { label: 'Previous-Year Papers', path: '/previous-year-papers', icon: History },
        { label: 'Student Attempts', path: '/attempts', icon: UsersRound },
        { label: 'Participation & Results', path: '/results', icon: BarChart3 },
        { label: 'Topic Analysis', path: '/topic-analysis', icon: LineChart },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];
    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };
    return (_jsxs("div", { className: "admin-shell", children: [sidebarOpen && (_jsx("div", { className: "sidebar-backdrop", onClick: () => setSidebarOpen(false) })), _jsxs("aside", { className: `sidebar ${sidebarOpen ? 'sidebar-open' : ''}`, children: [_jsxs("div", { className: "sidebar-brand", children: [_jsxs("div", { className: "brand-logo", children: [_jsx(ShieldCheck, { size: 28, className: "text-blue-500" }), _jsxs("div", { children: [_jsx("span", { className: "brand-name", children: "Vibhillion AI" }), _jsx("span", { className: "brand-tag", children: "EXAM ADMIN CONSOLE" })] })] }), _jsx("button", { className: "mobile-close-btn", onClick: () => setSidebarOpen(false), children: _jsx(X, { size: 20 }) })] }), _jsx("nav", { className: "sidebar-nav", children: navItems.map((item) => {
                            const Icon = item.icon;
                            return (_jsxs(NavLink, { to: item.path, end: item.path === '/', className: ({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`, onClick: () => setSidebarOpen(false), children: [_jsx(Icon, { size: 18, className: "nav-icon" }), _jsx("span", { children: item.label })] }, item.path));
                        }) }), _jsxs("div", { className: "sidebar-footer", children: [_jsxs("div", { className: "admin-user-pill", children: [_jsx("div", { className: "user-avatar", children: "A" }), _jsxs("div", { className: "user-meta", children: [_jsx("span", { className: "user-name", children: user?.user_metadata?.full_name || 'Administrator' }), _jsx("span", { className: "user-role", children: "Super Admin" })] })] }), _jsxs("button", { className: "logout-btn", onClick: handleLogout, title: "Log Out", children: [_jsx(LogOut, { size: 18 }), _jsx("span", { children: "Sign Out" })] })] })] }), _jsxs("div", { className: "main-wrapper", children: [_jsxs("header", { className: "top-header", children: [_jsx("button", { className: "menu-toggle-btn", onClick: () => setSidebarOpen(true), children: _jsx(Menu, { size: 22 }) }), _jsx("div", { className: "header-status-area", children: isConfigured ? (_jsxs("div", { className: "status-pill status-connected", children: [_jsx(CheckCircle2, { size: 15 }), _jsx("span", { children: "Supabase Live Connected" })] })) : (_jsxs("div", { className: "status-pill status-demo", children: [_jsx(AlertTriangle, { size: 15 }), _jsx("span", { children: "Local Interactive Mode (.env pending)" })] })) })] }), _jsx("main", { className: "content-container", children: _jsx(Outlet, {}) })] })] }));
};
