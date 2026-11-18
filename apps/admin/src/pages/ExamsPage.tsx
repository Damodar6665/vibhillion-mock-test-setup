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
  Upload,
  SplitSquareHorizontal,
  AlertCircle,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Exam, Category, ExamSection } from '@vibhillion/shared';
import { divideTotalAcrossSections, getDefaultSectionNames } from '../utils/questionDistributor';

interface SectionDraft {
  id?: string;
  name: string;
  question_count: number;
}

export const ExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category_id') || 'all';

  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSections, setAllSections] = useState<ExamSection[]>([]);
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
  const [totalQuestionsText, setTotalQuestionsText] = useState('100');
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(3600); // 60 mins
  const [totalMarks, setTotalMarks] = useState(200);
  const [positiveMarks, setPositiveMarks] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published');

  // Section-wise allocation drafts inside Exam Modal
  const [sectionCountInput, setSectionCountInput] = useState(4);
  const [sectionCountText, setSectionCountText] = useState('4');
  const [sectionDrafts, setSectionDrafts] = useState<SectionDraft[]>([
    { name: 'English Comprehension', question_count: 25 },
    { name: 'General Intelligence & Reasoning', question_count: 25 },
    { name: 'Quantitative Aptitude', question_count: 25 },
    { name: 'General Awareness', question_count: 25 },
  ]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminService.getExams(),
      adminService.getCategories(),
      adminService.getSections(),
    ]).then(([examData, catData, secData]) => {
      setExams(examData);
      setCategories(catData);
      setAllSections(secData);
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

  // Resize sections count WITHOUT wiping existing custom section counts
  const handleResizeSectionDrafts = (nextCount: number) => {
    const safeSecCount = Math.max(1, Math.min(20, Math.floor(Number(nextCount) || 1)));
    const defaultNames = getDefaultSectionNames(safeSecCount);
    setSectionCountInput(safeSecCount);
    setSectionCountText(String(safeSecCount));

    setSectionDrafts((prev) => {
      if (safeSecCount <= prev.length) {
        return prev.slice(0, safeSecCount);
      }
      const existingSum = prev.reduce((sum, s) => sum + (Number(s.question_count) || 0), 0);
      const remaining = Math.max(0, (parseInt(totalQuestionsText, 10) || totalQuestions || 0) - existingSum);
      const addedCount = safeSecCount - prev.length;
      const addedCounts = remaining > 0 ? divideTotalAcrossSections(remaining, addedCount) : Array(addedCount).fill(0);
      const extras: SectionDraft[] = addedCounts.map((cnt, offset) => ({
        name: defaultNames[prev.length + offset],
        question_count: cnt,
      }));
      return [...prev, ...extras];
    });
  };

  const handleAutoDivideSections = (targetTotal?: number, targetSecCount?: number) => {
    const parsedTotal = targetTotal !== undefined ? targetTotal : (parseInt(totalQuestionsText, 10) || totalQuestions || 100);
    const parsedSec = targetSecCount !== undefined ? targetSecCount : (parseInt(sectionCountText, 10) || sectionCountInput || 1);
    const safeSecCount = Math.max(1, Math.min(20, Math.floor(Number(parsedSec) || 1)));
    const safeTotal = Math.max(1, Math.floor(Number(parsedTotal) || 1));
    const counts = divideTotalAcrossSections(safeTotal, safeSecCount);
    const defaultNames = getDefaultSectionNames(safeSecCount);

    setTotalQuestions(safeTotal);
    setTotalQuestionsText(String(safeTotal));
    setSectionCountInput(safeSecCount);
    setSectionCountText(String(safeSecCount));
    setSectionDrafts((prev) =>
      counts.map((cnt, idx) => ({
        id: prev[idx]?.id,
        name: prev[idx]?.name || defaultNames[idx],
        question_count: cnt,
      }))
    );
  };

  const handleSectionDraftChange = (index: number, field: 'name' | 'question_count', value: string | number) => {
    setSectionDrafts((prev) =>
      prev.map((sec, idx) =>
        idx === index
          ? { ...sec, [field]: field === 'question_count' ? Math.max(0, Number(value) || 0) : value }
          : sec
      )
    );
  };

  const sectionDraftSum = useMemo(
    () => sectionDrafts.reduce((sum, s) => sum + (Number(s.question_count) || 0), 0),
    [sectionDrafts]
  );

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
    setTotalQuestionsText('100');
    setTotalDurationSeconds(3600);
    setTotalMarks(200);
    setPositiveMarks(2.0);
    setNegativeMarks(0.5);
    setStatus('published');
    setSectionCountInput(4);
    setSectionCountText('4');
    setSectionDrafts([
      { name: 'English Comprehension', question_count: 25 },
      { name: 'General Intelligence & Reasoning', question_count: 25 },
      { name: 'Quantitative Aptitude', question_count: 25 },
      { name: 'General Awareness', question_count: 25 },
    ]);
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
    setTotalQuestionsText(String(exam.total_questions));
    setTotalDurationSeconds(exam.total_duration_seconds);
    setTotalMarks(exam.total_marks);
    setPositiveMarks(exam.positive_marks);
    setNegativeMarks(exam.negative_marks);
    setStatus(exam.status);

    const existingSecs = allSections
      .filter((s) => s.exam_id === exam.id)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    if (existingSecs.length > 0) {
      setSectionCountInput(existingSecs.length);
      setSectionCountText(String(existingSecs.length));
      setSectionDrafts(
        existingSecs.map((s) => ({
          id: s.id,
          name: s.name,
          question_count: Number(s.question_count) || 0,
        }))
      );
    } else {
      const counts = divideTotalAcrossSections(exam.total_questions || 100, 4);
      const names = getDefaultSectionNames(4);
      setSectionCountInput(4);
      setSectionCountText('4');
      setSectionDrafts(counts.map((cnt, idx) => ({ name: names[idx], question_count: cnt })));
    }

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

    if (sectionDraftSum !== Number(totalQuestions)) {
      alert(
        `Section-wise question sum (${sectionDraftSum}) must equal Whole Exam Total Questions (${totalQuestions}). Click "Auto-Divide Equally" or adjust section counts.`
      );
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

    let savedExamId = editingExam?.id;
    if (editingExam) {
      await adminService.updateExam(editingExam.id, payload);
    } else {
      const created = await adminService.createExam(payload);
      savedExamId = created.id;
    }

    if (savedExamId && sectionDrafts.length > 0) {
      const perSecDuration = Math.max(60, Math.round(Number(totalDurationSeconds) / sectionDrafts.length));
      await adminService.syncExamSections(
        savedExamId,
        Number(totalQuestions),
        sectionDrafts.map((s, idx) => ({
          id: s.id,
          name: s.name.trim() || `Section ${idx + 1}`,
          display_order: idx + 1,
          question_count: Number(s.question_count) || 0,
          duration_seconds: perSecDuration,
          marks_per_correct: Number(positiveMarks) || 2.0,
          negative_marks_per_wrong: Number(negativeMarks) || 0.5,
        }))
      );
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
                  const examSections = allSections
                    .filter((s) => s.exam_id === exam.id)
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
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
                        <div className="font-semibold text-slate-800">
                          {exam.total_questions} Questions Limit
                        </div>
                        <div className="text-xs text-slate-500">
                          {Math.round(exam.total_duration_seconds / 60)} Mins •{' '}
                          <strong className="text-indigo-700">{examSections.length || 0} Sections</strong>
                        </div>
                        {examSections.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {examSections.map((s) => (
                              <span
                                key={s.id}
                                className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                              >
                                {s.name}: <strong>{s.question_count}</strong>
                              </span>
                            ))}
                          </div>
                        )}
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-teal btn-sm flex items-center gap-1 text-xs px-2.5 py-1"
                            onClick={() => navigate(`/questions?exam_id=${exam.id}`)}
                            title="Configure Exam/Section Counts & Add Questions"
                          >
                            <Plus size={13} />
                            <span>Add Questions</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-indigo btn-sm flex items-center gap-1 text-xs px-2.5 py-1"
                            onClick={() => navigate(`/questions?exam_id=${exam.id}&open_bulk=1`)}
                            title="Bulk Upload & Divide Questions Section-Wise"
                          >
                            <Upload size={13} />
                            <span>Bulk Upload</span>
                          </button>
                          <button
                            className="btn-icon text-blue-600 hover:bg-blue-50"
                            onClick={() => openEditModal(exam)}
                            title="Edit Exam & Section Counts"
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
                    <label className="form-label font-bold text-slate-800">Whole Exam Total Questions *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input font-bold"
                      value={totalQuestionsText}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setTotalQuestionsText(raw);
                        const n = parseInt(raw, 10);
                        if (!Number.isNaN(n) && n >= 1) {
                          setTotalQuestions(n);
                          setTotalMarks(n * positiveMarks);
                        }
                      }}
                      onBlur={() => {
                        const n = Math.max(1, parseInt(totalQuestionsText, 10) || totalQuestions || 1);
                        setTotalQuestions(n);
                        setTotalQuestionsText(String(n));
                        setTotalMarks(n * positiveMarks);
                      }}
                      required
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

                {/* SECTION-WISE QUESTION COUNT DIVISION SETUP */}
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SplitSquareHorizontal size={16} className="text-indigo-700" />
                      <h4 className="font-bold text-sm text-indigo-950">
                        Section-Wise Question Count Setup
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="text-xs font-semibold text-slate-700">Number of Sections:</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="form-input w-16 py-1 px-2 text-xs font-bold text-center"
                        value={sectionCountText}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setSectionCountText(raw);
                          const n = parseInt(raw, 10);
                          if (!Number.isNaN(n) && n >= 1 && n <= 20) {
                            handleResizeSectionDrafts(n);
                          }
                        }}
                        onBlur={() => {
                          const n = Math.max(1, Math.min(20, parseInt(sectionCountText, 10) || sectionCountInput || 1));
                          setSectionCountInput(n);
                          setSectionCountText(String(n));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoDivideSections()}
                        className="btn btn-secondary btn-sm text-xs whitespace-nowrap"
                        title="Optional shortcut: split total questions equally"
                      >
                        Optional: Equal Split ({totalQuestions} ÷ {sectionCountInput})
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-indigo-900">
                    Set any custom question count per section (e.g., 30, 20, 35, 15). Bulk upload will divide strictly per each section&apos;s given count.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {sectionDrafts.map((sec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-100 shadow-sm"
                      >
                        <span className="text-[11px] font-black bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                          S{idx + 1}
                        </span>
                        <input
                          type="text"
                          className="form-input flex-1 py-1 text-xs font-medium"
                          placeholder={`Section ${idx + 1} Name`}
                          value={sec.name}
                          onChange={(e) => handleSectionDraftChange(idx, 'name', e.target.value)}
                          required
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            className="form-input w-16 py-1 px-2 text-xs font-bold text-center"
                            value={sec.question_count}
                            onChange={(e) => handleSectionDraftChange(idx, 'question_count', e.target.value)}
                            required
                          />
                          <span className="text-[11px] text-slate-500 font-semibold">Qs</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg border font-semibold ${
                      sectionDraftSum === Number(totalQuestions)
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-300 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {sectionDraftSum === Number(totalQuestions) ? (
                        <CheckCircle size={14} className="text-emerald-600" />
                      ) : (
                        <AlertCircle size={14} className="text-amber-600" />
                      )}
                      <span>
                        Section Sum: <strong>{sectionDraftSum} Qs</strong> / Whole Exam Limit:{' '}
                        <strong>{totalQuestions} Qs</strong>
                      </span>
                    </div>
                    {sectionDraftSum !== Number(totalQuestions) && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>
                          ({totalQuestions - sectionDraftSum > 0 ? `+${totalQuestions - sectionDraftSum} left` : `${sectionDraftSum - totalQuestions} over`})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const sum = Math.max(1, sectionDraftSum);
                            setTotalQuestions(sum);
                            setTotalQuestionsText(String(sum));
                            setTotalMarks(sum * positiveMarks);
                          }}
                          className="btn btn-teal btn-sm text-[11px] py-1 px-2"
                        >
                          Set Exam Total = {sectionDraftSum}
                        </button>
                      </div>
                    )}
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

