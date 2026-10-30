// ==============================================================================
// VIBHILLION ADMIN: RESPONSIVE ADMIN LAYOUT & SIDEBAR
// File: apps/admin/src/layouts/AdminLayout.tsx
// ==============================================================================

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FileSpreadsheet,
  FolderTree,
  HelpCircle,
  KeyRound,
  History,
  UsersRound,
  BarChart3,
  LineChart,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';

export const AdminLayout: React.FC = () => {
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

  return (
    <div className="admin-shell">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <ShieldCheck size={28} className="text-blue-500" />
            <div>
              <span className="brand-name">Vibhillion AI</span>
              <span className="brand-tag">EXAM ADMIN CONSOLE</span>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user-pill">
            <div className="user-avatar">A</div>
            <div className="user-meta">
              <span className="user-name">
                {user?.user_metadata?.full_name || 'Administrator'}
              </span>
              <span className="user-role">Super Admin</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Log Out">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-header">
          <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="header-status-area">
            {isConfigured ? (
              <div className="status-pill status-connected">
                <CheckCircle2 size={15} />
                <span>Supabase Live Connected</span>
              </div>
            ) : (
              <div className="status-pill status-demo">
                <AlertTriangle size={15} />
                <span>Local Interactive Mode (.env pending)</span>
              </div>
            )}
          </div>
        </header>

        {/* Page View Body */}
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

