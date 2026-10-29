// ==============================================================================
// VIBHILLION AI: STUDENT EXAM SERVICE
// File: apps/student/src/services/examService.ts
// ==============================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Category,
  Exam,
  ExamSection,
  Question,
  ExamAttempt,
  QuestionAnalysis,
  ExamResultSummary,
} from '@vibhillion/shared';

// Fallback mock dataset for offline / pre-migration testing
const MOCK_CATEGORIES: Category[] = [
  {
    id: 'c0000001-0000-0000-0000-000000000001',
    name: 'SSC',
    slug: 'ssc',
    description: 'Staff Selection Commission - Combined Graduate Level & allied exams',
    icon_url: 'award',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_EXAM: Exam = {
  id: 'e0000001-0000-0000-0000-000000000001',
  category_id: 'c0000001-0000-0000-0000-000000000001',
  title: 'SSC CGL T-1 — Held on 12 Sep 2025, Shift 1',
  slug: 'ssc-cgl-t1-12-sep-2025-shift-1',
  description: 'SSC CGL Previous Year Papers: Official Tier-1 exam shift conducted on 12 September 2025 Shift 1.',
  exam_type: 'previous_year_paper',
  year: 2025,
  exam_date: '2025-09-12',
  session: 'Shift 1',
  total_questions: 25,
  total_duration_seconds: 900,
  total_marks: 50.0,
  positive_marks: 2.0,
  negative_marks: 0.5,
  status: 'published',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const MOCK_SECTIONS: ExamSection[] = [
  {
    id: 's0000001-0000-0000-0000-000000000001',
    exam_id: 'e0000001-0000-0000-0000-000000000001',
    name: 'English Comprehension',
    display_order: 1,
    question_count: 5,
    duration_seconds: 900,
    marks_per_correct: 2.0,
    negative_marks_per_wrong: 0.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q0000001-0000-0000-0000-000000000001',
    section_id: 's0000001-0000-0000-0000-000000000001',
    question_number: 1,
    question_text: 'Select the segment of the sentence that contains a grammatical error: "Neither the supervisor nor the engineers was present at the project site when the anomaly was reported."',
    question_type: 'single_choice',
    difficulty: 'medium',
    topic: 'Grammar',
    subtopic: 'Subject-Verb Agreement',
    marks: 2.0,
    negative_marks: 0.5,
    explanation: 'When two subjects are joined by "Neither... nor", the verb agrees with the nearer subject ("the engineers" - plural). Therefore, "were present" is correct.',
    solution_steps: ['Identify conjunction "Neither... nor"', 'Find closest subject: "engineers" (plural)', 'Change "was" to "were"'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: 'o1', question_id: 'q1', option_label: 'A', option_text: 'Neither the supervisor', display_order: 1 },
      { id: 'o2', question_id: 'q1', option_label: 'B', option_text: 'nor the engineers was present', display_order: 2 },
      { id: 'o3', question_id: 'q1', option_label: 'C', option_text: 'at the project site', display_order: 3 },
      { id: 'o4', question_id: 'q1', option_label: 'D', option_text: 'when the anomaly was reported', display_order: 4 },
    ],
  },
  {
    id: 'q0000001-0000-0000-0000-000000000002',
    section_id: 's0000001-0000-0000-0000-000000000001',
    question_number: 2,
    question_text: 'Select the most appropriate SYNONYM of the given word: METICULOUS',
    question_type: 'single_choice',
    difficulty: 'easy',
    topic: 'Vocabulary',
    subtopic: 'Synonyms',
    marks: 2.0,
    negative_marks: 0.5,
    explanation: 'Meticulous means showing great attention to detail; very careful and precise. Painstaking is the exact synonym.',
    solution_steps: ['Analyze word meaning: Meticulous = careful, precise', 'Evaluate options: Painstaking = thorough, diligent', 'Correct choice is Painstaking'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: 'o5', question_id: 'q2', option_label: 'A', option_text: 'Painstaking', display_order: 1 },
      { id: 'o6', question_id: 'q2', option_label: 'B', option_text: 'Careless', display_order: 2 },
      { id: 'o7', question_id: 'q2', option_label: 'C', option_text: 'Hasty', display_order: 3 },
      { id: 'o8', question_id: 'q2', option_label: 'D', option_text: 'Casual', display_order: 4 },
    ],
  },
  {
    id: 'q0000001-0000-0000-0000-000000000003',
    section_id: 's0000001-0000-0000-0000-000000000001',
    question_number: 3,
    question_text: 'Select the most appropriate ANTONYM of the given word: EPHEMERAL',
    question_type: 'single_choice',
    difficulty: 'medium',
    topic: 'Vocabulary',
    subtopic: 'Antonyms',
    marks: 2.0,
    negative_marks: 0.5,
    explanation: 'Ephemeral means lasting for a very short time. Permanent means lasting indefinitely, which is the antonym.',
    solution_steps: ['Ephemeral = transient, fleeting', 'Opposite is enduring, permanent', 'Select Permanent'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: 'o9', question_id: 'q3', option_label: 'A', option_text: 'Transient', display_order: 1 },
      { id: 'o10', question_id: 'q3', option_label: 'B', option_text: 'Fleeting', display_order: 2 },
      { id: 'o11', question_id: 'q3', option_label: 'C', option_text: 'Permanent', display_order: 3 },
      { id: 'o12', question_id: 'q3', option_label: 'D', option_text: 'Momentary', display_order: 4 },
    ],
  },
  {
    id: 'q0000001-0000-0000-0000-000000000004',
    section_id: 's0000001-0000-0000-0000-000000000001',
    question_number: 4,
    question_text: 'Select the meaning of the given idiom: "Bite the bullet"',
    question_type: 'single_choice',
    difficulty: 'easy',
    topic: 'Idioms & Phrases',
    subtopic: 'General Idioms',
    marks: 2.0,
    negative_marks: 0.5,
    explanation: '"Bite the bullet" means to face a difficult or unpleasant situation with courage and stoicism.',
    solution_steps: ['Origin relates to battlefield surgery', 'Meaning: Endure inevitable adversity with courage'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: 'o13', question_id: 'q4', option_label: 'A', option_text: 'To act impulsively without considering consequences', display_order: 1 },
      { id: 'o14', question_id: 'q4', option_label: 'B', option_text: 'To face a painful situation with courage and endurance', display_order: 2 },
      { id: 'o15', question_id: 'q4', option_label: 'C', option_text: 'To criticize someone harshly in public', display_order: 3 },
      { id: 'o16', question_id: 'q4', option_label: 'D', option_text: 'To withdraw from a competition beforehand', display_order: 4 },
    ],
  },
  {
    id: 'q0000001-0000-0000-0000-000000000005',
    section_id: 's0000001-0000-0000-0000-000000000001',
    question_number: 5,
    question_text: 'Select the option that can be used as a one-word substitute: "A person who loves and collects books."',
    question_type: 'single_choice',
    difficulty: 'easy',
    topic: 'Vocabulary',
    subtopic: 'One Word Substitution',
    marks: 2.0,
    negative_marks: 0.5,
    explanation: 'A bibliophile is an individual who collects or has a great love of books.',
    solution_steps: ['Biblio (books) + phile (lover)', 'Bibliophile = book lover'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    options: [
      { id: 'o17', question_id: 'q5', option_label: 'A', option_text: 'Bibliophile', display_order: 1 },
      { id: 'o18', question_id: 'q5', option_label: 'B', option_text: 'Philatelist', display_order: 2 },
      { id: 'o19', question_id: 'q5', option_label: 'C', option_text: 'Numismatist', display_order: 3 },
      { id: 'o20', question_id: 'q5', option_label: 'D', option_text: 'Somnambulist', display_order: 4 },
    ],
  },
];

export const examService = {
  /**
   * Fetch active categories
   */
  async getCategories(): Promise<Category[]> {
    if (!isSupabaseConfigured) return MOCK_CATEGORIES;
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) return MOCK_CATEGORIES;
      return data as Category[];
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  /**
   * Fetch exams by category
   */
  async getExamsByCategory(categoryId: string): Promise<Exam[]> {
    if (!isSupabaseConfigured) return [MOCK_EXAM];
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*, sections:exam_sections(*)')
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return [MOCK_EXAM];
      return data as Exam[];
    } catch {
      return [MOCK_EXAM];
    }
  },

  /**
   * Fetch single exam details with sections
   */
  async getExamDetails(examId: string): Promise<Exam | null> {
    if (!isSupabaseConfigured) return MOCK_EXAM;
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*, sections:exam_sections(*)')
        .eq('id', examId)
        .single();

      if (error || !data) return MOCK_EXAM;
      return data as Exam;
    } catch {
      return MOCK_EXAM;
    }
  },

  /**
   * Fetch exam questions for test attempt.
   * NOTE: Question answers are protected by RLS and not queried here!
   */
  async getExamQuestions(examId: string, sectionId?: string): Promise<Question[]> {
    if (!isSupabaseConfigured) {
      if (sectionId) {
        return MOCK_QUESTIONS.filter(q => q.section_id === sectionId);
      }
      return MOCK_QUESTIONS;
    }
    try {
      let query = supabase
        .from('questions')
        .select(`
          id,
          section_id,
          question_number,
          question_text,
          question_type,
          difficulty,
          topic,
          subtopic,
          marks,
          negative_marks,
          options:question_options (
            id,
            question_id,
            option_label,
            option_text,
            display_order
          )
        `)
        .order('question_number', { ascending: true });

      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return MOCK_QUESTIONS;
      }
      return data as Question[];
    } catch {
      return MOCK_QUESTIONS;
    }
  },

  /**
   * Start or retrieve an exam attempt
   */
  async startAttempt(examId: string, mode: 'timed' | 'practice'): Promise<ExamAttempt> {
    const defaultAttempt: ExamAttempt = {
      id: 'local-attempt-' + Date.now(),
      user_id: 'local-user',
      exam_id: examId,
      mode,
      status: 'in_progress',
      started_at: new Date().toISOString(),
      total_time_seconds: 0,
      score: 0,
      correct_count: 0,
      wrong_count: 0,
      unattempted_count: 5,
      attempted_count: 0,
      accuracy_percentage: 0,
      total_questions: 5,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) return defaultAttempt;

    try {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;
      if (!userId) return defaultAttempt;

      const { data, error } = await supabase
        .from('exam_attempts')
        .insert({
          user_id: userId,
          exam_id: examId,
          mode,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error || !data) return defaultAttempt;
      return data as ExamAttempt;
    } catch {
      return defaultAttempt;
    }
  },

  /**
   * Save a single answer response in real-time
   */
  async recordAnswer(
    attemptId: string,
    questionId: string,
    selectedOptionId: string | null,
    timeSpentSeconds: number,
    isMarkedForReview: boolean
  ): Promise<void> {
    if (!isSupabaseConfigured || attemptId.startsWith('local-')) return;
    try {
      await supabase.from('attempt_answers').upsert(
        {
          attempt_id: attemptId,
          question_id: questionId,
          selected_option_id: selectedOptionId,
          time_spent_seconds: timeSpentSeconds,
          is_marked_for_review: isMarkedForReview,
          visited: true,
          answered_at: selectedOptionId ? new Date().toISOString() : null,
        },
        { onConflict: 'attempt_id,question_id' }
      );
    } catch (err) {
      console.warn('Failed to persist answer to Supabase:', err);
    }
  },

  /**
   * Finalize and submit exam attempt via trusted server RPC function
   */
  async submitAttempt(
    attemptId: string,
    localAnswers?: Record<string, { optionId: string | null; timeSpent: number; marked: boolean }>
  ): Promise<ExamResultSummary> {
    if (!isSupabaseConfigured || attemptId.startsWith('local-')) {
      // Offline calculation fallback
      const answers = localAnswers || {};
      let correct = 0;
      let wrong = 0;
      let unattempted = 0;
      let totalTime = 0;

      const correctMapping: Record<string, string> = {
        'q0000001-0000-0000-0000-000000000001': 'o2',
        'q0000001-0000-0000-0000-000000000002': 'o5',
        'q0000001-0000-0000-0000-000000000003': 'o11',
        'q0000001-0000-0000-0000-000000000004': 'o14',
        'q0000001-0000-0000-0000-000000000005': 'o17',
      };

      MOCK_QUESTIONS.forEach(q => {
        const ans = answers[q.id];
        totalTime += ans?.timeSpent || 0;
        if (ans && ans.optionId) {
          if (ans.optionId === correctMapping[q.id]) {
            correct++;
          } else {
            wrong++;
          }
        } else {
          unattempted++;
        }
      });

      const attempted = correct + wrong;
      const correctMarks = correct * 2.0;
      const negativeMarks = wrong * 0.5;
      const finalScore = correctMarks - negativeMarks;
      const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

      return {
        attempt_id: attemptId,
        exam_title: MOCK_EXAM.title,
        total_questions: MOCK_QUESTIONS.length,
        attempted_count: attempted,
        unattempted_count: unattempted,
        correct_count: correct,
        wrong_count: wrong,
        correct_marks: correctMarks,
        negative_marks: negativeMarks,
        final_score: finalScore,
        maximum_score: MOCK_QUESTIONS.length * 2.0,
        accuracy_percentage: Number(accuracy.toFixed(2)),
        total_time_seconds: totalTime,
        rank: 1,
        percentile: 100,
        total_participants: 1,
      };
    }

    try {
      const { data, error } = await supabase.rpc('submit_exam_attempt', {
        p_attempt_id: attemptId,
      });

      if (error || !data) {
        throw new Error(error?.message || 'Failed to submit attempt');
      }

      return {
        attempt_id: attemptId,
        exam_title: 'SSC CGL Exam',
        total_questions: data.total_questions,
        attempted_count: data.attempted_count,
        unattempted_count: data.unattempted_count,
        correct_count: data.correct_count,
        wrong_count: data.wrong_count,
        correct_marks: data.correct_count * 2.0,
        negative_marks: data.wrong_count * 0.5,
        final_score: data.score,
        maximum_score: data.total_questions * 2.0,
        accuracy_percentage: data.accuracy_percentage,
        total_time_seconds: data.total_time_seconds,
        rank: 1,
        percentile: 95.0,
        total_participants: 120,
      };
    } catch (err) {
      console.warn('RPC submission error:', err);
      throw err;
    }
  },

  /**
   * Fetch post-submission solutions with explanations & steps
   */
  async getSolutions(
    attemptId: string,
    localAnswers?: Record<string, { optionId: string | null; timeSpent: number; marked: boolean }>
  ): Promise<QuestionAnalysis[]> {
    if (!isSupabaseConfigured || attemptId.startsWith('local-')) {
      const answers = localAnswers || {};
      const correctMapping: Record<string, string> = {
        'q0000001-0000-0000-0000-000000000001': 'o2',
        'q0000001-0000-0000-0000-000000000002': 'o5',
        'q0000001-0000-0000-0000-000000000003': 'o11',
        'q0000001-0000-0000-0000-000000000004': 'o14',
        'q0000001-0000-0000-0000-000000000005': 'o17',
      };

      return MOCK_QUESTIONS.map(q => {
        const ans = answers[q.id];
        const selectedId = ans?.optionId || null;
        const correctId = correctMapping[q.id];
        const isCorrect = selectedId === correctId;
        const marks = selectedId ? (isCorrect ? 2.0 : -0.5) : 0;

        return {
          question_id: q.id,
          question_number: q.question_number,
          question_text: q.question_text,
          difficulty: q.difficulty,
          topic: q.topic || 'General',
          subtopic: q.subtopic || 'General',
          marks: q.marks,
          negative_marks: q.negative_marks,
          section_id: q.section_id,
          section_name: 'English Comprehension',
          options: (q.options || []).map((o: any) => ({
            id: o.id,
            label: o.option_label,
            text: o.option_text,
            display_order: o.display_order,
          })),
          user_selected_option_id: selectedId,
          correct_option_id: correctId,
          is_correct: selectedId ? isCorrect : false,
          marks_awarded: marks,
          time_spent_seconds: ans?.timeSpent || 0,
          explanation: q.explanation,
          solution_steps: q.solution_steps,
          recommendation: isCorrect
            ? 'Great job! Strong grasp of this rule.'
            : 'Revise core subject-verb rules and practice 10 similar questions.',
        };
      });
    }

    try {
      const { data, error } = await supabase.rpc('get_attempt_solutions', {
        p_attempt_id: attemptId,
      });

      if (error || !data) return [];
      return data as QuestionAnalysis[];
    } catch {
      return [];
    }
  },

  /**
   * Fetch recent exams and participation count for student home
   */
  async getRecentExams(): Promise<any[]> {
    if (!isSupabaseConfigured) {
      return [
        {
          id: MOCK_EXAM.id,
          title: MOCK_EXAM.title,
          category: 'SSC',
          total_questions: 100,
          total_duration_minutes: 60,
          total_participants: 1248,
          last_score: 34.0,
          accuracy: 81.8,
          status: 'Available',
        },
      ];
    }

    try {
      const { data, error } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          total_questions,
          total_duration_seconds,
          category:categories(name),
          participation:exam_participation(count)
        `)
        .eq('status', 'published')
        .limit(5);

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },
};
