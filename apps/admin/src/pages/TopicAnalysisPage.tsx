// ==============================================================================
// VIBHILLION ADMIN: TOPIC ANALYSIS PAGE
// File: apps/admin/src/pages/TopicAnalysisPage.tsx
// ==============================================================================

import React from 'react';
import { LineChart, CheckCircle2, AlertTriangle } from 'lucide-react';

export const TopicAnalysisPage: React.FC = () => {
  const topics = [
    { name: 'Vocabulary (Synonyms & Antonyms)', accuracy: 82.4, attempts: 1240, avgTime: '38s', status: 'strong' },
    { name: 'Idioms & Phrases', accuracy: 76.5, attempts: 1180, avgTime: '42s', status: 'strong' },
    { name: 'One Word Substitution', accuracy: 74.0, attempts: 1210, avgTime: '35s', status: 'moderate' },
    { name: 'Subject-Verb Agreement', accuracy: 52.8, attempts: 1250, avgTime: '65s', status: 'weak' },
    { name: 'Reading Comprehension & Inference', accuracy: 48.2, attempts: 940, avgTime: '110s', status: 'weak' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Topic Performance Analysis</h1>
          <p className="page-subtitle">Platform-wide syllabus mastery, error hotspots, and pacing bottlenecks</p>
        </div>
      </div>

      <div className="content-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Syllabus Topic</th>
                <th>Accuracy Benchmark</th>
                <th>Total Attempts</th>
                <th>Avg Solving Pacing</th>
                <th>Cohort Status</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t, idx) => (
                <tr key={idx}>
                  <td className="font-bold text-slate-800">{t.name}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            t.accuracy >= 75 ? 'bg-emerald-500' : t.accuracy >= 60 ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${t.accuracy}%` }}
                        />
                      </div>
                      <span className="font-semibold text-xs text-slate-700">{t.accuracy}%</span>
                    </div>
                  </td>
                  <td className="text-sm text-slate-600">{t.attempts} responses</td>
                  <td className="text-sm text-slate-600">{t.avgTime}</td>
                  <td>
                    {t.status === 'strong' ? (
                      <span className="badge badge-success flex items-center gap-1 w-max">
                        <CheckCircle2 size={12} /> High Mastery
                      </span>
                    ) : t.status === 'weak' ? (
                      <span className="badge badge-danger flex items-center gap-1 w-max">
                        <AlertTriangle size={12} /> Critical Focus Area
                      </span>
                    ) : (
                      <span className="badge badge-info flex items-center gap-1 w-max">
                        Moderate
                      </span>
                    )}
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

