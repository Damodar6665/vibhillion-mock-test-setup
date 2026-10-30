// ==============================================================================
// VIBHILLION ADMIN: PARTICIPATION & RESULTS
// File: apps/admin/src/pages/ResultsPage.tsx
// ==============================================================================

import React, { useState } from 'react';
import { Users, Award, CheckCircle, Percent, Search, Download } from 'lucide-react';

interface ResultCandidate {
  rank: number;
  name: string;
  email: string;
  examTitle: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpent: string;
  percentile: number;
  attemptDate: string;
  attemptsCount: number;
}

export const ResultsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const candidates: ResultCandidate[] = [
    {
      rank: 1,
      name: 'Aditya Sharma',
      email: 'aditya.sharma@example.com',
      examTitle: 'SSC CGL T-1 (12 Sep 2025, Shift 1)',
      score: 48.0,
      maxScore: 50.0,
      accuracy: 96.0,
      timeSpent: '11m 45s',
      percentile: 99.8,
      attemptDate: '2026-10-28',
      attemptsCount: 1,
    },
    {
      rank: 2,
      name: 'Pooja Verma',
      email: 'pooja.v@example.com',
      examTitle: 'SSC CGL T-1 (12 Sep 2025, Shift 1)',
      score: 46.5,
      maxScore: 50.0,
      accuracy: 94.0,
      timeSpent: '12m 10s',
      percentile: 98.5,
      attemptDate: '2026-10-28',
      attemptsCount: 2,
    },
    {
      rank: 3,
      name: 'Rohan Mehra',
      email: 'rohan.m@example.com',
      examTitle: 'SSC CGL T-1 (12 Sep 2025, Shift 1)',
      score: 44.0,
      maxScore: 50.0,
      accuracy: 90.0,
      timeSpent: '13m 05s',
      percentile: 95.2,
      attemptDate: '2026-10-29',
      attemptsCount: 1,
    },
    {
      rank: 4,
      name: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      examTitle: 'SSC CGL T-1 (12 Sep 2025, Shift 1)',
      score: 42.5,
      maxScore: 50.0,
      accuracy: 88.0,
      timeSpent: '14m 20s',
      percentile: 91.0,
      attemptDate: '2026-10-29',
      attemptsCount: 1,
    },
    {
      rank: 5,
      name: 'Vibhillion Student',
      email: 'student@vibhillion.ai',
      examTitle: 'SSC CGL T-1 (12 Sep 2025, Shift 1)',
      score: 34.0,
      maxScore: 50.0,
      accuracy: 81.8,
      timeSpent: '12m 40s',
      percentile: 84.6,
      attemptDate: '2026-10-30',
      attemptsCount: 3,
    },
  ];

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportLeaderboard = () => {
    const csvHeader = 'Rank,Candidate Name,Email,Score,Max Marks,Accuracy %,Time Taken,Percentile,Submissions\n';
    const csvRows = candidates
      .map(
        (c) =>
          `${c.rank},"${c.name}","${c.email}",${c.score},${c.maxScore},${c.accuracy}%,"${c.timeSpent}",${c.percentile}%,${c.attemptsCount}`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibhillion-leaderboard-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Participation & Result Analytics</h1>
          <p className="page-subtitle">
            Unique candidate counts, deduplicated participant standings, and percentile distributions
          </p>
        </div>
        <button className="btn btn-secondary" onClick={exportLeaderboard}>
          <Download size={16} />
          <span>Export Leaderboard CSV</span>
        </button>
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
      <div className="content-card p-5 mb-6">
        <h3 className="text-base font-bold text-slate-800 mb-2">Participation Count Integrity Rule</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          The table <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">exam_participation</code> maintains a unique constraint on <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">(exam_id, user_id)</code>.
          Repeated attempts or submissions by the same student retain the student's highest score while guaranteeing the total participant headcount never inflates falsely.
        </p>
      </div>

      {/* Candidate Leaderboard Table */}
      <div className="content-card">
        <div className="card-header flex justify-between items-center">
          <h2 className="card-title">Candidate Performance Leaderboard</h2>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, email..."
              className="form-input pl-9 py-1.5 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Percentile</th>
                <th>Time Spent</th>
                <th>Submissions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c) => (
                <tr key={c.rank}>
                  <td>
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                        c.rank === 1
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : c.rank === 2
                          ? 'bg-slate-200 text-slate-700'
                          : c.rank === 3
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{c.rank}
                    </span>
                  </td>
                  <td>
                    <div className="font-bold text-slate-800 text-sm">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.email}</div>
                  </td>
                  <td>
                    <span className="text-base font-extrabold text-blue-600">{c.score}</span>
                    <span className="text-xs text-slate-400"> / {c.maxScore}</span>
                  </td>
                  <td>
                    <span className="font-semibold text-emerald-600">{c.accuracy}%</span>
                  </td>
                  <td>
                    <span className="badge badge-info">{c.percentile}th %ile</span>
                  </td>
                  <td className="text-sm text-slate-600">{c.timeSpent}</td>
                  <td>
                    <span className="badge badge-secondary" title="Deduplicated to 1 entry">
                      {c.attemptsCount} {c.attemptsCount === 1 ? 'Attempt' : 'Attempts'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
