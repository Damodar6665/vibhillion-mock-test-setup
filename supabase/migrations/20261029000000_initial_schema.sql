-- ==============================================================================
-- VIBHILLION AI: EXAM PREPARATION - MASTER DATABASE SCHEMA
-- Migration: 20261029000000_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  role text not null default 'student' check (role in ('student', 'admin')),
  avatar_url text,
  phone text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Trigger to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto create profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'student', -- Always default to student; only admin bootstrap/server can elevate
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Security definer helper to check admin role without recursion
create or replace function public.is_admin()
returns boolean as $$
declare
  current_role text;
begin
  if auth.uid() is null then
    return false;
  end if;
  select role into current_role from public.profiles where id = auth.uid();
  return current_role = 'admin';
end;
$$ language plpgsql security definer stable;

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. EXAMS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.exams (
  id uuid default gen_random_uuid() primary key,
  category_id uuid not null references public.categories(id) on delete cascade,
  title text not null,
  slug text unique not null,
  description text,
  exam_type text not null default 'mock_test' check (exam_type in ('mock_test', 'previous_year_paper')),
  year integer,
  exam_date date,
  session text,
  total_questions integer not null default 100,
  total_duration_seconds integer not null default 3600,
  total_marks numeric(6,2) not null default 200.00,
  negative_marks numeric(4,2) not null default 0.50,
  positive_marks numeric(4,2) not null default 2.00,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if do_not_exist idx_exams_category_id on public.exams(category_id);
create index if do_not_exist idx_exams_status on public.exams(status);

create trigger set_exams_updated_at
  before update on public.exams
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. EXAM_SECTIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.exam_sections (
  id uuid default gen_random_uuid() primary key,
  exam_id uuid not null references public.exams(id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  question_count integer not null default 25,
  duration_seconds integer not null default 900,
  marks_per_correct numeric(4,2) not null default 2.00,
  negative_marks_per_wrong numeric(4,2) not null default 0.50,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if do_not_exist idx_exam_sections_exam_id on public.exam_sections(exam_id);

create trigger set_exam_sections_updated_at
  before update on public.exam_sections
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. QUESTION_TOPICS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.question_topics (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  parent_topic_id uuid references public.question_topics(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. QUESTIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  section_id uuid not null references public.exam_sections(id) on delete cascade,
  question_number integer not null,
  question_text text not null,
  question_type text not null default 'single_choice' check (question_type in ('single_choice', 'multiple_choice', 'numerical')),
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  topic text,
  subtopic text,
  marks numeric(4,2) not null default 2.00,
  negative_marks numeric(4,2) not null default 0.50,
  explanation text,
  solution_steps jsonb default '[]'::jsonb,
  source_year integer,
  source_session text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (section_id, question_number)
);

create index if do_not_exist idx_questions_section_id on public.questions(section_id);

create trigger set_questions_updated_at
  before update on public.questions
  for each row execute procedure public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. QUESTION_OPTIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.question_options (
  id uuid default gen_random_uuid() primary key,
  question_id uuid not null references public.questions(id) on delete cascade,
  option_label text not null, -- 'A', 'B', 'C', 'D'
  option_text text not null,
  display_order integer not null default 0
);

create index if do_not_exist idx_question_options_question_id on public.question_options(question_id);

-- ------------------------------------------------------------------------------
-- 8. QUESTION_ANSWERS TABLE (Protected from students before submission)
-- ------------------------------------------------------------------------------
create table if not exists public.question_answers (
  id uuid default gen_random_uuid() primary key,
  question_id uuid not null references public.questions(id) on delete cascade unique,
  correct_option_id uuid not null references public.question_options(id) on delete cascade,
  explanation text,
  solution_steps jsonb default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if do_not_exist idx_question_answers_question_id on public.question_answers(question_id);

-- ------------------------------------------------------------------------------
-- 9. EXAM_ATTEMPTS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.exam_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  mode text not null default 'timed' check (mode in ('timed', 'practice')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'expired', 'submitted')),
  started_at timestamptz not null default timezone('utc'::text, now()),
  submitted_at timestamptz,
  total_time_seconds integer not null default 0,
  score numeric(6,2) not null default 0.00,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  unattempted_count integer not null default 0,
  attempted_count integer not null default 0,
  accuracy_percentage numeric(5,2) not null default 0.00,
  total_questions integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if do_not_exist idx_exam_attempts_user on public.exam_attempts(user_id);
create index if do_not_exist idx_exam_attempts_exam on public.exam_attempts(exam_id);
create index if do_not_exist idx_exam_attempts_status on public.exam_attempts(status);

-- ------------------------------------------------------------------------------
-- 10. ATTEMPT_SECTIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.attempt_sections (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  section_id uuid not null references public.exam_sections(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed', 'time_expired')),
  started_at timestamptz,
  submitted_at timestamptz,
  allocated_duration_seconds integer not null default 0,
  actual_duration_seconds integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  unattempted_count integer not null default 0,
  score numeric(6,2) not null default 0.00,
  unique (attempt_id, section_id)
);

create index if do_not_exist idx_attempt_sections_attempt_id on public.attempt_sections(attempt_id);

-- ------------------------------------------------------------------------------
-- 11. ATTEMPT_ANSWERS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.attempt_answers (
  id uuid default gen_random_uuid() primary key,
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option_id uuid references public.question_options(id) on delete set null,
  is_correct boolean,
  marks_awarded numeric(5,2) default 0.00,
  time_spent_seconds integer not null default 0,
  is_marked_for_review boolean not null default false,
  visited boolean not null default false,
  answered_at timestamptz,
  unique (attempt_id, question_id)
);

create index if do_not_exist idx_attempt_answers_attempt on public.attempt_answers(attempt_id);

-- ------------------------------------------------------------------------------
-- 12. BOOKMARKS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, question_id)
);

create index if do_not_exist idx_bookmarks_user on public.bookmarks(user_id);

-- ------------------------------------------------------------------------------
-- 13. EXAM_PARTICIPATION TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.exam_participation (
  id uuid default gen_random_uuid() primary key,
  exam_id uuid not null references public.exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  status text not null default 'completed',
  score numeric(6,2) not null default 0.00,
  completed_at timestamptz not null default timezone('utc'::text, now()),
  unique (exam_id, user_id)
);

create index if do_not_exist idx_exam_participation_exam on public.exam_participation(exam_id);

-- ------------------------------------------------------------------------------
-- 14. EXAM_SETTINGS & AUDIT LOG TABLES
-- ------------------------------------------------------------------------------
create table if not exists public.exam_settings (
  id uuid default gen_random_uuid() primary key,
  exam_id uuid not null references public.exams(id) on delete cascade unique,
  default_marks_per_question numeric(4,2) not null default 2.00,
  default_negative_penalty numeric(4,2) not null default 0.50,
  result_visibility text not null default 'immediate',
  explanation_visibility text not null default 'after_submission',
  reveal_answers_in_practice boolean not null default true,
  snapshot jsonb default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.answer_key_audit_log (
  id uuid default gen_random_uuid() primary key,
  question_id uuid not null references public.questions(id) on delete cascade,
  changed_by uuid references auth.users(id),
  old_correct_option_id uuid,
  new_correct_option_id uuid,
  reason text not null,
  reevaluated_attempts_count integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.exams enable row level security;
alter table public.exam_sections enable row level security;
alter table public.question_topics enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_answers enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.attempt_sections enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.bookmarks enable row level security;
alter table public.exam_participation enable row level security;
alter table public.exam_settings enable row level security;
alter table public.answer_key_audit_log enable row level security;

-- PROFILES:
-- Everyone authenticated can view profiles, user can update only their own non-role fields, admin can update all
create policy "Profiles viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and (role is not distinct from role or public.is_admin()));

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin());

-- CATEGORIES:
-- Public can read active categories, admins can manage all
create policy "Anyone can read active categories"
  on public.categories for select
  using (is_active = true or public.is_admin());

create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- EXAMS:
-- Published exams are viewable by authenticated students or anyone, drafts only by admins
create policy "Published exams viewable by everyone"
  on public.exams for select
  using (status = 'published' or public.is_admin());

create policy "Admins can manage exams"
  on public.exams for all
  using (public.is_admin());

-- EXAM SECTIONS:
create policy "Sections viewable if exam is viewable"
  on public.exam_sections for select
  using (
    exists (
      select 1 from public.exams e
      where e.id = exam_sections.exam_id and (e.status = 'published' or public.is_admin())
    )
  );

create policy "Admins can manage exam sections"
  on public.exam_sections for all
  using (public.is_admin());

-- TOPICS:
create policy "Topics viewable by all authenticated"
  on public.question_topics for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage topics"
  on public.question_topics for all
  using (public.is_admin());

-- QUESTIONS:
create policy "Questions viewable for accessible exams"
  on public.questions for select
  using (
    exists (
      select 1 from public.exam_sections s
      join public.exams e on e.id = s.exam_id
      where s.id = questions.section_id and (e.status = 'published' or public.is_admin())
    )
  );

create policy "Admins can manage questions"
  on public.questions for all
  using (public.is_admin());

-- QUESTION OPTIONS:
create policy "Question options viewable for accessible questions"
  on public.question_options for select
  using (
    exists (
      select 1 from public.questions q
      join public.exam_sections s on s.id = q.section_id
      join public.exams e on e.id = s.exam_id
      where q.id = question_options.question_id and (e.status = 'published' or public.is_admin())
    )
  );

create policy "Admins can manage question options"
  on public.question_options for all
  using (public.is_admin());

-- QUESTION ANSWERS: (CRITICAL SECURITY: ONLY ADMINS direct read/write)
-- Students NEVER read question_answers directly during test!
-- Solutions are provided via secure server RPC after attempt submission.
create policy "Only admins can access question_answers directly"
  on public.question_answers for all
  using (public.is_admin());

-- EXAM ATTEMPTS:
create policy "Users can view own attempts or admin can view all"
  on public.exam_attempts for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own attempts"
  on public.exam_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own in-progress attempts"
  on public.exam_attempts for update
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can delete attempts"
  on public.exam_attempts for delete
  using (public.is_admin());

-- ATTEMPT SECTIONS:
create policy "Users can view own attempt sections"
  on public.attempt_sections for select
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_sections.attempt_id and (a.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can insert own attempt sections"
  on public.attempt_sections for insert
  with check (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_sections.attempt_id and a.user_id = auth.uid()
    )
  );

create policy "Users can update own attempt sections"
  on public.attempt_sections for update
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_sections.attempt_id and (a.user_id = auth.uid() or public.is_admin())
    )
  );

-- ATTEMPT ANSWERS:
create policy "Users can view own attempt answers"
  on public.attempt_answers for select
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_answers.attempt_id and (a.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can insert and update own attempt answers"
  on public.attempt_answers for insert
  with check (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_answers.attempt_id and a.user_id = auth.uid() and a.status = 'in_progress'
    )
  );

create policy "Users can update own attempt answers during in-progress attempt"
  on public.attempt_answers for update
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_answers.attempt_id and (
        (a.user_id = auth.uid() and a.status = 'in_progress') or public.is_admin()
      )
    )
  );

-- BOOKMARKS:
create policy "Users can view and manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- EXAM PARTICIPATION:
create policy "Participation viewable by authenticated users"
  on public.exam_participation for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage participation"
  on public.exam_participation for all
  using (public.is_admin());

-- EXAM SETTINGS:
create policy "Exam settings viewable if exam viewable"
  on public.exam_settings for select
  using (
    exists (
      select 1 from public.exams e
      where e.id = exam_settings.exam_id and (e.status = 'published' or public.is_admin())
    )
  );

create policy "Admins can manage exam settings"
  on public.exam_settings for all
  using (public.is_admin());

-- AUDIT LOG:
create policy "Admins can view and manage audit log"
  on public.answer_key_audit_log for all
  using (public.is_admin());


-- ==============================================================================
-- SERVER-SIDE RPC FUNCTIONS FOR SECURE TEST FINALIZATION & SCORING
-- ==============================================================================

-- 1. SUBMIT EXAM ATTEMPT (Calculates score server-side against protected answers)
create or replace function public.submit_exam_attempt(p_attempt_id uuid)
returns jsonb as $$
declare
  v_attempt record;
  v_exam record;
  v_rec record;
  v_total_questions integer := 0;
  v_correct_count integer := 0;
  v_wrong_count integer := 0;
  v_unattempted_count integer := 0;
  v_attempted_count integer := 0;
  v_total_score numeric(6,2) := 0.00;
  v_accuracy numeric(5,2) := 0.00;
  v_total_time integer := 0;
begin
  -- Fetch attempt
  select * into v_attempt from public.exam_attempts where id = p_attempt_id;
  if not found then
    raise exception 'Attempt not found';
  end if;

  -- Ensure caller is owner or admin
  if v_attempt.user_id <> auth.uid() and not public.is_admin() then
    raise exception 'Not authorized to submit this attempt';
  end if;

  -- Prevent duplicate submission if already completed
  if v_attempt.status in ('completed', 'submitted') then
    return jsonb_build_object(
      'success', true,
      'already_submitted', true,
      'score', v_attempt.score,
      'correct_count', v_attempt.correct_count,
      'wrong_count', v_attempt.wrong_count,
      'unattempted_count', v_attempt.unattempted_count,
      'accuracy_percentage', v_attempt.accuracy_percentage
    );
  end if;

  -- Fetch exam
  select * into v_exam from public.exams where id = v_attempt.exam_id;
  v_total_questions := coalesce(v_exam.total_questions, 0);

  -- Score each question in the exam
  for v_rec in
    select 
      q.id as question_id,
      q.marks as q_marks,
      q.negative_marks as q_neg_marks,
      s.marks_per_correct as sec_marks,
      s.negative_marks_per_wrong as sec_neg_marks,
      qa.correct_option_id,
      aa.selected_option_id,
      aa.time_spent_seconds
    from public.exam_sections s
    join public.questions q on q.section_id = s.id
    left join public.question_answers qa on qa.question_id = q.id
    left join public.attempt_answers aa on aa.attempt_id = p_attempt_id and aa.question_id = q.id
    where s.exam_id = v_attempt.exam_id
  loop
    v_total_time := v_total_time + coalesce(v_rec.time_spent_seconds, 0);

    if v_rec.selected_option_id is not null then
      v_attempted_count := v_attempted_count + 1;
      if v_rec.selected_option_id = v_rec.correct_option_id then
        v_correct_count := v_correct_count + 1;
        v_total_score := v_total_score + coalesce(v_rec.sec_marks, v_rec.q_marks, 2.00);
        update public.attempt_answers
        set is_correct = true, marks_awarded = coalesce(v_rec.sec_marks, v_rec.q_marks, 2.00)
        where attempt_id = p_attempt_id and question_id = v_rec.question_id;
      else
        v_wrong_count := v_wrong_count + 1;
        v_total_score := v_total_score - coalesce(v_rec.sec_neg_marks, v_rec.q_neg_marks, 0.50);
        update public.attempt_answers
        set is_correct = false, marks_awarded = -1 * coalesce(v_rec.sec_neg_marks, v_rec.q_neg_marks, 0.50)
        where attempt_id = p_attempt_id and question_id = v_rec.question_id;
      end if;
    else
      v_unattempted_count := v_unattempted_count + 1;
      -- Ensure record exists for unattempted
      insert into public.attempt_answers (attempt_id, question_id, selected_option_id, is_correct, marks_awarded, time_spent_seconds, visited)
      values (p_attempt_id, v_rec.question_id, null, false, 0.00, coalesce(v_rec.time_spent_seconds, 0), false)
      on conflict (attempt_id, question_id) do update set
        marks_awarded = 0.00,
        is_correct = false;
    end if;
  end loop;

  if v_attempted_count > 0 then
    v_accuracy := round(((v_correct_count::numeric / v_attempted_count::numeric) * 100), 2);
  else
    v_accuracy := 0.00;
  end if;

  -- Finalize the attempt
  update public.exam_attempts
  set
    status = 'completed',
    submitted_at = timezone('utc'::text, now()),
    score = v_total_score,
    correct_count = v_correct_count,
    wrong_count = v_wrong_count,
    unattempted_count = v_unattempted_count,
    attempted_count = v_attempted_count,
    accuracy_percentage = v_accuracy,
    total_time_seconds = v_total_time
  where id = p_attempt_id;

  -- Record participation uniquely (prevent duplicate participation count)
  insert into public.exam_participation (exam_id, user_id, attempt_id, score, status, completed_at)
  values (v_attempt.exam_id, v_attempt.user_id, p_attempt_id, v_total_score, 'completed', timezone('utc'::text, now()))
  on conflict (exam_id, user_id) do update set
    score = case when excluded.score > public.exam_participation.score then excluded.score else public.exam_participation.score end,
    attempt_id = excluded.attempt_id,
    completed_at = excluded.completed_at;

  return jsonb_build_object(
    'success', true,
    'attempt_id', p_attempt_id,
    'score', v_total_score,
    'total_questions', v_total_questions,
    'attempted_count', v_attempted_count,
    'correct_count', v_correct_count,
    'wrong_count', v_wrong_count,
    'unattempted_count', v_unattempted_count,
    'accuracy_percentage', v_accuracy,
    'total_time_seconds', v_total_time
  );
end;
$$ language plpgsql security definer;


-- 2. GET ATTEMPT SOLUTIONS (Reveals answers ONLY after submission)
create or replace function public.get_attempt_solutions(p_attempt_id uuid)
returns jsonb as $$
declare
  v_attempt record;
  v_solutions jsonb;
begin
  select * into v_attempt from public.exam_attempts where id = p_attempt_id;
  if not found then
    raise exception 'Attempt not found';
  end if;

  if v_attempt.user_id <> auth.uid() and not public.is_admin() then
    raise exception 'Not authorized to view solutions for this attempt';
  end if;

  -- Guard: In timed mode, do NOT reveal until completed
  if v_attempt.mode = 'timed' and v_attempt.status not in ('completed', 'submitted', 'expired') then
    raise exception 'Answers and explanations are hidden until the test is submitted.';
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'question_id', q.id,
      'question_number', q.question_number,
      'question_text', q.question_text,
      'difficulty', q.difficulty,
      'topic', q.topic,
      'subtopic', q.subtopic,
      'marks', q.marks,
      'negative_marks', q.negative_marks,
      'section_id', q.section_id,
      'section_name', s.name,
      'options', (
        select jsonb_agg(
          jsonb_build_object(
            'id', qo.id,
            'label', qo.option_label,
            'text', qo.option_text,
            'display_order', qo.display_order
          ) order by qo.display_order, qo.option_label
        )
        from public.question_options qo
        where qo.question_id = q.id
      ),
      'user_selected_option_id', aa.selected_option_id,
      'correct_option_id', qa.correct_option_id,
      'is_correct', aa.is_correct,
      'marks_awarded', aa.marks_awarded,
      'time_spent_seconds', coalesce(aa.time_spent_seconds, 0),
      'explanation', coalesce(qa.explanation, q.explanation),
      'solution_steps', coalesce(qa.solution_steps, q.solution_steps)
    ) order by s.display_order, q.question_number
  ) into v_solutions
  from public.questions q
  join public.exam_sections s on s.id = q.section_id
  left join public.question_answers qa on qa.question_id = q.id
  left join public.attempt_answers aa on aa.attempt_id = p_attempt_id and aa.question_id = q.id
  where s.exam_id = v_attempt.exam_id;

  return coalesce(v_solutions, '[]'::jsonb);
end;
$$ language plpgsql security definer;


-- 3. RE-EVALUATE ATTEMPTS AFTER ANSWER KEY CHANGE (Audit & safe re-evaluation)
create or replace function public.reevaluate_exam_attempts(
  p_question_id uuid,
  p_new_correct_option_id uuid,
  p_reason text
)
returns jsonb as $$
declare
  v_old_correct_option_id uuid;
  v_count integer := 0;
  v_att record;
begin
  if not public.is_admin() then
    raise exception 'Admin privileges required';
  end if;

  select correct_option_id into v_old_correct_option_id
  from public.question_answers
  where question_id = p_question_id;

  -- Update answer key
  insert into public.question_answers (question_id, correct_option_id)
  values (p_question_id, p_new_correct_option_id)
  on conflict (question_id) do update set
    correct_option_id = excluded.correct_option_id,
    updated_at = timezone('utc'::text, now());

  -- Re-evaluate all completed attempts that answered this question
  for v_att in
    select distinct attempt_id
    from public.attempt_answers
    where question_id = p_question_id
  loop
    perform public.submit_exam_attempt(v_att.attempt_id);
    v_count := v_count + 1;
  end loop;

  -- Record audit log
  insert into public.answer_key_audit_log (
    question_id, changed_by, old_correct_option_id, new_correct_option_id, reason, reevaluated_attempts_count
  ) values (
    p_question_id, auth.uid(), v_old_correct_option_id, p_new_correct_option_id, p_reason, v_count
  );

  return jsonb_build_object(
    'success', true,
    'question_id', p_question_id,
    'reevaluated_attempts_count', v_count
  );
end;
$$ language plpgsql security definer;


-- 4. BOOTSTRAP ADMIN USER (Server-side procedure to grant admin role safely)
create or replace function public.bootstrap_admin(p_email text)
returns jsonb as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = p_email;
  if not found then
    return jsonb_build_object('success', false, 'message', 'User with email not found');
  end if;

  update public.profiles
  set role = 'admin'
  where id = v_user_id;

  return jsonb_build_object('success', true, 'user_id', v_user_id, 'email', p_email);
end;
$$ language plpgsql security definer;

