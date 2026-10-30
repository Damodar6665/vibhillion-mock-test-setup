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
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      phone_change,
      phone_change_token,
      reauthentication_token
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
      now(),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      v_user_id::text,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'admin@vibhillion.ai', 'email_verified', true, 'phone_verified', false),
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );

    insert into public.profiles (id, full_name, email, role)
    values (v_user_id, 'Administrator', 'admin@vibhillion.ai', 'admin')
    on conflict (id) do update set role = 'admin';
  else
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
    on conflict do nothing;

    update public.profiles
    set role = 'admin'
    where email = 'admin@vibhillion.ai';
  end if;
end $$;
