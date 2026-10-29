// ==============================================================================
// VIBHILLION ADMIN: PARTICIPATION & RESULTS
// File: apps/admin/src/pages/ResultsPage.tsx
// ==============================================================================

import React from 'react';
import { BarChart3, Users, Award, CheckCircle, Percent } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Participation & Result Analytics</h1>
          <p className="page-subtitle">Unique candidate counts, percentile distributions, and rank validity checks</p>
        </div>
      </div>

      <div className="grid-cards-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
            <Users size={22} />
          </div>
          <div>
            <span className="stat-label">Unique Candidates</span>
            <h3 className="stat-value">1,248</h3>
            <span className="stat-sub">Deduplicated Aspirants</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-100 text-emerald-600">
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="stat-label">Total Submissions</span>
            <h3 className="stat-value">1,580</h3>
            <span className="stat-sub">Includes retries & practice</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-100 text-purple-600">
            <Award size={22} />
          </div>
          <div>
            <span className="stat-label">Highest Score</span>
            <h3 className="stat-value">48.0</h3>
            <span className="stat-sub">Out of 50.0 Marks</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-100 text-amber-600">
            <Percent size={22} />
          </div>
          <div>
            <span className="stat-label">90th Percentile Cutoff</span>
            <h3 className="stat-value">42.5</h3>
            <span className="stat-sub">Normalized Benchmark</span>
          </div>
        </div>
      </div>

      {/* Unique Participation Enforcement Notice */}
      <div className="content-card p-6">
        <h3 className="text-base font-bold text-slate-800 mb-2">Participation Count Integrity Rule</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          The table <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">exam_participation</code> maintains a unique constraint on <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">(exam_id, user_id)</code>.
          Repeated attempts or submissions by the same student retain the student's highest score while guaranteeing the total participant headcount never inflates falsely.
        </p>
      </div>
    </div>
  );
};
