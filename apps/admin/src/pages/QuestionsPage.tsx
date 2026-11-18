// ==============================================================================
// VIBHILLION ADMIN: QUESTION MANAGEMENT, BULK JSON UPLOAD & IMAGE HANDLING
// File: apps/admin/src/pages/QuestionsPage.tsx
// ==============================================================================

import React, { useEffect, useState, useMemo } from 'react';
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
  SplitSquareHorizontal,
  Save,
  Sparkles,
  ShieldAlert,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { ExamSection, Exam, Category } from '@vibhillion/shared';
import {
  divideTotalAcrossSections,
  getDefaultSectionNames,
  distributeQuestionsAcrossSections,
  inferQuestionTopic,
  buildSectionTopicAnalysis,
  SectionAllocationConfig,
  DistributionMode,
} from '../utils/questionDistributor';

export const QuestionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const examIdParam = searchParams.get('exam_id') || '';
  const openBulkParam = searchParams.get('open_bulk') === '1';

  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(examIdParam);
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [allExamQuestions, setAllExamQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam & Section Question Allocation Config States
  const [examTotalLimit, setExamTotalLimit] = useState<number>(100);
  const [examTotalText, setExamTotalText] = useState<string>('100');
  const [sectionCountInput, setSectionCountInput] = useState<number>(4);
  const [sectionCountText, setSectionCountText] = useState<string>('4');
  const [sectionAllocations, setSectionAllocations] = useState<SectionAllocationConfig[]>([]);
  const [savingAllocation, setSavingAllocation] = useState<boolean>(false);
  const [allocationFeedback, setAllocationFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bulkActionError, setBulkActionError] = useState<string | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
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
  const [jsonFileName, setJsonFileName] = useState('');
  const [jsonReplace, setJsonReplace] = useState(false);
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('content_and_count');
  const [isUploadingJson, setIsUploadingJson] = useState(false);

  const syncAllocationStateFromData = (examObj: Exam | undefined, examSections: ExamSection[]) => {
    const targetLimit = Math.max(1, Number(examObj?.total_questions) || 100);
    setExamTotalLimit(targetLimit);
    setExamTotalText(String(targetLimit));

    if (examSections.length > 0) {
      setSectionCountInput(examSections.length);
      setSectionCountText(String(examSections.length));
      setSectionAllocations(
        examSections.map((s, idx) => ({
          id: s.id,
          name: s.name,
          display_order: s.display_order || idx + 1,
          question_count: Number(s.question_count) || 0,
          duration_seconds: Number(s.duration_seconds) || 900,
          marks_per_correct: Number(s.marks_per_correct) || Number(examObj?.positive_marks) || 2.0,
          negative_marks_per_wrong: Number(s.negative_marks_per_wrong) || Number(examObj?.negative_marks) || 0.5,
        }))
      );
    } else {
      const defaultCounts = divideTotalAcrossSections(targetLimit, 4);
      const defaultNames = getDefaultSectionNames(4);
      setSectionCountInput(4);
      setSectionCountText('4');
      setSectionAllocations(
        defaultCounts.map((cnt, idx) => ({
          id: `sec-new-${idx + 1}`,
          name: defaultNames[idx],
          display_order: idx + 1,
          question_count: cnt,
          duration_seconds: Math.max(60, Math.round((Number(examObj?.total_duration_seconds) || 3600) / 4)),
          marks_per_correct: Number(examObj?.positive_marks) || 2.0,
          negative_marks_per_wrong: Number(examObj?.negative_marks) || 0.5,
        }))
      );
    }
  };

  const openBulkUploadModal = () => {
    setBulkActionError(null);
    // If exam is already full with existing questions, default Replace mode ON so upload works immediately
    if (allExamQuestions.length >= examTotalLimit && allExamQuestions.length > 0) {
      setJsonReplace(true);
    }
    setIsJsonModalOpen(true);
  };

  const loadData = async (targetExamId?: string) => {
    setLoading(true);
    const [examsData, catsData] = await Promise.all([
      adminService.getExams(),
      adminService.getCategories(),
    ]);
    setExams(examsData);
    setCategories(catsData);

    const activeExId = targetExamId || selectedExamId || examIdParam || (examsData.length > 0 ? examsData[0].id : '');
    setSelectedExamId(activeExId);

    const activeExamObj = examsData.find((e) => e.id === activeExId) || examsData[0];

    // Load exam-specific sections and ALL questions for this exam
    const [examSecs, allQsForExam] = await Promise.all([
      adminService.getSections(activeExId),
      adminService.getQuestions('all', activeExId),
    ]);

    setSections(examSecs);
    setAllExamQuestions(allQsForExam);
    syncAllocationStateFromData(activeExamObj, examSecs);

    if (examSecs.length > 0) {
      const secId =
        selectedSectionId && examSecs.some((s) => s.id === selectedSectionId)
          ? selectedSectionId
          : examSecs[0].id;
      setSelectedSectionId(secId);
      const secQs = allQsForExam.filter((q) => q.section_id === secId);
      setQuestions(secQs);
      setQuestionNumber(allQsForExam.length + 1);
    } else {
      setSelectedSectionId('');
      setQuestions(allQsForExam);
      setQuestionNumber(allQsForExam.length + 1);
    }
    setLoading(false);
  };

  const loadQuestions = async (secId: string, exId?: string) => {
    setLoading(true);
    const activeExId = exId || selectedExamId;
    const allQsForExam = await adminService.getQuestions('all', activeExId);
    setAllExamQuestions(allQsForExam);
    const secQs = secId && secId !== 'all' ? allQsForExam.filter((q) => q.section_id === secId) : allQsForExam;
    setQuestions(secQs);
    setQuestionNumber(allQsForExam.length + 1);
    setLoading(false);
  };

  useEffect(() => {
    loadData(examIdParam);
  }, [examIdParam]);

  useEffect(() => {
    if (openBulkParam && !loading) {
      openBulkUploadModal();
    }
  }, [openBulkParam, loading]);

  const handleSelectExam = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const exId = e.target.value;
    setSelectedExamId(exId);
    setSelectedSectionId('');
    setSelectedTopicFilter('');
    setAllocationFeedback(null);
    setSearchParams(exId ? { exam_id: exId } : {});
    loadData(exId);
  };

  const handleSelectSection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const secId = e.target.value;
    setSelectedSectionId(secId);
    setSelectedTopicFilter('');
    const secQs = secId === 'all' ? allExamQuestions : allExamQuestions.filter((q) => q.section_id === secId);
    setQuestions(secQs);
  };

  // Resize section count WITHOUT overwriting existing custom per-section question counts!
  const handleResizeSectionCount = (nextCount: number) => {
    const safeSecCount = Math.max(1, Math.min(20, Math.floor(Number(nextCount) || 1)));
    const defaultNames = getDefaultSectionNames(safeSecCount);
    const currentExamObj = exams.find((e) => e.id === selectedExamId);
    const perSecDur = Math.max(60, Math.round((Number(currentExamObj?.total_duration_seconds) || 3600) / safeSecCount));

    setSectionCountInput(safeSecCount);
    setSectionCountText(String(safeSecCount));
    setBulkActionError(null);

    setSectionAllocations((prev) => {
      if (safeSecCount <= prev.length) {
        return prev.slice(0, safeSecCount).map((s, idx) => ({ ...s, display_order: idx + 1 }));
      }
      const existingSum = prev.reduce((sum, s) => sum + (Number(s.question_count) || 0), 0);
      const remaining = Math.max(0, (parseInt(examTotalText, 10) || examTotalLimit || 0) - existingSum);
      const addedCount = safeSecCount - prev.length;
      const addedCounts = remaining > 0 ? divideTotalAcrossSections(remaining, addedCount) : Array(addedCount).fill(0);

      const extras: SectionAllocationConfig[] = addedCounts.map((cnt, offset) => {
        const idx = prev.length + offset;
        return {
          id: `sec-new-${Date.now()}-${idx + 1}`,
          name: defaultNames[idx],
          display_order: idx + 1,
          question_count: cnt,
          duration_seconds: perSecDur,
          marks_per_correct: Number(currentExamObj?.positive_marks) || 2.0,
          negative_marks_per_wrong: Number(currentExamObj?.negative_marks) || 0.5,
        };
      });
      return [...prev, ...extras];
    });
  };

  // Sync Whole Exam Question Limit to equal the sum of custom section counts
  const handleSyncTotalToSectionSum = () => {
    const sum = Math.max(1, sectionAllocations.reduce((acc, s) => acc + (Number(s.question_count) || 0), 0));
    setExamTotalLimit(sum);
    setExamTotalText(String(sum));
    setBulkActionError(null);
    setAllocationFeedback({
      type: 'success',
      text: `Updated Whole Exam Limit to ${sum} Qs to match your custom section counts.`,
    });
  };

  // Optional equal split shortcut (only runs if explicitly clicked)
  const handleAutoDivideSections = (
    targetTotal?: number,
    targetSecCount?: number,
    showFeedback = true
  ): SectionAllocationConfig[] => {
    const parsedTotal = targetTotal !== undefined ? targetTotal : (parseInt(examTotalText, 10) || examTotalLimit || 100);
    const parsedSecCount = targetSecCount !== undefined ? targetSecCount : (parseInt(sectionCountText, 10) || sectionCountInput || 1);
    const safeSecCount = Math.max(1, Math.min(20, Math.floor(Number(parsedSecCount) || 1)));
    const safeTotal = Math.max(1, Math.floor(Number(parsedTotal) || 1));
    const counts = divideTotalAcrossSections(safeTotal, safeSecCount);
    const defaultNames = getDefaultSectionNames(safeSecCount);
    const currentExamObj = exams.find((e) => e.id === selectedExamId);
    const perSecDur = Math.max(60, Math.round((Number(currentExamObj?.total_duration_seconds) || 3600) / safeSecCount));

    const nextAllocations: SectionAllocationConfig[] = counts.map((cnt, idx) => ({
      id: sectionAllocations[idx]?.id || `sec-new-${idx + 1}`,
      name: sectionAllocations[idx]?.name || defaultNames[idx],
      display_order: idx + 1,
      question_count: cnt,
      duration_seconds: sectionAllocations[idx]?.duration_seconds || perSecDur,
      marks_per_correct: sectionAllocations[idx]?.marks_per_correct || Number(currentExamObj?.positive_marks) || 2.0,
      negative_marks_per_wrong: sectionAllocations[idx]?.negative_marks_per_wrong || Number(currentExamObj?.negative_marks) || 0.5,
    }));

    setExamTotalLimit(safeTotal);
    setExamTotalText(String(safeTotal));
    setSectionCountInput(safeSecCount);
    setSectionCountText(String(safeSecCount));
    setSectionAllocations(nextAllocations);
    setBulkActionError(null);

    if (showFeedback) {
      const summary = nextAllocations.map((s) => `${s.name}: ${s.question_count}`).join(' • ');
      setAllocationFeedback({
        type: 'success',
        text: `Split ${safeTotal} questions equally across ${safeSecCount} section(s) → ${summary}`,
      });
    }

    return nextAllocations;
  };

  // Save custom section counts AND re-divide existing uploaded questions across sections as per each section's custom count
  const handleRedivideExistingByCustomCounts = async () => {
    const parsedTotal = Math.max(1, Math.floor(parseInt(examTotalText, 10) || examTotalLimit || 1));
    const syncedSections = await handleSaveExamAndSectionCounts(false, parsedTotal, sectionAllocations);
    if (!syncedSections || syncedSections.length === 0) return;

    if (allExamQuestions.length === 0) {
      setAllocationFeedback({
        type: 'success',
        text: `Saved custom section counts (${syncedSections.map((s) => `${s.name}: ${s.question_count}`).join(', ')}). Now click "Bulk Upload" to upload questions.`,
      });
      return;
    }

    try {
      setSavingAllocation(true);
      const distribution = distributeQuestionsAcrossSections({
        rawQuestions: allExamQuestions,
        sections: syncedSections.map((s, idx) => ({
          id: s.id,
          name: s.name,
          display_order: s.display_order || idx + 1,
          question_count: Number(s.question_count) || 0,
          duration_seconds: Number(s.duration_seconds) || 900,
          marks_per_correct: Number(s.marks_per_correct) || 2.0,
          negative_marks_per_wrong: Number(s.negative_marks_per_wrong) || 0.5,
        })),
        examLimit: parsedTotal,
        existingQuestions: [],
        replaceMode: true,
        mode: distributionMode,
        examId: selectedExamId,
      });

      await adminService.bulkUploadQuestions({
        exam_id: selectedExamId,
        exam_question_limit: parsedTotal,
        questions: distribution.assignedQuestions,
        replace: true,
      });

      await loadData(selectedExamId);
      setSavingAllocation(false);
      const summary = distribution.sectionBreakdown
        .map((b) => `${b.section_name}: ${b.assigned_now}/${b.target_count}`)
        .join(' • ');
      setAllocationFeedback({
        type: 'success',
        text: `Applied custom counts & re-divided ${distribution.acceptedCount} questions → ${summary}`,
      });
    } catch (err: any) {
      setSavingAllocation(false);
      setAllocationFeedback({ type: 'error', text: err?.message || 'Failed to re-divide questions.' });
    }
  };

  const handleAllocationFieldChange = (
    idx: number,
    field: 'name' | 'question_count',
    value: string | number
  ) => {
    setBulkActionError(null);
    setSectionAllocations((prev) =>
      prev.map((sec, i) =>
        i === idx
          ? {
              ...sec,
              [field]: field === 'question_count' ? Math.max(0, Math.floor(Number(value) || 0)) : value,
            }
          : sec
      )
    );
  };

  const allocatedSectionSum = useMemo(
    () => sectionAllocations.reduce((sum, s) => sum + (Number(s.question_count) || 0), 0),
    [sectionAllocations]
  );

  // Section-wise Topic-wise Analysis for ALL questions of the active exam
  const sectionTopicAnalysis = useMemo(
    () => buildSectionTopicAnalysis(sections, allExamQuestions),
    [sections, allExamQuestions]
  );

  // Questions displayed in table (respects both Section filter AND clicked Topic pill filter)
  const displayedQuestions = useMemo(() => {
    if (!selectedTopicFilter) return questions;
    return questions.filter((q) => {
      const secName = sections.find((s) => s.id === q.section_id)?.name || '';
      const resolved = inferQuestionTopic(q.question_text || '', secName, q.topic);
      return resolved.topic.toLowerCase() === selectedTopicFilter.toLowerCase();
    });
  }, [questions, selectedTopicFilter, sections]);

  const handleSaveExamAndSectionCounts = async (
    silent = false,
    overrideTotal?: number,
    overrideAllocations?: SectionAllocationConfig[]
  ): Promise<ExamSection[] | null> => {
    if (!selectedExamId) return null;
    const totalToSave = Math.max(1, Math.floor(overrideTotal !== undefined ? overrideTotal : (parseInt(examTotalText, 10) || examTotalLimit || 0)));
    const allocsToSave = overrideAllocations || sectionAllocations;
    const allocSum = allocsToSave.reduce((s, item) => s + (Number(item.question_count) || 0), 0);

    if (totalToSave <= 0) {
      alert('Whole Exam Question Count must be greater than 0.');
      return null;
    }
    if (allocSum !== totalToSave) {
      const msg = `Section-wise sum (${allocSum}) must equal Whole Exam Question Count (${totalToSave}). Click "Divide Equally" or adjust section counts.`;
      if (!silent) {
        setAllocationFeedback({ type: 'error', text: msg });
      }
      setBulkActionError(msg);
      return null;
    }

    try {
      setSavingAllocation(true);
      const syncRes = await adminService.syncExamSections(
        selectedExamId,
        totalToSave,
        allocsToSave.map((s, idx) => ({
          id: s.id.startsWith('sec-new-') ? undefined : s.id,
          name: s.name.trim() || `Section ${idx + 1}`,
          display_order: idx + 1,
          question_count: Number(s.question_count) || 0,
          duration_seconds: Number(s.duration_seconds) || 900,
          marks_per_correct: Number(s.marks_per_correct) || 2.0,
          negative_marks_per_wrong: Number(s.negative_marks_per_wrong) || 0.5,
        }))
      );

      setExamTotalLimit(totalToSave);
      setExamTotalText(String(totalToSave));
      setSections(syncRes.sections);
      setSectionAllocations(
        syncRes.sections.map((s, idx) => ({
          id: s.id,
          name: s.name,
          display_order: s.display_order || idx + 1,
          question_count: Number(s.question_count) || 0,
          duration_seconds: Number(s.duration_seconds) || 900,
          marks_per_correct: Number(s.marks_per_correct) || 2.0,
          negative_marks_per_wrong: Number(s.negative_marks_per_wrong) || 0.5,
        }))
      );
      if (syncRes.sections.length > 0 && !syncRes.sections.some((s) => s.id === selectedSectionId)) {
        setSelectedSectionId(syncRes.sections[0].id);
      }

      // Refresh exams list so total_questions reflects immediately
      const refreshedExams = await adminService.getExams();
      setExams(refreshedExams);

      setSavingAllocation(false);
      if (!silent) {
        const breakdownStr = syncRes.sections.map((s) => `${s.name} (${s.question_count})`).join(', ');
        setAllocationFeedback({
          type: 'success',
          text: `Saved & Divided! Exam limit: ${totalToSave} Qs → ${breakdownStr}`,
        });
      }
      return syncRes.sections;
    } catch (err: any) {
      setSavingAllocation(false);
      if (!silent) {
        setAllocationFeedback({ type: 'error', text: err?.message || 'Failed to save allocation.' });
      }
      return null;
    }
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

  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const activeCategory = activeExam ? categories.find((c) => c.id === activeExam.category_id) : null;
  const activeExamLimit = Math.max(1, Number(examTotalLimit) || Number(activeExam?.total_questions) || 100);
  const remainingExamSlots = Math.max(0, activeExamLimit - allExamQuestions.length);

  // Helper to extract questions array from flexible JSON structures
  const extractQuestionsArray = (parsed: any): any[] | null => {
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
    if (parsed && Array.isArray(parsed.data)) return parsed.data;
    if (parsed && Array.isArray(parsed.items)) return parsed.items;
    if (parsed && Array.isArray(parsed.sections)) {
      // Support section-grouped JSON: { sections: [{ name: "...", questions: [...] }] }
      const flattened: any[] = [];
      parsed.sections.forEach((sec: any) => {
        if (Array.isArray(sec.questions)) {
          sec.questions.forEach((q: any) => {
            flattened.push({
              ...q,
              section_name: q.section_name || sec.name || sec.section_name,
            });
          });
        }
      });
      return flattened;
    }
    return null;
  };

  // Live Real-Time Bulk Upload Distribution & Limit Preview
  const bulkPreview = useMemo(() => {
    if (!jsonContent.trim()) {
      return { parseError: null as string | null, result: null };
    }
    try {
      const parsed = JSON.parse(jsonContent);
      const rawList = extractQuestionsArray(parsed);
      if (!rawList) {
        return {
          parseError: 'JSON must be an array of questions `[...]` or `{ "questions": [...] }` or `{ "sections": [...] }`.',
          result: null,
        };
      }
      if (rawList.length === 0) {
        return { parseError: 'JSON questions array is empty.', result: null };
      }
      const distResult = distributeQuestionsAcrossSections({
        rawQuestions: rawList,
        sections: sectionAllocations,
        examLimit: activeExamLimit,
        existingQuestions: allExamQuestions,
        replaceMode: jsonReplace,
        mode: distributionMode,
        examId: selectedExamId,
      });
      return { parseError: null, result: distResult };
    } catch (err: any) {
      return { parseError: `Invalid JSON syntax: ${err.message}`, result: null };
    }
  }, [jsonContent, sectionAllocations, activeExamLimit, allExamQuestions, jsonReplace, distributionMode, selectedExamId]);

  const openCreateModal = () => {
    if (allExamQuestions.length >= activeExamLimit) {
      alert(
        `Whole Exam Question Limit reached (${allExamQuestions.length}/${activeExamLimit}). Only ${activeExamLimit} questions can be added to this exam. Increase the Whole Exam Question Count above if you want to add more.`
      );
      return;
    }

    const activeSec = sections.find((s) => s.id === selectedSectionId);
    if (activeSec && questions.length >= Number(activeSec.question_count)) {
      const proceed = confirm(
        `Section "${activeSec.name}" has already reached its configured limit (${questions.length}/${activeSec.question_count}). Do you want to switch to another section or adjust section counts first? Click Cancel to go back, or OK to continue anyway.`
      );
      if (!proceed) return;
    }

    setEditingQuestion(null);
    setQuestionNumber(allExamQuestions.length + 1);
    setQuestionText('');
    setQuestionImage('');
    setDifficulty('medium');
    setTopic('Grammar');
    setSubtopic('');
    setMarks(Number(activeExam?.positive_marks) || 2.0);
    setNegativeMarks(Number(activeExam?.negative_marks) || 0.5);
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

    try {
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
        if (allExamQuestions.length >= activeExamLimit) {
          alert(`Exam question limit reached (${allExamQuestions.length}/${activeExamLimit}). Cannot add more questions.`);
          return;
        }
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
      await loadQuestions(selectedSectionId, selectedExamId);
    } catch (err: any) {
      alert(err?.message || 'Failed to save question.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      await adminService.deleteQuestion(id);
      await loadQuestions(selectedSectionId, selectedExamId);
    }
  };

  // --------------------------------------------------------------------------
  // BULK JSON UPLOAD (ENFORCING EXAM TOTAL LIMIT & SECTION-WISE DIVISION)
  // --------------------------------------------------------------------------
  const downloadJsonTemplate = () => {
    const templateSections =
      sectionAllocations.length > 0
        ? sectionAllocations
        : [
            { id: 's1', name: 'English Comprehension', display_order: 1, question_count: 25, duration_seconds: 900, marks_per_correct: 2, negative_marks_per_wrong: 0.5 },
            { id: 's2', name: 'General Intelligence & Reasoning', display_order: 2, question_count: 25, duration_seconds: 900, marks_per_correct: 2, negative_marks_per_wrong: 0.5 },
          ];

    const samplePayload = {
      replace: false,
      questions: templateSections.map((sec, idx) => ({
        question_number: idx + 1,
        section_name: sec.name,
        question_text: `Sample question for ${sec.name} (Q${idx + 1}): Choose the most appropriate option.`,
        image_url: null,
        difficulty: idx % 2 === 0 ? 'easy' : 'medium',
        topic: sec.name,
        subtopic: 'Core Concept',
        marks: sec.marks_per_correct || 2.0,
        negative_marks: sec.negative_marks_per_wrong || 0.5,
        explanation: `Detailed step-by-step explanation for ${sec.name} question ${idx + 1}.`,
        options: [
          { option_label: 'A', option_text: 'Correct Option', image_url: null },
          { option_label: 'B', option_text: 'Distractor 1', image_url: null },
          { option_label: 'C', option_text: 'Distractor 2', image_url: null },
          { option_label: 'D', option_text: 'Distractor 3', image_url: null },
        ],
        correct_option_label: 'A',
      })),
    };

    const blob = new Blob([JSON.stringify(samplePayload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vibhillion_${activeExam?.slug || 'exam'}_bulk_template.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJsonFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJsonFileName(file.name);
      setBulkActionError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setJsonContent(String(reader.result || ''));
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteJsonBulkUpload = async () => {
    setBulkActionError(null);

    if (!jsonContent.trim()) {
      setBulkActionError('Please choose a .json file or paste your questions JSON content in Step 2 before uploading.');
      return;
    }

    const parsedLimit = Math.max(1, Math.floor(parseInt(examTotalText, 10) || examTotalLimit || 100));
    let allocationsToUse = sectionAllocations;

    // If section sum does not match exam total, automatically divide cleanly if user forgot to click Auto-Divide
    const currentSum = allocationsToUse.reduce((s, item) => s + (Number(item.question_count) || 0), 0);
    if (currentSum !== parsedLimit) {
      setBulkActionError(
        `Section-wise counts sum (${currentSum}) does not match Whole Exam Question Limit (${parsedLimit}). Click "Auto-Divide" in Step 1 or adjust the section counts so they add up to ${parsedLimit}.`
      );
      return;
    }

    try {
      setIsUploadingJson(true);
      const parsed = JSON.parse(jsonContent);
      const questionsList = extractQuestionsArray(parsed);

      if (!questionsList || questionsList.length === 0) {
        setBulkActionError('Invalid JSON: Must contain an array of questions `[...]` or `{ "questions": [...] }`.');
        setIsUploadingJson(false);
        return;
      }

      // 1. Sync configured Exam Question Limit & Section Counts first so section IDs are finalized
      const syncedSections = await handleSaveExamAndSectionCounts(true, parsedLimit, allocationsToUse);
      if (!syncedSections || syncedSections.length === 0) {
        setIsUploadingJson(false);
        return;
      }

      // 2. Strictly enforce Whole Exam Question Limit and divide across sections by Content + Section Count
      const distribution = distributeQuestionsAcrossSections({
        rawQuestions: questionsList,
        sections: syncedSections.map((s, idx) => ({
          id: s.id,
          name: s.name,
          display_order: s.display_order || idx + 1,
          question_count: Number(s.question_count) || 0,
          duration_seconds: Number(s.duration_seconds) || 900,
          marks_per_correct: Number(s.marks_per_correct) || 2.0,
          negative_marks_per_wrong: Number(s.negative_marks_per_wrong) || 0.5,
        })),
        examLimit: parsedLimit,
        existingQuestions: allExamQuestions,
        replaceMode: jsonReplace,
        mode: distributionMode,
        examId: selectedExamId,
      });

      if (distribution.acceptedCount === 0) {
        setIsUploadingJson(false);
        setBulkActionError(
          `Exam already has ${distribution.existingExamCount}/${parsedLimit} questions uploaded (0 slots remaining). Check "Replace existing questions for this exam" below or increase Whole Exam Question Limit.`
        );
        return;
      }

      // 3. Persist the divided & capped questions to the backend
      const res = await adminService.bulkUploadQuestions({
        exam_id: selectedExamId,
        exam_question_limit: parsedLimit,
        questions: distribution.assignedQuestions,
        replace: jsonReplace,
      });

      setIsUploadingJson(false);
      setIsJsonModalOpen(false);
      setJsonContent('');
      setJsonFileName('');
      await loadData(selectedExamId);

      const breakdownLines = distribution.sectionBreakdown
        .map((b) => `• ${b.section_name}: +${b.assigned_now} uploaded (${b.final_count}/${b.target_count})`)
        .join('\n');

      const excessNote =
        distribution.excludedExcessCount > 0
          ? `\n\n⚠️ Limit Enforced: ${distribution.excludedExcessCount} excess question(s) in the file were excluded because this exam is capped at ${parsedLimit} total questions.`
          : '';

      setAllocationFeedback({
        type: 'success',
        text: `Bulk Upload Complete! Imported ${res.uploaded_count} of ${distribution.inputCount} question(s) divided across ${distribution.sectionBreakdown.length} sections.${distribution.excludedExcessCount > 0 ? ` (${distribution.excludedExcessCount} excess excluded over ${parsedLimit} exam limit)` : ''}`,
      });

      alert(
        `Bulk Upload & Section Division Successful!\n\nUploaded: ${res.uploaded_count} of ${distribution.inputCount} file questions\nExam Limit: ${parsedLimit} Questions\n\nSection-Wise Division:\n${breakdownLines}${excessNote}`
      );
    } catch (err: any) {
      setIsUploadingJson(false);
      setBulkActionError(`JSON Upload Error: ${err.message}`);
    }
  };

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
            className="btn btn-indigo"
            onClick={openBulkUploadModal}
            title="Bulk Upload Questions via JSON"
          >
            <Upload size={16} />
            <span>Bulk Upload JSON</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={openCreateModal}
            title={
              remainingExamSlots <= 0
                ? `Exam question limit reached (${allExamQuestions.length}/${activeExamLimit})`
                : 'Add a single question to selected section'
            }
          >
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
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded border ${
                    remainingExamSlots === 0
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  }`}
                >
                  Uploaded: {allExamQuestions.length} / {activeExamLimit} Exam Limit ({remainingExamSlots} left)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Question Cap:</span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
              Max {activeExamLimit} Qs Enforced
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOP OF PAGE: SECTION-WISE TOPIC-WISE ANALYSIS OF ALL EXAM QUESTIONS       */}
      {/* ========================================================================= */}
      {sectionTopicAnalysis.length > 0 && (
        <div className="content-card p-5 mb-4 border-2 border-teal-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Topic-Wise Analysis by Section — All Questions ({allExamQuestions.length} Qs)
                </h3>
                <p className="text-xs text-slate-500">
                  Complete topic-wise breakdown for every section in this exam. Click any topic pill to filter questions below.
                </p>
              </div>
            </div>

            {selectedTopicFilter && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded-full border border-teal-300">
                  Active Topic: {selectedTopicFilter}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTopicFilter('')}
                  className="btn btn-secondary btn-sm text-xs"
                >
                  Clear Topic Filter
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {sectionTopicAnalysis.map((secGroup, sIdx) => (
              <div
                key={secGroup.section_id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-black bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                        SEC {sIdx + 1}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 mt-1">
                        {secGroup.section_name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-indigo-700">
                        {secGroup.uploaded_count} / {secGroup.target_count} Qs
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold">
                        {secGroup.unique_topic_count} Topic(s)
                      </div>
                    </div>
                  </div>

                  {secGroup.topics.length === 0 ? (
                    <div className="text-[11px] text-slate-400 py-3 text-center">
                      No questions uploaded in this section yet.
                    </div>
                  ) : (
                    <div className="space-y-1.5" style={{ maxHeight: '190px', overflowY: 'auto' }}>
                      {secGroup.topics.map((t) => {
                        const isTopicSelected =
                          selectedSectionId === secGroup.section_id &&
                          selectedTopicFilter.toLowerCase() === t.topic.toLowerCase();
                        return (
                          <button
                            key={t.topic}
                            type="button"
                            onClick={() => {
                              setSelectedSectionId(secGroup.section_id);
                              setQuestions(allExamQuestions.filter((q) => q.section_id === secGroup.section_id));
                              setSelectedTopicFilter(isTopicSelected ? '' : t.topic);
                            }}
                            className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${
                              isTopicSelected
                                ? 'bg-teal-600 text-white border-teal-700'
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                            title={`Click to view ${t.count} question(s) in ${secGroup.section_name} → ${t.topic}`}
                          >
                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <span className="font-bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {t.topic}
                              </span>
                              <span
                                className={`font-black px-1.5 py-0.5 rounded whitespace-nowrap ${
                                  isTopicSelected
                                    ? 'bg-white text-teal-800'
                                    : 'bg-indigo-50 text-indigo-800'
                                }`}
                              >
                                {t.count} Qs ({t.percentage}%)
                              </span>
                            </div>
                            <div
                              className="w-full h-1.5 rounded-full overflow-hidden mt-1"
                              style={{ backgroundColor: isTopicSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0' }}
                            >
                              <div
                                className="h-full"
                                style={{
                                  width: `${Math.max(6, t.percentage)}%`,
                                  backgroundColor: isTopicSelected ? '#ffffff' : '#0d9488',
                                }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold pt-2 border-t border-slate-200 text-slate-500">
                  <span className="text-emerald-700">Easy: {secGroup.easy}</span>
                  <span className="text-amber-600">Med: {secGroup.medium}</span>
                  <span className="text-red-600">Hard: {secGroup.hard}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXAM & CUSTOM SECTION-WISE QUESTION COUNT ALLOCATION PANEL                */}
      {/* ========================================================================= */}
      <div className="content-card p-5 mb-4 border-2 border-indigo-200 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 mb-4 border-b border-indigo-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <SplitSquareHorizontal size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Exam & Custom Section-Wise Question Count Setup
              </h3>
              <p className="text-xs text-slate-500">
                Set the whole-exam limit and assign any custom question count to EACH section (does not need to be equal — e.g., 30, 20, 35, 15). Bulk upload divides strictly per each section&apos;s given count.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveExamAndSectionCounts(false)}
              disabled={savingAllocation}
              className="btn btn-teal btn-sm flex items-center gap-1.5 text-xs"
            >
              <Save size={14} />
              <span>{savingAllocation ? 'Saving...' : 'Save Custom Counts'}</span>
            </button>
            <button
              type="button"
              onClick={handleRedivideExistingByCustomCounts}
              disabled={savingAllocation}
              className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs border-indigo-300 text-indigo-700"
              title="Save custom section counts and re-divide existing uploaded questions across sections as per each section's given count"
            >
              <RefreshCw size={13} />
              <span>Divide by Custom Counts</span>
            </button>
            <button
              type="button"
              onClick={openBulkUploadModal}
              className="btn btn-indigo btn-sm flex items-center gap-1.5 text-xs"
            >
              <Upload size={14} />
              <span>Bulk Upload by Section Counts</span>
            </button>
          </div>
        </div>

        {allocationFeedback && (
          <div
            className={`mb-3 p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border ${
              allocationFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span>{allocationFeedback.text}</span>
            <button
              type="button"
              onClick={() => setAllocationFeedback(null)}
              className="ml-3 font-bold cursor-pointer"
              style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Whole Exam Question Limit + Number of Sections Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              1. Whole Exam Question Count (Upload Limit)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                className="form-input text-sm font-black text-indigo-900 w-28"
                value={examTotalText}
                onChange={(e) => {
                  const raw = e.target.value;
                  setExamTotalText(raw);
                  const n = parseInt(raw, 10);
                  if (!Number.isNaN(n) && n >= 1) {
                    setExamTotalLimit(n);
                  }
                }}
                onBlur={() => {
                  const n = Math.max(1, parseInt(examTotalText, 10) || examTotalLimit || 1);
                  setExamTotalLimit(n);
                  setExamTotalText(String(n));
                }}
              />
              <span className="text-xs text-slate-500 font-semibold">
                Questions Max
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              2. Number of Sections (Preserves Custom Counts)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                min="1"
                max="20"
                className="form-input text-sm font-black text-teal-900 w-20 text-center"
                value={sectionCountText}
                onChange={(e) => {
                  const raw = e.target.value;
                  setSectionCountText(raw);
                  const n = parseInt(raw, 10);
                  if (!Number.isNaN(n) && n >= 1 && n <= 20) {
                    handleResizeSectionCount(n);
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
                onClick={() => handleAutoDivideSections(undefined, undefined, true)}
                className="btn btn-secondary btn-sm text-xs whitespace-nowrap"
                title="Optional shortcut: split total questions equally across all sections"
              >
                Optional: Equal Split ({examTotalLimit} ÷ {sectionCountInput})
              </button>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border flex flex-col justify-center ${
              allocatedSectionSum === Number(examTotalLimit)
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              {allocatedSectionSum === Number(examTotalLimit) ? (
                <CheckCircle2 size={15} className="text-emerald-600" />
              ) : (
                <AlertCircle size={15} className="text-amber-600" />
              )}
              <span>Custom Section Sum Check</span>
            </div>
            <div className="text-xs mt-1">
              Custom Sections Sum: <strong>{allocatedSectionSum} Qs</strong> / Exam Limit:{' '}
              <strong>{examTotalLimit} Qs</strong>
              {allocatedSectionSum !== Number(examTotalLimit) && (
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSyncTotalToSectionSum}
                    className="btn btn-teal btn-sm text-[11px] py-1 px-2"
                  >
                    Set Exam Limit = {allocatedSectionSum}
                  </button>
                  <span className="text-[11px] font-semibold">
                    ({examTotalLimit - allocatedSectionSum > 0
                      ? `${examTotalLimit - allocatedSectionSum} Qs unassigned`
                      : `${allocatedSectionSum - examTotalLimit} Qs over limit`})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section-Wise Custom Count Editable Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {sectionAllocations.map((sec, idx) => {
            const uploadedInSec = allExamQuestions.filter((q) => q.section_id === sec.id).length;
            const pct = sec.question_count > 0 ? Math.min(100, Math.round((uploadedInSec / sec.question_count) * 100)) : 0;
            return (
              <div
                key={sec.id || idx}
                className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                    SECTION {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600">
                    Uploaded:{' '}
                    <strong className={uploadedInSec >= sec.question_count && sec.question_count > 0 ? 'text-emerald-700' : 'text-indigo-700'}>
                      {uploadedInSec}
                    </strong>{' '}
                    / {sec.question_count}
                  </span>
                </div>

                <input
                  type="text"
                  className="form-input text-xs font-bold py-1.5"
                  value={sec.name}
                  placeholder={`Section ${idx + 1} Name`}
                  onChange={(e) => handleAllocationFieldChange(idx, 'name', e.target.value)}
                />

                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-bold text-indigo-900">Custom Count:</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input w-20 py-1 px-2 text-xs font-black text-center border-indigo-300"
                    value={sec.question_count}
                    onChange={(e) => handleAllocationFieldChange(idx, 'question_count', e.target.value)}
                  />
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${pct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Filter Bar */}
      <div className="content-card p-4 mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-bold text-slate-700">Filter By Section:</label>
          <select
            className="form-input max-w-sm"
            value={selectedSectionId}
            onChange={handleSelectSection}
          >
            <option value="all">
              All Sections ({allExamQuestions.length} / {activeExamLimit} Qs Uploaded)
            </option>
            {sections.map((sec) => {
              const secUploaded = allExamQuestions.filter((q) => q.section_id === sec.id).length;
              return (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({secUploaded} / {sec.question_count} Qs)
                </option>
              );
            })}
          </select>

          {selectedTopicFilter && (
            <button
              type="button"
              onClick={() => setSelectedTopicFilter('')}
              className="btn btn-teal btn-sm text-xs flex items-center gap-1"
            >
              <span>Topic: {selectedTopicFilter}</span>
              <span>×</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing: <strong>{displayedQuestions.length}</strong> Qs | Whole Exam:{' '}
          <strong>
            {allExamQuestions.length} / {activeExamLimit}
          </strong>{' '}
          | Image-enabled:{' '}
          <strong>
            {displayedQuestions.filter((q) => q.image_url || q.options?.some((o: any) => o.image_url)).length}
          </strong>
        </div>
      </div>

      {/* Questions Data List */}
      <div className="content-card">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading section questions...</div>
        ) : displayedQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <HelpCircle size={40} className="mx-auto mb-2 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">No questions match this filter</h3>
            <p className="text-xs text-slate-500 mt-1">Use "Add Question" or "Bulk Upload" to populate this section, or clear the active topic filter.</p>
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
                {displayedQuestions.map((q) => {
                  const hasImage = Boolean(q.image_url);
                  const hasOptionImages = q.options?.some((o: any) => Boolean(o.image_url));
                  const secName = sections.find((s) => s.id === q.section_id)?.name || '';
                  const resolvedTopic = inferQuestionTopic(q.question_text || '', secName, q.topic);

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
                        <div className="text-xs font-bold text-slate-700">{resolvedTopic.topic}</div>
                        <div className="text-[11px] text-slate-400">{q.subtopic || resolvedTopic.subtopic || 'Concept'}</div>
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
      {/* BULK UPLOAD QUESTIONS VIA JSON MODAL (EXAM LIMIT + SECTION-WISE DIVISION) */}
      {/* ========================================================================= */}
      {isJsonModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog modal-lg" style={{ maxWidth: '860px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <FileCode size={20} className="text-indigo-600" />
                <div>
                  <h3 className="modal-title">Bulk Upload & Section-Wise Question Division</h3>
                  <p className="text-[11px] text-slate-500">
                    Exam: <strong>{activeExam?.title || 'Selected Exam'}</strong> • Strictly enforces exam question count limit & divides by section count + content
                  </p>
                </div>
              </div>
              <button className="btn-close" onClick={() => setIsJsonModalOpen(false)}>×</button>
            </div>

            <div className="modal-body space-y-4">
              {/* STEP 1: EXAM TOTAL & SECTION-WISE ALLOCATION */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-950">
                    <SplitSquareHorizontal size={15} className="text-indigo-700" />
                    <span>Step 1: Set Whole Exam Question Count & Section-Wise Allocation</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      allocatedSectionSum === Number(examTotalLimit)
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    Sections Sum: {allocatedSectionSum} / Exam Limit: {examTotalLimit} Qs
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Whole Exam Question Limit *
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-input py-1 text-xs font-black text-indigo-900"
                      value={examTotalText}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setExamTotalText(raw);
                        setBulkActionError(null);
                        const n = parseInt(raw, 10);
                        if (!Number.isNaN(n) && n >= 1) {
                          setExamTotalLimit(n);
                        }
                      }}
                      onBlur={() => {
                        const n = Math.max(1, parseInt(examTotalText, 10) || examTotalLimit || 1);
                        setExamTotalLimit(n);
                        setExamTotalText(String(n));
                      }}
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Number of Sections
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        className="form-input py-1 w-16 text-xs font-black text-center"
                        value={sectionCountText}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setSectionCountText(raw);
                          setBulkActionError(null);
                          const n = parseInt(raw, 10);
                          if (!Number.isNaN(n) && n >= 1 && n <= 20) {
                            handleResizeSectionCount(n);
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
                        onClick={() => handleAutoDivideSections(undefined, undefined, true)}
                        className="btn btn-secondary btn-sm text-[11px] py-1 px-2 whitespace-nowrap"
                        title="Optional: split equally"
                      >
                        Equal Split
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-indigo-100">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Section Division Method
                    </label>
                    <select
                      className="form-input py-1 text-xs font-semibold"
                      value={distributionMode}
                      onChange={(e) => setDistributionMode(e.target.value as DistributionMode)}
                    >
                      <option value="content_and_count">Content + Custom Section Count (Smart)</option>
                      <option value="sequential">Sequential by Custom Section Count</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-indigo-900 font-medium">
                  Enter any custom count for each section below (e.g., <strong>30, 20, 35, 15</strong>). Bulk upload will divide and upload strictly as per each section&apos;s given count.
                </div>

                {allocatedSectionSum !== Number(examTotalLimit) && (
                  <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-center justify-between gap-2 flex-wrap">
                    <span>
                      <strong>Mismatch:</strong> Custom sections sum is <strong>{allocatedSectionSum}</strong>, but Whole Exam Limit is <strong>{examTotalLimit}</strong>.
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSyncTotalToSectionSum}
                        className="btn btn-teal btn-sm text-xs py-1 px-2"
                      >
                        Set Exam Limit = {allocatedSectionSum}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAutoDivideSections(undefined, undefined, true)}
                        className="btn btn-secondary btn-sm text-xs py-1 px-2"
                      >
                        Equal Split ({examTotalLimit} ÷ {sectionCountInput})
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sectionAllocations.map((sec, idx) => (
                    <div
                      key={sec.id || idx}
                      className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-indigo-100"
                    >
                      <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                        S{idx + 1}
                      </span>
                      <input
                        type="text"
                        className="form-input flex-1 py-1 text-xs font-semibold"
                        value={sec.name}
                        onChange={(e) => handleAllocationFieldChange(idx, 'name', e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        className="form-input w-16 py-1 px-1.5 text-xs font-black text-center"
                        value={sec.question_count}
                        onChange={(e) => handleAllocationFieldChange(idx, 'question_count', e.target.value)}
                      />
                      <span className="text-[11px] text-slate-500 font-semibold">Qs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 2: UPLOAD OR PASTE QUESTIONS */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="form-label font-bold text-slate-800">
                    Step 2: Upload .JSON File or Paste Bulk Questions
                    {jsonFileName && (
                      <span className="ml-2 text-emerald-700 font-semibold">
                        (Loaded: {jsonFileName})
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={downloadJsonTemplate}
                    className="text-xs text-indigo-600 font-bold cursor-pointer"
                    style={{ background: 'none', border: 'none', textDecoration: 'underline' }}
                  >
                    Download Section-Matched Sample JSON
                  </button>
                </div>

                <input
                  type="file"
                  accept=".json,application/json,.txt"
                  onChange={handleJsonFileSelect}
                  className="form-input text-xs"
                />

                <textarea
                  className="form-input font-mono text-xs"
                  rows={6}
                  placeholder={`{\n  "questions": [\n    {\n      "question_number": 1,\n      "section_name": "${sectionAllocations[0]?.name || 'English Comprehension'}",\n      "question_text": "Sample Question Text",\n      "topic": "Vocabulary",\n      "options": [\n        { "option_label": "A", "option_text": "Choice 1" },\n        { "option_label": "B", "option_text": "Choice 2" },\n        { "option_label": "C", "option_text": "Choice 3" },\n        { "option_label": "D", "option_text": "Choice 4" }\n      ],\n      "correct_option_label": "A"\n    }\n  ]\n}`}
                  value={jsonContent}
                  onChange={(e) => {
                    setJsonContent(e.target.value);
                    setBulkActionError(null);
                  }}
                />
              </div>

              {/* REPLACE EXISTING CHECKBOX */}
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="jsonReplaceCheck"
                    checked={jsonReplace}
                    onChange={(e) => {
                      setJsonReplace(e.target.checked);
                      setBulkActionError(null);
                    }}
                  />
                  <label htmlFor="jsonReplaceCheck" className="text-xs text-slate-700 cursor-pointer font-medium">
                    <strong>Replace existing questions for this exam</strong> (Currently {allExamQuestions.length}/{activeExamLimit} uploaded; {remainingExamSlots} slot(s) open in append mode)
                  </label>
                </div>
                {!jsonReplace && remainingExamSlots === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setJsonReplace(true);
                      setBulkActionError(null);
                    }}
                    className="btn btn-teal btn-sm text-xs py-1 px-2"
                  >
                    Enable Replace Mode
                  </button>
                )}
              </div>

              {/* INLINE ACTION ERROR BANNER */}
              {bulkActionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2 font-semibold">
                  <AlertCircle size={15} className="text-red-600 flex-shrink-0" />
                  <span>{bulkActionError}</span>
                </div>
              )}

              {/* STEP 3: LIVE DIVISION & LIMIT PREVIEW */}
              {bulkPreview.parseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-600 flex-shrink-0" />
                  <span>{bulkPreview.parseError}</span>
                </div>
              )}

              {bulkPreview.result && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Sparkles size={14} className="text-teal-600" />
                      <span>Step 3: Live Exam Limit & Section Division Preview</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                      <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                        In File: {bulkPreview.result.inputCount} Qs
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                        Will Upload: {bulkPreview.result.acceptedCount} Qs (Limit: {bulkPreview.result.examLimit})
                      </span>
                      {bulkPreview.result.excludedExcessCount > 0 && (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                          <ShieldAlert size={12} />
                          <span>Excluded Over Limit: {bulkPreview.result.excludedExcessCount} Qs</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {bulkPreview.result.excludedExcessCount > 0 && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 font-medium">
                      <strong>Exam Question Limit Enforced:</strong> Your upload contains{' '}
                      <strong>{bulkPreview.result.inputCount}</strong> questions, but this exam only has room for{' '}
                      <strong>{bulkPreview.result.acceptedCount}</strong> question(s) (Whole Exam Limit:{' '}
                      <strong>{bulkPreview.result.examLimit}</strong>). Only{' '}
                      <strong>{bulkPreview.result.acceptedCount}</strong> question(s) will be imported and divided across sections.
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-200 text-slate-700 text-left">
                          <th className="py-1.5 px-2.5">Section Name</th>
                          <th className="py-1.5 px-2.5 text-center">Target Quota</th>
                          <th className="py-1.5 px-2.5 text-center">Existing</th>
                          <th className="py-1.5 px-2.5 text-center">Content Matched</th>
                          <th className="py-1.5 px-2.5 text-center">Uploading Now</th>
                          <th className="py-1.5 px-2.5 text-center">Final Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkPreview.result.sectionBreakdown.map((row) => (
                          <tr key={row.section_id} className="border-t border-slate-200 bg-white">
                            <td className="py-1.5 px-2.5 font-bold text-slate-800">{row.section_name}</td>
                            <td className="py-1.5 px-2.5 text-center font-semibold">{row.target_count}</td>
                            <td className="py-1.5 px-2.5 text-center text-slate-500">{row.existing_count}</td>
                            <td className="py-1.5 px-2.5 text-center text-indigo-700 font-semibold">
                              {distributionMode === 'content_and_count' ? row.matched_by_content : '—'}
                            </td>
                            <td className="py-1.5 px-2.5 text-center font-black text-teal-700">
                              +{row.assigned_now}
                            </td>
                            <td className="py-1.5 px-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  row.final_count === row.target_count
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-50 text-blue-800'
                                }`}
                              >
                                {row.final_count} / {row.target_count}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
                className="btn btn-indigo"
                onClick={handleExecuteJsonBulkUpload}
                disabled={isUploadingJson}
              >
                {isUploadingJson
                  ? 'Dividing & Importing...'
                  : bulkPreview.result
                  ? `Upload & Divide ${bulkPreview.result.acceptedCount} Question(s)`
                  : 'Upload & Divide Questions'}
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
