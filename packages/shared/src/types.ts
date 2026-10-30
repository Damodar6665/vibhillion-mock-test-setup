// ==============================================================================
// VIBHILLION AI: SHARED TYPES & INTERFACES
// File: packages/shared/src/types.ts
// ==============================================================================

export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ExamType = 'mock_test' | 'previous_year_paper';
export type ExamStatus = 'draft' | 'published' | 'archived';

export interface Exam {
  id: string;
  category_id: string;
  title: string;
  slug: string;
  description?: string | null;
  exam_type: ExamType;
  year?: number | null;
  exam_date?: string | null;
  session?: string | null;
  total_questions: number;
  total_duration_seconds: number;
  total_marks: number;
  positive_marks: number;
  negative_marks: number;
  status: ExamStatus;
  created_at: string;
  updated_at: string;
  category?: Category;
  sections?: ExamSection[];
}

export interface ExamSection {
  id: string;
  exam_id: string;
  name: string;
  display_order: number;
  question_count: number;
  duration_seconds: number;
  marks_per_correct: number;
  negative_marks_per_wrong: number;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export type QuestionType = 'single_choice' | 'multiple_choice' | 'numerical';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  question_id: string;
  option_label: string; // 'A', 'B', 'C', 'D'
  option_text: string;
  display_order: number;
}

export interface Question {
  id: string;
  section_id: string;
  question_number: number;
  question_text: string;
  question_type: QuestionType;
  difficulty: DifficultyLevel;
  topic?: string | null;
  subtopic?: string | null;
  marks: number;
  negative_marks: number;
  explanation?: string | null;
  solution_steps?: string[] | null;
  source_year?: number | null;
  source_session?: string | null;
  options?: QuestionOption[];
  created_at: string;
  updated_at: string;
}

export interface QuestionAnswer {
  id: string;
  question_id: string;
  correct_option_id: string;
  explanation?: string | null;
  solution_steps?: string[] | null;
  updated_at: string;
}

export type AttemptMode = 'timed' | 'practice';
export type AttemptStatus = 'in_progress' | 'completed' | 'expired' | 'submitted';

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  mode: AttemptMode;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string | null;
  total_time_seconds: number;
  score: number;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
  attempted_count: number;
  accuracy_percentage: number;
  total_questions: number;
  created_at: string;
  exam?: Exam;
}

export type SectionAttemptStatus = 'not_started' | 'in_progress' | 'completed' | 'time_expired';

export interface AttemptSection {
  id: string;
  attempt_id: string;
  section_id: string;
  status: SectionAttemptStatus;
  started_at?: string | null;
  submitted_at?: string | null;
  allocated_duration_seconds: number;
  actual_duration_seconds: number;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
  score: number;
}

export interface AttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string | null;
  is_correct?: boolean | null;
  marks_awarded: number;
  time_spent_seconds: number;
  is_marked_for_review: boolean;
  visited: boolean;
  answered_at?: string | null;
}

export interface ExamParticipation {
  id: string;
  exam_id: string;
  user_id: string;
  attempt_id: string;
  status: string;
  score: number;
  completed_at: string;
}

export interface QuestionAnalysis {
  question_id: string;
  question_number: number;
  question_text: string;
  difficulty: DifficultyLevel;
  topic: string;
  subtopic: string;
  marks: number;
  negative_marks: number;
  section_id: string;
  section_name: string;
  options: {
    id: string;
    label: string;
    text: string;
    display_order: number;
  }[];
  user_selected_option_id?: string | null;
  correct_option_id: string;
  is_correct?: boolean | null;
  marks_awarded: number;
  time_spent_seconds: number;
  explanation?: string | null;
  solution_steps?: string[] | null;
  recommendation?: string;
}

export interface TopicPerformance {
  topic: string;
  total_questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  average_time_seconds: number;
  is_weak: boolean;
  is_strong: boolean;
}

export interface ExamResultSummary {
  attempt_id: string;
  exam_title: string;
  total_questions: number;
  attempted_count: number;
  unattempted_count: number;
  correct_count: number;
  wrong_count: number;
  correct_marks: number;
  negative_marks: number;
  final_score: number;
  maximum_score: number;
  accuracy_percentage: number;
  total_time_seconds: number;
  rank?: number;
  percentile?: number;
  total_participants?: number;
}

export interface BookmarkItem {
  id: string;
  user_id?: string;
  question_id: string;
  question_text: string;
  topic?: string | null;
  subtopic?: string | null;
  difficulty?: DifficultyLevel;
  section_name?: string;
  options: {
    id: string;
    label: string;
    text: string;
  }[];
  correct_option_id?: string;
  explanation?: string | null;
  solution_steps?: string[] | null;
  created_at: string;
}

export interface UserAttemptHistory {
  id: string;
  exam_id: string;
  exam_title: string;
  mode: AttemptMode;
  score: number;
  maximum_score: number;
  accuracy_percentage: number;
  total_time_seconds: number;
  submitted_at: string;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
}

