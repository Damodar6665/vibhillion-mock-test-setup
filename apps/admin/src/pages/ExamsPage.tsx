// ==============================================================================
// VIBHILLION ADMIN: EXAM MANAGEMENT PAGE
// File: apps/admin/src/pages/ExamsPage.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { Exam, Category } from '@vibhillion/shared';

export const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form Fields
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [examType, setExamType] = useState<'mock_test' | 'previous_year_paper'>('previous_year_paper');
  const [year, setYear] = useState(2025);
  const [examDate, setExamDate] = useState('2025-09-12');
  const [session, setSession] = useState('Shift 1');
  const [description, setDescription] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(100);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(3600); // 60 mins
  const [totalMarks, setTotalMarks] = useState(200);
  const [positiveMarks, setPositiveMarks] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');

  const loadData = () => {
    setLoading(true);
    Promise.all([adminService.getExams(), adminService.getCategories()]).then(([examData, catData]) => {
      setExams(examData);
      setCategories(catData);
      if (catData.length > 0 && !categoryId) setCategoryId(catData[0].id);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingExam(null);
    setTitle('');
    setSlug('');
    setExamType('previous_year_paper');
    setYear(2025);
    setExamDate('2025-09-12');
    setSession('Shift 1');
    setDescription('');
    setTotalQuestions(100);
    setTotalDurationSeconds(3600);
    setTotalMarks(200);
    setPositiveMarks(2.0);
    setNegativeMarks(0.5);
    setStatus('published');
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setCategoryId(exam.category_id);
    setTitle(exam.title);
    setSlug(exam.slug);
    setExamType(exam.exam_type);
    setYear(exam.year || 2025);
    setExamDate(exam.exam_date || '2025-09-12');
    setSession(exam.session || 'Shift 1');
    setDescription(exam.description || '');
    setTotalQuestions(exam.total_questions);
    setTotalDurationSeconds(exam.total_duration_seconds);
    setTotalMarks(exam.total_marks);
    setPositiveMarks(exam.positive_marks);
    setNegativeMarks(exam.negative_marks);
    setStatus(exam.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !categoryId) return;

    // Validation: Total questions must be positive
    if (totalQuestions <= 0) {
      alert('Total questions must be greater than 0');
      return;
    }

    const payload = {
      category_id: categoryId,
      title,
      slug,
      exam_type: examType,
      year: Number(year),
      exam_date: examDate,
      session,
      description,
      total_questions: Number(totalQuestions),
      total_duration_seconds: Number(totalDurationSeconds),
      total_marks: Number(totalMarks),
      positive_marks: Number(positiveMarks),
      negative_marks: Number(negativeMarks),
      status,
    };

    if (editingExam) {
      await adminService.updateExam(editingExam.id, payload);
    } else {
      await adminService.createExam(payload);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleTogglePublish = async (exam: Exam) => {
    const nextStatus = exam.status === 'published' ? 'draft' : 'published';
    await adminService.updateExam(exam.id, { status: nextStatus });
    loadData();
  };

  const handleDelete = async (id: string, examTitle: string) => {
    if (confirm(`Are you sure you want to delete exam "${examTitle}"?`)) {
      await adminService.deleteExam(id);
      loadData();
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exam Management</h1>
          <p className="page-subtitle">Create, configure, publish, and audit test series & official shifts</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          <span>Create New Exam</span>
        </button>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading exams catalog...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Type & Year</th>
                  <th>Questions & Time</th>
                  <th>Marks Pattern</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam.id}>
                    <td>
                      <div className="font-bold text-slate-900">{exam.title}</div>
                      <div className="text-xs text-slate-500">{exam.slug}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{exam.exam_type.replace(/_/g, ' ')}</span>
                      <div className="text-xs text-slate-600 mt-1">{exam.year} • {exam.session}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-800">{exam.total_questions} Questions</div>
                      <div className="text-xs text-slate-500">
                        {Math.round(exam.total_duration_seconds / 60)} Minutes
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-semibold text-emerald-600">+{exam.positive_marks}</span>
                      <span className="text-xs text-slate-400"> / </span>
                      <span className="text-sm font-semibold text-red-500">−{exam.negative_marks}</span>
                      <div className="text-xs text-slate-500">Max: {exam.total_marks}</div>
                    </td>
                    <td>
                      {exam.status === 'published' ? (
                        <button
                          className="badge badge-success cursor-pointer"
                          onClick={() => handleTogglePublish(exam)}
                          title="Click to switch to Draft"
                        >
                          ● Published
                        </button>
                      ) : (
                        <button
                          className="badge badge-warning cursor-pointer"
                          onClick={() => handleTogglePublish(exam)}
                          title="Click to Publish"
                        >
                          ○ Draft
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn-icon text-blue-600 hover:bg-blue-50"
                          onClick={() => openEditModal(exam)}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(exam.id, exam.title)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingExam ? 'Edit Exam Paper' : 'Create New Exam'}
              </h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body space-y-4">
                <div className="grid-2-cols">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-input"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Exam Type *</label>
                    <select
                      className="form-input"
                      value={examType}
                      onChange={(e: any) => setExamType(e.target.value)}
                    >
                      <option value="previous_year_paper">Previous Year Paper</option>
                      <option value="mock_test">Mock Test</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Exam Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={title}
                    placeholder="e.g. SSC CGL T-1 — Held on 12 Sep 2025, Shift 1"
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingExam) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                      }
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-3-cols">
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input
                      type="number"
                      className="form-input"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Exam Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Shift / Session</label>
                    <input
                      type="text"
                      className="form-input"
                      value={session}
                      onChange={(e) => setSession(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-3-cols">
                  <div className="form-group">
                    <label className="form-label">Total Questions</label>
                    <input
                      type="number"
                      className="form-input"
                      value={totalQuestions}
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={Math.round(totalDurationSeconds / 60)}
                      onChange={(e) => setTotalDurationSeconds(Number(e.target.value) * 60)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Marks</label>
                    <input
                      type="number"
                      className="form-input"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid-3-cols">
                  <div className="form-group">
                    <label className="form-label">Positive Mark (+)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={positiveMarks}
                      onChange={(e) => setPositiveMarks(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Negative Penalty (−)</label>
                    <input
                      type="number"
                      step="0.05"
                      className="form-input"
                      value={negativeMarks}
                      onChange={(e) => setNegativeMarks(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Publication Status</label>
                    <select
                      className="form-input"
                      value={status}
                      onChange={(e: any) => setStatus(e.target.value)}
                    >
                      <option value="draft">Draft (Private)</option>
                      <option value="published">Published (Public)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingExam ? 'Update Exam' : 'Save Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
