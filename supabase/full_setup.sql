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

drop trigger if exists set_profiles_updated_at on public.profiles;
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

drop trigger if exists set_categories_updated_at on public.categories;
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

create index if not exists idx_exams_category_id on public.exams(category_id);
create index if not exists idx_exams_status on public.exams(status);

drop trigger if exists set_exams_updated_at on public.exams;
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

create index if not exists idx_exam_sections_exam_id on public.exam_sections(exam_id);

drop trigger if exists set_exam_sections_updated_at on public.exam_sections;
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

create index if not exists idx_questions_section_id on public.questions(section_id);

drop trigger if exists set_questions_updated_at on public.questions;
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

create index if not exists idx_question_options_question_id on public.question_options(question_id);

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

create index if not exists idx_question_answers_question_id on public.question_answers(question_id);

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

create index if not exists idx_exam_attempts_user on public.exam_attempts(user_id);
create index if not exists idx_exam_attempts_exam on public.exam_attempts(exam_id);
create index if not exists idx_exam_attempts_status on public.exam_attempts(status);

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

create index if not exists idx_attempt_sections_attempt_id on public.attempt_sections(attempt_id);

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

create index if not exists idx_attempt_answers_attempt on public.attempt_answers(attempt_id);

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

create index if not exists idx_bookmarks_user on public.bookmarks(user_id);

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

create index if not exists idx_exam_participation_exam on public.exam_participation(exam_id);

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
drop policy if exists "Profiles viewable by authenticated users" on public.profiles;
create policy "Profiles viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and (role is not distinct from role or public.is_admin()));

drop policy if exists "Admins can manage all profiles" on public.profiles;
create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin());

-- CATEGORIES:
-- Public can read active categories, admins can manage all
drop policy if exists "Anyone can read active categories" on public.categories;
create policy "Anyone can read active categories"
  on public.categories for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
  on public.categories for all
  using (public.is_admin());

-- EXAMS:
-- Published exams are viewable by authenticated students or anyone, drafts only by admins
drop policy if exists "Published exams viewable by everyone" on public.exams;
create policy "Published exams viewable by everyone"
  on public.exams for select
  using (status = 'published' or public.is_admin());

drop policy if exists "Admins can manage exams" on public.exams;
create policy "Admins can manage exams"
  on public.exams for all
  using (public.is_admin());

-- EXAM SECTIONS:
drop policy if exists "Sections viewable if exam is viewable" on public.exam_sections;
create policy "Sections viewable if exam is viewable"
  on public.exam_sections for select
  using (
    exists (
      select 1 from public.exams e
      where e.id = exam_sections.exam_id and (e.status = 'published' or public.is_admin())
    )
  );

drop policy if exists "Admins can manage exam sections" on public.exam_sections;
create policy "Admins can manage exam sections"
  on public.exam_sections for all
  using (public.is_admin());

-- TOPICS:
drop policy if exists "Topics viewable by all authenticated" on public.question_topics;
create policy "Topics viewable by all authenticated"
  on public.question_topics for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage topics" on public.question_topics;
create policy "Admins can manage topics"
  on public.question_topics for all
  using (public.is_admin());

-- QUESTIONS:
drop policy if exists "Questions viewable for accessible exams" on public.questions;
create policy "Questions viewable for accessible exams"
  on public.questions for select
  using (
    exists (
      select 1 from public.exam_sections s
      join public.exams e on e.id = s.exam_id
      where s.id = questions.section_id and (e.status = 'published' or public.is_admin())
    )
  );

drop policy if exists "Admins can manage questions" on public.questions;
create policy "Admins can manage questions"
  on public.questions for all
  using (public.is_admin());

-- QUESTION OPTIONS:
drop policy if exists "Question options viewable for accessible questions" on public.question_options;
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

drop policy if exists "Admins can manage question options" on public.question_options;
create policy "Admins can manage question options"
  on public.question_options for all
  using (public.is_admin());

-- QUESTION ANSWERS: (CRITICAL SECURITY: ONLY ADMINS direct read/write)
-- Students NEVER read question_answers directly during test!
-- Solutions are provided via secure server RPC after attempt submission.
drop policy if exists "Only admins can access question_answers directly" on public.question_answers;
create policy "Only admins can access question_answers directly"
  on public.question_answers for all
  using (public.is_admin());

-- EXAM ATTEMPTS:
drop policy if exists "Users can view own attempts or admin can view all" on public.exam_attempts;
create policy "Users can view own attempts or admin can view all"
  on public.exam_attempts for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own attempts" on public.exam_attempts;
create policy "Users can insert own attempts"
  on public.exam_attempts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own in-progress attempts" on public.exam_attempts;
create policy "Users can update own in-progress attempts"
  on public.exam_attempts for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can delete attempts" on public.exam_attempts;
create policy "Admins can delete attempts"
  on public.exam_attempts for delete
  using (public.is_admin());

-- ATTEMPT SECTIONS:
drop policy if exists "Users can view own attempt sections" on public.attempt_sections;
create policy "Users can view own attempt sections"
  on public.attempt_sections for select
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_sections.attempt_id and (a.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Users can insert own attempt sections" on public.attempt_sections;
create policy "Users can insert own attempt sections"
  on public.attempt_sections for insert
  with check (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_sections.attempt_id and a.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update own attempt sections" on public.attempt_sections;
create policy "Users can update own attempt sections"
  on public.attempt_sections for update
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_sections.attempt_id and (a.user_id = auth.uid() or public.is_admin())
    )
  );

-- ATTEMPT ANSWERS:
drop policy if exists "Users can view own attempt answers" on public.attempt_answers;
create policy "Users can view own attempt answers"
  on public.attempt_answers for select
  using (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_answers.attempt_id and (a.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Users can insert and update own attempt answers" on public.attempt_answers;
create policy "Users can insert and update own attempt answers"
  on public.attempt_answers for insert
  with check (
    exists (
      select 1 from public.exam_attempts a
      where a.id = attempt_answers.attempt_id and a.user_id = auth.uid() and a.status = 'in_progress'
    )
  );

drop policy if exists "Users can update own attempt answers during in-progress attempt" on public.attempt_answers;
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
drop policy if exists "Users can view and manage own bookmarks" on public.bookmarks;
create policy "Users can view and manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- EXAM PARTICIPATION:
drop policy if exists "Participation viewable by authenticated users" on public.exam_participation;
create policy "Participation viewable by authenticated users"
  on public.exam_participation for select
  using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage participation" on public.exam_participation;
create policy "Admins can manage participation"
  on public.exam_participation for all
  using (public.is_admin());

-- EXAM SETTINGS:
drop policy if exists "Exam settings viewable if exam viewable" on public.exam_settings;
create policy "Exam settings viewable if exam viewable"
  on public.exam_settings for select
  using (
    exists (
      select 1 from public.exams e
      where e.id = exam_settings.exam_id and (e.status = 'published' or public.is_admin())
    )
  );

drop policy if exists "Admins can manage exam settings" on public.exam_settings;
create policy "Admins can manage exam settings"
  on public.exam_settings for all
  using (public.is_admin());

-- AUDIT LOG:
drop policy if exists "Admins can view and manage audit log" on public.answer_key_audit_log;
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



-- ==============================================================================
-- SEED DATA
-- ==============================================================================

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
  ('a0000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'English Comprehension', 1, 25, 900, 2.00, 0.50),
  ('a0000002-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000001', 'General Intelligence & Reasoning', 2, 25, 900, 2.00, 0.50),
  ('a0000003-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000001', 'Quantitative Aptitude', 3, 25, 900, 2.00, 0.50),
  ('a0000004-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000001', 'General Awareness', 4, 25, 900, 2.00, 0.50)
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
  'b0000001-0000-0000-0000-000000000001',
  'a0000001-0000-0000-0000-000000000001',
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
  ('d0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'A', 'Neither the supervisor', 1),
  ('d0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', 'B', 'nor the engineers was present', 2),
  ('d0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000001', 'C', 'at the project site', 3),
  ('d0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000001', 'D', 'when the anomaly was reported', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000001-0000-0000-0000-000000000001',
  'd0000001-0000-0000-0000-000000000002',
  'Option B contains the error: "nor the engineers was present" should be "nor the engineers were present".'
) on conflict (question_id) do nothing;

-- Question 2: Synonym
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000001-0000-0000-0000-000000000002',
  'a0000001-0000-0000-0000-000000000001',
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
  ('d0000001-0000-0000-0000-000000000005', 'b0000001-0000-0000-0000-000000000002', 'A', 'Painstaking', 1),
  ('d0000001-0000-0000-0000-000000000006', 'b0000001-0000-0000-0000-000000000002', 'B', 'Careless', 2),
  ('d0000001-0000-0000-0000-000000000007', 'b0000001-0000-0000-0000-000000000002', 'C', 'Hasty', 3),
  ('d0000001-0000-0000-0000-000000000008', 'b0000001-0000-0000-0000-000000000002', 'D', 'Casual', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000001-0000-0000-0000-000000000002',
  'd0000001-0000-0000-0000-000000000005',
  'Option A is correct: "Painstaking" means taking great care and effort, which matches "Meticulous".'
) on conflict (question_id) do nothing;

-- Question 3: Antonym
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000001-0000-0000-0000-000000000003',
  'a0000001-0000-0000-0000-000000000001',
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
  ('d0000001-0000-0000-0000-000000000009', 'b0000001-0000-0000-0000-000000000003', 'A', 'Transient', 1),
  ('d0000001-0000-0000-0000-000000000010', 'b0000001-0000-0000-0000-000000000003', 'B', 'Fleeting', 2),
  ('d0000001-0000-0000-0000-000000000011', 'b0000001-0000-0000-0000-000000000003', 'C', 'Permanent', 3),
  ('d0000001-0000-0000-0000-000000000012', 'b0000001-0000-0000-0000-000000000003', 'D', 'Momentary', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000001-0000-0000-0000-000000000003',
  'd0000001-0000-0000-0000-000000000011',
  'Option C is correct: "Permanent" is the exact antonym of "Ephemeral".'
) on conflict (question_id) do nothing;

-- Question 4: Idioms & Phrases
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000001-0000-0000-0000-000000000004',
  'a0000001-0000-0000-0000-000000000001',
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
  ('d0000001-0000-0000-0000-000000000013', 'b0000001-0000-0000-0000-000000000004', 'A', 'To act impulsively without considering consequences', 1),
  ('d0000001-0000-0000-0000-000000000014', 'b0000001-0000-0000-0000-000000000004', 'B', 'To face a painful situation with courage and endurance', 2),
  ('d0000001-0000-0000-0000-000000000015', 'b0000001-0000-0000-0000-000000000004', 'C', 'To criticize someone harshly in public', 3),
  ('d0000001-0000-0000-0000-000000000016', 'b0000001-0000-0000-0000-000000000004', 'D', 'To withdraw from a competition beforehand', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000001-0000-0000-0000-000000000004',
  'd0000001-0000-0000-0000-000000000014',
  'Option B is correct: To face a painful or difficult situation with fortitude.'
) on conflict (question_id) do nothing;

-- Question 5: One Word Substitution
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000001-0000-0000-0000-000000000005',
  'a0000001-0000-0000-0000-000000000001',
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
  ('d0000001-0000-0000-0000-000000000017', 'b0000001-0000-0000-0000-000000000005', 'A', 'Bibliophile', 1),
  ('d0000001-0000-0000-0000-000000000018', 'b0000001-0000-0000-0000-000000000005', 'B', 'Philatelist', 2),
  ('d0000001-0000-0000-0000-000000000019', 'b0000001-0000-0000-0000-000000000005', 'C', 'Numismatist', 3),
  ('d0000001-0000-0000-0000-000000000020', 'b0000001-0000-0000-0000-000000000005', 'D', 'Somnambulist', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000001-0000-0000-0000-000000000005',
  'd0000001-0000-0000-0000-000000000017',
  'Option A is correct: Bibliophile.'
) on conflict (question_id) do nothing;


-- ==============================================================================
-- 6. QUESTIONS FOR SECTION 2: GENERAL INTELLIGENCE & REASONING
-- ==============================================================================

-- Question 1: Analogy
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000002-0000-0000-0000-000000000001',
  'a0000002-0000-0000-0000-000000000002',
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
  ('d0000002-0000-0000-0000-000000000021', 'b0000002-0000-0000-0000-000000000001', 'A', 'Museum', 1),
  ('d0000002-0000-0000-0000-000000000022', 'b0000002-0000-0000-0000-000000000001', 'B', 'Stone', 2),
  ('d0000002-0000-0000-0000-000000000023', 'b0000002-0000-0000-0000-000000000001', 'C', 'Statue', 3),
  ('d0000002-0000-0000-0000-000000000024', 'b0000002-0000-0000-0000-000000000001', 'D', 'Chisel', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000002-0000-0000-0000-000000000001',
  'd0000002-0000-0000-0000-000000000023',
  'Option C is correct: A sculptor creates a statue.'
) on conflict (question_id) do nothing;

-- Question 2: Number Series
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000002-0000-0000-0000-000000000002',
  'a0000002-0000-0000-0000-000000000002',
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
  ('d0000002-0000-0000-0000-000000000025', 'b0000002-0000-0000-0000-000000000002', 'A', '127', 1),
  ('d0000002-0000-0000-0000-000000000026', 'b0000002-0000-0000-0000-000000000002', 'B', '125', 2),
  ('d0000002-0000-0000-0000-000000000027', 'b0000002-0000-0000-0000-000000000002', 'C', '129', 3),
  ('d0000002-0000-0000-0000-000000000028', 'b0000002-0000-0000-0000-000000000002', 'D', '131', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000002-0000-0000-0000-000000000002',
  'd0000002-0000-0000-0000-000000000025',
  'Option A is correct: 127.'
) on conflict (question_id) do nothing;

-- Question 3: Coding-Decoding
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000002-0000-0000-0000-000000000003',
  'a0000002-0000-0000-0000-000000000002',
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
  ('d0000002-0000-0000-0000-000000000029', 'b0000002-0000-0000-0000-000000000003', 'A', 'TCKP', 1),
  ('d0000002-0000-0000-0000-000000000030', 'b0000002-0000-0000-0000-000000000003', 'B', 'SCLP', 2),
  ('d0000002-0000-0000-0000-000000000031', 'b0000002-0000-0000-0000-000000000003', 'C', 'TBKQ', 3),
  ('d0000002-0000-0000-0000-000000000032', 'b0000002-0000-0000-0000-000000000003', 'D', 'TCJQ', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000002-0000-0000-0000-000000000003',
  'd0000002-0000-0000-0000-000000000029',
  'Option A is correct: TCKP.'
) on conflict (question_id) do nothing;

-- ==============================================================================
-- 7. QUESTIONS FOR SECTION 3: QUANTITATIVE APTITUDE
-- ==============================================================================

-- Question 1: Percentages
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000003-0000-0000-0000-000000000001',
  'a0000003-0000-0000-0000-000000000003',
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
  ('d0000003-0000-0000-0000-000000000041', 'b0000003-0000-0000-0000-000000000001', 'A', '20%', 1),
  ('d0000003-0000-0000-0000-000000000042', 'b0000003-0000-0000-0000-000000000001', 'B', '25%', 2),
  ('d0000003-0000-0000-0000-000000000043', 'b0000003-0000-0000-0000-000000000001', 'C', '16.67%', 3),
  ('d0000003-0000-0000-0000-000000000044', 'b0000003-0000-0000-0000-000000000001', 'D', '15%', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000003-0000-0000-0000-000000000001',
  'd0000003-0000-0000-0000-000000000041',
  'Option A is correct: 20%.'
) on conflict (question_id) do nothing;

-- Question 2: Profit & Loss
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000003-0000-0000-0000-000000000002',
  'a0000003-0000-0000-0000-000000000003',
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
  ('d0000003-0000-0000-0000-000000000045', 'b0000003-0000-0000-0000-000000000002', 'A', '₹550', 1),
  ('d0000003-0000-0000-0000-000000000046', 'b0000003-0000-0000-0000-000000000002', 'B', '₹600', 2),
  ('d0000003-0000-0000-0000-000000000047', 'b0000003-0000-0000-0000-000000000002', 'C', '₹620', 3),
  ('d0000003-0000-0000-0000-000000000048', 'b0000003-0000-0000-0000-000000000002', 'D', '₹580', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000003-0000-0000-0000-000000000002',
  'd0000003-0000-0000-0000-000000000046',
  'Option B is correct: ₹600.'
) on conflict (question_id) do nothing;

-- ==============================================================================
-- 8. QUESTIONS FOR SECTION 4: GENERAL AWARENESS
-- ==============================================================================

-- Question 1: Indian Polity
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000004-0000-0000-0000-000000000001',
  'a0000004-0000-0000-0000-000000000004',
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
  ('d0000004-0000-0000-0000-000000000061', 'b0000004-0000-0000-0000-000000000001', 'A', 'Article 14', 1),
  ('d0000004-0000-0000-0000-000000000062', 'b0000004-0000-0000-0000-000000000001', 'B', 'Article 19', 2),
  ('d0000004-0000-0000-0000-000000000063', 'b0000004-0000-0000-0000-000000000001', 'C', 'Article 21', 3),
  ('d0000004-0000-0000-0000-000000000064', 'b0000004-0000-0000-0000-000000000001', 'D', 'Article 32', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000004-0000-0000-0000-000000000001',
  'd0000004-0000-0000-0000-000000000061',
  'Option A is correct: Article 14.'
) on conflict (question_id) do nothing;

-- Question 2: General Science
insert into public.questions (id, section_id, question_number, question_text, question_type, difficulty, topic, subtopic, marks, negative_marks, explanation, solution_steps, source_year, source_session)
values (
  'b0000004-0000-0000-0000-000000000004',
  'a0000004-0000-0000-0000-000000000004',
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
  ('d0000004-0000-0000-0000-000000000073', 'b0000004-0000-0000-0000-000000000004', 'A', 'Mitochondria', 1),
  ('d0000004-0000-0000-0000-000000000074', 'b0000004-0000-0000-0000-000000000004', 'B', 'Ribosome', 2),
  ('d0000004-0000-0000-0000-000000000075', 'b0000004-0000-0000-0000-000000000004', 'C', 'Golgi Apparatus', 3),
  ('d0000004-0000-0000-0000-000000000076', 'b0000004-0000-0000-0000-000000000004', 'D', 'Lysosome', 4)
on conflict do nothing;

insert into public.question_answers (question_id, correct_option_id, explanation)
values (
  'b0000004-0000-0000-0000-000000000004',
  'd0000004-0000-0000-0000-000000000073',
  'Option A is correct: Mitochondria.'
) on conflict (question_id) do nothing;
