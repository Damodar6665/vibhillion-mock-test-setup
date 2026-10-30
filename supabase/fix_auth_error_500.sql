-- ==============================================================================
-- VIBHILLION AI: REPAIR SUPABASE AUTH 500 "Database error querying schema"
-- File: supabase/fix_auth_error_500.sql
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/chkhsshofywlsaqskdqo/sql/new
-- ==============================================================================

-- 1. Fix all NULL token columns that crash GoTrue's internal database scanner
update auth.users
set 
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where confirmation_token is null 
   or recovery_token is null 
   or email_change is null 
   or email_change_token_new is null;

-- 2. Ensure admin@vibhillion.ai has confirmed email and clean string tokens
update auth.users
set 
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmation_token = '',
  recovery_token = '',
  email_change = '',
  email_change_token_new = '',
  email_change_token_current = '',
  phone_change = '',
  phone_change_token = '',
  reauthentication_token = ''
where email = 'admin@vibhillion.ai';

-- 3. Ensure auth.identities has an entry for admin@vibhillion.ai
-- GoTrue crashes with 500 if a user exists in auth.users without a matching identity
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select 
  id::text,
  id,
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true, 'phone_verified', false),
  'email',
  id::text,
  now(),
  now(),
  now()
from auth.users
where email = 'admin@vibhillion.ai'
and not exists (
  select 1 from auth.identities where user_id = auth.users.id and provider = 'email'
);

-- 4. Confirm public.profiles has admin role
insert into public.profiles (id, full_name, email, role)
select id, 'Administrator', email, 'admin'
from auth.users
where email = 'admin@vibhillion.ai'
on conflict (id) do update set role = 'admin';
