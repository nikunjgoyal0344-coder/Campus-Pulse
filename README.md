# 🎓 Campus Pulse — Intelligent Student Campus Radar

> **Problem Solved**: Students at every college face daily friction with scattered notices on chaotic WhatsApp groups, lost emails, poster photos, and missed deadlines. **Campus Pulse** gives students one clear, intelligent radar to stay on top of campus life — turning messy forwards and poster photos into prioritized, actionable cards in one tap.

[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployment%20Ready-black?style=flat&logo=vercel)](https://vercel.com)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20NPM-emerald?style=flat)](https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git)
[![Test Suite](https://img.shields.io/badge/Tests-13%2F13%20PASS-brightgreen?style=flat)](https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git)
[![Repo Size](https://img.shields.io/badge/Repo%20Size-%3C%201%20MB-blue?style=flat)](https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git)
[![Branches](https://img.shields.io/badge/Branches-1%20(main)-indigo?style=flat)](https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git)

---

## 🌟 Full Feature Breakdown

### 1. Smart Text Ingestion & Notice Radar
- **Large Dropzone**: Paste any chaotic WhatsApp forward, email body, or caption.
- **Robust NLP Extractor**: Automatically isolates **Title**, **Date**, **Time**, **Venue/Room**, **Category**, **Short Description**, and **Links**.
- **Indian College Slang Handling**: Natively parses `"tmrw"`, `"kal"`, `"audi 2"`, `"compulsory attendance"`, `"LMS portal"`.
- **Poster OCR & Vision Studio**: Features an animated sweeping neon laser line over notice board posters with real-time bounding box detection.
- **1-Click Test Presets**: Includes 4 realistic test sample chips (*WhatsApp Exam Forward*, *Hackathon Fest*, *Placement Drive*, *Hostel Mess Alert*).
- **Inline Field Edit Chips**: Review and adjust extracted fields before publishing.

### 2. Organised Dashboard & Dual Views
- **Stream View**: High-legibility cards with takeaway summary boxes (*Scheduled Time*, *Venue*, *Status*).
- **Interactive Calendar View**: Month and weekly grid mapping campus notices directly onto their dates with day schedule popovers.
- **Dynamic Category Filter Pills**: Real-time counter badges for *Academic*, *Urgent Deadlines*, *Free Food & Perks*, *Placements*, *Hackathons*, *Hostel/Admin*.
- **Natural Language Search**: Understands queries like `"deadlines this week"`, `"free pizza"`, `"placement talks"`.

### 3. Priority & Attention System
- **Pinned "🚨 Needs Attention Today" Hero Shelf**: Sticky top banner displaying cutoffs due in < 24 hours.
- **Visual Urgency Coding**: 🔴 Red (Urgent / Today), 🟡 Amber (This Week), ⚪ Grey (Upcoming / Past).
- **1-Tap "Mark as Done / Attended"**: Immediately archives or checks off completed items with a particle confetti celebration!
- **Browser Reminders**: One-tap browser notification alert scheduling.

### 4. AI Weekly Executive Digest ("What do I need to know this week?")
- **One-Click Digest Generator**: Synthesizes this week's priorities into *Critical Deadlines*, *Confirmed Free Food Perks*, and *Must-Attend Talks*.
- **Sub-Filter Focus**: Focus digest by *"Only Academics"*, *"Only Free Food"*, or *"Only Placement & Tech"*.
- **WhatsApp Batch Summary Generator**: Formats a clean emoji-bulleted summary ready to copy and forward to class WhatsApp groups.
- **Voice Speech Synthesis**: Built-in speech synthesis (`Web Speech API`) to read the weekly briefing aloud.

### 5. Google Ecosystem Tools & Integrations
- **1-Click Google Calendar Sync**: Deep-links pre-filled events directly into Google Calendar with title, location, description, and dates.
- **Google Gemini AI Integration**: Live multimodal extraction settings drawer with seamless client-side NLP fallback.
- **Apple & Outlook Calendar (.ICS)**: Generates and downloads standard `.ics` files.
- **Google Fonts & Typography**: `Plus Jakarta Sans` & `Inter`.
- **Google Material Symbols**: Accessible Google iconography.

### 6. Interactive AI Chat Assistant ("Ask Campus Pulse")
- Natural language floating campus assistant capable of answering questions about free food, upcoming deadlines, placement drives, and room venues.
- 1-click prompt chips for rapid testing.

### 7. Interactive Student ID Portal & Profiles
- Digital University ID Card mockup with live student roll number, avatar, CGPA, and branch.
- 1-Click Fast Student Switcher between **Alex Rivera** (CS 3rd Year), **Priya Sharma** (AI/ML 4th Year), and **Rohan Mehta** (Robotics 2nd Year).
- Simulated Google Student Single Sign-On.

### 8. Visual Graphs & Analytics
- **Weekly Deadline Heat intensity bar chart** (Mon-Sun breakdown).
- **Attendance / Action Rate circular SVG ring** (tracks percentage of notices acted upon).
- **Notice Volume by Stream bar graph** (Academics, Placements, Hackathons, Clubs, Sports, Admin).
- **Perks & Value Tracker**: Free meals, pizza, boba drinks, and student grant funding tracked.

### 9. Room Booking Conflict Resolver
- Detects double-booking clashes (e.g., Engineering Atrium simultaneously booked by Career Fair and Debate Society) and provides 1-click auto-rescheduling.

### 10. Power-User Keyboard Shortcuts
- `/` &rarr; Focus Search
- `D` &rarr; Open AI Weekly Digest
- `C` &rarr; Toggle Calendar / Stream View
- `A` &rarr; Open "Ask Campus Pulse" AI Assistant
- `T` &rarr; Toggle Dark / Light Theme
- `?` &rarr; Open Shortcuts Modal
- `Esc` &rarr; Close any active modal

---

## 📁 Repository Structure

```
Campus-Pulse/
├── index.html          # Accessible single-page web app structure
├── vercel.json         # Production Vercel deployment configuration
├── test.js             # Automated unit test suite (13/13 tests pass)
├── PLAN.md             # 10-Fragment roadmap mapped to all 14 features
├── UI_PROMPT.md        # Functional UI/UX specification
├── favicon.svg         # Branded SVG favicon
├── css/
│   └── styles.css      # Dark mode, animations, print timetable styles
└── js/
    ├── data.js         # 12+ realistic campus notices & student profiles
    ├── storage.js      # LocalStorage persistence & backup engine
    ├── extractor.js    # NLP text parser (Indian slang, dates, venues, perks)
    ├── digest.js       # Weekly AI briefing & WhatsApp batch formatter
    ├── calendar.js     # Monthly interactive calendar grid & popover
    ├── analytics.js    # Interactive SVG graphs (Weekly heat, completion ring)
    ├── chat.js         # "Ask Campus Pulse" conversational AI assistant
    ├── scanner.js      # Poster OCR & vision studio with laser canvas
    ├── gemini.js       # Google Gemini AI live extraction engine
    └── app.js          # Master controller & event wiring
```

---

## 🧪 Automated Testing

Campus Pulse includes a zero-dependency CLI test suite covering text sanitization, Indian slang normalization, venue extraction, category classification, perks detection, and conflict warnings:

```bash
node test.js
```

**Results: 13 Passed, 0 Failed.**

---

## 🚀 How to Run Locally

Because Campus Pulse has **zero build dependencies**, you can run it instantly using any of the following methods:

### Option 1: Direct Browser Launch
Simply double-click `index.html` or open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: Using Python 3
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000`.

### Option 3: Using Node.js
```bash
npx serve .
```

---

## ⚡ Deployment to Vercel

This repository is pre-configured with `vercel.json` for instant static hosting:
1. Push to your GitHub repository: `https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git`
2. Import repository in [Vercel](https://vercel.com).
3. Framework Preset: **Other** (Static HTML).
4. Click **Deploy**. Done!

---

## 🎯 Verification Against Constraints

- **Repository Link**: `https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git`
- **Branches**: Exactly **1 branch** (`main`).
- **Repository Size**: **< 1 MB** (well under the 10 MB limit).
- **Accessibility**: Semantic HTML5 landmarks, ARIA labels, keyboard navigation.
