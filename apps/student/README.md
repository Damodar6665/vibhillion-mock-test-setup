# Vibhillion App - React Native + Expo + Supabase (Android Ready) 🚀

This project is a complete setup for building an Android mobile application using **React Native**, **Expo SDK 58 (Expo Router)**, and **Supabase** backend (Auth, Database, Realtime, and Storage).

---

## 📱 Features & Highlights

- **React Native & Expo Router**: File-based navigation with native tabs, type-safe routing, and modern UI tokens.
- **Supabase Integration**:
  - `@supabase/supabase-js` client configured for React Native.
  - `@react-native-async-storage/async-storage` for auto-refreshing, persistent auth sessions across app restarts.
  - `react-native-url-polyfill` for URL and WebSocket handling.
  - Interactive Supabase Auth screen (`src/app/supabase.tsx`) with sign-in, sign-up, session inspector, and database connectivity test.
  - Custom `useAuth()` hook and `AuthProvider` context.
- **Android Configuration**:
  - Package ID: `com.vibhillion.app` configured in `app.json`.
  - Android permissions: `INTERNET` enabled.
  - Deep linking scheme: `vibhillion://` ready for OAuth redirects (`vibhillion://auth/callback`).

---

## 🛠️ Getting Started

### 1. Configure Supabase Environment Variables

Open the `.env` file in the root folder and add your credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Where to find them:** Supabase Dashboard → **Project Settings** → **API**.

### 2. (Optional) Run Initial Database Schema

To set up a `profiles` table with automatic signup triggers and Row Level Security, copy the contents of [`supabase_schema.sql`](./supabase_schema.sql) and run it in your **Supabase Dashboard → SQL Editor**.

---

## 🤖 Running on Android

### Option A: Running on Physical Android Device (Expo Go)
1. Install **Expo Go** from Google Play Store on your Android phone.
2. Ensure your computer and phone are connected to the same Wi-Fi network.
3. Start the dev server:
   ```bash
   npm run start
   ```
4. Scan the QR code displayed in the terminal using the Expo Go app.

### Option B: Running on Android Emulator
1. Start an Android Virtual Device (AVD) from Android Studio.
2. Run:
   ```bash
   npm run android
   ```
3. Expo will automatically detect the running emulator and install/launch the application.

### Option C: Web Preview (Dev Mode)
To test UI and Auth quickly in the browser:
```bash
npm run web
```

---

## 🔗 Android Deep Linking & OAuth Setup

If you want to enable Google, Apple, or GitHub OAuth sign-in via Supabase on Android:

1. **Deep Link Scheme**: Configured as `vibhillion://` in `app.json`.
2. **Supabase Redirect URL**:
   In your Supabase Dashboard under **Authentication** → **URL Configuration**, add:
   ```text
   vibhillion://auth/callback
   ```

---

## 📂 Project Structure

```text
├── .env                         # Local environment variables (git-ignored)
├── .env.example                 # Example environment template
├── app.json                     # Expo & Android app configuration
├── supabase_schema.sql          # Sample SQL schema for profiles & auth trigger
├── src/
│   ├── app/                     # Expo Router file-based screens
│   │   ├── _layout.tsx          # Root theme & AuthProvider wrapper
│   │   ├── index.tsx            # Home screen with quick start guide
│   │   ├── explore.tsx          # Explore screen
│   │   └── supabase.tsx         # Live Supabase Auth & Android tester screen
│   ├── components/              # UI components & themed elements
│   ├── constants/               # Colors, Spacing, and Theme tokens
│   ├── context/
│   │   └── auth-context.tsx     # Supabase Auth Context & useAuth() hook
│   ├── lib/
│   │   └── supabase.ts          # Supabase client with AsyncStorage & URL polyfill
│   └── types/                   # TypeScript module declarations
└── package.json
```

---

## 📦 Building a Standalone Android APK / AAB (Production)

To build a standalone APK or AAB for Google Play:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to Expo:
   ```bash
   eas login
   ```
3. Configure and build:
   ```bash
   eas build:configure
   eas build -p android --profile preview
   ```
