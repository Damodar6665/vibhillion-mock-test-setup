-- ==============================================================================
-- VIBHILLION AI: EXAM PREPARATION - INITIAL SEED DATA
-- File: supabase/seed.sql
-- ==============================================================================

-- 1. Insert Initial Category: SSC
insert into public.categories (id, name, slug, description, icon_url, display_order, is_active)
values (
  'c0000001-0000-0000-0000-000000000001',
  'SSC',
  'ssc',
  'Staff Selection Commission - Combined Graduate Level and allied exams',
  'award',
  1,
  true
) on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

-- 2. Insert Initial Exam: SSC CGL T-1 — Held on 12 Sep 2025, Shift 1
-- Under SSC CGL Previous Year Papers
insert into public.exams (
  id,
  category_id,
  title,
  slug,
  description,
  exam_type,
  year,
  exam_date,
  session,
  total_questions,
  total_duration_seconds,
  total_marks,
  positive_marks,
  negative_marks,
  status
) values (
  'e0000001-0000-0000-0000-000000000001',
  'c0000001-0000-0000-0000-000000000001',
  'SSC CGL T-1 — Held on 12 Sep 2025, Shift 1',
  'ssc-cgl-t1-12-sep-2025-shift-1',
  'SSC CGL Previous Year Papers: Official Tier-1 exam shift conducted on 12 September 2025 Shift 1.',
  'previous_year_paper',
  2025,
  '2025-09-12',
  'Shift 1',
  100,
  3600, -- 60 minutes total
  200.00,
  2.00,
  0.50,
  'published'
) on conflict (slug) do update set
  title = excluded.title,
  status = excluded.status;

-- 3. Configure 4 sections for SSC CGL Tier 1 (Configurable independent counts and timers)
insert into public.exam_sections (id, exam_id, name, display_order, question_count, duration_seconds, marks_per_correct, negative_marks_per_wrong)
values 
  ('s0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'English Comprehension', 1, 25, 900, 2.00, 0.50),
  ('s0000002-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000001', 'General Intelligence & Reasoning', 2, 25, 900, 2.00, 0.50),
  ('s0000003-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000001', 'Quantitative Aptitude', 3, 25, 900, 2.00, 0.50),
  ('s0000004-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000001', 'General Awareness', 4, 25, 900, 2.00, 0.50)
on conflict (id) do update set
  name = excluded.name,
  duration_seconds = excluded.duration_seconds;

-- 4. Insert Default Exam Settings
insert into public.exam_settings (exam_id, default_marks_per_question, default_negative_penalty, result_visibility, explanation_visibility, reveal_answers_in_practice)
values (
  'e0000001-0000-0000-0000-000000000001',
  2.00,
  0.50,
  'immediate',
  'after_submission',
  true
) on conflict (exam_id) do nothing;

-- 5. Insert Sample Questions for English Section (Clearly labelled development samples for SSC CGL)
-- Question 1: Spotting Error
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000001-0000-0000-0000-000000000001',
  's0000001-0000-0000-0000-000000000001',
  1,
  'Select the segment of the sentence that contains a grammatical error: "Neither the supervisor nor the engineers was present at the project site when the anomaly was reported."',
  'single_choice',
  'medium',
  'Grammar',
  'Subject-Verb Agreement',
  2.00,
  0.50,
  'When two subjects are joined by "Neither... nor", the verb agrees with the nearer subject. Here the nearer subject is "the engineers" (plural), so the plural verb "were" should be used instead of "was".',
  '["Identify the coordinating conjunction: ''Neither... nor''.", "Find the closest subject to the verb: ''the engineers'' is plural.", "Replace ''was present'' with ''were present''."]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000001-0000-0000-0000-000000000001', 'q0000001-0000-0000-0000-000000000001', 'A', 'Neither the supervisor', 1),
  ('o0000001-0000-0000-0000-000000000002', 'q0000001-0000-0000-0000-000000000001', 'B', 'nor the engineers was present', 2),
  ('o0000001-0000-0000-0000-000000000003', 'q0000001-0000-0000-0000-000000000001', 'C', 'at the project site', 3),
  ('o0000001-0000-0000-0000-000000000004', 'q0000001-0000-0000-0000-000000000001', 'D', 'when the anomaly was reported', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000001-0000-0000-0000-000000000001',
  'o0000001-0000-0000-0000-000000000002',
  'Option B contains the error: "nor the engineers was present" should be "nor the engineers were present".'
) on conflict (question_id) do nothing;

-- Question 2: Synonym
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000001-0000-0000-0000-000000000002',
  's0000001-0000-0000-0000-000000000001',
  2,
  'Select the most appropriate SYNONYM of the given word: METICULOUS',
  'single_choice',
  'easy',
  'Vocabulary',
  'Synonyms',
  2.00,
  0.50,
  'Meticulous means showing great attention to detail; very careful and precise. Painstaking is the exact synonym.',
  '["Analyze word meaning: ''Meticulous'' means extremely careful, precise, and thorough.", "Examine options: Painstaking = thorough and careful; Careless = negligent; Hasty = quick/rash; Casual = unconcerned.", "Painstaking is the direct synonym."]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000001-0000-0000-0000-000000000005', 'q0000001-0000-0000-0000-000000000002', 'A', 'Painstaking', 1),
  ('o0000001-0000-0000-0000-000000000006', 'q0000001-0000-0000-0000-000000000002', 'B', 'Careless', 2),
  ('o0000001-0000-0000-0000-000000000007', 'q0000001-0000-0000-0000-000000000002', 'C', 'Hasty', 3),
  ('o0000001-0000-0000-0000-000000000008', 'q0000001-0000-0000-0000-000000000002', 'D', 'Casual', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000001-0000-0000-0000-000000000002',
  'o0000001-0000-0000-0000-000000000005',
  'Option A is correct: "Painstaking" means taking great care and effort, which matches "Meticulous".'
) on conflict (question_id) do nothing;

-- Question 3: Antonym
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000001-0000-0000-0000-000000000003',
  's0000001-0000-0000-0000-000000000001',
  3,
  'Select the most appropriate ANTONYM of the given word: EPHEMERAL',
  'single_choice',
  'medium',
  'Vocabulary',
  'Antonyms',
  2.00,
  0.50,
  'Ephemeral means lasting for a very short time. Permanent means lasting indefinitely, which is the antonym.',
  '["Word meaning: Ephemeral means transient, fleeting, short-lived.", "Antonym required: Opposite of temporary is lasting or permanent.", "Option C ''Permanent'' is the direct antonym."]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000001-0000-0000-0000-000000000009', 'q0000001-0000-0000-0000-000000000003', 'A', 'Transient', 1),
  ('o0000001-0000-0000-0000-000000000010', 'q0000001-0000-0000-0000-000000000003', 'B', 'Fleeting', 2),
  ('o0000001-0000-0000-0000-000000000011', 'q0000001-0000-0000-0000-000000000003', 'C', 'Permanent', 3),
  ('o0000001-0000-0000-0000-000000000012', 'q0000001-0000-0000-0000-000000000003', 'D', 'Momentary', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000001-0000-0000-0000-000000000003',
  'o0000001-0000-0000-0000-000000000011',
  'Option C is correct: "Permanent" is the exact antonym of "Ephemeral".'
) on conflict (question_id) do nothing;

-- Question 4: Idioms & Phrases
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000001-0000-0000-0000-000000000004',
  's0000001-0000-0000-0000-000000000001',
  4,
  'Select the meaning of the given idiom: "Bite the bullet"',
  'single_choice',
  'easy',
  'Idioms & Phrases',
  'General Idioms',
  2.00,
  0.50,
  '"Bite the bullet" means to face a difficult or unpleasant situation with courage and stoicism.',
  '["Origin: Biting on a lead bullet during battlefield surgery without anesthesia.", "Idiomatic meaning: Enduring an inevitable grim or unpleasant ordeal bravely."]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000001-0000-0000-0000-000000000013', 'q0000001-0000-0000-0000-000000000004', 'A', 'To act impulsively without considering consequences', 1),
  ('o0000001-0000-0000-0000-000000000014', 'q0000001-0000-0000-0000-000000000004', 'B', 'To face a painful situation with courage and endurance', 2),
  ('o0000001-0000-0000-0000-000000000015', 'q0000001-0000-0000-0000-000000000004', 'C', 'To criticize someone harshly in public', 3),
  ('o0000001-0000-0000-0000-000000000016', 'q0000001-0000-0000-0000-000000000004', 'D', 'To withdraw from a competition beforehand', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000001-0000-0000-0000-000000000004',
  'o0000001-0000-0000-0000-000000000014',
  'Option B is correct: To face a painful or difficult situation with fortitude.'
) on conflict (question_id) do nothing;

-- Question 5: One Word Substitution
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000001-0000-0000-0000-000000000005',
  's0000001-0000-0000-0000-000000000001',
  5,
  'Select the option that can be used as a one-word substitute for the underlined group of words: "A person who loves and collects books."',
  'single_choice',
  'easy',
  'Vocabulary',
  'One Word Substitution',
  2.00,
  0.50,
  'A bibliophile is an individual who collects or has a great love of books.',
  '["Biblio (book) + Phil (lover).", "A bibliophile is a book collector or lover.", "Philatelist = stamp collector; Numismatist = coin collector; Somnambulist = sleepwalker."]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000001-0000-0000-0000-000000000017', 'q0000001-0000-0000-0000-000000000005', 'A', 'Bibliophile', 1),
  ('o0000001-0000-0000-0000-000000000018', 'q0000001-0000-0000-0000-000000000005', 'B', 'Philatelist', 2),
  ('o0000001-0000-0000-0000-000000000019', 'q0000001-0000-0000-0000-000000000005', 'C', 'Numismatist', 3),
  ('o0000001-0000-0000-0000-000000000020', 'q0000001-0000-0000-0000-000000000005', 'D', 'Somnambulist', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000001-0000-0000-0000-000000000005',
  'o0000001-0000-0000-0000-000000000017',
  'Option A is correct: Bibliophile.'
) on conflict (question_id) do nothing;

