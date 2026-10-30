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


-- ==============================================================================
-- 6. QUESTIONS FOR SECTION 2: GENERAL INTELLIGENCE & REASONING
-- ==============================================================================

-- Question 1: Analogy
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000002-0000-0000-0000-000000000001',
  's0000002-0000-0000-0000-000000000002',
  1,
  'Select the related word from the given alternatives: Architect : Building :: Sculptor : ?',
  'single_choice',
  'easy',
  'Reasoning',
  'Analogy',
  2.00,
  0.50,
  'An architect designs and creates a building; similarly, a sculptor carves and creates a statue.',
  '["Analyze relationship: Creator to Creation", "Architect creates Building", "Sculptor creates Statue"]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000002-0000-0000-0000-000000000021', 'q0000002-0000-0000-0000-000000000001', 'A', 'Museum', 1),
  ('o0000002-0000-0000-0000-000000000022', 'q0000002-0000-0000-0000-000000000001', 'B', 'Stone', 2),
  ('o0000002-0000-0000-0000-000000000023', 'q0000002-0000-0000-0000-000000000001', 'C', 'Statue', 3),
  ('o0000002-0000-0000-0000-000000000024', 'q0000002-0000-0000-0000-000000000001', 'D', 'Chisel', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000002-0000-0000-0000-000000000001',
  'o0000002-0000-0000-0000-000000000023',
  'Option C is correct: A sculptor creates a statue.'
) on conflict (question_id) do nothing;

-- Question 2: Number Series
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000002-0000-0000-0000-000000000002',
  's0000002-0000-0000-0000-000000000002',
  2,
  'Find the next number in the sequence: 3, 7, 15, 31, 63, ?',
  'single_choice',
  'medium',
  'Reasoning',
  'Number Series',
  2.00,
  0.50,
  'The pattern is: term * 2 + 1. 63 * 2 + 1 = 127. Alternatively, differences are powers of 2 (4, 8, 16, 32, 64). 63 + 64 = 127.',
  '["Differences: 7-3=4, 15-7=8, 31-15=16, 63-31=32", "Next difference is 64", "63 + 64 = 127"]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000002-0000-0000-0000-000000000025', 'q0000002-0000-0000-0000-000000000002', 'A', '127', 1),
  ('o0000002-0000-0000-0000-000000000026', 'q0000002-0000-0000-0000-000000000002', 'B', '125', 2),
  ('o0000002-0000-0000-0000-000000000027', 'q0000002-0000-0000-0000-000000000002', 'C', '129', 3),
  ('o0000002-0000-0000-0000-000000000028', 'q0000002-0000-0000-0000-000000000002', 'D', '131', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000002-0000-0000-0000-000000000002',
  'o0000002-0000-0000-0000-000000000025',
  'Option A is correct: 127.'
) on conflict (question_id) do nothing;

-- Question 3: Coding-Decoding
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000002-0000-0000-0000-000000000003',
  's0000002-0000-0000-0000-000000000002',
  3,
  'In a certain code language, if CLOUD is coded as ENQWF, how is RAIN coded in that language?',
  'single_choice',
  'medium',
  'Reasoning',
  'Coding-Decoding',
  2.00,
  0.50,
  'Each letter shifts +2 positions: R(+2)->T, A(+2)->C, I(+2)->K, N(+2)->P => TCKP.',
  '["Shift +2 for each alphabetical index", "R -> T", "A -> C", "I -> K", "N -> P", "Result is TCKP"]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000002-0000-0000-0000-000000000029', 'q0000002-0000-0000-0000-000000000003', 'A', 'TCKP', 1),
  ('o0000002-0000-0000-0000-000000000030', 'q0000002-0000-0000-0000-000000000003', 'B', 'SCLP', 2),
  ('o0000002-0000-0000-0000-000000000031', 'q0000002-0000-0000-0000-000000000003', 'C', 'TBKQ', 3),
  ('o0000002-0000-0000-0000-000000000032', 'q0000002-0000-0000-0000-000000000003', 'D', 'TCJQ', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000002-0000-0000-0000-000000000003',
  'o0000002-0000-0000-0000-000000000029',
  'Option A is correct: TCKP.'
) on conflict (question_id) do nothing;

-- ==============================================================================
-- 7. QUESTIONS FOR SECTION 3: QUANTITATIVE APTITUDE
-- ==============================================================================

-- Question 1: Percentages
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000003-0000-0000-0000-000000000001',
  's0000003-0000-0000-0000-000000000003',
  1,
  'If the price of a commodity increases by 25%, by what percentage must consumption be reduced so that expenditure remains unchanged?',
  'single_choice',
  'medium',
  'Mathematics',
  'Percentages',
  2.00,
  0.50,
  'Required reduction = [r / (100 + r)] * 100% = [25 / 125] * 100% = 20%.',
  '["Formula: % reduction = [r / (100 + r)] * 100", "Substitute r = 25: 25 / 125 * 100 = 20%"]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000003-0000-0000-0000-000000000041', 'q0000003-0000-0000-0000-000000000001', 'A', '20%', 1),
  ('o0000003-0000-0000-0000-000000000042', 'q0000003-0000-0000-0000-000000000001', 'B', '25%', 2),
  ('o0000003-0000-0000-0000-000000000043', 'q0000003-0000-0000-0000-000000000001', 'C', '16.67%', 3),
  ('o0000003-0000-0000-0000-000000000044', 'q0000003-0000-0000-0000-000000000001', 'D', '15%', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000003-0000-0000-0000-000000000001',
  'o0000003-0000-0000-0000-000000000041',
  'Option A is correct: 20%.'
) on conflict (question_id) do nothing;

-- Question 2: Profit & Loss
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000003-0000-0000-0000-000000000002',
  's0000003-0000-0000-0000-000000000003',
  2,
  'A merchant marks an article at ₹500 and sells it at a 20% profit. What is the selling price?',
  'single_choice',
  'easy',
  'Mathematics',
  'Profit & Loss',
  2.00,
  0.50,
  'Selling Price = Cost Price * (1 + Profit%) = 500 * 1.20 = ₹600.',
  '["Profit = 20% of 500 = ₹100", "Selling Price = 500 + 100 = ₹600"]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000003-0000-0000-0000-000000000045', 'q0000003-0000-0000-0000-000000000002', 'A', '₹550', 1),
  ('o0000003-0000-0000-0000-000000000046', 'q0000003-0000-0000-0000-000000000002', 'B', '₹600', 2),
  ('o0000003-0000-0000-0000-000000000047', 'q0000003-0000-0000-0000-000000000002', 'C', '₹620', 3),
  ('o0000003-0000-0000-0000-000000000048', 'q0000003-0000-0000-0000-000000000002', 'D', '₹580', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000003-0000-0000-0000-000000000002',
  'o0000003-0000-0000-0000-000000000046',
  'Option B is correct: ₹600.'
) on conflict (question_id) do nothing;

-- ==============================================================================
-- 8. QUESTIONS FOR SECTION 4: GENERAL AWARENESS
-- ==============================================================================

-- Question 1: Indian Polity
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000004-0000-0000-0000-000000000001',
  's0000004-0000-0000-0000-000000000004',
  1,
  'Which Article of the Constitution of India guarantees the Right to Equality before law and equal protection of the laws?',
  'single_choice',
  'easy',
  'General Awareness',
  'Indian Polity',
  2.00,
  0.50,
  'Article 14 of the Indian Constitution states that the State shall not deny to any person equality before the law or equal protection of the laws within India.',
  '["Article 14: Equality before law", "Article 19: Fundamental freedoms", "Article 21: Protection of life", "Article 32: Constitutional remedies"]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000004-0000-0000-0000-000000000061', 'q0000004-0000-0000-0000-000000000001', 'A', 'Article 14', 1),
  ('o0000004-0000-0000-0000-000000000062', 'q0000004-0000-0000-0000-000000000001', 'B', 'Article 19', 2),
  ('o0000004-0000-0000-0000-000000000063', 'q0000004-0000-0000-0000-000000000001', 'C', 'Article 21', 3),
  ('o0000004-0000-0000-0000-000000000064', 'q0000004-0000-0000-0000-000000000001', 'D', 'Article 32', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000004-0000-0000-0000-000000000001',
  'o0000004-0000-0000-0000-000000000061',
  'Option A is correct: Article 14.'
) on conflict (question_id) do nothing;

-- Question 2: General Science
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'q0000004-0000-0000-0000-000000000004',
  's0000004-0000-0000-0000-000000000004',
  2,
  'Which cellular organelle is universally termed as the "powerhouse of the cell"?',
  'single_choice',
  'easy',
  'General Awareness',
  'General Science',
  2.00,
  0.50,
  'Mitochondria produce most of the chemical energy required by the cell in the form of ATP, hence termed powerhouses of the cell.',
  '["Cellular respiration occurs in mitochondria", "Generates ATP", "Termed powerhouse of the cell"]'::jsonb,
  2025,
  'Shift 1'
) on conflict (section_id, question_number) do nothing;

insert into public.question_options (id, question_id, option_label, option_text, display_order)
values
  ('o0000004-0000-0000-0000-000000000073', 'q0000004-0000-0000-0000-000000000004', 'A', 'Mitochondria', 1),
  ('o0000004-0000-0000-0000-000000000074', 'q0000004-0000-0000-0000-000000000004', 'B', 'Ribosome', 2),
  ('o0000004-0000-0000-0000-000000000075', 'q0000004-0000-0000-0000-000000000004', 'C', 'Golgi Apparatus', 3),
  ('o0000004-0000-0000-0000-000000000076', 'q0000004-0000-0000-0000-000000000004', 'D', 'Lysosome', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'q0000004-0000-0000-0000-000000000004',
  'o0000004-0000-0000-0000-000000000073',
  'Option A is correct: Mitochondria.'
) on conflict (question_id) do nothing;
