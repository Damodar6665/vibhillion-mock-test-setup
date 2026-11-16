// ==============================================================================
// VIBHILLION ADMIN: QUESTION MANAGEMENT, BULK JSON UPLOAD & IMAGE HANDLING
// File: apps/admin/src/pages/QuestionsPage.tsx
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Edit2,
  HelpCircle,
  Download,
  Upload,
  CheckCircle2,
  FileCode,
  Image as ImageIcon,
  X,
  FileSpreadsheet,
  AlertCircle,
  Layers,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { ExamSection, Exam, Category } from '@vibhillion/shared';

export const QuestionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const examIdParam = searchParams.get('exam_id') || '';

  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(examIdParam);
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  // Form states
  const [questionNumber, setQuestionNumber] = useState(1);
  const [questionText, setQuestionText] = useState('');
  const [questionImage, setQuestionImage] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [topic, setTopic] = useState('Grammar');
  const [subtopic, setSubtopic] = useState('');
  const [marks, setMarks] = useState(2.0);
  const [negativeMarks, setNegativeMarks] = useState(0.5);
  const [explanation, setExplanation] = useState('');
  
  // 4 Options: text and optional image
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [optionImages, setOptionImages] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  // Bulk JSON State
  const [jsonContent, setJsonContent] = useState('');
  const [jsonReplace, setJsonReplace] = useState(false);
  const [isUploadingJson, setIsUploadingJson] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  const loadData = async (targetExamId?: string) => {
    setLoading(true);
    const [examsData, catsData, secData] = await Promise.all([
      adminService.getExams(),
      adminService.getCategories(),
      adminService.getSections(),
    ]);
    setExams(examsData);
    setCategories(catsData);

    const activeExId = targetExamId || selectedExamId || examIdParam || (examsData.length > 0 ? examsData[0].id : '');
    setSelectedExamId(activeExId);

    // Filter sections for active exam or keep common sections
    const examSections = secData.filter((s) => !s.exam_id || s.exam_id === activeExId);
    const finalSections = examSections.length > 0 ? examSections : secData;
    setSections(finalSections);

    if (finalSections.length > 0) {
      const secId = (selectedSectionId && finalSections.some(s => s.id === selectedSectionId)) ? selectedSectionId : finalSections[0].id;
      setSelectedSectionId(secId);
      await loadQuestions(secId, activeExId);
    } else {
      setLoading(false);
    }
  };

  const loadQuestions = async (secId: string, exId?: string) => {
    setLoading(true);
    const activeExId = exId || selectedExamId;
    const qData = await adminService.getQuestions(secId, activeExId);
    setQuestions(qData);
    setQuestionNumber(qData.length + 1);
    setLoading(false);
  };

  useEffect(() => {
    loadData(examIdParam);
  }, [examIdParam]);

  const handleSelectExam = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const exId = e.target.value;
    setSelectedExamId(exId);
    setSearchParams(exId ? { exam_id: exId } : {});
    loadData(exId);
  };

  const handleSelectSection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const secId = e.target.value;
    setSelectedSectionId(secId);
    loadQuestions(secId, selectedExamId);
  };

  const handleOptionTextChange = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const handleOptionImageChange = (index: number, value: string) => {
    const next = [...optionImages];
    next[index] = value;
    setOptionImages(next);
  };

  const handleFileUploadAsBase64 = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size exceeds 2MB limit. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionNumber(questions.length + 1);
    setQuestionText('');
    setQuestionImage('');
    setDifficulty('medium');
    setTopic('Grammar');
    setSubtopic('');
    setMarks(2.0);
    setNegativeMarks(0.5);
    setExplanation('');
    setOptions(['', '', '', '']);
    setOptionImages(['', '', '', '']);
    setCorrectIndex(0);
    setIsModalOpen(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setQuestionNumber(q.question_number);
    setQuestionText(q.question_text);
    setQuestionImage(q.image_url || '');
    setDifficulty(q.difficulty || 'medium');
    setTopic(q.topic || 'General');
    setSubtopic(q.subtopic || '');
    setMarks(Number(q.marks) || 2.0);
    setNegativeMarks(Number(q.negative_marks) || 0.5);
    setExplanation(q.explanation || q.answer_explanation || '');

    const optTexts = (q.options || []).map((o: any) => o.option_text);
    const optImgs = (q.options || []).map((o: any) => o.image_url || '');
    while (optTexts.length < 4) optTexts.push('');
    while (optImgs.length < 4) optImgs.push('');

    setOptions(optTexts);
    setOptionImages(optImgs);
    const correctIdx = (q.options || []).findIndex((o: any) => o.id === q.correct_option_id);
    setCorrectIndex(correctIdx >= 0 ? correctIdx : 0);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || options.some((o) => !o.trim())) {
      alert('Please enter the question text and all four options.');
      return;
    }

    const formattedOptions = options.map((txt, i) => ({
      option_text: txt,
      image_url: optionImages[i]?.trim() || null,
    }));

    if (editingQuestion) {
      await adminService.updateQuestion(editingQuestion.id, {
        question_number: Number(questionNumber),
        question_text: questionText,
        difficulty,
        topic,
        subtopic,
        marks: Number(marks),
        negative_marks: Number(negativeMarks),
        explanation,
        solution_steps: [explanation],
        options: formattedOptions,
        correctOptionIndex: correctIndex,
        image_url: questionImage?.trim() || null,
      });
    } else {
      await adminService.createQuestion({
        exam_id: selectedExamId,
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
        options: formattedOptions,
        correctOptionIndex: correctIndex,
        image_url: questionImage?.trim() || null,
      });
    }

    setIsModalOpen(false);
    setEditingQuestion(null);
    loadQuestions(selectedSectionId, selectedExamId);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      await adminService.deleteQuestion(id);
      loadQuestions(selectedSectionId, selectedExamId);
    }
  };

  // --------------------------------------------------------------------------
  // BULK JSON UPLOAD
  // --------------------------------------------------------------------------
  const downloadJsonTemplate = () => {
    const samplePayload = {
      replace: false,
      questions: [
        {
          question_number: 1,
          section_name: 'English Comprehension',
          question_text: 'Select the synonym of the word METICULOUS:',
          image_url: null,
          difficulty: 'easy',
          topic: 'Vocabulary',
          subtopic: 'Synonyms',
          marks: 2.0,
          negative_marks: 0.5,
          explanation: 'Meticulous means taking or showing extreme care about minute details; painstaking.',
          options: [
            { option_label: 'A', option_text: 'Painstaking', image_url: null },
            { option_label: 'B', option_text: 'Careless', image_url: null },
            { option_label: 'C', option_text: 'Hasty', image_url: null },
            { option_label: 'D', option_text: 'Casual', image_url: null },
          ],
          correct_option_label: 'A',
        },
        {
          question_number: 2,
          section_name: 'General Intelligence & Reasoning',
          question_text: 'Which figure replaces the question mark in the sequence below?',
          image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
          difficulty: 'medium',
          topic: 'Reasoning',
          subtopic: 'Pattern Completion',
          marks: 2.0,
          negative_marks: 0.5,
          explanation: 'The pattern rotates clockwise 45 degrees at each step.',
          options: [
            { option_label: 'A', option_text: 'Figure 1', image_url: null },
            { option_label: 'B', option_text: 'Figure 2', image_url: null },
            { option_label: 'C', option_text: 'Figure 3', image_url: null },
            { option_label: 'D', option_text: 'Figure 4', image_url: null },
          ],
          correct_option_label: 'B',
        },
      ],
    };

    const blob = new Blob([JSON.stringify(samplePayload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vibhillion_questions_bulk_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJsonFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setJsonContent(reader.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteJsonBulkUpload = async () => {
    if (!jsonContent.trim()) {
      alert('Please select a JSON file or paste valid JSON content.');
      return;
    }

    try {
      setIsUploadingJson(true);
      const parsed = JSON.parse(jsonContent);
      const questionsList = Array.isArray(parsed) ? parsed : (parsed.questions || []);

      if (!Array.isArray(questionsList) || questionsList.length === 0) {
        alert('Invalid JSON: Must contain an array of questions or { "questions": [...] }.');
        setIsUploadingJson(false);
        return;
      }

      const res = await adminService.bulkUploadQuestions({
        questions: questionsList.map((q: any) => ({
          ...q,
          exam_id: q.exam_id || selectedExamId,
        })),
        replace: jsonReplace,
      });

      setIsUploadingJson(false);
      setIsJsonModalOpen(false);
      setJsonContent('');
      await loadData(selectedExamId);
      alert(`Bulk Upload Success! Successfully imported ${res.uploaded_count} questions. Total questions in bank: ${res.total_questions}. Synced live across frontend and backend.`);
    } catch (err: any) {
      setIsUploadingJson(false);
      alert(`JSON Upload Error: ${err.message}`);
    }
  };

  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const activeCategory = activeExam ? categories.find((c) => c.id === activeExam.category_id) : null;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Question Management</h1>
          <p className="page-subtitle">
            Author questions, upload/delete images on questions & options, and perform bulk JSON imports syncing live with frontend
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn btn-secondary"
            onClick={downloadJsonTemplate}
            title="Download JSON format sample"
          >
            <FileCode size={16} />
            <span>JSON Template</span>
          </button>

          <button
            className="btn btn-secondary bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
            onClick={() => setIsJsonModalOpen(true)}
            title="Bulk Upload Questions via JSON"
          >
            <Upload size={16} />
            <span>Bulk Upload JSON</span>
          </button>

          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Target Exam Selector Bar */}
      <div className="content-card p-4 mb-4 bg-gradient-to-r from-teal-50/70 via-indigo-50/40 to-white border border-teal-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
              <GraduationCap size={18} className="text-teal-700" />
              <span>Target Exam:</span>
            </div>
            <select
              className="form-input font-bold text-slate-800 bg-white border-teal-300 min-w-[280px]"
              value={selectedExamId}
              onChange={handleSelectExam}
            >
              {exams.map((ex) => {
                const cat = categories.find((c) => c.id === ex.category_id);
                return (
                  <option key={ex.id} value={ex.id}>
                    [{cat?.name || 'General'}] {ex.title} ({ex.year || 2025})
                  </option>
                );
              })}
            </select>

            {activeExam && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded-full border border-teal-200">
                  Category: {activeCategory?.name || 'General'}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded border border-slate-200">
                  {activeExam.session || 'Shift 1'} • {activeExam.total_questions || 100} Questions Expected
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Direct Question Assignment:</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Active Exam Linked
            </span>
          </div>
        </div>
      </div>

      {/* Section Filter Bar */}
      <div className="content-card p-4 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-700">Filter By Section:</label>
          <select
            className="form-input max-w-sm"
            value={selectedSectionId}
            onChange={handleSelectSection}
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name} ({sec.question_count} Qs)
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Section Questions: <strong>{questions.length}</strong> | Image-enabled: <strong>{questions.filter(q => q.image_url || q.options?.some((o: any) => o.image_url)).length}</strong>
        </div>
      </div>

      {/* Questions Data List */}
      <div className="content-card">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading section questions...</div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <HelpCircle size={40} className="mx-auto mb-2 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">No questions in this section</h3>
            <p className="text-xs text-slate-500 mt-1">Use "Add Question" or "Bulk Upload JSON" to populate this section.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Q#</th>
                  <th>Question & Visuals</th>
                  <th>Topic & Difficulty</th>
                  <th>Options & Correct Key</th>
                  <th>Marks</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => {
                  const hasImage = Boolean(q.image_url);
                  const hasOptionImages = q.options?.some((o: any) => Boolean(o.image_url));

                  return (
                    <tr key={q.id}>
                      <td>
                        <span className="font-black text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded">
                          Q{q.question_number}
                        </span>
                      </td>
                      <td>
                        <div className="font-semibold text-slate-900 text-xs mb-1">
                          {q.question_text}
                        </div>
                        {hasImage && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              <ImageIcon size={12} />
                              <span>Diagram Attached</span>
                            </span>
                            <img
                              src={q.image_url}
                              alt="Thumbnail"
                              className="w-8 h-8 rounded border object-cover"
                            />
                          </div>
                        )}
                        {hasOptionImages && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 mt-1">
                            <ImageIcon size={10} />
                            <span>Visual Options</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="text-xs font-bold text-slate-700">{q.topic || 'General'}</div>
                        <div className="text-[11px] text-slate-400">{q.subtopic || 'Concept'}</div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                            q.difficulty === 'hard'
                              ? 'bg-red-100 text-red-700'
                              : q.difficulty === 'easy'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {q.difficulty?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </td>
                      <td>
                        <div className="space-y-1">
                          {q.options?.map((opt: any) => {
                            const isCorrect = opt.id === q.correct_option_id;
                            return (
                              <div
                                key={opt.id}
                                className={`text-[11px] px-2 py-0.5 rounded flex items-center justify-between gap-1 ${
                                  isCorrect
                                    ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                                    : 'text-slate-600'
                                }`}
                              >
                                <span>
                                  {opt.option_label}: {opt.option_text}
                                </span>
                                {opt.image_url && (
                                  <span title="Option has image">
                                    <ImageIcon size={10} className="text-purple-600" />
                                  </span>
                                )}
                                {isCorrect && <CheckCircle2 size={12} className="text-emerald-700" />}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <span className="text-xs font-bold text-emerald-700">+{q.marks || 2}</span> /{' '}
                        <span className="text-xs font-bold text-red-600">-{q.negative_marks || 0.5}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            className="btn btn-secondary btn-sm p-1.5"
                            onClick={() => openEditModal(q)}
                            title="Edit question & images"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm p-1.5 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(q.id)}
                            title="Delete question"
                          >
                            <Trash2 size={13} />
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

      {/* ========================================================================= */}
      {/* BULK UPLOAD QUESTIONS VIA JSON MODAL */}
      {/* ========================================================================= */}
      {isJsonModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <FileCode size={20} className="text-indigo-600" />
                <h3 className="modal-title">Bulk Upload Questions (JSON Format)</h3>
              </div>
              <button className="btn-close" onClick={() => setIsJsonModalOpen(false)}>×</button>
            </div>
            <div className="modal-body space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-900 flex items-start gap-2">
                <AlertCircle size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Live Synchronized Bulk Upload:</strong> Uploading JSON will immediately persist questions to the live question repository and update counts across sections, exams, and candidate screens in real-time.
                </div>
              </div>

              <div>
                <label className="form-label">Upload .JSON File:</label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleJsonFileSelect}
                  className="form-input text-xs"
                />
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between">
                  <label className="form-label">Or Paste Questions JSON:</label>
                  <button
                    type="button"
                    onClick={downloadJsonTemplate}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    Download Sample JSON
                  </button>
                </div>
                <textarea
                  className="form-input font-mono text-xs"
                  rows={8}
                  placeholder={`{\n  "questions": [\n    {\n      "question_number": 1,\n      "question_text": "Sample Question Text",\n      "image_url": null,\n      "topic": "Vocabulary",\n      "options": [\n        { "option_label": "A", "option_text": "Choice 1", "image_url": null },\n        { "option_label": "B", "option_text": "Choice 2", "image_url": null }\n      ],\n      "correct_option_label": "A"\n    }\n  ]\n}`}
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
                <input
                  type="checkbox"
                  id="jsonReplaceCheck"
                  checked={jsonReplace}
                  onChange={(e) => setJsonReplace(e.target.checked)}
                />
                <label htmlFor="jsonReplaceCheck" className="text-xs text-slate-700 cursor-pointer font-medium">
                  <strong>Replace existing question bank</strong> (Warning: unchecking will append questions instead of replacing)
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsJsonModalOpen(false)}
                disabled={isUploadingJson}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary bg-indigo-600 hover:bg-indigo-700"
                onClick={handleExecuteJsonBulkUpload}
                disabled={isUploadingJson}
              >
                {isUploadingJson ? 'Importing Questions...' : 'Upload & Sync Questions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT QUESTION MODAL (WITH IMAGE UPLOAD & DELETE) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingQuestion ? `Edit Question #${questionNumber}` : 'Create New Question'}
              </h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveQuestion}>
              <div className="modal-body space-y-4">
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-teal-900">
                    <GraduationCap size={15} className="text-teal-700" />
                    <span>Target Exam:</span>
                    <strong className="text-teal-950 font-bold">
                      {activeExam?.title || 'Selected Exam'}
                    </strong>
                  </div>
                  <span className="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200">
                    Section: {sections.find((s) => s.id === selectedSectionId)?.name || 'Default Section'}
                  </span>
                </div>

                <div className="grid-2-cols gap-4">
                  <div className="form-group">
                    <label className="form-label">Question Number *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={questionNumber}
                      onChange={(e) => setQuestionNumber(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Difficulty *</label>
                    <select
                      className="form-input"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2-cols gap-4">
                  <div className="form-group">
                    <label className="form-label">Topic *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Vocabulary, Reasoning, Algebra"
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
                      placeholder="e.g. Synonyms, Blood Relations"
                      value={subtopic}
                      onChange={(e) => setSubtopic(e.target.value)}
                    />
                  </div>
                </div>

                {/* Question Text */}
                <div className="form-group">
                  <label className="form-label">Question Statement / Text *</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter complete question statement..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                  />
                </div>

                {/* QUESTION IMAGE SECTION */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="form-label flex items-center gap-1.5 text-slate-800">
                      <ImageIcon size={14} className="text-teal-600" />
                      <span>Question Image / Diagram (Optional):</span>
                    </label>
                    {questionImage ? (
                      <button
                        type="button"
                        onClick={() => setQuestionImage('')}
                        className="text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>Delete Image</span>
                      </button>
                    ) : null}
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="form-input flex-1 text-xs"
                      placeholder="Paste Image URL or select file below..."
                      value={questionImage}
                      onChange={(e) => setQuestionImage(e.target.value)}
                    />
                    <label className="btn btn-secondary btn-sm cursor-pointer whitespace-nowrap">
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUploadAsBase64(e, setQuestionImage)}
                      />
                    </label>
                  </div>

                  {questionImage ? (
                    <div className="relative mt-2 p-2 bg-white rounded border border-slate-200 inline-block">
                      <img
                        src={questionImage}
                        alt="Question Preview"
                        className="max-h-36 max-w-full object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setQuestionImage('')}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                        title="Delete Image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* 4 OPTIONS WITH OPTIONAL IMAGES */}
                <div className="space-y-3">
                  <label className="form-label block font-bold text-slate-800">
                    4 Multiple Choice Options (Text & Optional Images) *
                  </label>
                  {['A', 'B', 'C', 'D'].map((lbl, idx) => (
                    <div
                      key={lbl}
                      className={`p-3 rounded-lg border space-y-2 transition-all ${
                        correctIndex === idx
                          ? 'border-emerald-400 bg-emerald-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctOption"
                          id={`opt-radio-${lbl}`}
                          checked={correctIndex === idx}
                          onChange={() => setCorrectIndex(idx)}
                          className="w-4 h-4 text-emerald-600 cursor-pointer"
                        />
                        <label
                          htmlFor={`opt-radio-${lbl}`}
                          className={`font-bold text-xs cursor-pointer ${
                            correctIndex === idx ? 'text-emerald-800' : 'text-slate-700'
                          }`}
                        >
                          Option {lbl} {correctIndex === idx && '(Correct Answer)'}
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="form-input flex-1 text-xs"
                          placeholder={`Enter text for Option ${lbl}...`}
                          value={options[idx]}
                          onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                          required
                        />
                      </div>

                      {/* Option Image Upload / Delete */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <input
                          type="text"
                          className="form-input text-[11px] flex-1"
                          placeholder={`Option ${lbl} Image URL (Optional)...`}
                          value={optionImages[idx]}
                          onChange={(e) => handleOptionImageChange(idx, e.target.value)}
                        />
                        <label className="btn btn-secondary btn-sm text-[11px] cursor-pointer whitespace-nowrap">
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) =>
                              handleFileUploadAsBase64(e, (b64) => handleOptionImageChange(idx, b64))
                            }
                          />
                        </label>
                        {optionImages[idx] && (
                          <button
                            type="button"
                            onClick={() => handleOptionImageChange(idx, '')}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Option Image"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {optionImages[idx] && (
                        <div className="p-1 bg-white border border-slate-200 rounded inline-block">
                          <img
                            src={optionImages[idx]}
                            alt={`Option ${lbl}`}
                            className="max-h-20 object-contain rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="form-group">
                  <label className="form-label">Official Explanation & Steps</label>
                  <textarea
                    className="form-input text-xs"
                    rows={3}
                    placeholder="Provide concept breakdown and step-by-step solving logic..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
