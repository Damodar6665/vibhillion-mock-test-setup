// ==============================================================================
// VIBHILLION ADMIN: SECTION MANAGEMENT PAGE
// File: apps/admin/src/pages/SectionsPage.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle, CheckCircle } from 'lucide-react';
import { adminService } from '../services/adminService';
import { ExamSection, Exam } from '@vibhillion/shared';

export const SectionsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ExamSection | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [questionCount, setQuestionCount] = useState(25);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [marksPerCorrect, setMarksPerCorrect] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.5);

  const loadExams = async () => {
    setLoading(true);
    const examData = await adminService.getExams();
    setExams(examData);
    if (examData.length > 0) {
      const firstId = examData[0].id;
      setSelectedExamId(firstId);
      loadSections(firstId);
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
  };

  const openCreateModal = () => {
    setEditingSection(null);
    setName('');
    setDisplayOrder(sections.length + 1);
    setQuestionCount(25);
    setDurationMinutes(15);
    setMarksPerCorrect(2.0);
    setNegativeMarks(0.5);
    setIsModalOpen(true);
  };

  const openEditModal = (sec: ExamSection) => {
    setEditingSection(sec);
    setName(sec.name);
    setDisplayOrder(sec.display_order);
    setQuestionCount(sec.question_count);
    setDurationMinutes(Math.round(sec.duration_seconds / 60));
    setMarksPerCorrect(sec.marks_per_correct);
    setNegativeMarks(sec.negative_marks_per_wrong);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedExamId) return;

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
    } else {
      await adminService.createSection(payload);
    }

    setIsModalOpen(false);
    loadSections(selectedExamId);
  };

  const handleDelete = async (id: string, secName: string) => {
    if (confirm(`Delete section "${secName}"? Questions inside will also be removed.`)) {
      await adminService.deleteSection(id);
      loadSections(selectedExamId);
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
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} />
          <span>Add Section</span>
        </button>
      </div>

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
              <option key={ex.id} value={ex.id}>{ex.title}</option>
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
                {sections.map((sec) => (
                  <tr key={sec.id}>
                    <td>
                      <span className="order-circle">{sec.display_order}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <FolderTree size={16} className="text-blue-500" />
                        <span>{sec.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-800">{sec.question_count} Questions</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{Math.round(sec.duration_seconds / 60)} Mins ({sec.duration_seconds}s)</span>
                    </td>
                    <td>
                      <span className="text-sm font-semibold text-emerald-600">+{sec.marks_per_correct}</span>
                      <span className="text-xs text-slate-400"> / </span>
                      <span className="text-sm font-semibold text-red-500">−{sec.negative_marks_per_wrong}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn-icon text-blue-600 hover:bg-blue-50"
                          onClick={() => openEditModal(sec)}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(sec.id, sec.name)}
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

      {/* CREATE / EDIT SECTION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingSection ? 'Edit Test Section' : 'Add Test Section'}
              </h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Section Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. English Comprehension"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2-cols">
                  <div className="form-group">
                    <label className="form-label">Display Sequence</label>
                    <input
                      type="number"
                      className="form-input"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Question Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Section Duration (Minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  />
                </div>

                <div className="grid-2-cols">
                  <div className="form-group">
                    <label className="form-label">Marks Per Correct (+)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={marksPerCorrect}
                      onChange={(e) => setMarksPerCorrect(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Penalty Per Incorrect (−)</label>
                    <input
                      type="number"
                      step="0.05"
                      className="form-input"
                      value={negativeMarks}
                      onChange={(e) => setNegativeMarks(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSection ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
