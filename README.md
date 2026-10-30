# Vibhillion AI: Exam Prep (SSC CGL & Competitive Exams) 🎓

A complete, production-grade examination preparation platform featuring a **Student Android Application (React Native + Expo)** and an **Admin Web Application (React + Vite)** powered by a single shared **Supabase PostgreSQL** backend.

---

## 📱 System Applications

| Application | Technology | Features |
| :--- | :--- | :--- |
| **Student Android App** | React Native, Expo SDK 58, Expo Router, TypeScript | 5-tab bottom navigation (Home, Tests, Bookmarks, Analysis, Profile), SSC category drill-down, 2025 Shift-1 paper, Timed mode countdown engine with question palette, Practice mode with instant solution toggle, Result screen (+2.0, -0.5 formula), Question-wise step-by-step analysis, and deep topic performance recommendations. |
| **Admin Web Console** | React, Vite, TypeScript, React Router, Lucide | Executive dashboard metrics, Category CRUD, Exam management with draft/publish toggles, Section configuration with question/timer validation, Question authoring with 4 options, CSV bulk import/export, Answer key revision with audit trail & automatic re-evaluation, Attempt inspection, and Global exam settings. |
| **Shared Backend** | Supabase, PostgreSQL, RLS, Security Definer RPCs | Strict Row Level Security policies, protected answer keys (zero client-side leakage during tests), atomic server-side scoring function `submit_exam_attempt`, participation deduplication on `(exam_id, user_id)`, and admin bootstrap procedure. |

---

## ⚡ Quickstart Commands

### 1. Run Unit Tests (Scoring & Timing Engine)
```bash
npm test
```

### 2. Launch Student Mobile App (Expo)
```bash
npm run student
# Or preview in web browser:
npm run student:web
# Or run on connected Android device / emulator:
npm run student:android
```

### 3. Launch Admin Web Application (Vite)
```bash
npm run admin
```
Navigate to `http://localhost:5173` in your browser.

---

## 📖 Complete Documentation
For detailed step-by-step instructions on Supabase database migrations, seed data import, admin bootstrap, and Android APK compilation, see [`docs/SETUP.md`](./docs/SETUP.md).

