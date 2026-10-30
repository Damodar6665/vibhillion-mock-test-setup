// ==============================================================================
// VIBHILLION ADMIN: QUESTION MANAGEMENT & CSV IMPORT
// File: apps/admin/src/pages/QuestionsPage.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  HelpCircle,
  Download,
  Upload,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { ExamSection } from '@vibhillion/shared';

export const QuestionsPage: React.FC = () => {
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Form states
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionText, setQuestionText] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [topic, setTopic] = useState('Grammar');
  const [subtopic, setSubtopic] = useState('');
  const [marks, setMarks] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  // CSV State
  const [csvContent, setCsvContent] = useState('');

  const loadData = async () => {
    setLoading(true);
    const secData = await adminService.getSections();
    setSections(secData);
    if (secData.length > 0) {
      const secId = selectedSectionId || secData[0].id;
      setSelectedSectionId(secId);
      loadQuestions(secId);
    } else {
      setLoading(false);
    }
  };

  const loadQuestions = async (secId: string) => {
    setLoading(true);
    const qData = await adminService.getQuestions(secId);
    setQuestions(qData);
    setQuestionNumber(qData.length + 1);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectSection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const secId = e.target.value;
    setSelectedSectionId(secId);
    loadQuestions(secId);
  };

  const handleOptionChange = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const openCreateModal = () => {
    setQuestionNumber(questions.length + 1);
    setQuestionText('');
    setDifficulty('medium');
    setTopic('Grammar');
    setSubtopic('');
    setMarks(2.0);
    setNegativeMarks(0.5);
    setExplanation('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || options.some((o) => !o.trim())) {
      alert('Please enter question text and all four options.');
      return;
    }

    await adminService.createQuestion({
      section_id: selectedSectionId,
      question_number: Number(questionNumber),
      question_text: questionText,
      difficulty,
      topic,
      subtopic,
      marks: Number(marks),
      negative_marks: Number(negativeMarks),
      explanation,
      solution_steps: [explanation],
      options,
      correctOptionIndex: correctIndex,
    });

    setIsModalOpen(false);
    loadQuestions(selectedSectionId);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      await adminService.deleteQuestion(id);
      loadQuestions(selectedSectionId);
    }
  };

  // CSV Template generation
  const downloadTemplate = () => {
    const csvHeader = 'question_number,question_text,option_A,option_B,option_C,option_D,correct_option,difficulty,topic,subtopic,marks,negative_marks,explanation\n';
    const sampleRow = '1,"Select the synonym of METICULOUS","Painstaking","Careless","Hasty","Casual","A","easy","Vocabulary","Synonyms",2.0,0.5,"Meticulous means careful"\n';
    const blob = new Blob([csvHeader + sampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'vibhillion_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvImport = async () => {
    if (!csvContent.trim()) {
      alert('Please paste CSV content');
      return;
    }

    const lines = csvContent.split('\n').filter((l) => l.trim().length > 0);
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 7) {
        const correctOpt = parts[6].toUpperCase();
        let cIdx = 0;
        if (correctOpt === 'B') cIdx = 1;
        else if (correctOpt === 'C') cIdx = 2;
        else if (correctOpt === 'D') cIdx = 3;

        await adminService.createQuestion({
          section_id: selectedSectionId,
          question_number: Number(parts[0]) || questions.length + imported + 1,
          question_text: parts[1],
          difficulty: (parts[7] as any) || 'medium',
          topic: parts[8] || 'General',
          subtopic: parts[9] || '',
          marks: Number(parts[10]) || 2.0,
          negative_marks: Number(parts[11]) || 0.5,
          explanation: parts[12] || '',
          options: [parts[2], parts[3], parts[4], parts[5]],
          correctOptionIndex: cIdx,
        });
        imported++;
      }
    }

    setIsCsvModalOpen(false);
    setCsvContent('');
    loadQuestions(selectedSectionId);
    alert(`Successfully imported ${imported} questions!`);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Question Management</h1>
          <p className="page-subtitle">Author questions, configure 4 options, protect answers, and import via CSV</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={downloadTemplate} title="Download CSV format template">
            <Download size={16} />
            <span>CSV Template</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setIsCsvModalOpen(true)}>
            <Upload size={16} />
            <span>Import CSV</span>
          </button>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Section Filter Bar */}
      <div className="content-card p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-700">Filter By Section:</label>
          <select
            className="form-input max-w-sm"
            value={selectedSectionId}
            onChange={handleSelectSection}
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </select>
        </div>
        <div className="text-sm font-semibold text-slate-600">
          Showing {questions.length} questions in section
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="content-card p-6 text-center text-slate-500">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="content-card p-8 text-center text-slate-500">
            <HelpCircle size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No questions added to this section yet.</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Question" or "Import CSV" to upload questions.</p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="content-card p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="order-circle bg-blue-100 text-blue-700 font-bold">
                    Q{q.question_number}
                  </span>
                  <div>
                    <span className="badge badge-info">{q.topic}</span>
                    {q.subtopic && <span className="text-xs text-slate-500 ml-2">• {q.subtopic}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-success">+{q.marks} / −{q.negative_marks}</span>
                  <button
                    className="btn-icon text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(q.id)}
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-slate-800 font-medium text-base mb-4 leading-relaxed">
                {q.question_text}
              </p>

              {/* 4 Options Grid */}
              <div className="grid-2-cols gap-2 mb-3">
                {q.options?.map((opt: any) => {
                  const isCorrect = opt.id === q.correct_option_id;
                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-lg border text-sm flex items-center justify-between ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span>
                        <strong className="mr-2">{opt.option_label}.</strong> {opt.option_text}
                      </span>
                      {isCorrect && (
                        <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
                          Answer Key
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 mt-2">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ADD QUESTION MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Create New Question</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveQuestion}>
              <div className="modal-body space-y-4">
                <div className="grid-3-cols">
                  <div className="form-group">
                    <label className="form-label">Question # *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={questionNumber}
                      onChange={(e) => setQuestionNumber(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Topic *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Grammar, Vocabulary"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subtopic</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Subject-Verb Agreement"
                      value={subtopic}
                      onChange={(e) => setSubtopic(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Question Text *</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter the complete question prompt..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="form-label">Four Answer Options (Select radio for correct answer) *</label>
                  {['A', 'B', 'C', 'D'].map((label, idx) => (
                    <div key={label} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={correctIndex === idx}
                        onChange={() => setCorrectIndex(idx)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className="font-bold text-slate-700 w-6">{label}.</span>
                      <input
                        type="text"
                        className="form-input flex-1"
                        placeholder={`Option ${label} text...`}
                        value={options[idx]}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid-2-cols">
                  <div className="form-group">
                    <label className="form-label">Marks for Correct (+)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={marks}
                      onChange={(e) => setMarks(Number(e.target.value))}
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
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Solution & Explanation</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Provide official grammatical rule or mathematical steps..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Question & Protect Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isCsvModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Bulk Import Questions from CSV</h3>
              <button className="btn-close" onClick={() => setIsCsvModalOpen(false)}>×</button>
            </div>
            <div className="modal-body space-y-4">
              <p className="text-sm text-slate-600">
                Paste CSV data below matching the columns:
                <br />
                <code className="text-xs bg-slate-100 p-1 rounded font-mono">
                  question_number,question_text,option_A,option_B,option_C,option_D,correct_option,difficulty,topic,subtopic,marks,negative_marks,explanation
                </code>
              </p>
              <textarea
                className="form-input font-mono text-xs"
                rows={10}
                placeholder="Paste CSV rows here..."
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsCsvModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCsvImport}>
                Import Rows into Current Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

