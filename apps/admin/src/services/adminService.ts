// ==============================================================================
// VIBHILLION ADMIN: DATA SERVICES & CRUD OPERATIONS
// File: apps/admin/src/services/adminService.ts
// ==============================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Category,
  Exam,
  ExamSection,
  Question,
  ExamAttempt,
  FULL_100_QUESTIONS,
  FULL_100_SECTIONS,
  FULL_100_CORRECT_MAPPING,
  TopicOnlineAnalysis,
  DEFAULT_TOPIC_ANALYSIS_DB,
  getTopicOnlineAnalysis,
} from '@vibhillion/shared';

// Mock in-memory state for offline/demo administration
let MOCK_CATEGORIES: Category[] = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    name: 'SSC',
    slug: 'ssc',
    description: 'Staff Selection Commission - Combined Graduate Level and allied exams',
    icon_url: 'award',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let MOCK_EXAMS: Exam[] = [
  {
    id: 'e0000001-0000-0000-0000-000000000001',
    category_id: 'c0000001-0000-0000-0000-000000000001',
    title: 'SSC CGL T-1 — Held on 12 Sep 2025, Shift 1',
    slug: 'ssc-cgl-t1-12-sep-2025-shift-1',
    description: 'Official SSC CGL Tier 1 paper conducted on 12 Sep 2025 Shift 1.',
    exam_type: 'previous_year_paper',
    year: 2025,
    exam_date: '2025-09-12',
    session: 'Shift 1',
    total_questions: 100,
    total_duration_seconds: 3600,
    total_marks: 200,
    positive_marks: 2.0,
    negative_marks: 0.5,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let MOCK_SECTIONS: ExamSection[] = [...FULL_100_SECTIONS];

let MOCK_QUESTIONS: any[] = FULL_100_QUESTIONS.map((q) => ({
  ...q,
  correct_option_id: FULL_100_CORRECT_MAPPING[q.id] || (q.options && q.options[0]?.id) || 'opt-1',
  answer_explanation: q.explanation || '',
}));

function recalculateMockExam() {
  if (MOCK_EXAMS.length > 0) {
    MOCK_EXAMS[0].total_questions = MOCK_SECTIONS.reduce((a, s) => a + Number(s.question_count || 0), 0);
    MOCK_EXAMS[0].total_duration_seconds = MOCK_SECTIONS.reduce((a, s) => a + Number(s.duration_seconds || 0), 0);
    MOCK_EXAMS[0].total_marks = MOCK_SECTIONS.reduce(
      (a, s) => a + (Number(s.question_count || 0) * Number(s.marks_per_correct || 2.0)),
      0
    );
    MOCK_EXAMS[0].updated_at = new Date().toISOString();
  }
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(endpoint, options);
    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch {
    // API not reachable, fallback to memory
  }
  return null;
}

let MOCK_AUDIT_LOG: any[] = [
  {
    id: 'aud-1',
    question_id: 'b0000001-0000-0000-0000-000000000001',
    changed_by_name: 'Super Admin',
    old_correct_label: 'A',
    new_correct_label: 'B',
    reason: 'Official SSC answer key revision following representations.',
    reevaluated_attempts_count: 42,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const adminService = {
  // ----------------------------------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------------------------------
  async getCategories(): Promise<Category[]> {
    const live = await apiCall<Category[]>('/api/categories');
    if (live && Array.isArray(live) && live.length > 0) {
      MOCK_CATEGORIES = live;
      return live;
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) return data as Category[];
    }
    return [...MOCK_CATEGORIES];
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const apiRes = await apiCall<Category>('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    if (apiRes) {
      MOCK_CATEGORIES.push(apiRes);
      return apiRes;
    }
    if (!isSupabaseConfigured) {
      const newCat: Category = {
        id: 'cat-' + Date.now(),
        name: cat.name || 'New Category',
        slug: cat.slug || 'new-category',
        description: cat.description || '',
        icon_url: cat.icon_url || 'award',
        display_order: cat.display_order || MOCK_CATEGORIES.length + 1,
        is_active: cat.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_CATEGORIES.push(newCat);
      return newCat;
    }
    const { data, error } = await supabase.from('categories').insert(cat).select().single();
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const apiRes = await apiCall<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (apiRes) {
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
      if (idx !== -1) MOCK_CATEGORIES[idx] = apiRes;
      return apiRes;
    }
    if (!isSupabaseConfigured) {
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
      if (idx !== -1) {
        MOCK_CATEGORIES[idx] = { ...MOCK_CATEGORIES[idx], ...updates, updated_at: new Date().toISOString() };
        return MOCK_CATEGORIES[idx];
      }
      throw new Error('Category not found');
    }
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiCall(`/api/categories/${id}`, { method: 'DELETE' });
    MOCK_CATEGORIES = MOCK_CATEGORIES.filter((c) => c.id !== id);
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // ----------------------------------------------------------------------------
  // EXAMS
  // ----------------------------------------------------------------------------
  async getExams(): Promise<Exam[]> {
    const live = await apiCall<Exam[]>('/api/exams');
    if (live && Array.isArray(live) && live.length > 0) {
      MOCK_EXAMS = live;
      return live;
    }
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('exams')
        .select('*, category:categories(name), sections:exam_sections(*)')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as Exam[];
    }
    return [...MOCK_EXAMS];
  },

  async createExam(exam: Partial<Exam>): Promise<Exam> {
    const apiRes = await apiCall<Exam>('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });
    if (apiRes) {
      MOCK_EXAMS.push(apiRes);
      return apiRes;
    }
    const newExam: Exam = {
      id: 'exam-' + Date.now(),
      category_id: exam.category_id || MOCK_CATEGORIES[0].id,
      title: exam.title || 'Untitled Exam',
      slug: exam.slug || 'untitled-exam-' + Date.now(),
      description: exam.description || '',
      exam_type: exam.exam_type || 'mock_test',
      year: exam.year || 2025,
      exam_date: exam.exam_date || '2025-09-12',
      session: exam.session || 'Shift 1',
      total_questions: exam.total_questions || 100,
      total_duration_seconds: exam.total_duration_seconds || 3600,
      total_marks: exam.total_marks || 200,
      positive_marks: exam.positive_marks || 2.0,
      negative_marks: exam.negative_marks || 0.5,
      status: exam.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_EXAMS.push(newExam);
    return newExam;
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
    const apiRes = await apiCall<Exam>(`/api/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const idx = MOCK_EXAMS.findIndex((e) => e.id === id);
    if (idx !== -1) {
      MOCK_EXAMS[idx] = apiRes || { ...MOCK_EXAMS[idx], ...updates, updated_at: new Date().toISOString() };
      return MOCK_EXAMS[idx];
    }
    if (apiRes) return apiRes;
    throw new Error('Exam not found');
  },

  async deleteExam(id: string): Promise<void> {
    await apiCall(`/api/exams/${id}`, { method: 'DELETE' });
    MOCK_EXAMS = MOCK_EXAMS.filter((e) => e.id !== id);
  },

  // ----------------------------------------------------------------------------
  // SECTIONS
  // ----------------------------------------------------------------------------
  async syncExamSections(
    examId: string,
    totalQuestions: number,
    sections: Array<{
      id?: string;
      name: string;
      display_order: number;
      question_count: number;
      duration_seconds?: number;
      marks_per_correct?: number;
      negative_marks_per_wrong?: number;
    }>
  ): Promise<{ success: boolean; exam_id: string; total_questions: number; sections: ExamSection[] }> {
    const apiRes = await apiCall<any>(`/api/exams/${examId}/sections/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_questions: totalQuestions, sections }),
    });

    if (apiRes && apiRes.success) {
      MOCK_SECTIONS = [
        ...MOCK_SECTIONS.filter((s) => s.exam_id !== examId),
        ...apiRes.sections,
      ];
      const exIdx = MOCK_EXAMS.findIndex((e) => e.id === examId);
      if (exIdx !== -1) {
        MOCK_EXAMS[exIdx].total_questions = totalQuestions;
      }
      return apiRes;
    }

    // In-memory fallback
    const otherSections = MOCK_SECTIONS.filter((s) => s.exam_id !== examId);
    const synced: ExamSection[] = sections.map((s, idx) => ({
      id: s.id || `sec-${examId}-${Date.now()}-${idx + 1}`,
      exam_id: examId,
      name: s.name || `Section ${idx + 1}`,
      display_order: Number(s.display_order) || idx + 1,
      question_count: Math.max(0, Math.floor(Number(s.question_count) || 0)),
      duration_seconds: Number(s.duration_seconds) || 900,
      marks_per_correct: Number(s.marks_per_correct) || 2.0,
      negative_marks_per_wrong: Number(s.negative_marks_per_wrong) || 0.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    MOCK_SECTIONS = [...otherSections, ...synced];
    const exIdx = MOCK_EXAMS.findIndex((e) => e.id === examId);
    if (exIdx !== -1) {
      MOCK_EXAMS[exIdx].total_questions = totalQuestions;
      MOCK_EXAMS[exIdx].total_marks = synced.reduce(
        (acc, s) => acc + s.question_count * s.marks_per_correct,
        0
      );
    }

    return {
      success: true,
      exam_id: examId,
      total_questions: totalQuestions,
      sections: synced,
    };
  },

  async getSections(examId?: string): Promise<ExamSection[]> {
    const endpoint = examId && examId !== 'all' ? `/api/sections?exam_id=${encodeURIComponent(examId)}` : '/api/sections';
    const live = await apiCall<ExamSection[]>(endpoint);
    if (live && Array.isArray(live)) {
      if (!examId || examId === 'all') {
        MOCK_SECTIONS = live;
      }
      return live;
    }
    if (isSupabaseConfigured) {
      let query = supabase.from('exam_sections').select('*').order('display_order', { ascending: true });
      if (examId) query = query.eq('exam_id', examId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as ExamSection[];
    }
    if (examId) return MOCK_SECTIONS.filter((s) => s.exam_id === examId);
    return [...MOCK_SECTIONS];
  },

  async createSection(sec: Partial<ExamSection>): Promise<ExamSection> {
    const apiRes = await apiCall<ExamSection>('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sec),
    });
    if (apiRes) {
      MOCK_SECTIONS.push(apiRes);
      recalculateMockExam();
      return apiRes;
    }
    const newSec: ExamSection = {
      id: 'sec-' + Date.now(),
      exam_id: sec.exam_id || MOCK_EXAMS[0].id,
      name: sec.name || 'New Section',
      display_order: Number(sec.display_order) || MOCK_SECTIONS.length + 1,
      question_count: Number(sec.question_count) || 25,
      duration_seconds: Number(sec.duration_seconds) || 900,
      marks_per_correct: Number(sec.marks_per_correct) || 2.0,
      negative_marks_per_wrong: Number(sec.negative_marks_per_wrong) || 0.5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_SECTIONS.push(newSec);
    recalculateMockExam();
    return newSec;
  },

  async updateSection(id: string, updates: Partial<ExamSection>): Promise<ExamSection> {
    const apiRes = await apiCall<ExamSection>(`/api/sections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const idx = MOCK_SECTIONS.findIndex((s) => s.id === id);
    if (idx !== -1) {
      MOCK_SECTIONS[idx] = apiRes || {
        ...MOCK_SECTIONS[idx],
        ...updates,
        question_count: updates.question_count !== undefined ? Number(updates.question_count) : MOCK_SECTIONS[idx].question_count,
        duration_seconds: updates.duration_seconds !== undefined ? Number(updates.duration_seconds) : MOCK_SECTIONS[idx].duration_seconds,
        marks_per_correct: updates.marks_per_correct !== undefined ? Number(updates.marks_per_correct) : MOCK_SECTIONS[idx].marks_per_correct,
        negative_marks_per_wrong: updates.negative_marks_per_wrong !== undefined ? Number(updates.negative_marks_per_wrong) : MOCK_SECTIONS[idx].negative_marks_per_wrong,
        updated_at: new Date().toISOString(),
      };
      recalculateMockExam();
      return MOCK_SECTIONS[idx];
    }
    if (apiRes) return apiRes;
    throw new Error('Section not found');
  },

  async deleteSection(id: string): Promise<void> {
    await apiCall(`/api/sections/${id}`, { method: 'DELETE' });
    MOCK_SECTIONS = MOCK_SECTIONS.filter((s) => s.id !== id);
    MOCK_QUESTIONS = MOCK_QUESTIONS.filter((q) => q.section_id !== id);
    recalculateMockExam();
  },

  // ----------------------------------------------------------------------------
  // QUESTIONS & ANSWERS
  // ----------------------------------------------------------------------------
  async getQuestions(sectionId?: string, examId?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (sectionId && sectionId !== 'all') params.append('section_id', sectionId);
    if (examId && examId !== 'all') params.append('exam_id', examId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const live = await apiCall<any[]>(`/api/questions${qs}`);
    if (live && Array.isArray(live)) {
      return live;
    }
    let filtered = [...MOCK_QUESTIONS];
    if (sectionId && sectionId !== 'all') filtered = filtered.filter((q) => q.section_id === sectionId);
    if (examId && examId !== 'all') filtered = filtered.filter((q) => q.exam_id === examId);
    return filtered;
  },

  async createQuestion(payload: {
    section_id: string;
    exam_id?: string;
    question_number: number;
    question_text: string;
    difficulty: string;
    topic: string;
    subtopic?: string;
    marks: number;
    negative_marks: number;
    explanation?: string;
    solution_steps?: string[];
    options: (string | { option_text: string; image_url?: string | null })[]; // 4 options
    correctOptionIndex: number; // 0..3
    image_url?: string | null;
  }): Promise<void> {
    let apiRes: any = null;
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        if (errBody?.error) {
          throw new Error(errBody.error);
        }
      } else {
        apiRes = await res.json();
      }
    } catch (err: any) {
      if (err?.message && err.message.includes('Exam question limit')) {
        throw err;
      }
      // API unreachable, fallback to memory
    }

    const qId = apiRes?.id || 'q-' + Date.now();
    const labels = ['A', 'B', 'C', 'D'];
    const createdOptions = payload.options.map((optItem, idx) => {
      const optText = typeof optItem === 'string' ? optItem : optItem.option_text;
      const optImg = typeof optItem === 'object' ? (optItem.image_url || null) : null;
      return {
        id: `opt-${qId}-${idx}`,
        question_id: qId,
        option_label: labels[idx] || `${idx + 1}`,
        option_text: optText,
        image_url: optImg,
        display_order: idx + 1,
      };
    });

    const newQ = apiRes || {
      id: qId,
      exam_id: payload.exam_id,
      section_id: payload.section_id,
      question_number: Number(payload.question_number),
      question_text: payload.question_text,
      question_type: 'single_choice',
      difficulty: payload.difficulty,
      topic: payload.topic,
      subtopic: payload.subtopic || '',
      marks: Number(payload.marks),
      negative_marks: Number(payload.negative_marks),
      explanation: payload.explanation || '',
      solution_steps: payload.solution_steps || [],
      image_url: payload.image_url || null,
      options: createdOptions,
      correct_option_id: createdOptions[payload.correctOptionIndex]?.id,
      answer_explanation: payload.explanation || '',
    };

    MOCK_QUESTIONS.push(newQ);
  },

  async updateQuestion(
    id: string,
    payload: {
      question_number?: number;
      question_text?: string;
      difficulty?: string;
      topic?: string;
      subtopic?: string;
      marks?: number;
      negative_marks?: number;
      explanation?: string;
      solution_steps?: string[];
      options?: (string | { id?: string; option_text: string; image_url?: string | null })[];
      correctOptionIndex?: number;
      correct_option_id?: string;
      section_id?: string;
      image_url?: string | null;
    }
  ): Promise<any> {
    const apiRes = await apiCall<any>(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const idx = MOCK_QUESTIONS.findIndex((q) => q.id === id);
    if (idx !== -1) {
      const existing = MOCK_QUESTIONS[idx];
      let updatedOptions = existing.options;

      if (payload.options && payload.options.length > 0) {
        const labels = ['A', 'B', 'C', 'D'];
        updatedOptions = payload.options.map((optItem: any, oIdx: number) => {
          const optText = typeof optItem === 'string' ? optItem : optItem.option_text;
          const optImg = typeof optItem === 'object' ? (optItem.image_url !== undefined ? optItem.image_url : existing.options?.[oIdx]?.image_url || null) : null;
          return {
            id: (typeof optItem === 'object' && optItem.id) || existing.options?.[oIdx]?.id || `opt-${id}-${oIdx}`,
            question_id: id,
            option_label: labels[oIdx] || `${oIdx + 1}`,
            option_text: optText,
            image_url: optImg,
            display_order: oIdx + 1,
          };
        });
      }

      let correctId = existing.correct_option_id;
      if (payload.correctOptionIndex !== undefined && updatedOptions[payload.correctOptionIndex]) {
        correctId = updatedOptions[payload.correctOptionIndex].id;
      } else if (payload.correct_option_id) {
        correctId = payload.correct_option_id;
      }

      MOCK_QUESTIONS[idx] = apiRes || {
        ...existing,
        ...payload,
        image_url: payload.image_url !== undefined ? payload.image_url : existing.image_url,
        options: updatedOptions,
        correct_option_id: correctId,
        explanation: payload.explanation !== undefined ? payload.explanation : existing.explanation,
        answer_explanation: payload.explanation !== undefined ? payload.explanation : existing.answer_explanation,
      };

      return MOCK_QUESTIONS[idx];
    }
    if (apiRes) return apiRes;
    throw new Error('Question not found');
  },

  async bulkUploadQuestions(
    payload:
      | {
          exam_id?: string;
          exam_question_limit?: number;
          questions: any[];
          replace?: boolean;
        }
      | any[]
  ): Promise<{
    success: boolean;
    uploaded_count: number;
    skipped_excess_count?: number;
    exam_limit?: number;
    total_exam_questions?: number;
    total_questions: number;
    section_breakdown?: Array<{
      section_id: string;
      section_name: string;
      target_count: number;
      uploaded_now: number;
      total_after: number;
    }>;
    questions: any[];
  }> {
    let apiRes: any = null;
    try {
      const res = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        if (errBody?.error) {
          throw new Error(errBody.error);
        }
      } else {
        apiRes = await res.json();
      }
    } catch (err: any) {
      if (err?.message && (err.message.includes('Exam question limit') || err.message.includes('No valid questions'))) {
        throw err;
      }
      // API unreachable, fallback to memory
    }

    if (apiRes && apiRes.success) {
      if (apiRes.questions) {
        MOCK_QUESTIONS = apiRes.questions;
      }
      return apiRes;
    }

    // In-memory fallback with exam limit enforcement
    const isArray = Array.isArray(payload);
    const rawQuestions = isArray ? payload : (payload.questions || []);
    const replaceMode = !isArray && Boolean(payload.replace);
    const targetExamId = !isArray ? (payload.exam_id || rawQuestions[0]?.exam_id) : rawQuestions[0]?.exam_id;
    const examLimit = !isArray && payload.exam_question_limit ? Number(payload.exam_question_limit) : 100;

    const existingForExam = replaceMode
      ? []
      : MOCK_QUESTIONS.filter((q) => !targetExamId || q.exam_id === targetExamId);
    const remainingCap = Math.max(0, examLimit - existingForExam.length);
    const capped = rawQuestions.slice(0, remainingCap);
    const skippedExcess = Math.max(0, rawQuestions.length - capped.length);

    const labels = ['A', 'B', 'C', 'D'];
    const processed = capped.map((item: any, idx: number) => {
      const qId = item.id || `q-bulk-${Date.now()}-${idx + 1}`;
      const secId = item.section_id || MOCK_SECTIONS[0]?.id;
      let opts = item.options || [];
      if (Array.isArray(opts)) {
        opts = opts.map((opt: any, oIdx: number) => {
          const optText = typeof opt === 'string' ? opt : (opt.option_text || opt.text || '');
          const optImg = typeof opt === 'object' ? (opt.image_url || null) : null;
          return {
            id: (typeof opt === 'object' && opt.id) ? opt.id : `opt-${qId}-${oIdx}`,
            question_id: qId,
            option_label: (typeof opt === 'object' && opt.option_label) || labels[oIdx] || `${oIdx + 1}`,
            option_text: optText,
            image_url: optImg,
            display_order: oIdx + 1,
          };
        });
      }
      let correctOptId = item.correct_option_id;
      if (!correctOptId && item.correct_option_label) {
        const found = opts.find((o: any) => o.option_label?.toUpperCase() === item.correct_option_label.toUpperCase());
        if (found) correctOptId = found.id;
      }
      if (!correctOptId) correctOptId = opts[0]?.id;

      return {
        id: qId,
        exam_id: item.exam_id || targetExamId,
        section_id: secId,
        question_number: Number(item.question_number) || (existingForExam.length + idx + 1),
        question_text: item.question_text || item.text || 'Untitled Question',
        difficulty: item.difficulty || 'medium',
        topic: item.topic || 'General Topic',
        subtopic: item.subtopic || '',
        marks: Number(item.marks) || 2.0,
        negative_marks: Number(item.negative_marks) || 0.5,
        explanation: item.explanation || '',
        image_url: item.image_url || null,
        options: opts,
        correct_option_id: correctOptId,
        answer_explanation: item.explanation || '',
      };
    });

    if (replaceMode && targetExamId) {
      MOCK_QUESTIONS = [...MOCK_QUESTIONS.filter((q) => q.exam_id !== targetExamId), ...processed];
    } else if (replaceMode) {
      MOCK_QUESTIONS = processed;
    } else {
      MOCK_QUESTIONS.push(...processed);
    }

    return {
      success: true,
      uploaded_count: processed.length,
      skipped_excess_count: skippedExcess,
      exam_limit: examLimit,
      total_exam_questions: MOCK_QUESTIONS.filter((q) => !targetExamId || q.exam_id === targetExamId).length,
      total_questions: MOCK_QUESTIONS.length,
      questions: MOCK_QUESTIONS,
    };
  },

  async deleteQuestion(id: string): Promise<void> {
    await apiCall(`/api/questions/${id}`, { method: 'DELETE' });
    MOCK_QUESTIONS = MOCK_QUESTIONS.filter((q) => q.id !== id);
  },

  // ----------------------------------------------------------------------------
  // AUDIT & RE-EVALUATION WORKFLOW
  // ----------------------------------------------------------------------------
  async updateAnswerKeyWithAudit(
    questionId: string,
    newCorrectOptionId: string,
    reason: string
  ): Promise<{ success: boolean; count: number }> {
    if (!isSupabaseConfigured) {
      const q = MOCK_QUESTIONS.find((item) => item.id === questionId);
      if (q) {
        const oldId = q.correct_option_id;
        q.correct_option_id = newCorrectOptionId;
        MOCK_AUDIT_LOG.unshift({
          id: 'aud-' + Date.now(),
          question_id: questionId,
          changed_by_name: 'Administrator',
          old_correct_label: q.options?.find((o: any) => o.id === oldId)?.option_label || 'A',
          new_correct_label: q.options?.find((o: any) => o.id === newCorrectOptionId)?.option_label || 'B',
          reason,
          reevaluated_attempts_count: 5,
          created_at: new Date().toISOString(),
        });
      }
      return { success: true, count: 5 };
    }

    const { data, error } = await supabase.rpc('reevaluate_exam_attempts', {
      p_question_id: questionId,
      p_new_correct_option_id: newCorrectOptionId,
      p_reason: reason,
    });

    if (error) throw error;
    return { success: true, count: data.reevaluated_attempts_count };
  },

  async getAuditLog(): Promise<any[]> {
    if (!isSupabaseConfigured) return [...MOCK_AUDIT_LOG];
    const { data, error } = await supabase
      .from('answer_key_audit_log')
      .select('*, question:questions(question_number, question_text), user:profiles(full_name)')
      .order('created_at', { ascending: false });
    if (error || !data) return [...MOCK_AUDIT_LOG];
    return data;
  },

  // ----------------------------------------------------------------------------
  // DASHBOARD & ANALYTICS METRICS
  // ----------------------------------------------------------------------------
  async getDashboardMetrics() {
    if (!isSupabaseConfigured) {
      return {
        totalPublishedExams: 1,
        totalStudents: 342,
        totalAttempts: 1248,
        completedTests: 1190,
        averageScore: 34.0,
        highestScore: 48.0,
        participationToday: 86,
        completionRate: 95.3,
        popularExam: 'SSC CGL T-1 — Held on 12 Sep 2025, Shift 1',
      };
    }

    try {
      const [examsRes, profilesRes, attemptsRes] = await Promise.all([
        supabase.from('exams').select('id', { count: 'exact' }).eq('status', 'published'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('exam_attempts').select('score, status'),
      ]);

      const examsCount = examsRes.count || 0;
      const studentsCount = profilesRes.count || 0;
      const attempts = attemptsRes.data || [];
      const totalAttempts = attempts.length;
      const completed = attempts.filter((a) => a.status === 'completed');
      const totalScore = completed.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const avgScore = completed.length > 0 ? Number((totalScore / completed.length).toFixed(1)) : 0;

      return {
        totalPublishedExams: examsCount,
        totalStudents: studentsCount,
        totalAttempts,
        completedTests: completed.length,
        averageScore: avgScore,
        highestScore: 48.0,
        participationToday: 42,
        completionRate: totalAttempts > 0 ? Number(((completed.length / totalAttempts) * 100).toFixed(1)) : 0,
        popularExam: 'SSC CGL T-1 — Held on 12 Sep 2025, Shift 1',
      };
    } catch {
      return {
        totalPublishedExams: 1,
        totalStudents: 342,
        totalAttempts: 1248,
        completedTests: 1190,
        averageScore: 34.0,
        highestScore: 48.0,
        participationToday: 86,
        completionRate: 95.3,
        popularExam: 'SSC CGL T-1 — Held on 12 Sep 2025, Shift 1',
      };
    }
  },

  // ----------------------------------------------------------------------------
  // ATTEMPTS & PARTICIPATION
  // ----------------------------------------------------------------------------
  async getStudentAttempts(): Promise<ExamAttempt[]> {
    if (!isSupabaseConfigured) {
      return [
        {
          id: 'att-1',
          user_id: 'usr-1',
          exam_id: MOCK_EXAMS[0].id,
          mode: 'timed',
          status: 'completed',
          started_at: new Date(Date.now() - 3600000).toISOString(),
          submitted_at: new Date(Date.now() - 2700000).toISOString(),
          total_time_seconds: 840,
          score: 34.0,
          correct_count: 18,
          wrong_count: 4,
          unattempted_count: 3,
          attempted_count: 22,
          accuracy_percentage: 81.82,
          total_questions: 25,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }

    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*, exam:exams(title)')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as ExamAttempt[];
  },

  // ----------------------------------------------------------------------------
  // TOPIC-WISE ONLINE ANALYSIS & REFERENCES MANAGEMENT
  // ----------------------------------------------------------------------------
  async getTopicAnalyses(): Promise<Record<string, TopicOnlineAnalysis>> {
    const res = await apiCall<Record<string, TopicOnlineAnalysis>>('/api/topic-analysis');
    if (res && typeof res === 'object') {
      return { ...DEFAULT_TOPIC_ANALYSIS_DB, ...res };
    }
    return { ...DEFAULT_TOPIC_ANALYSIS_DB };
  },

  async saveTopicAnalysis(topicKey: string, analysis: Partial<TopicOnlineAnalysis>): Promise<boolean> {
    const res = await apiCall<{ success: boolean }>('/api/topic-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: topicKey, analysis }),
    });
    return !!(res && res.success);
  },

  async bulkUpdateTopicAnalyses(topicAnalyses: Record<string, TopicOnlineAnalysis>): Promise<boolean> {
    const res = await apiCall<{ success: boolean }>('/api/topic-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_analyses: topicAnalyses }),
    });
    return !!(res && res.success);
  },
};

