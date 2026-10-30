// ==============================================================================
// VIBHILLION ADMIN: PREVIOUS-YEAR PAPERS PAGE
// File: apps/admin/src/pages/PreviousYearPapersPage.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { History, Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { adminService } from '../services/adminService';
import { Exam } from '@vibhillion/shared';
import { Link } from 'react-router-dom';

export const PreviousYearPapersPage: React.FC = () => {
  const [papers, setPapers] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getExams().then((data) => {
      setPapers(data.filter((e) => e.exam_type === 'previous_year_paper'));
      setLoading(false);
    });
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Previous-Year Papers</h1>
          <p className="page-subtitle">Archive and curate official shifts, historical question sets, and sectional limits</p>
        </div>
        <Link to="/exams" className="btn btn-primary">
          <History size={16} />
          <span>Add Official Shift Paper</span>
        </Link>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading paper archives...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paper Title</th>
                  <th>Exam Date & Shift</th>
                  <th>Questions</th>
                  <th>Sectional Timing</th>
                  <th>Candidate Access</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="font-bold text-slate-900">{p.title}</div>
                      <div className="text-xs text-slate-500">SSC CGL Tier 1 • {p.year}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{p.exam_date || '2025-09-12'}</span>
                      </div>
                      <div className="text-xs text-slate-500">{p.session}</div>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-800">{p.total_questions} Questions</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-slate-700">
                        <Clock size={14} className="text-blue-500" />
                        <span>4 × 15 Mins (60 Mins Total)</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">Published on Mobile App</span>
                    </td>
                    <td>
                      <Link to="/questions" className="btn btn-secondary btn-sm flex items-center gap-1">
                        <span>Inspect Qs</span>
                        <ArrowRight size={12} />
                      </Link>
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

