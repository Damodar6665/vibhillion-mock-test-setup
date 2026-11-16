// ==============================================================================
// VIBHILLION ADMIN: SECTION MANAGEMENT PAGE
// File: apps/admin/src/pages/SectionsPage.tsx
// ==============================================================================

import React, { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  HelpCircle,
  Save,
  Layers,
  Sparkles,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { ExamSection, Exam } from '@vibhillion/shared';

export const SectionsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ExamSection | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [questionCount, setQuestionCount] = useState(25);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [marksPerCorrect, setMarksPerCorrect] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.5);

  const editorRef = useRef<HTMLDivElement | null>(null);

  const loadExams = async () => {
    setLoading(true);
    const examData = await adminService.getExams();
    setExams(examData);
    if (examData.length > 0) {
      const firstId = examData[0].id;
      setSelectedExamId(firstId);
      await loadSections(firstId);
    } else {
      setLoading(false);
    }
  };

  const loadSections = async (examId: string) => {
    setLoading(true);
    const secData = await adminService.getSections(examId);
    setSections(secData);
    setLoading(false);
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleSelectExam = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedExamId(id);
    loadSections(id);
    setIsEditorOpen(false);
    setEditingSection(null);
  };

  const openCreateSection = () => {
    setEditingSection(null);
    setName('');
    setDisplayOrder(sections.length + 1);
    setQuestionCount(25);
    setDurationMinutes(15);
    setMarksPerCorrect(2.0);
    setNegativeMarks(0.5);
    setIsEditorOpen(true);
    setStatusMessage(null);
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const openEditSection = (sec: ExamSection) => {
    setEditingSection(sec);
    setName(sec.name);
    setDisplayOrder(sec.display_order);
    setQuestionCount(sec.question_count);
    setDurationMinutes(Math.round(sec.duration_seconds / 60));
    setMarksPerCorrect(sec.marks_per_correct);
    setNegativeMarks(sec.negative_marks_per_wrong);
    setIsEditorOpen(true);
    setStatusMessage(null);
    setTimeout(() => {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingSection(null);
    setStatusMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedExamId) return;

    try {
      const payload = {
        exam_id: selectedExamId,
        name,
        display_order: Number(displayOrder),
        question_count: Number(questionCount),
        duration_seconds: Number(durationMinutes) * 60,
        marks_per_correct: Number(marksPerCorrect),
        negative_marks_per_wrong: Number(negativeMarks),
      };

      if (editingSection) {
        await adminService.updateSection(editingSection.id, payload);
        setStatusMessage({
          type: 'success',
          text: `Section "${name}" updated successfully! Changes are synchronized live with student tests.`,
        });
      } else {
        await adminService.createSection(payload);
        setStatusMessage({
          type: 'success',
          text: `New section "${name}" created successfully!`,
        });
      }

      await loadSections(selectedExamId);
      const updatedExams = await adminService.getExams();
      setExams(updatedExams);

      // Keep editor visible or smoothly close after brief confirmation
      setTimeout(() => {
        setIsEditorOpen(false);
        setEditingSection(null);
      }, 1500);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save section changes. Please try again.',
      });
    }
  };

  const handleDelete = async (id: string, secName: string) => {
    if (confirm(`Delete section "${secName}"? Questions inside will also be removed.`)) {
      await adminService.deleteSection(id);
      await loadSections(selectedExamId);
      const updatedExams = await adminService.getExams();
      setExams(updatedExams);
      if (editingSection?.id === id) {
        closeEditor();
      }
    }
  };

  // Calculations & Validations
  const totalConfiguredQuestions = sections.reduce((acc, s) => acc + s.question_count, 0);
  const totalConfiguredDuration = sections.reduce((acc, s) => acc + s.duration_seconds, 0);
  const activeExam = exams.find((e) => e.id === selectedExamId);

  const isQuestionsMatch = activeExam ? totalConfiguredQuestions === activeExam.total_questions : true;
  const isDurationMatch = activeExam ? totalConfiguredDuration === activeExam.total_duration_seconds : true;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Section Management</h1>
          <p className="page-subtitle">Configure test sections, independent question allocations, and timers</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateSection}>
          <Plus size={16} />
          <span>Add Section</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle size={18} className="text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="text-red-600" />
            )}
            <span className="font-semibold text-sm">{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Exam Selector */}
      <div className="content-card p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-700">Select Exam Paper:</label>
          <select
            className="form-input max-w-md"
            value={selectedExamId}
            onChange={handleSelectExam}
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-slate-500">
          Showing <strong>{sections.length}</strong> configured sections
        </div>
      </div>

      {/* Validation Banner */}
      <div className="grid-2-cols mb-4">
        <div className={`validation-box ${isQuestionsMatch ? 'validation-valid' : 'validation-warning'}`}>
          {isQuestionsMatch ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>
            <h4 className="font-bold text-sm">Question Count Verification</h4>
            <p className="text-xs">
              Configured: <strong>{totalConfiguredQuestions} Qs</strong> • Exam Total: <strong>{activeExam?.total_questions || 100} Qs</strong>
            </p>
          </div>
        </div>

        <div className={`validation-box ${isDurationMatch ? 'validation-valid' : 'validation-warning'}`}>
          {isDurationMatch ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <div>
            <h4 className="font-bold text-sm">Duration Compatibility</h4>
            <p className="text-xs">
              Sum of Sections: <strong>{Math.round(totalConfiguredDuration / 60)} Mins</strong> • Exam Total: <strong>{Math.round((activeExam?.total_duration_seconds || 3600) / 60)} Mins</strong>
            </p>
          </div>
        </div>
      </div>

      {/* CLEARLY VISIBLE DEDICATED EDIT / CREATE SECTION PANEL */}
      {isEditorOpen && (
        <div
          ref={editorRef}
          className="content-card mb-6 border-2 border-teal-500 shadow-lg p-6 bg-white rounded-xl transition-all"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Edit2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {editingSection ? `Edit Section: ${editingSection.name}` : 'Add New Test Section'}
                  </h3>
                  <span className="badge badge-info text-[11px] px-2.5 py-0.5">
                    Live Editing Mode • Always Visible
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  This editing section remains clearly visible on your screen and will not close while you type or edit.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm flex items-center gap-1.5"
              onClick={closeEditor}
              title="Close Editor"
            >
              <X size={14} />
              <span>Close</span>
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="form-group md:col-span-2">
                <label className="form-label font-bold text-slate-800">
                  Section Name *
                </label>
                <input
                  type="text"
                  className="form-input text-sm font-medium"
                  placeholder="e.g. English Comprehension"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Official name of the exam tier section displayed to students.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label font-bold text-slate-800">
                  Display Sequence Order
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-input text-sm"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Position in the test tab order (1, 2, 3, etc.)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label font-bold text-slate-800 flex items-center gap-1">
                  <HelpCircle size={14} className="text-blue-500" />
                  <span>Question Count</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-input text-sm font-semibold"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Questions allocated in this section
                </span>
              </div>

              <div className="form-group">
                <label className="form-label font-bold text-slate-800 flex items-center gap-1">
                  <Clock size={14} className="text-amber-500" />
                  <span>Section Duration (Minutes)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-input text-sm font-semibold"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  = {Number(durationMinutes) * 60} seconds sectional timer
                </span>
              </div>

              <div className="form-group">
                <label className="form-label font-bold text-slate-800">
                  Marks Per Correct (+)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input text-sm font-bold text-emerald-700 bg-emerald-50/40"
                  value={marksPerCorrect}
                  onChange={(e) => setMarksPerCorrect(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Score awarded for each correct answer
                </span>
              </div>

              <div className="form-group">
                <label className="form-label font-bold text-slate-800">
                  Penalty Per Incorrect (−)
                </label>
                <input
                  type="number"
                  step="0.05"
                  className="form-input text-sm font-bold text-red-600 bg-red-50/40"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Score deducted for each wrong answer
                </span>
              </div>
            </div>

            {/* LIVE SECTION CALCULATION SUMMARY */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 mb-5 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  Section Weight: <strong className="text-slate-900 font-bold">{questionCount * marksPerCorrect} marks max</strong>
                </span>
                <span>•</span>
                <span>
                  Max Potential Deduction: <strong className="text-red-700 font-bold">−{(questionCount * negativeMarks).toFixed(1)} marks</strong>
                </span>
                <span>•</span>
                <span>
                  Sectional Timer: <strong className="text-slate-900 font-bold">{durationMinutes} min ({durationMinutes * 60}s)</strong>
                </span>
              </div>

              <span className="text-teal-700 font-semibold flex items-center gap-1.5 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                <Sparkles size={13} className="text-teal-600" />
                <span>Instant live sync with frontend & timed tests</span>
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn btn-secondary px-5"
                onClick={closeEditor}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-6 flex items-center gap-2 font-bold shadow-sm"
              >
                <Save size={16} />
                <span>{editingSection ? 'Update Section Changes' : 'Create Test Section'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sections Table */}
      <div className="content-card">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading sections...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Section Name</th>
                  <th>Questions</th>
                  <th>Sectional Timer</th>
                  <th>Marks Pattern</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec) => {
                  const isCurrentlyEditing = isEditorOpen && editingSection?.id === sec.id;

                  return (
                    <tr
                      key={sec.id}
                      className={isCurrentlyEditing ? 'bg-teal-50/60 border-l-4 border-l-teal-600' : ''}
                    >
                      <td>
                        <span className={`order-circle ${isCurrentlyEditing ? 'bg-teal-600 text-white' : ''}`}>
                          {sec.display_order}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <FolderTree
                            size={16}
                            className={isCurrentlyEditing ? 'text-teal-600' : 'text-blue-500'}
                          />
                          <span className="font-bold text-slate-900">{sec.name}</span>
                          {isCurrentlyEditing && (
                            <span className="badge badge-success text-[10px] py-0.5 px-2 font-bold">
                              Currently Editing
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="font-semibold text-slate-800">
                          {sec.question_count} Questions
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {Math.round(sec.duration_seconds / 60)} Mins ({sec.duration_seconds}s)
                        </span>
                      </td>
                      <td>
                        <span className="text-sm font-semibold text-emerald-600">
                          +{sec.marks_per_correct}
                        </span>
                        <span className="text-xs text-slate-400"> / </span>
                        <span className="text-sm font-semibold text-red-500">
                          −{sec.negative_marks_per_wrong}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            className={`btn-icon ${
                              isCurrentlyEditing
                                ? 'bg-teal-600 text-white hover:bg-teal-700'
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            onClick={() => openEditSection(sec)}
                            title={isCurrentlyEditing ? 'Editing active section' : 'Edit Section'}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="btn-icon text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(sec.id, sec.name)}
                            title="Delete Section"
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
    </div>
  );
};
