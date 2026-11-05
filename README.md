# 🎧 All Ears — Interactive English Listening Teaching Platform

**All Ears** is a full-featured English listening teaching web application built with **React, TypeScript, Tailwind CSS, and Firebase** (Authentication, Cloud Firestore, Storage, and Hosting).

It empowers teachers to turn YouTube clips or audio/video files into formative listening experiences with synchronized live classroom hosting, interactive vocabulary hotspots, and 6 question types.

---

## 🌟 Key Features

### 1. Teacher Studio & Lesson Creator
- **Media Inputs**: Insert any YouTube URL (with YouTube Iframe API sync) or upload direct audio/video.
- **Synchronized Captions**: Upload `.vtt` / `.srt` files or paste timed cues. Timed cues display in sync with playback.
- **Vocabulary Hotspots**: Tag difficult words in the transcript with:
  - Phonetic transcription (e.g., `/ˌkɒm.prɪˈhen.ʃən/`)
  - Audio pronunciation (Web Speech API)
  - Part of speech
  - Plain English definition
  - Illustrative context sentence and image
- **Formative Assessment Generator (6 Types)**:
  1. **Multiple Choice** (single-choice with options, explanation, and points)
  2. **Matching Pairs** (interactive matching between vocabulary/phrases and meanings)
  3. **Close-Ended** (short answer keyword validation with synonym tolerance)
  4. **Open-Ended** (free-response reflection with model answer and scoring rubric)
  5. **Drag and Drop** (chronological sequencing or category bucketing)
  6. **Fill in the Blanks** (cloze passage with missing tokens and word bank)

### 2. Live Hosting Engine (Kahoot / Nearpod style)
- **Room Code Generation**: Teacher clicks **Host Live Lesson** to generate a 6-character room code (e.g. `EAR42`).
- **Real-Time Playback Synchronization**:
  - Play, pause, seek, speed controls (0.5x – 2x), and caption toggles are controlled by the teacher and mirrored to all connected students.
  - Student playback controls are locked (`Controlled by Teacher` status indicator).
- **Synchronized Question Triggers**:
  - When media plays to a question's timestamp, the video/audio **auto-pauses**.
  - The question is prominently highlighted on all students' screens for them to answer.
  - Teacher cockpit shows real-time submission count and live answer distribution.
  - **Reveal Answer**: Teacher clicks a button to broadcast correct answers, feedback, and context explanations to all students.
- **Classroom Vocabulary Spotlight**:
  - Teacher can click any difficult word from the sidebar or caption text.
  - Auto-pauses audio and broadcasts a **Spotlight Card** to all students' screens simultaneously!
- **End-of-Session Analytics**:
  - Class average score, question-by-question accuracy rate, student leaderboard, and CSV export.

### 3. Student Experience
- **Live Mode**: Join via 6-character room code; audio synced with teacher; questions unlocked at timestamps; can independently click difficult words in captions anytime to view gloss cards.
- **Homework / Self-Paced Mode**:
  - Full player control (play, pause, -5s rewind, +5s forward, speed selector, captions toggle).
  - Instant formative feedback upon answering questions with celebratory confetti.
  - Full review report with correct answers and explanations.

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Side-by-Side Live Session Testing
To test the Teacher and Student experience on the same computer:
1. Open [http://localhost:3000](http://localhost:3000) in **Tab 1** (as Teacher `Prof. Eleanor Vance`). Click **Host Live Lesson** on "The Secrets of Learning a New Language". Note the room code (e.g. `EAR42`).
2. Open [http://localhost:3000](http://localhost:3000) in **Tab 2** (or Incognito window). Use the top-right profile switch to select **Student (Alex Smith)**.
3. In Tab 2, enter the room code in the **Join Live Class** box and click **Join**.
4. In Tab 1 (Teacher), press **Play**. Notice Tab 2 synchronizes playback, pauses at questions, allows student answering, and reveals answers when the teacher presses **Reveal Answer**!

### 3. Firebase Configuration
The app includes a built-in multi-tab reactive sync system that works immediately out-of-the-box.
To connect to your live Firebase Cloud project:
1. Click the **Firebase Mock / Live** pill in the top navigation bar.
2. Enter your Firebase project credentials (`apiKey`, `projectId`, `authDomain`, `storageBucket`, `appId`).
3. Click **Save & Reload**.

### 4. Deploy to Firebase Hosting
```bash
npm run build
firebase deploy
```
