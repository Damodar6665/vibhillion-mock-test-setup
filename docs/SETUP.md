# Vibhillion AI: Exam Prep — Setup & Operations Guide 🚀

This document provides complete, production-grade instructions for deploying, running, and configuring both the **Student Android Application (React Native + Expo)** and the **Admin Web Application (React + Vite)** connected to a shared **Supabase PostgreSQL** backend.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Node.js & npm Verification](#2-nodejs--npm-verification)
3. [Project Structure & Architecture](#3-project-structure--architecture)
4. [Dependency Installation](#4-dependency-installation)
5. [Environment Variable Configuration](#5-environment-variable-configuration)
6. [Supabase Project Creation](#6-supabase-project-creation)
7. [Database Migration Execution](#7-database-migration-execution)
8. [Initial Seed Data Import](#8-initial-seed-data-import)
9. [Admin Account Bootstrap](#9-admin-account-bootstrap)
10. [Row Level Security (RLS) Verification](#10-row-level-security-rls-verification)
11. [Launching the Student Mobile App (Android / Web)](#11-launching-the-student-mobile-app)
12. [Launching the Admin Web Console](#12-launching-the-admin-web-console)
13. [Android Virtual Device (AVD Emulator) Setup](#13-android-virtual-device-emulator-setup)
14. [Testing on a Physical Android Device (Expo Go)](#14-testing-on-a-physical-android-device)
15. [Standalone Android APK & Production Build Options](#15-standalone-android-apk--production-build-options)
16. [Troubleshooting Common Issues](#16-troubleshooting-common-issues)
17. [Production Deployment Checklist](#17-production-deployment-checklist)

---

## 1. Prerequisites

Before getting started, make sure your system has:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**: Installed and accessible from your terminal
- **Supabase Account**: Free or Pro tier at [https://supabase.com](https://supabase.com)
- **Expo Go App** (optional): Installed on your Android phone from Google Play Store
- **Android Studio** (optional): For Android Virtual Device (AVD) emulation

---

## 2. Node.js & npm Verification

Verify your environment tools in terminal:

```bash
node -v
npm -v
git --version
```

Expected output:
```text
v20.x.x (or higher)
10.x.x (or higher)
git version 2.x.x
```

---

## 3. Project Structure & Architecture

The project is structured as a cohesive monorepo:

```text
vibhillion-mock-test/
├── apps/
│   ├── student/                # React Native + Expo SDK 58 mobile app
│   │   ├── src/
│   │   │   ├── app/            # Expo Router file-based screens
│   │   │   │   ├── (tabs)/     # 5-Button Bottom Nav: Home, Tests, Bookmarks, Analysis, Profile
│   │   │   │   ├── exam/       # Exam flow: instructions, timed, practice, result, solution, performance
│   │   │   │   └── auth/       # Student login & registration
│   │   │   ├── services/       # Exam & Attempt Supabase service
│   │   │   └── context/        # Auth Context
│   │   └── app.json            # Android configuration (package: com.vibhillion.app)
│   │
│   └── admin/                  # React + Vite admin dashboard
│       └── src/
│           ├── layouts/        # Responsive admin sidebar & header
│           ├── pages/          # Dashboard, Categories, Exams, Sections, Questions, Solutions, etc.
│           └── services/       # Admin CRUD & audit services
│
├── packages/
│   └── shared/                 # Shared TypeScript models, Zod schemas, & scoring engine
│       ├── src/types.ts
│       ├── src/scoring.ts      # Formula: (+2.0 * correct) - (0.5 * wrong), accuracy %
│       └── test/scoring.test.mjs
│
├── supabase/
│   ├── migrations/
│   │   └── 20261029000000_initial_schema.sql  # Full schema, RLS policies, & RPC functions
│   └── seed.sql                # Initial SSC CGL 2025 Shift 1 paper & sample English questions
│
├── docs/
│   └── SETUP.md
└── package.json
```

---

## 4. Dependency Installation

To install all workspace dependencies across student, admin, and shared packages:

```bash
# Build shared package first
cd packages/shared
npm install
npm run build
npm test

# Install and build admin web app
cd ../../apps/admin
npm install
npm run build

# Student app dependencies
cd ../student
npm install
```

---

## 5. Environment Variable Configuration

Both the student mobile app and admin web app share the exact same Supabase project URL and anon key.

### A. Student Mobile App (`apps/student/.env`)
Copy `apps/student/.env.example` to `apps/student/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

### B. Admin Web App (`apps/admin/.env`)
Copy `apps/admin/.env.example` to `apps/admin/.env`:

```bash
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

> **Security Note:** Never expose the `service_role` secret key in either application. Only the publishable `anon` key is required.

---

## 6. Supabase Project Creation

1. Log in to [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Click **New Project**.
3. Set **Project Name**: `vibhillion-exam-prep`.
4. Choose your database password and nearest region.
5. Once provisioned, go to **Project Settings** → **API**.
6. Copy the **Project URL** and the **anon public API key**.
7. Paste these credentials into both `apps/student/.env` and `apps/admin/.env`.

---

## 7. Database Migration Execution

1. In the Supabase Dashboard, open the **SQL Editor** from the left navigation.
2. Click **New query**.
3. Open the file `supabase/migrations/20261029000000_initial_schema.sql` in your editor.
4. Copy its entire content, paste it into the Supabase SQL Editor, and click **Run**.
5. Verify success. This script creates:
   - `profiles` with trigger on `auth.users`
   - `categories`, `exams`, `exam_sections`
   - `questions`, `question_options`, `question_answers` (RLS protected)
   - `exam_attempts`, `attempt_sections`, `attempt_answers`
   - `exam_participation`, `exam_settings`, `answer_key_audit_log`
   - Security Definer RPC functions: `submit_exam_attempt`, `get_attempt_solutions`, `reevaluate_exam_attempts`, and `bootstrap_admin`.

---

## 8. Initial Seed Data Import

1. In Supabase Dashboard → **SQL Editor**, open a new query.
2. Copy the content of `supabase/seed.sql` and run it.
3. This creates:
   - Category: **SSC**
   - Exam: **SSC CGL T-1 — Held on 12 Sep 2025, Shift 1**
   - 4 Configured Sections (English Comprehension, General Intelligence & Reasoning, Quantitative Aptitude, General Awareness)
   - Sample questions for English Comprehension with protected answer keys, explanations, and step-by-step solutions.

---

## 9. Admin Account Bootstrap

Because RLS prohibits candidates from elevating their own profile to `admin`:

1. Sign up a new user via the Student Mobile App or Admin Login page (e.g. `admin@vibhillion.ai`).
2. Run this command in the Supabase SQL Editor to elevate that email to administrator:

```sql
select public.bootstrap_admin('admin@vibhillion.ai');
```

Alternatively, you can navigate to the **Settings** page in the Admin Web App, enter the registered email, and click **Grant Admin Privileges**.

---

## 10. Row Level Security (RLS) Verification

You can verify that answer keys cannot be leaked to students before submission:
1. Try querying `public.question_answers` with an unauthenticated or student token:
   ```sql
   select * from public.question_answers;
   ```
   *Result:* Returns `0 rows` due to the RLS policy `"Only admins can access question_answers directly"`.
2. Solutions are only accessible through the `get_attempt_solutions(attempt_id)` RPC function, which verifies that `attempt.status = 'completed'`.

---

## 11. Launching the Student Mobile App

Open a terminal in the root folder:

```bash
# Start Expo development server
npm run student

# Or run directly targeting web preview
npm run student:web

# Or run targeting connected Android device / emulator
npm run student:android
```

- When using Expo Go, scan the displayed QR code with your phone.
- Web preview opens at `http://localhost:8081`.

---

## 12. Launching the Admin Web Console

In a separate terminal:

```bash
# Start Vite development server
npm run admin
```

The admin web console runs locally at `http://localhost:5173`.
- Log in using your bootstrapped admin credentials.
- Or click **Explore Demo Console Directly** to interactively test all views.

---

## 13. Android Virtual Device (Emulator) Setup

1. Open **Android Studio**.
2. Open **Tools** → **Device Manager**.
3. Click **Create Device** (e.g. Pixel 7 / Android 14 API 34).
4. Start the emulator.
5. In your terminal, run:
   ```bash
   cd apps/student
   npx expo run:android
   ```
6. Expo will detect the running emulator, install the app, and launch it automatically.

---

## 14. Testing on a Physical Android Device

1. Download **Expo Go** from the Google Play Store on your phone.
2. Ensure your computer and phone are connected to the same Wi-Fi network.
3. Run `npm run student` in terminal.
4. Open the camera or Expo Go on your phone and scan the terminal QR code.
5. If running on a restricted guest Wi-Fi, run:
   ```bash
   npx expo start --tunnel
   ```

---

## 15. Standalone Android APK & Production Build Options

To generate a standalone APK or AAB for Google Play:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Configure project builds:
   ```bash
   cd apps/student
   eas build:configure
   ```
4. Build a standalone APK for testing:
   ```bash
   eas build -p android --profile preview
   ```
5. Build an Android App Bundle (AAB) for Play Store:
   ```bash
   eas build -p android --profile production
   ```

---

## 16. Troubleshooting Common Issues

### Issue 1: "Network request failed" in mobile app
- Ensure your mobile device and computer are on the same local Wi-Fi.
- In `apps/student/.env`, ensure `EXPO_PUBLIC_SUPABASE_URL` starts with `https://`.

### Issue 2: "Attempt answers hidden until submission"
- This is intentional security behavior. In Timed Mode, answer keys are withheld on the database server until the student taps **Submit Test** or the timer reaches zero.

### Issue 3: "Port 5173 is already in use"
- Run `npx kill-port 5173` or specify a custom port in `apps/admin/vite.config.ts`.

---

## 17. Production Deployment Checklist

- [ ] Supabase migrations applied (`20261029000000_initial_schema.sql`).
- [ ] Initial seed data loaded (`seed.sql`).
- [ ] At least one administrator account bootstrapped via `select public.bootstrap_admin('...');`.
- [ ] Production environment variables configured in hosting platform (Vercel / Netlify for Admin, EAS for Student App).
- [ ] CORS allowed origins configured in Supabase under **Authentication** → **URL Configuration**.
- [ ] Deep linking redirect `vibhillion://auth/callback` registered in Supabase.
- [ ] All unit tests passing (`npm test` in `packages/shared`).
