# Cirqo 🎡

A **production-ready offline-first** party game built with Next.js (App Router), TypeScript, Tailwind CSS, Zustand, and Dexie (IndexedDB). 

Spin the wheel, get a dare, and have fun — with a smart consent-aware filtering engine. No backend required!

## Features

- **Offline-First**: Uses `next-pwa` and Service Workers to work entirely offline after the first visit.
- **Local Storage**: All sessions, players, and custom dares are saved securely in your browser using IndexedDB.
- **Smart Consent Engine**: Dares are dynamically filtered based on every player's comfort level (spice level 1-5, physical boundaries, alcohol preferences, and custom tags).
- **Smooth Animations**: Powered by Framer Motion for a premium app-like feel.
- **Dark Neon UI**: Custom Tailwind theme optimized for mobile party environments.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Storage**: Dexie (IndexedDB)
- **Animations**: Framer Motion
- **PWA**: `next-pwa`

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment on Vercel

This app is designed to be deployed on Vercel with **zero configuration**.

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com/new).
3. Import the project.
4. Keep the default settings (Framework Preset: Next.js).
5. Click **Deploy**.

Because the app is entirely client-side and offline-first (MVP), there are no environment variables or backend databases to configure.
