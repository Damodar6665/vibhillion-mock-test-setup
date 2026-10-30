// ==============================================================================
// VIBHILLION AI: SHARED ZOD SCHEMAS
// File: packages/shared/src/schemas.ts
// ==============================================================================

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm password must match'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  display_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const examSchema = z.object({
  category_id: z.string().uuid('Valid category is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  exam_type: z.enum(['mock_test', 'previous_year_paper']),
  year: z.number().int().min(2000).max(2035).optional(),
  exam_date: z.string().optional(),
  session: z.string().optional(),
  total_questions: z.number().int().min(1, 'At least 1 question is required'),
  total_duration_seconds: z.number().int().min(60, 'Duration must be at least 60 seconds'),
  total_marks: z.number().min(1, 'Total marks must be positive'),
  positive_marks: z.number().min(0.1, 'Positive marks must be greater than 0'),
  negative_marks: z.number().min(0, 'Negative penalty must be non-negative'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export type ExamInput = z.infer<typeof examSchema>;

export const examSectionSchema = z.object({
  exam_id: z.string().uuid('Valid exam ID required'),
  name: z.string().min(2, 'Section name required'),
  display_order: z.number().int().default(0),
  question_count: z.number().int().min(1),
  duration_seconds: z.number().int().min(30),
  marks_per_correct: z.number().min(0.1),
  negative_marks_per_wrong: z.number().min(0),
});

export type ExamSectionInput = z.infer<typeof examSectionSchema>;

export const questionOptionSchema = z.object({
  option_label: z.string().min(1),
  option_text: z.string().min(1, 'Option text cannot be empty'),
  display_order: z.number().int().default(0),
});

export const questionFormSchema = z.object({
  section_id: z.string().uuid('Section is required'),
  question_number: z.number().int().min(1),
  question_text: z.string().min(5, 'Question text must be at least 5 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().min(1, 'Topic is required'),
  subtopic: z.string().optional(),
  marks: z.number().min(0.1),
  negative_marks: z.number().min(0),
  explanation: z.string().optional(),
  options: z.array(z.string().min(1, 'Option cannot be empty')).min(2, 'At least 2 options required'),
  correctOptionIndex: z.number().int().min(0),
});

export type QuestionFormInput = z.infer<typeof questionFormSchema>;

