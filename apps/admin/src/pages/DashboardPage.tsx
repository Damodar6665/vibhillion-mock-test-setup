// ==============================================================================
// VIBHILLION ADMIN: DASHBOARD PAGE
// File: apps/admin/src/pages/DashboardPage.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Users,
  CheckCircle,
  TrendingUp,
  Award,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading platform dashboard metrics...</div>;
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time platform metrics, test participation, and candidate performance</p>
        </div>
        <div className="header-actions">
          <Link to="/exams" className="btn btn-primary">
            <FileSpreadsheet size={16} />
            <span>Manage Exams</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid-cards-4">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <span className="stat-label">Published Exams</span>
            <h3 className="stat-value">{metrics.totalPublishedExams}</h3>
            <span className="stat-sub">1 Active Competitive Tier</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-100 text-emerald-600">
            <Users size={24} />
          </div>
          <div>
            <span className="stat-label">Total Aspirants</span>
            <h3 className="stat-value">{metrics.totalStudents}</h3>
            <span className="stat-sub">Registered Candidates</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-100 text-amber-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="stat-label">Completed Tests</span>
            <h3 className="stat-value">{metrics.completedTests}</h3>
            <span className="stat-sub">{metrics.completionRate}% Completion Rate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-100 text-purple-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="stat-label">Average Score</span>
            <h3 className="stat-value">{metrics.averageScore} <span className="stat-unit">Marks</span></h3>
            <span className="stat-sub">High: {metrics.highestScore} Marks</span>
          </div>
        </div>
      </div>

      {/* Featured Exam & Highlights */}
      <div className="grid-2-cols mt-6">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Top Active Exam Paper</h2>
            <span className="badge badge-success">Live Now</span>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-slate-800">{metrics.popularExam}</h3>
            <p className="text-sm text-slate-500 mt-1">
              Official Shift Paper with 4 configured sections (English, Reasoning, Quant, GA). Real sectional countdown timers and scoring rules.
            </p>
            <div className="grid-3-cols mt-4 p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="text-xs text-slate-400">Total Duration</span>
                <p className="font-semibold text-slate-700">60 Minutes</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Marks Rule</span>
                <p className="font-semibold text-emerald-600">+2.0 / -0.5</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Attempts</span>
                <p className="font-semibold text-blue-600">1,248 Completed</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to="/questions" className="btn btn-secondary btn-sm">
                Inspect 25 English Qs
              </Link>
              <Link to="/sections" className="btn btn-secondary btn-sm">
                Configure Sections
              </Link>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Quick Administration Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            <Link to="/questions" className="action-row-item">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Add New Question</h4>
                  <p className="text-xs text-slate-500">Insert questions with 4 options and protected answers</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>

            <Link to="/solutions" className="action-row-item">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Answer Key Audit & Re-eval</h4>
                  <p className="text-xs text-slate-500">Update key with mandatory audit reason and score refresh</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>

            <Link to="/categories" className="action-row-item">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Add Exam Category</h4>
                  <p className="text-xs text-slate-500">Expand from SSC to Banking, Railways, UPSC</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

