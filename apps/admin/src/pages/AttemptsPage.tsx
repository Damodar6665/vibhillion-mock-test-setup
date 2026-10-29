// ==============================================================================
// VIBHILLION ADMIN: STUDENT ATTEMPTS MANAGEMENT
// File: apps/admin/src/pages/AttemptsPage.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { UsersRound, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
import { ExamAttempt, formatDuration } from '@vibhillion/shared';

export const AttemptsPage: React.FC = () => {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStudentAttempts().then((data) => {
      setAttempts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidate Test Attempts</h1>
          <p className="page-subtitle">Track in-progress, completed, and submitted student test sessions</p>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading candidate attempts...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Attempt ID & Mode</th>
                  <th>Submitted At</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Breakdown (C / W / U)</th>
                  <th>Time Spent</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => (
                  <tr key={att.id}>
                    <td>
                      <div className="font-mono text-xs font-bold text-slate-800">{att.id}</div>
                      <span className={`badge ${att.mode === 'timed' ? 'badge-info' : 'badge-warning'} mt-1`}>
                        {att.mode.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-sm text-slate-600">
                      {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : 'In Progress'}
                    </td>
                    <td>
                      <span className="text-base font-extrabold text-blue-600">{att.score.toFixed(1)}</span>
                      <span className="text-xs text-slate-400"> Marks</span>
                    </td>
                    <td>
                      <span className="font-semibold text-emerald-600">{att.accuracy_percentage.toFixed(1)}%</span>
                    </td>
                    <td className="text-sm text-slate-700">
                      <span className="text-emerald-600 font-bold">{att.correct_count}</span> /{' '}
                      <span className="text-red-500 font-bold">{att.wrong_count}</span> /{' '}
                      <span className="text-slate-400 font-bold">{att.unattempted_count}</span>
                    </td>
                    <td className="text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400" />
                        <span>{formatDuration(att.total_time_seconds)}</span>
                      </div>
                    </td>
                    <td>
                      {att.status === 'completed' ? (
                        <span className="badge badge-success flex items-center gap-1 w-max">
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      ) : (
                        <span className="badge badge-warning flex items-center gap-1 w-max">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
