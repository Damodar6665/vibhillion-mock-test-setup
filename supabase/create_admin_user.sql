-- ==============================================================================
-- VIBHILLION AI: CREATE ADMIN USER IN SUPABASE AUTH
-- File: supabase/create_admin_user.sql
-- Run in Supabase SQL Editor to register admin@vibhillion.ai with Admin@123
-- ==============================================================================

do $$
declare
  v_user_id uuid := gen_random_uuid();
begin
  if not exists (select 1 from auth.users where email = 'admin@vibhillion.ai') then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'admin@vibhillion.ai',
      crypt('Admin@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrator"}'::jsonb,
      now(),
      now()
    );

    insert into public.profiles (id, full_name, email, role)
    values (v_user_id, 'Administrator', 'admin@vibhillion.ai', 'admin')
    on conflict (id) do update set role = 'admin';
  else
    update public.profiles
    set role = 'admin'
    where email = 'admin@vibhillion.ai';
  end if;
end $$;
