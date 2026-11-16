// ==============================================================================
// VIBHILLION ADMIN: EXAM MANAGEMENT PAGE
// File: apps/admin/src/pages/ExamsPage.tsx
// ==============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  Eye,
  Layers,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Exam, Category } from '@vibhillion/shared';

export const ExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category_id') || 'all';

  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>(initialCategory);
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
      const activeCat = selectedCategoryFilter !== 'all' ? selectedCategoryFilter : (catData[0]?.id || '');
      if (!categoryId) setCategoryId(activeCat);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const filteredExams = useMemo(() => {
    if (selectedCategoryFilter === 'all') return exams;
    return exams.filter((e) => e.category_id === selectedCategoryFilter);
  }, [exams, selectedCategoryFilter]);

  const openCreateModal = () => {
    setEditingExam(null);
    const activeCat = selectedCategoryFilter !== 'all' ? selectedCategoryFilter : (categories[0]?.id || '');
    setCategoryId(activeCat);
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

      {/* CATEGORY FILTER PILLS */}
      <div className="content-card mb-4 p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
            <button
              className={`filter-pill-btn flex items-center gap-1.5 ${selectedCategoryFilter === 'all' ? 'active-teal font-bold' : ''}`}
              onClick={() => {
                setSelectedCategoryFilter('all');
                setSearchParams({});
              }}
            >
              <Layers size={13} />
              <span>All Categories ({exams.length})</span>
            </button>
            {categories.map((c) => {
              const count = exams.filter((e) => e.category_id === c.id).length;
              const isActive = selectedCategoryFilter === c.id;
              return (
                <button
                  key={c.id}
                  className={`filter-pill-btn flex items-center gap-1.5 ${isActive ? 'active-teal font-bold' : ''}`}
                  onClick={() => {
                    setSelectedCategoryFilter(c.id);
                    setSearchParams({ category_id: c.id });
                  }}
                >
                  <span>{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white text-teal-800' : 'bg-slate-200 text-slate-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            className="btn btn-secondary text-xs flex items-center gap-1 hover:text-blue-600"
            onClick={() => navigate('/categories')}
            title="Configure Categories"
          >
            <Layers size={13} />
            <span>Manage Categories</span>
          </button>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading exams catalog...</div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookOpen size={32} className="mx-auto mb-2 text-slate-400" />
            <h3 className="font-bold text-slate-800 text-sm">No exams found in this category</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click below to create your first exam under this category.</p>
            <button className="btn btn-primary text-xs mx-auto" onClick={openCreateModal}>
              <Plus size={14} />
              <span>Create Exam</span>
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam Title & Category</th>
                  <th>Type & Year</th>
                  <th>Questions & Time</th>
                  <th>Marks Pattern</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => {
                  const catName = categoryMap[exam.category_id] || 'General';
                  return (
                    <tr key={exam.id}>
                      <td>
                        <button
                          onClick={() => navigate(`/questions?exam_id=${exam.id}`)}
                          className="text-left cursor-pointer group block"
                          title="Click to view & add questions for this exam"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 underline-offset-2 group-hover:underline">
                            {exam.title}
                          </div>
                          <div className="text-xs text-slate-400 font-normal">{exam.slug}</div>
                        </button>
                        <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 mt-1.5 inline-block">
                          Category: {catName}
                        </span>
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
                            className="btn btn-primary btn-sm flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs px-2.5 py-1"
                            onClick={() => navigate(`/questions?exam_id=${exam.id}`)}
                            title="Add & Manage Questions for this Exam"
                          >
                            <Plus size={13} />
                            <span>Add Questions</span>
                          </button>
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
                  );
                })}
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

