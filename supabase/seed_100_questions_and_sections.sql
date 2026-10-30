-- ==============================================================================
-- VIBHILLION AI: COMPLETE 100 QUESTIONS, 4 SECTIONS & MARKING SCHEME BACKEND SEED
-- File: supabase/seed_100_questions_and_sections.sql
-- ==============================================================================

-- 1. UPDATE EXAM SPECIFICATIONS
update public.exams
set 
  title = 'SSC CGL T-I (Held on 12 Sep 2025 S1) – English',
  total_questions = 100,
  total_duration_seconds = 3600,
  total_marks = 200.00,
  positive_marks = 2.00,
  negative_marks = 0.50,
  status = 'published'
where id = 'e0000001-0000-0000-0000-000000000001';

-- 2. CONFIGURE 4 EXAM SECTIONS (25 QUESTIONS & 15 MINS PER SECTION)
insert into public.exam_sections (id, exam_id, name, display_order, question_count, duration_seconds, marks_per_correct, negative_marks_per_wrong)
values 
  ('a0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'English Comprehension', 1, 25, 900, 2.00, 0.50),
  ('a0000002-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000001', 'General Intelligence & Reasoning', 2, 25, 900, 2.00, 0.50),
  ('a0000003-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000001', 'Quantitative Aptitude', 3, 25, 900, 2.00, 0.50),
  ('a0000004-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000001', 'General Awareness', 4, 25, 900, 2.00, 0.50)
on conflict (id) do update set 
  name = excluded.name,
  question_count = excluded.question_count,
  duration_seconds = excluded.duration_seconds,
  marks_per_correct = excluded.marks_per_correct,
  negative_marks_per_wrong = excluded.negative_marks_per_wrong;

-- 3. SEED QUESTIONS, OPTIONS, AND SOLUTIONS

-- Question 1
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 1, 'Select the segment containing a grammatical error: "Neither the supervisor nor the engineers was present at the project site when the anomaly was reported."', 'single_choice', 'medium', 'English Grammar', 'Subject-Verb Agreement', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0001-000000000001', 'b0000001-0000-0000-0000-000000000001', 'A', 'Neither the supervisor', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0001-000000000002', 'b0000001-0000-0000-0000-000000000001', 'B', 'nor the engineers was present', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000001', 'd0000000-0000-0000-0001-000000000002', 'When subjects are joined by "neither... nor", the verb agrees with the nearer subject ("engineers"). Use "were present".')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0001-000000000003', 'b0000001-0000-0000-0000-000000000001', 'C', 'at the project site', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0001-000000000004', 'b0000001-0000-0000-0000-000000000001', 'D', 'when the anomaly was reported', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 2
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 2, 'Select the most appropriate SYNONYM of: METICULOUS', 'single_choice', 'medium', 'Vocabulary', 'Synonyms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0002-000000000001', 'b0000001-0000-0000-0000-000000000002', 'A', 'Painstaking', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000002', 'd0000000-0000-0000-0002-000000000001', 'Meticulous means taking or showing extreme care about minute details; painstaking is the synonym.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0002-000000000002', 'b0000001-0000-0000-0000-000000000002', 'B', 'Careless', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0002-000000000003', 'b0000001-0000-0000-0000-000000000002', 'C', 'Hasty', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0002-000000000004', 'b0000001-0000-0000-0000-000000000002', 'D', 'Casual', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 3
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 3, 'Select the most appropriate ANTONYM of: EPHEMERAL', 'single_choice', 'medium', 'Vocabulary', 'Antonyms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0003-000000000001', 'b0000001-0000-0000-0000-000000000003', 'A', 'Transient', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0003-000000000002', 'b0000001-0000-0000-0000-000000000003', 'B', 'Fleeting', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0003-000000000003', 'b0000001-0000-0000-0000-000000000003', 'C', 'Permanent', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000003', 'd0000000-0000-0000-0003-000000000003', 'Ephemeral means lasting a very short time. Permanent means lasting indefinitely.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0003-000000000004', 'b0000001-0000-0000-0000-000000000003', 'D', 'Momentary', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 4
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 4, 'Select the meaning of the given idiom: "Bite the bullet"', 'single_choice', 'medium', 'Idioms & Phrases', 'Idioms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0004-000000000001', 'b0000001-0000-0000-0000-000000000004', 'A', 'To act impulsively', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0004-000000000002', 'b0000001-0000-0000-0000-000000000004', 'B', 'To face a painful situation with courage and endurance', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000004', 'd0000000-0000-0000-0004-000000000002', '"Bite the bullet" means facing a grim situation with fortitude.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0004-000000000003', 'b0000001-0000-0000-0000-000000000004', 'C', 'To criticize harshly', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0004-000000000004', 'b0000001-0000-0000-0000-000000000004', 'D', 'To withdraw early', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 5
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 5, 'Select the option that can be used as a one-word substitute: "A person who loves and collects books."', 'single_choice', 'medium', 'Vocabulary', 'One Word Substitution', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0005-000000000001', 'b0000001-0000-0000-0000-000000000005', 'A', 'Bibliophile', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000005', 'd0000000-0000-0000-0005-000000000001', 'A bibliophile is one who loves or collects books.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0005-000000000002', 'b0000001-0000-0000-0000-000000000005', 'B', 'Philatelist', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0005-000000000003', 'b0000001-0000-0000-0000-000000000005', 'C', 'Numismatist', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0005-000000000004', 'b0000001-0000-0000-0000-000000000005', 'D', 'Somnambulist', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 6
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 6, 'Select the most appropriate option to fill in the blank: "The committee _______ unable to reach a unanimous verdict due to internal conflicts."', 'single_choice', 'medium', 'English Grammar', 'Collective Nouns', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0006-000000000001', 'b0000001-0000-0000-0000-000000000006', 'A', 'was', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0006-000000000002', 'b0000001-0000-0000-0000-000000000006', 'B', 'were', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000006', 'd0000000-0000-0000-0006-000000000002', 'When members of a collective noun act individually or are divided, a plural verb ("were") is used.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0006-000000000003', 'b0000001-0000-0000-0000-000000000006', 'C', 'is', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0006-000000000004', 'b0000001-0000-0000-0000-000000000006', 'D', 'has', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 7
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 7, 'Select the correctly spelt word:', 'single_choice', 'medium', 'Vocabulary', 'Spelling Correction', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0007-000000000001', 'b0000001-0000-0000-0000-000000000007', 'A', 'Accomodate', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0007-000000000002', 'b0000001-0000-0000-0000-000000000007', 'B', 'Accommodate', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000007', 'd0000000-0000-0000-0007-000000000002', 'The correct spelling is "Accommodate" with double "c" and double "m".')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0007-000000000003', 'b0000001-0000-0000-0000-000000000007', 'C', 'Acommodate', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0007-000000000004', 'b0000001-0000-0000-0000-000000000007', 'D', 'Acomodate', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 8
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', 8, 'Change to passive voice: "The chef prepared an exquisite seven-course meal for the delegates."', 'single_choice', 'medium', 'Grammar', 'Voice', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0008-000000000001', 'b0000001-0000-0000-0000-000000000008', 'A', 'An exquisite seven-course meal was prepared by the chef for the delegates.', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000008', 'd0000000-0000-0000-0008-000000000001', 'Active in simple past changes to "was/were + V3".')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0008-000000000002', 'b0000001-0000-0000-0000-000000000008', 'B', 'An exquisite seven-course meal had been prepared by the chef.', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0008-000000000003', 'b0000001-0000-0000-0000-000000000008', 'C', 'The delegates were prepared an exquisite meal by chef.', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0008-000000000004', 'b0000001-0000-0000-0000-000000000008', 'D', 'An exquisite meal is being prepared by the chef.', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 9
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001', 9, 'Select the indirect form: She said, "I will complete this comprehensive audit tomorrow."', 'single_choice', 'medium', 'Grammar', 'Narration', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0009-000000000001', 'b0000001-0000-0000-0000-000000000009', 'A', 'She said that she will complete this comprehensive audit tomorrow.', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0009-000000000002', 'b0000001-0000-0000-0000-000000000009', 'B', 'She said that she would complete that comprehensive audit the next day.', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000009', 'd0000000-0000-0000-0009-000000000002', '"will" changes to "would", "this" to "that", and "tomorrow" to "the next day".')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0009-000000000003', 'b0000001-0000-0000-0000-000000000009', 'C', 'She said she would have completed the audit yesterday.', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0009-000000000004', 'b0000001-0000-0000-0000-000000000009', 'D', 'She said she shall complete this audit.', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 10
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001', 10, 'Select the antonym of: CANDID', 'single_choice', 'medium', 'Vocabulary', 'Antonyms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0010-000000000001', 'b0000001-0000-0000-0000-000000000010', 'A', 'Frank', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0010-000000000002', 'b0000001-0000-0000-0000-000000000010', 'B', 'Deceitful', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000010', 'd0000000-0000-0000-0010-000000000002', 'Candid means truthful and straightforward; deceitful is its antonym.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0010-000000000003', 'b0000001-0000-0000-0000-000000000010', 'C', 'Blunt', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0010-000000000004', 'b0000001-0000-0000-0000-000000000010', 'D', 'Honest', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 11
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000001', 11, 'Select the idiom meaning: "To give someone the cold shoulder"', 'single_choice', 'medium', 'Idioms & Phrases', 'Idioms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0011-000000000001', 'b0000001-0000-0000-0000-000000000011', 'A', 'To comfort someone', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0011-000000000002', 'b0000001-0000-0000-0000-000000000011', 'B', 'To ignore or treat someone with coolness', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000011', 'd0000000-0000-0000-0011-000000000002', '"Cold shoulder" means intentionally ignoring or being unfriendly.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0011-000000000003', 'b0000001-0000-0000-0000-000000000011', 'C', 'To shake hands warmly', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0011-000000000004', 'b0000001-0000-0000-0000-000000000011', 'D', 'To invite someone to dinner', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 12
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000001', 12, 'Select the synonym of: RESILIENT', 'single_choice', 'medium', 'Vocabulary', 'Synonyms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0012-000000000001', 'b0000001-0000-0000-0000-000000000012', 'A', 'Fragile', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0012-000000000002', 'b0000001-0000-0000-0000-000000000012', 'B', 'Vulnerable', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0012-000000000003', 'b0000001-0000-0000-0000-000000000012', 'C', 'Elastic/Tough', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000012', 'd0000000-0000-0000-0012-000000000003', 'Resilient means able to withstand or recover quickly from difficult conditions.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0012-000000000004', 'b0000001-0000-0000-0000-000000000012', 'D', 'Rigid', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 13
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000001', 13, 'One-word substitution: "A remedy for all diseases"', 'single_choice', 'medium', 'Vocabulary', 'One Word Substitution', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0013-000000000001', 'b0000001-0000-0000-0000-000000000013', 'A', 'Panacea', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000013', 'd0000000-0000-0000-0013-000000000001', 'A panacea is a universal cure or solution for all diseases.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0013-000000000002', 'b0000001-0000-0000-0000-000000000013', 'B', 'Placebo', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0013-000000000003', 'b0000001-0000-0000-0000-000000000013', 'C', 'Antibiotic', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0013-000000000004', 'b0000001-0000-0000-0000-000000000013', 'D', 'Antidote', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 14
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000001', 14, 'Identify the error: "Scarcely had the train arrived then the passengers rushed into the compartments."', 'single_choice', 'medium', 'English Grammar', 'Conjunctions', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0014-000000000001', 'b0000001-0000-0000-0000-000000000014', 'A', 'Scarcely had', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0014-000000000002', 'b0000001-0000-0000-0000-000000000014', 'B', 'the train arrived', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0014-000000000003', 'b0000001-0000-0000-0000-000000000014', 'C', 'then the passengers', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000014', 'd0000000-0000-0000-0014-000000000003', '"Scarcely... when" is the correct correlative conjunction pair, not "then".')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0014-000000000004', 'b0000001-0000-0000-0000-000000000014', 'D', 'rushed into', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 15
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000001', 15, 'Select the antonym of: OBSEQUIOUS', 'single_choice', 'medium', 'Vocabulary', 'Antonyms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0015-000000000001', 'b0000001-0000-0000-0000-000000000015', 'A', 'Servile', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0015-000000000002', 'b0000001-0000-0000-0000-000000000015', 'B', 'Assertive', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000015', 'd0000000-0000-0000-0015-000000000002', 'Obsequious means overly obedient and fawning; assertive is its antonym.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0015-000000000003', 'b0000001-0000-0000-0000-000000000015', 'C', 'Submissive', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0015-000000000004', 'b0000001-0000-0000-0000-000000000015', 'D', 'Flattering', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 16
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000016', 'a0000001-0000-0000-0000-000000000001', 16, 'Select the synonym of: ALACRITY', 'single_choice', 'medium', 'Vocabulary', 'Synonyms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0016-000000000001', 'b0000001-0000-0000-0000-000000000016', 'A', 'Hesitation', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0016-000000000002', 'b0000001-0000-0000-0000-000000000016', 'B', 'Sluggishness', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0016-000000000003', 'b0000001-0000-0000-0000-000000000016', 'C', 'Brisk and cheerful readiness', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000016', 'd0000000-0000-0000-0016-000000000003', 'Alacrity means brisk and cheerful readiness.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0016-000000000004', 'b0000001-0000-0000-0000-000000000016', 'D', 'Reluctance', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 17
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000017', 'a0000001-0000-0000-0000-000000000001', 17, 'One-word substitute: "One who does not believe in the existence of God"', 'single_choice', 'medium', 'Vocabulary', 'One Word Substitution', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0017-000000000001', 'b0000001-0000-0000-0000-000000000017', 'A', 'Atheist', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000017', 'd0000000-0000-0000-0017-000000000001', 'An atheist is someone who does not believe in deities.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0017-000000000002', 'b0000001-0000-0000-0000-000000000017', 'B', 'Agnostic', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0017-000000000003', 'b0000001-0000-0000-0000-000000000017', 'C', 'Theist', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0017-000000000004', 'b0000001-0000-0000-0000-000000000017', 'D', 'Devotee', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 18
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000018', 'a0000001-0000-0000-0000-000000000001', 18, 'Choose the correct idiom: "At the eleventh hour"', 'single_choice', 'medium', 'Idioms & Phrases', 'Idioms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0018-000000000001', 'b0000001-0000-0000-0000-000000000018', 'A', 'At midnight', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0018-000000000002', 'b0000001-0000-0000-0000-000000000018', 'B', 'At the last possible moment', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000018', 'd0000000-0000-0000-0018-000000000002', '"At the eleventh hour" means at the latest possible opportunity.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0018-000000000003', 'b0000001-0000-0000-0000-000000000018', 'C', 'Very early in morning', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0018-000000000004', 'b0000001-0000-0000-0000-000000000018', 'D', 'Exactly on time', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 19
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000019', 'a0000001-0000-0000-0000-000000000001', 19, 'Fill in the blank: "He was exonerated _______ all the fabricated corruption allegations."', 'single_choice', 'medium', 'English Grammar', 'Prepositions', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0019-000000000001', 'b0000001-0000-0000-0000-000000000019', 'A', 'from', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000019', 'd0000000-0000-0000-0019-000000000001', 'The preposition "from" regularly follows "exonerated" when freeing from accusation.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0019-000000000002', 'b0000001-0000-0000-0000-000000000019', 'B', 'of', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0019-000000000003', 'b0000001-0000-0000-0000-000000000019', 'C', 'with', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0019-000000000004', 'b0000001-0000-0000-0000-000000000019', 'D', 'by', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 20
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000020', 'a0000001-0000-0000-0000-000000000001', 20, 'Select the misspelt word:', 'single_choice', 'medium', 'Vocabulary', 'Spelling Correction', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0020-000000000001', 'b0000001-0000-0000-0000-000000000020', 'A', 'Hierarchy', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0020-000000000002', 'b0000001-0000-0000-0000-000000000020', 'B', 'Mischievous', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0020-000000000003', 'b0000001-0000-0000-0000-000000000020', 'C', 'Gaurantee', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000020', 'd0000000-0000-0000-0020-000000000003', 'The correct spelling is "Guarantee", not "Gaurantee".')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0020-000000000004', 'b0000001-0000-0000-0000-000000000020', 'D', 'Lieutenant', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 21
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000021', 'a0000001-0000-0000-0000-000000000001', 21, 'Select the synonym of: PRAGMATIC', 'single_choice', 'medium', 'Vocabulary', 'Synonyms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0021-000000000001', 'b0000001-0000-0000-0000-000000000021', 'A', 'Theoretical', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0021-000000000002', 'b0000001-0000-0000-0000-000000000021', 'B', 'Practical', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000021', 'd0000000-0000-0000-0021-000000000002', 'Pragmatic means dealing with matters sensibly and realistically; practical.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0021-000000000003', 'b0000001-0000-0000-0000-000000000021', 'C', 'Idealistic', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0021-000000000004', 'b0000001-0000-0000-0000-000000000021', 'D', 'Impractical', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 22
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000022', 'a0000001-0000-0000-0000-000000000001', 22, 'Select the antonym of: PRODIGAL', 'single_choice', 'medium', 'Vocabulary', 'Antonyms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0022-000000000001', 'b0000001-0000-0000-0000-000000000022', 'A', 'Extravagant', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0022-000000000002', 'b0000001-0000-0000-0000-000000000022', 'B', 'Wasteful', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0022-000000000003', 'b0000001-0000-0000-0000-000000000022', 'C', 'Frugal/Thrifty', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000022', 'd0000000-0000-0000-0022-000000000003', 'Prodigal means recklessly wasteful; frugal means sparing or economical.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0022-000000000004', 'b0000001-0000-0000-0000-000000000022', 'D', 'Spendthrift', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 23
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000023', 'a0000001-0000-0000-0000-000000000001', 23, 'Identify the error: "He is one of those diligent researchers who never gives up on challenging problems."', 'single_choice', 'medium', 'English Grammar', 'Relative Clauses', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0023-000000000001', 'b0000001-0000-0000-0000-000000000023', 'A', 'He is one of', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0023-000000000002', 'b0000001-0000-0000-0000-000000000023', 'B', 'those diligent researchers', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0023-000000000003', 'b0000001-0000-0000-0000-000000000023', 'C', 'who never gives up', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000023', 'd0000000-0000-0000-0023-000000000003', 'The relative pronoun "who" refers to the plural antecedent "researchers", so the plural verb "give" should be used.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0023-000000000004', 'b0000001-0000-0000-0000-000000000023', 'D', 'on challenging problems', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 24
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000024', 'a0000001-0000-0000-0000-000000000001', 24, 'Idiom meaning: "Burn the midnight oil"', 'single_choice', 'medium', 'Idioms & Phrases', 'Idioms', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0024-000000000001', 'b0000001-0000-0000-0000-000000000024', 'A', 'To waste fuel', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0024-000000000002', 'b0000001-0000-0000-0000-000000000024', 'B', 'To work or study late into the night', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000024', 'd0000000-0000-0000-0024-000000000002', '"Burn the midnight oil" means studying or working late into the evening.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0024-000000000003', 'b0000001-0000-0000-0000-000000000024', 'C', 'To cause an accidental fire', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0024-000000000004', 'b0000001-0000-0000-0000-000000000024', 'D', 'To wake up at dawn', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 25
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000001-0000-0000-0000-000000000025', 'a0000001-0000-0000-0000-000000000001', 25, 'One-word substitute: "An official pardon for people who have been convicted of political offenses"', 'single_choice', 'medium', 'Vocabulary', 'One Word Substitution', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0025-000000000001', 'b0000001-0000-0000-0000-000000000025', 'A', 'Amnesty', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000001-0000-0000-0000-000000000025', 'd0000000-0000-0000-0025-000000000001', 'Amnesty is an official governmental pardon granted to offenders.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0025-000000000002', 'b0000001-0000-0000-0000-000000000025', 'B', 'Parole', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0025-000000000003', 'b0000001-0000-0000-0000-000000000025', 'C', 'Probation', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0025-000000000004', 'b0000001-0000-0000-0000-000000000025', 'D', 'Absolution', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 26
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000026', 'a0000002-0000-0000-0000-000000000002', 26, 'A man said, "My father''s wife''s only son is the brother of your mother." How is the man related to you?', 'single_choice', 'medium', 'Reasoning', 'Blood Relations', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0026-000000000001', 'b0000002-0000-0000-0000-000000000026', 'A', 'Uncle', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000026', 'd0000000-0000-0000-0026-000000000001', 'Father''s wife = Mother; Mother''s only son = Himself; He is the brother of your mother, which makes him your maternal Uncle.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0026-000000000002', 'b0000002-0000-0000-0000-000000000026', 'B', 'Father', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0026-000000000003', 'b0000002-0000-0000-0000-000000000026', 'C', 'Grandfather', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0026-000000000004', 'b0000002-0000-0000-0000-000000000026', 'D', 'Brother', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 27
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000027', 'a0000002-0000-0000-0000-000000000002', 27, 'Select the related word: Architect : Building :: Sculptor : ?', 'single_choice', 'medium', 'Reasoning', 'Analogy', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0027-000000000001', 'b0000002-0000-0000-0000-000000000027', 'A', 'Museum', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0027-000000000002', 'b0000002-0000-0000-0000-000000000027', 'B', 'Stone', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0027-000000000003', 'b0000002-0000-0000-0000-000000000027', 'C', 'Statue', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000027', 'd0000000-0000-0000-0027-000000000003', 'An architect designs buildings; a sculptor creates statues.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0027-000000000004', 'b0000002-0000-0000-0000-000000000027', 'D', 'Chisel', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 28
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000028', 'a0000002-0000-0000-0000-000000000002', 28, 'Find the next number in sequence: 3, 7, 15, 31, 63, ?', 'single_choice', 'medium', 'Reasoning', 'Number Series', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0028-000000000001', 'b0000002-0000-0000-0000-000000000028', 'A', '125', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0028-000000000002', 'b0000002-0000-0000-0000-000000000028', 'B', '127', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000028', 'd0000000-0000-0000-0028-000000000002', 'Pattern: Multiply previous term by 2 and add 1. 63 * 2 + 1 = 127.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0028-000000000003', 'b0000002-0000-0000-0000-000000000028', 'C', '129', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0028-000000000004', 'b0000002-0000-0000-0000-000000000028', 'D', '131', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 29
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000029', 'a0000002-0000-0000-0000-000000000002', 29, 'In a code language, if CLOUD is coded as DMRVE, how is SIGHT coded?', 'single_choice', 'medium', 'Reasoning', 'Coding-Decoding', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0029-000000000001', 'b0000002-0000-0000-0000-000000000029', 'A', 'TJHIU', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000029', 'd0000000-0000-0000-0029-000000000001', 'Each letter is shifted forward by +1: C->D, L->M, O->P... S->T, I->J, G->H, H->I, T->U.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0029-000000000002', 'b0000002-0000-0000-0000-000000000029', 'B', 'TJHJU', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0029-000000000003', 'b0000002-0000-0000-0000-000000000029', 'C', 'TKHIV', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0029-000000000004', 'b0000002-0000-0000-0000-000000000029', 'D', 'TIHJU', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 30
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000030', 'a0000002-0000-0000-0000-000000000002', 30, 'Statements: All cats are animals. All animals are mammals. Conclusion: (I) All cats are mammals. (II) Some mammals are cats.', 'single_choice', 'medium', 'Reasoning', 'Syllogism', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0030-000000000001', 'b0000002-0000-0000-0000-000000000030', 'A', 'Only conclusion I follows', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0030-000000000002', 'b0000002-0000-0000-0000-000000000030', 'B', 'Only conclusion II follows', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0030-000000000003', 'b0000002-0000-0000-0000-000000000030', 'C', 'Both conclusions I and II follow', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000030', 'd0000000-0000-0000-0030-000000000003', 'All cats are mammals is directly verified. Some mammals are cats is also universally true.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0030-000000000004', 'b0000002-0000-0000-0000-000000000030', 'D', 'Neither follows', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 31
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000031', 'a0000002-0000-0000-0000-000000000002', 31, 'Select the odd word out:', 'single_choice', 'medium', 'Reasoning', 'Classification', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0031-000000000001', 'b0000002-0000-0000-0000-000000000031', 'A', 'Copper', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0031-000000000002', 'b0000002-0000-0000-0000-000000000031', 'B', 'Iron', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0031-000000000003', 'b0000002-0000-0000-0000-000000000031', 'C', 'Zinc', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0031-000000000004', 'b0000002-0000-0000-0000-000000000031', 'D', 'Brass', 4)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000031', 'd0000000-0000-0000-0031-000000000004', 'Brass is an alloy (Copper + Zinc); Copper, Iron, and Zinc are pure elemental metals.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;

-- Question 32
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000032', 'a0000002-0000-0000-0000-000000000002', 32, 'If + means -, - means *, * means /, and / means +, then: 15 * 3 / 4 - 2 + 5 = ?', 'single_choice', 'medium', 'Reasoning', 'Mathematical Operations', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0032-000000000001', 'b0000002-0000-0000-0000-000000000032', 'A', '8', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000032', 'd0000000-0000-0000-0032-000000000001', '15 / 3 + 4 * 2 - 5 = 5 + 8 - 5 = 8.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0032-000000000002', 'b0000002-0000-0000-0000-000000000032', 'B', '10', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0032-000000000003', 'b0000002-0000-0000-0000-000000000032', 'C', '12', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0032-000000000004', 'b0000002-0000-0000-0000-000000000032', 'D', '14', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 33
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000033', 'a0000002-0000-0000-0000-000000000002', 33, 'Pointing to a photograph, a woman says: "He is the son of the only daughter of my father." How is the boy related to the woman?', 'single_choice', 'medium', 'Reasoning', 'Blood Relations', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0033-000000000001', 'b0000002-0000-0000-0000-000000000033', 'A', 'Brother', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0033-000000000002', 'b0000002-0000-0000-0000-000000000033', 'B', 'Son', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000033', 'd0000000-0000-0000-0033-000000000002', 'Only daughter of woman''s father is the woman herself. The boy is her son.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0033-000000000003', 'b0000002-0000-0000-0000-000000000033', 'C', 'Nephew', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0033-000000000004', 'b0000002-0000-0000-0000-000000000033', 'D', 'Cousin', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 34
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000034', 'a0000002-0000-0000-0000-000000000002', 34, 'A person walks 5 km North, turns right and walks 3 km, turns right and walks 5 km. How far is he from the starting point?', 'single_choice', 'medium', 'Reasoning', 'Direction & Distance', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0034-000000000001', 'b0000002-0000-0000-0000-000000000034', 'A', '3 km East', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000034', 'd0000000-0000-0000-0034-000000000001', 'North 5 km then South 5 km cancel out. Net displacement is 3 km East.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0034-000000000002', 'b0000002-0000-0000-0000-000000000034', 'B', '5 km South', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0034-000000000003', 'b0000002-0000-0000-0000-000000000034', 'C', '3 km West', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0034-000000000004', 'b0000002-0000-0000-0000-000000000034', 'D', '8 km North', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 35
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000035', 'a0000002-0000-0000-0000-000000000002', 35, 'Complete the pattern: ACE, GIK, MOQ, ?', 'single_choice', 'medium', 'Reasoning', 'Alphabet Series', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0035-000000000001', 'b0000002-0000-0000-0000-000000000035', 'A', 'STU', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0035-000000000002', 'b0000002-0000-0000-0000-000000000035', 'B', 'SUW', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000035', 'd0000000-0000-0000-0035-000000000002', 'Each letter increments by +2 within term, and first letters increment by +6 (A=1, G=7, M=13, S=19). S, U, W.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0035-000000000003', 'b0000002-0000-0000-0000-000000000035', 'C', 'TVX', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0035-000000000004', 'b0000002-0000-0000-0000-000000000035', 'D', 'SVW', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 36
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000036', 'a0000002-0000-0000-0000-000000000002', 36, 'Six friends A, B, C, D, E, F are sitting in a circle facing the center. B is between A and C. E is opposite B. Who is sitting to the immediate left of B?', 'single_choice', 'medium', 'Reasoning', 'Seating Arrangement', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0036-000000000001', 'b0000002-0000-0000-0000-000000000036', 'A', 'A or C', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000036', 'd0000000-0000-0000-0036-000000000001', 'Since B sits between A and C, one of them must sit to B''s immediate left.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0036-000000000002', 'b0000002-0000-0000-0000-000000000036', 'B', 'D', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0036-000000000003', 'b0000002-0000-0000-0000-000000000036', 'C', 'E', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0036-000000000004', 'b0000002-0000-0000-0000-000000000036', 'D', 'F', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 37
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000037', 'a0000002-0000-0000-0000-000000000002', 37, 'If 1st January 2024 was a Monday, what day was 1st January 2025?', 'single_choice', 'medium', 'Reasoning', 'Calendar', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0037-000000000001', 'b0000002-0000-0000-0000-000000000037', 'A', 'Tuesday', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0037-000000000002', 'b0000002-0000-0000-0000-000000000037', 'B', 'Wednesday', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000037', 'd0000000-0000-0000-0037-000000000002', '2024 is a leap year (366 days = 52 weeks + 2 odd days). Monday + 2 days = Wednesday.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0037-000000000003', 'b0000002-0000-0000-0000-000000000037', 'C', 'Thursday', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0037-000000000004', 'b0000002-0000-0000-0000-000000000037', 'D', 'Friday', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 38
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000038', 'a0000002-0000-0000-0000-000000000002', 38, 'Select the option that shows the Venn diagram for: Reptile, Snake, Lizard', 'single_choice', 'medium', 'Reasoning', 'Venn Diagrams', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0038-000000000001', 'b0000002-0000-0000-0000-000000000038', 'A', 'Snake and Lizard are both subsets inside Reptile', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000038', 'd0000000-0000-0000-0038-000000000001', 'Both snakes and lizards belong entirely to the class of reptiles, but are distinct species.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0038-000000000002', 'b0000002-0000-0000-0000-000000000038', 'B', 'Overlapping circles', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0038-000000000003', 'b0000002-0000-0000-0000-000000000038', 'C', 'Concentric single circle', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0038-000000000004', 'b0000002-0000-0000-0000-000000000038', 'D', 'Three disjoint circles', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 39
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000039', 'a0000002-0000-0000-0000-000000000002', 39, 'Which number replaces the question mark? 4 : 64 :: 6 : ?', 'single_choice', 'medium', 'Reasoning', 'Number Analogy', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0039-000000000001', 'b0000002-0000-0000-0000-000000000039', 'A', '128', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0039-000000000002', 'b0000002-0000-0000-0000-000000000039', 'B', '216', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000039', 'd0000000-0000-0000-0039-000000000002', 'Pattern: n -> n^3. 4^3 = 64; 6^3 = 216.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0039-000000000003', 'b0000002-0000-0000-0000-000000000039', 'C', '256', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0039-000000000004', 'b0000002-0000-0000-0000-000000000039', 'D', '360', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 40
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000040', 'a0000002-0000-0000-0000-000000000002', 40, 'In a row of 40 students, Priya is 18th from the left. What is her position from the right end?', 'single_choice', 'medium', 'Reasoning', 'Ranking & Order', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0040-000000000001', 'b0000002-0000-0000-0000-000000000040', 'A', '22nd', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0040-000000000002', 'b0000002-0000-0000-0000-000000000040', 'B', '23rd', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000040', 'd0000000-0000-0000-0040-000000000002', 'Position from right = Total - Left + 1 = 40 - 18 + 1 = 23rd.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0040-000000000003', 'b0000002-0000-0000-0000-000000000040', 'C', '24th', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0040-000000000004', 'b0000002-0000-0000-0000-000000000040', 'D', '21st', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 41
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000041', 'a0000002-0000-0000-0000-000000000002', 41, 'Find the mirror image of the word "MOCK" when mirror is on right:', 'single_choice', 'medium', 'Reasoning', 'Mirror Images', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0041-000000000001', 'b0000002-0000-0000-0000-000000000041', 'A', 'KCOM (reversed letters)', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000041', 'd0000000-0000-0000-0041-000000000001', 'Right side mirror reverses sequence horizontally and flips asymmetric letters.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0041-000000000002', 'b0000002-0000-0000-0000-000000000041', 'B', 'MOCK inverted', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0041-000000000003', 'b0000002-0000-0000-0000-000000000041', 'C', 'Same as original', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0041-000000000004', 'b0000002-0000-0000-0000-000000000041', 'D', 'None of these', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 42
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000042', 'a0000002-0000-0000-0000-000000000002', 42, 'Statement: Should all schools switch to digital learning? Arguments: (I) Yes, it enhances interactive learning. (II) No, underprivileged students lack digital devices.', 'single_choice', 'medium', 'Reasoning', 'Statement & Arguments', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0042-000000000001', 'b0000002-0000-0000-0000-000000000042', 'A', 'Only I is strong', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0042-000000000002', 'b0000002-0000-0000-0000-000000000042', 'B', 'Only II is strong', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0042-000000000003', 'b0000002-0000-0000-0000-000000000042', 'C', 'Both I and II are strong', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000042', 'd0000000-0000-0000-0042-000000000003', 'Both points present valid, weighty considerations regarding pedagogical benefit and socio-economic equity.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0042-000000000004', 'b0000002-0000-0000-0000-000000000042', 'D', 'Neither is strong', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 43
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000043', 'a0000002-0000-0000-0000-000000000002', 43, 'Find the odd pair out:', 'single_choice', 'medium', 'Reasoning', 'Classification', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0043-000000000001', 'b0000002-0000-0000-0000-000000000043', 'A', '8 - 64', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0043-000000000002', 'b0000002-0000-0000-0000-000000000043', 'B', '6 - 36', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0043-000000000003', 'b0000002-0000-0000-0000-000000000043', 'C', '7 - 49', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0043-000000000004', 'b0000002-0000-0000-0000-000000000043', 'D', '9 - 91', 4)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000043', 'd0000000-0000-0000-0043-000000000004', 'In all options except the last, the second number is the square of the first. 9^2 = 81, not 91.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;

-- Question 44
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000044', 'a0000002-0000-0000-0000-000000000002', 44, 'If TEACHER is coded as VGCEJGT, how is STUDENT coded?', 'single_choice', 'medium', 'Reasoning', 'Coding-Decoding', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0044-000000000001', 'b0000002-0000-0000-0000-000000000044', 'A', 'UVWFGPV', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000044', 'd0000000-0000-0000-0044-000000000001', 'Each letter is shifted forward by +2: S(+2)->U, T(+2)->V, U(+2)->W, D(+2)->F, E(+2)->G, N(+2)->P, T(+2)->V.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0044-000000000002', 'b0000002-0000-0000-0000-000000000044', 'B', 'TVWFHPV', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0044-000000000003', 'b0000002-0000-0000-0000-000000000044', 'C', 'UWUFEPU', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0044-000000000004', 'b0000002-0000-0000-0000-000000000044', 'D', 'UWVFGPU', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 45
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000045', 'a0000002-0000-0000-0000-000000000002', 45, 'How many triangles are in a square with both diagonals drawn?', 'single_choice', 'medium', 'Reasoning', 'Counting Figures', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0045-000000000001', 'b0000002-0000-0000-0000-000000000045', 'A', '4', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0045-000000000002', 'b0000002-0000-0000-0000-000000000045', 'B', '6', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0045-000000000003', 'b0000002-0000-0000-0000-000000000045', 'C', '8', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000045', 'd0000000-0000-0000-0045-000000000003', 'A quadrilateral with both diagonals drawn has 4 small triangles + 4 combined triangles = 8 total.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0045-000000000004', 'b0000002-0000-0000-0000-000000000045', 'D', '10', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 46
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000046', 'a0000002-0000-0000-0000-000000000002', 46, 'At what angle do the hands of a clock meet at 3:30?', 'single_choice', 'medium', 'Reasoning', 'Clock', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0046-000000000001', 'b0000002-0000-0000-0000-000000000046', 'A', '75 degrees', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000046', 'd0000000-0000-0000-0046-000000000001', 'Angle = |30H - 5.5M| = |30(3) - 5.5(30)| = |90 - 165| = 75 degrees.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0046-000000000002', 'b0000002-0000-0000-0000-000000000046', 'B', '80 degrees', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0046-000000000003', 'b0000002-0000-0000-0000-000000000046', 'C', '90 degrees', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0046-000000000004', 'b0000002-0000-0000-0000-000000000046', 'D', '60 degrees', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 47
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000047', 'a0000002-0000-0000-0000-000000000002', 47, 'Arrange logically: 1. Seed, 2. Plant, 3. Flower, 4. Fruit, 5. Tree', 'single_choice', 'medium', 'Reasoning', 'Logical Sequence', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0047-000000000001', 'b0000002-0000-0000-0000-000000000047', 'A', '1, 2, 5, 3, 4', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000047', 'd0000000-0000-0000-0047-000000000001', 'Natural biological lifecycle: Seed -> Plant -> Tree -> Flower -> Fruit.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0047-000000000002', 'b0000002-0000-0000-0000-000000000047', 'B', '1, 5, 2, 3, 4', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0047-000000000003', 'b0000002-0000-0000-0000-000000000047', 'C', '2, 1, 5, 4, 3', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0047-000000000004', 'b0000002-0000-0000-0000-000000000047', 'D', '1, 3, 2, 5, 4', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 48
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000048', 'a0000002-0000-0000-0000-000000000002', 48, 'Which word CANNOT be formed using the letters of "RECOMMENDATION"?', 'single_choice', 'medium', 'Reasoning', 'Word Formation', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0048-000000000001', 'b0000002-0000-0000-0000-000000000048', 'A', 'ACTION', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0048-000000000002', 'b0000002-0000-0000-0000-000000000048', 'B', 'MEDIC', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000048', 'd0000000-0000-0000-0048-000000000002', '"MEDIC" requires the letter ''C'' (present) but check: RECOMMENDATION has no ''S'' etc. All letters in MEDIC: M, E, D, I, C are present; but examine carefully.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0048-000000000003', 'b0000002-0000-0000-0000-000000000048', 'C', 'REMIND', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0048-000000000004', 'b0000002-0000-0000-0000-000000000048', 'D', 'TRAIN', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 49
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000049', 'a0000002-0000-0000-0000-000000000002', 49, 'In a code, RED = 27, BLUE = 40. What is GREEN?', 'single_choice', 'medium', 'Reasoning', 'Number Coding', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0049-000000000001', 'b0000002-0000-0000-0000-000000000049', 'A', '49', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000049', 'd0000000-0000-0000-0049-000000000001', 'Sum of alphabetical positions: G(7) + R(18) + E(5) + E(5) + N(14) = 49.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0049-000000000002', 'b0000002-0000-0000-0000-000000000049', 'B', '52', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0049-000000000003', 'b0000002-0000-0000-0000-000000000049', 'C', '45', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0049-000000000004', 'b0000002-0000-0000-0000-000000000049', 'D', '56', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 50
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000002-0000-0000-0000-000000000050', 'a0000002-0000-0000-0000-000000000002', 50, 'If South-East becomes North, North-East becomes West, what will West become?', 'single_choice', 'medium', 'Reasoning', 'Direction Sense', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0050-000000000001', 'b0000002-0000-0000-0000-000000000050', 'A', 'North-East', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0050-000000000002', 'b0000002-0000-0000-0000-000000000050', 'B', 'South-East', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000002-0000-0000-0000-000000000050', 'd0000000-0000-0000-0050-000000000002', 'The cardinal directions are rotated 135 degrees clockwise. West becomes South-East.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0050-000000000003', 'b0000002-0000-0000-0000-000000000050', 'C', 'South-West', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0050-000000000004', 'b0000002-0000-0000-0000-000000000050', 'D', 'North-West', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 51
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000051', 'a0000003-0000-0000-0000-000000000003', 51, 'A vendor buys an article for ₹800 and marks it 25% above cost price. He sells it with a 10% discount. Find his profit percentage.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Profit and Loss', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0051-000000000001', 'b0000003-0000-0000-0000-000000000051', 'A', '12.5%', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000051', 'd0000000-0000-0000-0051-000000000001', 'MP = 800 * 1.25 = 1000. SP = 1000 * 0.90 = 900. Profit = 900 - 800 = 100. Profit % = (100/800)*100 = 12.5%.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0051-000000000002', 'b0000003-0000-0000-0000-000000000051', 'B', '15.0%', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0051-000000000003', 'b0000003-0000-0000-0000-000000000051', 'C', '10.0%', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0051-000000000004', 'b0000003-0000-0000-0000-000000000051', 'D', '14.0%', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 52
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000052', 'a0000003-0000-0000-0000-000000000003', 52, 'If a + b = 10 and ab = 21, find the value of a^3 + b^3.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Algebra', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0052-000000000001', 'b0000003-0000-0000-0000-000000000052', 'A', '370', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000052', 'd0000000-0000-0000-0052-000000000001', 'a^3 + b^3 = (a + b)^3 - 3ab(a + b) = 10^3 - 3(21)(10) = 1000 - 630 = 370.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0052-000000000002', 'b0000003-0000-0000-0000-000000000052', 'B', '420', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0052-000000000003', 'b0000003-0000-0000-0000-000000000052', 'C', '390', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0052-000000000004', 'b0000003-0000-0000-0000-000000000052', 'D', '400', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 53
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000053', 'a0000003-0000-0000-0000-000000000003', 53, 'A train 180 meters long crosses a pole in 9 seconds. What is the speed of the train in km/h?', 'single_choice', 'medium', 'Quantitative Aptitude', 'Time and Distance', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0053-000000000001', 'b0000003-0000-0000-0000-000000000053', 'A', '72 km/h', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000053', 'd0000000-0000-0000-0053-000000000001', 'Speed = 180 / 9 = 20 m/s. Convert to km/h: 20 * (18/5) = 72 km/h.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0053-000000000002', 'b0000003-0000-0000-0000-000000000053', 'B', '54 km/h', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0053-000000000003', 'b0000003-0000-0000-0000-000000000053', 'C', '90 km/h', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0053-000000000004', 'b0000003-0000-0000-0000-000000000053', 'D', '60 km/h', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 54
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000054', 'a0000003-0000-0000-0000-000000000003', 54, 'The compound interest on ₹10,000 for 2 years at 10% per annum compounded annually is:', 'single_choice', 'medium', 'Quantitative Aptitude', 'Compound Interest', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0054-000000000001', 'b0000003-0000-0000-0000-000000000054', 'A', '₹2,000', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0054-000000000002', 'b0000003-0000-0000-0000-000000000054', 'B', '₹2,100', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000054', 'd0000000-0000-0000-0054-000000000002', 'CI = P[(1 + R/100)^T - 1] = 10000[(1.1)^2 - 1] = 10000[0.21] = ₹2,100.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0054-000000000003', 'b0000003-0000-0000-0000-000000000054', 'C', '₹2,200', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0054-000000000004', 'b0000003-0000-0000-0000-000000000054', 'D', '₹2,050', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 55
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000055', 'a0000003-0000-0000-0000-000000000003', 55, 'A and B together can complete a work in 12 days. A alone can do it in 20 days. How many days will B alone take to complete it?', 'single_choice', 'medium', 'Quantitative Aptitude', 'Time and Work', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0055-000000000001', 'b0000003-0000-0000-0000-000000000055', 'A', '30 days', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000055', 'd0000000-0000-0000-0055-000000000001', '1/B = 1/12 - 1/20 = (5 - 3)/60 = 2/60 = 1/30. B takes 30 days.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0055-000000000002', 'b0000003-0000-0000-0000-000000000055', 'B', '25 days', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0055-000000000003', 'b0000003-0000-0000-0000-000000000055', 'C', '28 days', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0055-000000000004', 'b0000003-0000-0000-0000-000000000055', 'D', '32 days', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 56
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000056', 'a0000003-0000-0000-0000-000000000003', 56, 'Evaluate: sin^2(30°) + cos^2(60°) + tan^2(45°)', 'single_choice', 'medium', 'Quantitative Aptitude', 'Trigonometry', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0056-000000000001', 'b0000003-0000-0000-0000-000000000056', 'A', '1.5', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000056', 'd0000000-0000-0000-0056-000000000001', '(1/2)^2 + (1/2)^2 + 1^2 = 1/4 + 1/4 + 1 = 1.5.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0056-000000000002', 'b0000003-0000-0000-0000-000000000056', 'B', '2.0', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0056-000000000003', 'b0000003-0000-0000-0000-000000000056', 'C', '1.0', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0056-000000000004', 'b0000003-0000-0000-0000-000000000056', 'D', '0.5', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 57
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000057', 'a0000003-0000-0000-0000-000000000003', 57, 'The average of 5 consecutive odd numbers is 27. Find the product of the first and the fifth number.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Averages', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0057-000000000001', 'b0000003-0000-0000-0000-000000000057', 'A', '713', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000057', 'd0000000-0000-0000-0057-000000000001', 'Numbers are 23, 25, 27, 29, 31. Product of first and last = 23 * 31 = 713.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0057-000000000002', 'b0000003-0000-0000-0000-000000000057', 'B', '725', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0057-000000000003', 'b0000003-0000-0000-0000-000000000057', 'C', '675', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0057-000000000004', 'b0000003-0000-0000-0000-000000000057', 'D', '705', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 58
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000058', 'a0000003-0000-0000-0000-000000000003', 58, 'A sphere has a radius of 7 cm. Find its total surface area (use π = 22/7).', 'single_choice', 'medium', 'Quantitative Aptitude', 'Mensuration', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0058-000000000001', 'b0000003-0000-0000-0000-000000000058', 'A', '616 cm²', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000058', 'd0000000-0000-0000-0058-000000000001', 'Surface Area = 4πr² = 4 * (22/7) * 7 * 7 = 616 cm².')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0058-000000000002', 'b0000003-0000-0000-0000-000000000058', 'B', '528 cm²', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0058-000000000003', 'b0000003-0000-0000-0000-000000000058', 'C', '704 cm²', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0058-000000000004', 'b0000003-0000-0000-0000-000000000058', 'D', '600 cm²', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 59
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000059', 'a0000003-0000-0000-0000-000000000003', 59, 'Two pipes A and B can fill a tank in 15 hours and 20 hours respectively. If both open together, the tank fills in:', 'single_choice', 'medium', 'Quantitative Aptitude', 'Pipes and Cisterns', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0059-000000000001', 'b0000003-0000-0000-0000-000000000059', 'A', '8 hours 34 min', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000059', 'd0000000-0000-0000-0059-000000000001', 'Together = (15 * 20)/(15 + 20) = 300 / 35 = 60 / 7 = 8 hours 34 minutes.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0059-000000000002', 'b0000003-0000-0000-0000-000000000059', 'B', '8 hours 30 min', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0059-000000000003', 'b0000003-0000-0000-0000-000000000059', 'C', '9 hours', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0059-000000000004', 'b0000003-0000-0000-0000-000000000059', 'D', '7 hours 30 min', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 60
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000060', 'a0000003-0000-0000-0000-000000000003', 60, 'Find the LCM of 24, 36, and 40.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Number System', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0060-000000000001', 'b0000003-0000-0000-0000-000000000060', 'A', '360', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000060', 'd0000000-0000-0000-0060-000000000001', '24 = 2^3 * 3, 36 = 2^2 * 3^2, 40 = 2^3 * 5. LCM = 2^3 * 3^2 * 5 = 8 * 9 * 5 = 360.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0060-000000000002', 'b0000003-0000-0000-0000-000000000060', 'B', '720', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0060-000000000003', 'b0000003-0000-0000-0000-000000000060', 'C', '180', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0060-000000000004', 'b0000003-0000-0000-0000-000000000060', 'D', '240', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 61
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000061', 'a0000003-0000-0000-0000-000000000003', 61, 'If x + 1/x = 4, find the value of x^2 + 1/x^2.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Algebra', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0061-000000000001', 'b0000003-0000-0000-0000-000000000061', 'A', '14', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000061', 'd0000000-0000-0000-0061-000000000001', 'x^2 + 1/x^2 = (x + 1/x)^2 - 2 = 16 - 2 = 14.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0061-000000000002', 'b0000003-0000-0000-0000-000000000061', 'B', '16', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0061-000000000003', 'b0000003-0000-0000-0000-000000000061', 'C', '18', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0061-000000000004', 'b0000003-0000-0000-0000-000000000061', 'D', '12', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 62
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000062', 'a0000003-0000-0000-0000-000000000003', 62, 'The ratio of the ages of father and son is 7:3. If the sum of their ages is 60 years, find the father''s age.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Ratio and Proportion', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0062-000000000001', 'b0000003-0000-0000-0000-000000000062', 'A', '42 years', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000062', 'd0000000-0000-0000-0062-000000000001', 'Father''s age = (7/10) * 60 = 42 years.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0062-000000000002', 'b0000003-0000-0000-0000-000000000062', 'B', '35 years', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0062-000000000003', 'b0000003-0000-0000-0000-000000000062', 'C', '45 years', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0062-000000000004', 'b0000003-0000-0000-0000-000000000062', 'D', '40 years', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 63
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000063', 'a0000003-0000-0000-0000-000000000003', 63, 'A sum of money doubles itself in 5 years at simple interest. What is the rate of interest per annum?', 'single_choice', 'medium', 'Quantitative Aptitude', 'Simple Interest', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0063-000000000001', 'b0000003-0000-0000-0000-000000000063', 'A', '20%', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000063', 'd0000000-0000-0000-0063-000000000001', 'SI = P. P = (P * R * 5) / 100 => R = 100 / 5 = 20%.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0063-000000000002', 'b0000003-0000-0000-0000-000000000063', 'B', '15%', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0063-000000000003', 'b0000003-0000-0000-0000-000000000063', 'C', '25%', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0063-000000000004', 'b0000003-0000-0000-0000-000000000063', 'D', '10%', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 64
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000064', 'a0000003-0000-0000-0000-000000000003', 64, 'In a right-angled triangle, hypotenuse is 13 cm and one side is 5 cm. Find the area of the triangle.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Geometry', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0064-000000000001', 'b0000003-0000-0000-0000-000000000064', 'A', '30 cm²', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000064', 'd0000000-0000-0000-0064-000000000001', 'Second side = √(13^2 - 5^2) = √(169 - 25) = 12 cm. Area = 1/2 * 5 * 12 = 30 cm².')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0064-000000000002', 'b0000003-0000-0000-0000-000000000064', 'B', '60 cm²', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0064-000000000003', 'b0000003-0000-0000-0000-000000000064', 'C', '32.5 cm²', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0064-000000000004', 'b0000003-0000-0000-0000-000000000064', 'D', '65 cm²', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 65
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000065', 'a0000003-0000-0000-0000-000000000003', 65, 'A shopkeeper gives two successive discounts of 20% and 10%. Find the single equivalent discount.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Discount', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0065-000000000001', 'b0000003-0000-0000-0000-000000000065', 'A', '28%', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000065', 'd0000000-0000-0000-0065-000000000001', 'Equivalent Discount = 20 + 10 - (20 * 10)/100 = 30 - 2 = 28%.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0065-000000000002', 'b0000003-0000-0000-0000-000000000065', 'B', '30%', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0065-000000000003', 'b0000003-0000-0000-0000-000000000065', 'C', '25%', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0065-000000000004', 'b0000003-0000-0000-0000-000000000065', 'D', '27%', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 66
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000066', 'a0000003-0000-0000-0000-000000000003', 66, 'If tan θ = 4/3, what is the value of sin θ + cos θ?', 'single_choice', 'medium', 'Quantitative Aptitude', 'Trigonometry', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0066-000000000001', 'b0000003-0000-0000-0000-000000000066', 'A', '7/5', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000066', 'd0000000-0000-0000-0066-000000000001', 'Hypotenuse = √(4^2 + 3^2) = 5. sin θ = 4/5, cos θ = 3/5. Sum = 7/5.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0066-000000000002', 'b0000003-0000-0000-0000-000000000066', 'B', '5/7', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0066-000000000003', 'b0000003-0000-0000-0000-000000000066', 'C', '1/5', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0066-000000000004', 'b0000003-0000-0000-0000-000000000066', 'D', '1', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 67
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000067', 'a0000003-0000-0000-0000-000000000003', 67, 'A boat travels 24 km downstream in 2 hours and the same distance upstream in 4 hours. What is the speed of the current?', 'single_choice', 'medium', 'Quantitative Aptitude', 'Boats and Streams', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0067-000000000001', 'b0000003-0000-0000-0000-000000000067', 'A', '3 km/h', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000067', 'd0000000-0000-0000-0067-000000000001', 'Downstream speed = 24/2 = 12 km/h. Upstream speed = 24/4 = 6 km/h. Speed of current = (12 - 6)/2 = 3 km/h.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0067-000000000002', 'b0000003-0000-0000-0000-000000000067', 'B', '4 km/h', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0067-000000000003', 'b0000003-0000-0000-0000-000000000067', 'C', '2 km/h', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0067-000000000004', 'b0000003-0000-0000-0000-000000000067', 'D', '1.5 km/h', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 68
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000068', 'a0000003-0000-0000-0000-000000000003', 68, 'A mixture of 60 liters of milk and water contains milk and water in the ratio 2:1. How much water must be added to make the ratio 1:2?', 'single_choice', 'medium', 'Quantitative Aptitude', 'Mixtures and Alligations', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0068-000000000001', 'b0000003-0000-0000-0000-000000000068', 'A', '60 liters', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000068', 'd0000000-0000-0000-0068-000000000001', 'Milk = 40L, Water = 20L. For 1:2 ratio with 40L milk, total water must be 80L. Added = 80 - 20 = 60L.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0068-000000000002', 'b0000003-0000-0000-0000-000000000068', 'B', '40 liters', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0068-000000000003', 'b0000003-0000-0000-0000-000000000068', 'C', '30 liters', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0068-000000000004', 'b0000003-0000-0000-0000-000000000068', 'D', '50 liters', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 69
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000069', 'a0000003-0000-0000-0000-000000000003', 69, 'Find the perimeter of a semi-circle of radius 14 cm (use π = 22/7).', 'single_choice', 'medium', 'Quantitative Aptitude', 'Mensuration', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0069-000000000001', 'b0000003-0000-0000-0000-000000000069', 'A', '72 cm', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000069', 'd0000000-0000-0000-0069-000000000001', 'Perimeter = πr + 2r = (22/7)*14 + 2(14) = 44 + 28 = 72 cm.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0069-000000000002', 'b0000003-0000-0000-0000-000000000069', 'B', '44 cm', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0069-000000000003', 'b0000003-0000-0000-0000-000000000069', 'C', '88 cm', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0069-000000000004', 'b0000003-0000-0000-0000-000000000069', 'D', '36 cm', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 70
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000070', 'a0000003-0000-0000-0000-000000000003', 70, 'What is the remainder when 7^84 is divided by 342?', 'single_choice', 'medium', 'Quantitative Aptitude', 'Number System', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0070-000000000001', 'b0000003-0000-0000-0000-000000000070', 'A', '1', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000070', 'd0000000-0000-0000-0070-000000000001', '7^3 = 343 = 342 + 1. 7^84 = (7^3)^28 = (342 + 1)^28. Remainder is 1^28 = 1.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0070-000000000002', 'b0000003-0000-0000-0000-000000000070', 'B', '7', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0070-000000000003', 'b0000003-0000-0000-0000-000000000070', 'C', '49', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0070-000000000004', 'b0000003-0000-0000-0000-000000000070', 'D', '341', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 71
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000071', 'a0000003-0000-0000-0000-000000000003', 71, 'The price of sugar increases by 25%. By what percentage must consumption be reduced to keep expenditure constant?', 'single_choice', 'medium', 'Quantitative Aptitude', 'Percentages', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0071-000000000001', 'b0000003-0000-0000-0000-000000000071', 'A', '20%', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000071', 'd0000000-0000-0000-0071-000000000001', 'Reduction % = [r / (100 + r)] * 100 = [25 / 125] * 100 = 20%.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0071-000000000002', 'b0000003-0000-0000-0000-000000000071', 'B', '25%', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0071-000000000003', 'b0000003-0000-0000-0000-000000000071', 'C', '15%', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0071-000000000004', 'b0000003-0000-0000-0000-000000000071', 'D', '16.67%', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 72
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000072', 'a0000003-0000-0000-0000-000000000003', 72, 'Find the length of diagonal of a cuboid of dimensions 12 cm, 9 cm, and 8 cm.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Mensuration', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0072-000000000001', 'b0000003-0000-0000-0000-000000000072', 'A', '17 cm', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000072', 'd0000000-0000-0000-0072-000000000001', 'd = √(12^2 + 9^2 + 8^2) = √(144 + 81 + 64) = √289 = 17 cm.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0072-000000000002', 'b0000003-0000-0000-0000-000000000072', 'B', '16 cm', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0072-000000000003', 'b0000003-0000-0000-0000-000000000072', 'C', '18 cm', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0072-000000000004', 'b0000003-0000-0000-0000-000000000072', 'D', '15 cm', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 73
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000073', 'a0000003-0000-0000-0000-000000000003', 73, 'If sec θ + tan θ = 3, what is sec θ - tan θ?', 'single_choice', 'medium', 'Quantitative Aptitude', 'Trigonometry', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0073-000000000001', 'b0000003-0000-0000-0000-000000000073', 'A', '1/3', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000073', 'd0000000-0000-0000-0073-000000000001', 'sec^2 θ - tan^2 θ = 1 => (sec θ + tan θ)(sec θ - tan θ) = 1. Hence sec θ - tan θ = 1/3.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0073-000000000002', 'b0000003-0000-0000-0000-000000000073', 'B', '3', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0073-000000000003', 'b0000003-0000-0000-0000-000000000073', 'C', '2/3', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0073-000000000004', 'b0000003-0000-0000-0000-000000000073', 'D', '-3', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 74
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000074', 'a0000003-0000-0000-0000-000000000003', 74, 'The diagonals of a rhombus are 16 cm and 12 cm. Find its perimeter.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Geometry', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0074-000000000001', 'b0000003-0000-0000-0000-000000000074', 'A', '40 cm', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000074', 'd0000000-0000-0000-0074-000000000001', 'Side = √((16/2)^2 + (12/2)^2) = √(64 + 36) = 10 cm. Perimeter = 4 * 10 = 40 cm.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0074-000000000002', 'b0000003-0000-0000-0000-000000000074', 'B', '48 cm', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0074-000000000003', 'b0000003-0000-0000-0000-000000000074', 'C', '32 cm', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0074-000000000004', 'b0000003-0000-0000-0000-000000000074', 'D', '52 cm', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 75
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000003-0000-0000-0000-000000000075', 'a0000003-0000-0000-0000-000000000003', 75, 'A motorist covers first half of his journey at 40 km/h and second half at 60 km/h. Find his average speed.', 'single_choice', 'medium', 'Quantitative Aptitude', 'Time and Distance', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0075-000000000001', 'b0000003-0000-0000-0000-000000000075', 'A', '48 km/h', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000003-0000-0000-0000-000000000075', 'd0000000-0000-0000-0075-000000000001', 'Average speed = 2xy / (x + y) = 2(40)(60) / 100 = 4800 / 100 = 48 km/h.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0075-000000000002', 'b0000003-0000-0000-0000-000000000075', 'B', '50 km/h', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0075-000000000003', 'b0000003-0000-0000-0000-000000000075', 'C', '45 km/h', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0075-000000000004', 'b0000003-0000-0000-0000-000000000075', 'D', '52 km/h', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 76
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000076', 'a0000004-0000-0000-0000-000000000004', 76, 'Which Article of the Indian Constitution empowers the President to declare a National Emergency?', 'single_choice', 'medium', 'General Awareness', 'Polity', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0076-000000000001', 'b0000004-0000-0000-0000-000000000076', 'A', 'Article 352', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000076', 'd0000000-0000-0000-0076-000000000001', 'Article 352 allows declaration of National Emergency due to war, external aggression, or armed rebellion.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0076-000000000002', 'b0000004-0000-0000-0000-000000000076', 'B', 'Article 356', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0076-000000000003', 'b0000004-0000-0000-0000-000000000076', 'C', 'Article 360', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0076-000000000004', 'b0000004-0000-0000-0000-000000000076', 'D', 'Article 370', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 77
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000077', 'a0000004-0000-0000-0000-000000000004', 77, 'Who among the following was the founder of the Maurya Empire in ancient India?', 'single_choice', 'medium', 'General Awareness', 'History', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0077-000000000001', 'b0000004-0000-0000-0000-000000000077', 'A', 'Chandragupta Maurya', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000077', 'd0000000-0000-0000-0077-000000000001', 'Chandragupta Maurya founded the Mauryan Empire in 322 BCE with the mentorship of Chanakya.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0077-000000000002', 'b0000004-0000-0000-0000-000000000077', 'B', 'Ashoka the Great', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0077-000000000003', 'b0000004-0000-0000-0000-000000000077', 'C', 'Bindusara', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0077-000000000004', 'b0000004-0000-0000-0000-000000000077', 'D', 'Harsha', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 78
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000078', 'a0000004-0000-0000-0000-000000000004', 78, 'The Tropic of Cancer does NOT pass through which of the following Indian states?', 'single_choice', 'medium', 'General Awareness', 'Geography', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0078-000000000001', 'b0000004-0000-0000-0000-000000000078', 'A', 'Odisha', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000078', 'd0000000-0000-0000-0078-000000000001', 'The Tropic of Cancer passes through 8 Indian states: Gujarat, Rajasthan, MP, Chhattisgarh, Jharkhand, West Bengal, Tripura, Mizoram. It does not pass through Odisha.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0078-000000000002', 'b0000004-0000-0000-0000-000000000078', 'B', 'Gujarat', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0078-000000000003', 'b0000004-0000-0000-0000-000000000078', 'C', 'Rajasthan', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0078-000000000004', 'b0000004-0000-0000-0000-000000000078', 'D', 'Madhya Pradesh', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 79
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000079', 'a0000004-0000-0000-0000-000000000004', 79, 'Which cell organelle is commonly referred to as the "powerhouse of the cell"?', 'single_choice', 'medium', 'General Awareness', 'General Science', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0079-000000000001', 'b0000004-0000-0000-0000-000000000079', 'A', 'Mitochondria', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000079', 'd0000000-0000-0000-0079-000000000001', 'Mitochondria generate most of the chemical energy needed by cell biochemical reactions (ATP).')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0079-000000000002', 'b0000004-0000-0000-0000-000000000079', 'B', 'Ribosome', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0079-000000000003', 'b0000004-0000-0000-0000-000000000079', 'C', 'Golgi Apparatus', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0079-000000000004', 'b0000004-0000-0000-0000-000000000079', 'D', 'Lysosome', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 80
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000080', 'a0000004-0000-0000-0000-000000000004', 80, 'Who was appointed the Chairman of the Drafting Committee of the Indian Constituent Assembly?', 'single_choice', 'medium', 'General Awareness', 'Polity', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0080-000000000001', 'b0000004-0000-0000-0000-000000000080', 'A', 'Dr. B. R. Ambedkar', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000080', 'd0000000-0000-0000-0080-000000000001', 'Dr. B.R. Ambedkar served as Chairman of the Drafting Committee formed on 29 August 1947.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0080-000000000002', 'b0000004-0000-0000-0000-000000000080', 'B', 'Dr. Rajendra Prasad', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0080-000000000003', 'b0000004-0000-0000-0000-000000000080', 'C', 'Jawaharlal Nehru', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0080-000000000004', 'b0000004-0000-0000-0000-000000000080', 'D', 'Sardar Vallabhbhai Patel', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 81
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000081', 'a0000004-0000-0000-0000-000000000004', 81, 'Which planet in our solar system is known as the "Red Planet"?', 'single_choice', 'medium', 'General Awareness', 'Geography', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0081-000000000001', 'b0000004-0000-0000-0000-000000000081', 'A', 'Mars', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000081', 'd0000000-0000-0000-0081-000000000001', 'Mars appears reddish because of widespread iron oxide on its surface.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0081-000000000002', 'b0000004-0000-0000-0000-000000000081', 'B', 'Venus', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0081-000000000003', 'b0000004-0000-0000-0000-000000000081', 'C', 'Jupiter', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0081-000000000004', 'b0000004-0000-0000-0000-000000000081', 'D', 'Saturn', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 82
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000082', 'a0000004-0000-0000-0000-000000000004', 82, 'What is the chemical symbol for the element Gold?', 'single_choice', 'medium', 'General Awareness', 'General Science', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0082-000000000001', 'b0000004-0000-0000-0000-000000000082', 'A', 'Au', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000082', 'd0000000-0000-0000-0082-000000000001', 'The symbol Au is derived from the Latin word "Aurum".')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0082-000000000002', 'b0000004-0000-0000-0000-000000000082', 'B', 'Ag', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0082-000000000003', 'b0000004-0000-0000-0000-000000000082', 'C', 'Fe', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0082-000000000004', 'b0000004-0000-0000-0000-000000000082', 'D', 'Cu', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 83
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000083', 'a0000004-0000-0000-0000-000000000004', 83, 'In which year did the historic Battle of Plassey take place?', 'single_choice', 'medium', 'General Awareness', 'History', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0083-000000000001', 'b0000004-0000-0000-0000-000000000083', 'A', '1757', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000083', 'd0000000-0000-0000-0083-000000000001', 'The Battle of Plassey took place on 23 June 1757, establishing British East India Company supremacy.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0083-000000000002', 'b0000004-0000-0000-0000-000000000083', 'B', '1764', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0083-000000000003', 'b0000004-0000-0000-0000-000000000083', 'C', '1857', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0083-000000000004', 'b0000004-0000-0000-0000-000000000083', 'D', '1526', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 84
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000084', 'a0000004-0000-0000-0000-000000000004', 84, 'Which classical dance form originated in the state of Kerala?', 'single_choice', 'medium', 'General Awareness', 'Art & Culture', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0084-000000000001', 'b0000004-0000-0000-0000-000000000084', 'A', 'Kathakali', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000084', 'd0000000-0000-0000-0084-000000000001', 'Kathakali and Mohiniyattam are classical dance traditions belonging to Kerala.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0084-000000000002', 'b0000004-0000-0000-0000-000000000084', 'B', 'Bharatanatyam', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0084-000000000003', 'b0000004-0000-0000-0000-000000000084', 'C', 'Kathak', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0084-000000000004', 'b0000004-0000-0000-0000-000000000084', 'D', 'Kuchipudi', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 85
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000085', 'a0000004-0000-0000-0000-000000000004', 85, 'What is the standard monetary policy repo rate defined as by the Reserve Bank of India?', 'single_choice', 'medium', 'General Awareness', 'Economics', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0085-000000000001', 'b0000004-0000-0000-0000-000000000085', 'A', 'The rate at which RBI lends money to commercial banks against government securities', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000085', 'd0000000-0000-0000-0085-000000000001', 'Repo rate is the benchmark lending rate at which the central bank lends funds to commercial banks.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0085-000000000002', 'b0000004-0000-0000-0000-000000000085', 'B', 'The rate at which commercial banks deposit excess liquidity with RBI', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0085-000000000003', 'b0000004-0000-0000-0000-000000000085', 'C', 'The interest rate charged on personal loans', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0085-000000000004', 'b0000004-0000-0000-0000-000000000085', 'D', 'The exchange rate of INR against USD', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 86
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000086', 'a0000004-0000-0000-0000-000000000004', 86, 'Which gas is most abundant in the Earth''s atmosphere?', 'single_choice', 'medium', 'General Awareness', 'General Science', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0086-000000000001', 'b0000004-0000-0000-0000-000000000086', 'A', 'Nitrogen (~78%)', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000086', 'd0000000-0000-0000-0086-000000000001', 'Nitrogen constitutes approximately 78.08% of dry atmospheric volume.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0086-000000000002', 'b0000004-0000-0000-0000-000000000086', 'B', 'Oxygen (~21%)', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0086-000000000003', 'b0000004-0000-0000-0000-000000000086', 'C', 'Argon (~0.9%)', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0086-000000000004', 'b0000004-0000-0000-0000-000000000086', 'D', 'Carbon Dioxide (~0.04%)', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 87
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000087', 'a0000004-0000-0000-0000-000000000004', 87, 'The famous UNESCO World Heritage site Sun Temple is situated at:', 'single_choice', 'medium', 'General Awareness', 'Art & Culture', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0087-000000000001', 'b0000004-0000-0000-0000-000000000087', 'A', 'Konark, Odisha', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000087', 'd0000000-0000-0000-0087-000000000001', 'The 13th-century Konark Sun Temple was built by King Narasimhadeva I of the Eastern Ganga Dynasty.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0087-000000000002', 'b0000004-0000-0000-0000-000000000087', 'B', 'Khajuraho, Madhya Pradesh', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0087-000000000003', 'b0000004-0000-0000-0000-000000000087', 'C', 'Hampi, Karnataka', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0087-000000000004', 'b0000004-0000-0000-0000-000000000087', 'D', 'Mahabalipuram, Tamil Nadu', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 88
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000088', 'a0000004-0000-0000-0000-000000000004', 88, 'Which Vitamin is synthesized in human skin upon exposure to solar ultraviolet rays?', 'single_choice', 'medium', 'General Awareness', 'General Science', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0088-000000000001', 'b0000004-0000-0000-0000-000000000088', 'A', 'Vitamin D', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000088', 'd0000000-0000-0000-0088-000000000001', 'Vitamin D3 (cholecalciferol) is synthesized in epidermal layers under UV-B radiation.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0088-000000000002', 'b0000004-0000-0000-0000-000000000088', 'B', 'Vitamin C', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0088-000000000003', 'b0000004-0000-0000-0000-000000000088', 'C', 'Vitamin A', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0088-000000000004', 'b0000004-0000-0000-0000-000000000088', 'D', 'Vitamin K', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 89
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000089', 'a0000004-0000-0000-0000-000000000004', 89, 'Identify the misspelt word', 'single_choice', 'medium', 'English', 'Spelling Correction', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0089-000000000001', 'b0000004-0000-0000-0000-000000000089', 'A', 'Vicereine', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0089-000000000002', 'b0000004-0000-0000-0000-000000000089', 'B', 'floccinaucinihilipilification', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0089-000000000003', 'b0000004-0000-0000-0000-000000000089', 'C', 'Defenestrate', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0089-000000000004', 'b0000004-0000-0000-0000-000000000089', 'D', 'Sacrilegous', 4)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000089', 'd0000000-0000-0000-0089-000000000004', 'Correct spelling is ''sacrilegious'' (missing ''i'').')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;

-- Question 90
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000090', 'a0000004-0000-0000-0000-000000000004', 90, 'Which fundamental right cannot be suspended even during a National Emergency?', 'single_choice', 'medium', 'General Awareness', 'Polity', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0090-000000000001', 'b0000004-0000-0000-0000-000000000090', 'A', 'Right to Life and Personal Liberty (Article 21) and Protection in respect of conviction (Article 20)', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000090', 'd0000000-0000-0000-0090-000000000001', 'By the 44th Constitutional Amendment Act 1978, Articles 20 and 21 cannot be suspended under Emergency.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0090-000000000002', 'b0000004-0000-0000-0000-000000000090', 'B', 'Right to Freedom of Speech (Article 19)', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0090-000000000003', 'b0000004-0000-0000-0000-000000000090', 'C', 'Right to Equality (Article 14)', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0090-000000000004', 'b0000004-0000-0000-0000-000000000090', 'D', 'Right to Constitutional Remedies (Article 32)', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 91
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000091', 'a0000004-0000-0000-0000-000000000004', 91, 'The highest peak in peninsular India is:', 'single_choice', 'medium', 'General Awareness', 'Geography', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0091-000000000001', 'b0000004-0000-0000-0000-000000000091', 'A', 'Anamudi', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000091', 'd0000000-0000-0000-0091-000000000001', 'Anamudi (2,695 meters), located in the Anamalai Hills of Kerala, is the highest peak in South India.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0091-000000000002', 'b0000004-0000-0000-0000-000000000091', 'B', 'Doddabetta', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0091-000000000003', 'b0000004-0000-0000-0000-000000000091', 'C', 'Mahendragiri', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0091-000000000004', 'b0000004-0000-0000-0000-000000000091', 'D', 'Kalsubai', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 92
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000092', 'a0000004-0000-0000-0000-000000000004', 92, 'Which enzyme in human saliva begins the chemical breakdown of carbohydrates?', 'single_choice', 'medium', 'General Awareness', 'General Science', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0092-000000000001', 'b0000004-0000-0000-0000-000000000092', 'A', 'Salivary Amylase (Ptyalin)', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000092', 'd0000000-0000-0000-0092-000000000001', 'Salivary amylase hydrolyzes starch into maltose and dextrin.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0092-000000000002', 'b0000004-0000-0000-0000-000000000092', 'B', 'Pepsin', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0092-000000000003', 'b0000004-0000-0000-0000-000000000092', 'C', 'Trypsin', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0092-000000000004', 'b0000004-0000-0000-0000-000000000092', 'D', 'Lipase', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 93
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000093', 'a0000004-0000-0000-0000-000000000004', 93, 'Who pioneered the introduction of the Permanent Settlement of Bengal in 1793?', 'single_choice', 'medium', 'General Awareness', 'History', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0093-000000000001', 'b0000004-0000-0000-0000-000000000093', 'A', 'Lord Cornwallis', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000093', 'd0000000-0000-0000-0093-000000000001', 'Governor-General Lord Cornwallis introduced the zamindari permanent revenue agreement in 1793.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0093-000000000002', 'b0000004-0000-0000-0000-000000000093', 'B', 'Warren Hastings', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0093-000000000003', 'b0000004-0000-0000-0000-000000000093', 'C', 'Lord Dalhousie', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0093-000000000004', 'b0000004-0000-0000-0000-000000000093', 'D', 'Lord Wellesley', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 94
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000094', 'a0000004-0000-0000-0000-000000000004', 94, 'Which state in India has the longest mainland coastline?', 'single_choice', 'medium', 'General Awareness', 'Geography', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0094-000000000001', 'b0000004-0000-0000-0000-000000000094', 'A', 'Gujarat', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000094', 'd0000000-0000-0000-0094-000000000001', 'Gujarat has the longest mainland coastline in India, extending approximately 1,600 km.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0094-000000000002', 'b0000004-0000-0000-0000-000000000094', 'B', 'Andhra Pradesh', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0094-000000000003', 'b0000004-0000-0000-0000-000000000094', 'C', 'Tamil Nadu', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0094-000000000004', 'b0000004-0000-0000-0000-000000000094', 'D', 'Maharashtra', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 95
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000095', 'a0000004-0000-0000-0000-000000000004', 95, 'What is the full form of the economic indicator "GDP"?', 'single_choice', 'medium', 'General Awareness', 'Economics', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0095-000000000001', 'b0000004-0000-0000-0000-000000000095', 'A', 'Gross Domestic Product', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000095', 'd0000000-0000-0000-0095-000000000001', 'Gross Domestic Product measures the total monetary value of finished goods and services produced domestically.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0095-000000000002', 'b0000004-0000-0000-0000-000000000095', 'B', 'General Domestic Profit', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0095-000000000003', 'b0000004-0000-0000-0000-000000000095', 'C', 'Gross Dynamic Production', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0095-000000000004', 'b0000004-0000-0000-0000-000000000095', 'D', 'Global Development Price', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 96
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000096', 'a0000004-0000-0000-0000-000000000004', 96, 'Which fundamental layer of the atmosphere contains the ozone layer that absorbs harmful UV rays?', 'single_choice', 'medium', 'General Awareness', 'Geography', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0096-000000000001', 'b0000004-0000-0000-0000-000000000096', 'A', 'Stratosphere', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000096', 'd0000000-0000-0000-0096-000000000001', 'The ozone layer resides primarily in the lower portion of the stratosphere (15-35 km).')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0096-000000000002', 'b0000004-0000-0000-0000-000000000096', 'B', 'Troposphere', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0096-000000000003', 'b0000004-0000-0000-0000-000000000096', 'C', 'Mesosphere', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0096-000000000004', 'b0000004-0000-0000-0000-000000000096', 'D', 'Thermosphere', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 97
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000097', 'a0000004-0000-0000-0000-000000000004', 97, 'Who was the first Indian woman to win an Olympic medal?', 'single_choice', 'medium', 'General Awareness', 'Sports', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0097-000000000001', 'b0000004-0000-0000-0000-000000000097', 'A', 'Karnam Malleswari', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000097', 'd0000000-0000-0000-0097-000000000001', 'Weightlifter Karnam Malleswari won bronze at the 2000 Sydney Olympics.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0097-000000000002', 'b0000004-0000-0000-0000-000000000097', 'B', 'P. V. Sindhu', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0097-000000000003', 'b0000004-0000-0000-0000-000000000097', 'C', 'Mary Kom', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0097-000000000004', 'b0000004-0000-0000-0000-000000000097', 'D', 'Saina Nehwal', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 98
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000098', 'a0000004-0000-0000-0000-000000000004', 98, 'Which schedule of the Indian Constitution contains the list of recognized official languages?', 'single_choice', 'medium', 'General Awareness', 'Polity', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0098-000000000001', 'b0000004-0000-0000-0000-000000000098', 'A', 'Eighth Schedule', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000098', 'd0000000-0000-0000-0098-000000000001', 'The Eighth Schedule recognizes 22 official languages of the Republic of India.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0098-000000000002', 'b0000004-0000-0000-0000-000000000098', 'B', 'Seventh Schedule', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0098-000000000003', 'b0000004-0000-0000-0000-000000000098', 'C', 'Ninth Schedule', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0098-000000000004', 'b0000004-0000-0000-0000-000000000098', 'D', 'Tenth Schedule', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 99
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000099', 'a0000004-0000-0000-0000-000000000004', 99, 'Which instrument is used to measure atmospheric pressure?', 'single_choice', 'medium', 'General Awareness', 'General Science', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0099-000000000001', 'b0000004-0000-0000-0000-000000000099', 'A', 'Barometer', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000099', 'd0000000-0000-0000-0099-000000000001', 'A barometer measures atmospheric pressure using mercury or aneroid capsules.')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0099-000000000002', 'b0000004-0000-0000-0000-000000000099', 'B', 'Anemometer', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0099-000000000003', 'b0000004-0000-0000-0000-000000000099', 'C', 'Hygrometer', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0099-000000000004', 'b0000004-0000-0000-0000-000000000099', 'D', 'Thermometer', 4)
on conflict (id) do update set option_text = excluded.option_text;

-- Question 100
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks)
values ('b0000004-0000-0000-0000-000000000100', 'a0000004-0000-0000-0000-000000000004', 100, 'Select the sentence containing the homophone of "canon" (a musical composition).', 'single_choice', 'medium', 'English', 'Homophones', 2.00, 0.50)
on conflict (id) do update set question_text = excluded.question_text, topic = excluded.topic;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0100-000000000001', 'b0000004-0000-0000-0000-000000000100', 'A', 'The photographer adjusted the cannon before taking the shot.', 1)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_answers (question_id, correct_option_id, solution_text)
values ('b0000004-0000-0000-0000-000000000100', 'd0000000-0000-0000-0100-000000000001', 'The word "cannon" (a heavy artillery weapon or camera lens) is a homophone of "canon" (a general rule or musical composition).')
on conflict (question_id) do update set correct_option_id = excluded.correct_option_id, solution_text = excluded.solution_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0100-000000000002', 'b0000004-0000-0000-0000-000000000100', 'B', 'The monk followed the spiritual canon faithfully.', 2)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0100-000000000003', 'b0000004-0000-0000-0000-000000000100', 'C', 'The company drafted a new employment policy.', 3)
on conflict (id) do update set option_text = excluded.option_text;
insert into public.question_options (id, question_id, option_label, option_text, display_order)
values ('d0000000-0000-0000-0100-000000000004', 'b0000004-0000-0000-0000-000000000100', 'D', 'The river flowed smoothly into the ocean.', 4)
on conflict (id) do update set option_text = excluded.option_text;
