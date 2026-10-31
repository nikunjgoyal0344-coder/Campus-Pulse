# 🎓 Campus Pulse — Intelligent Student Campus Radar

> **Problem Solved**: Students at every college face daily friction with scattered notices on chaotic WhatsApp groups, lost emails, poster photos, and missed deadlines. **Campus Pulse** gives students one clear, intelligent radar to stay on top of campus life — turning messy forwards into prioritized, actionable cards in one tap.

[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployment%20Ready-black?style=flat&logo=vercel)](https://vercel.com)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20NPM-emerald?style=flat)](https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git)
[![Repo Size](https://img.shields.io/badge/Repo%20Size-%3C%201%20MB-blue?style=flat)](https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git)
[![Branches](https://img.shields.io/badge/Branches-1%20(main)-indigo?style=flat)](https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git)

---

## 🌟 Key Features (Complete 14-Feature Suite)

### 1. Smart Text Input & Notice Radar
- **Large Dropzone**: Paste any chaotic WhatsApp forward, email body, or caption.
- **Robust NLP Extractor**: Automatically isolates **Title**, **Date**, **Time**, **Venue/Room**, **Category**, **Short Description**, and **Links**.
- **Indian College Slang Handling**: Natively understands `"tmrw"`, `"kal"`, `"audi 2"`, `"compulsory attendance"`, `"LMS portal"`.
- **Poster Photo OCR Upload Simulation**: Snap a picture of a physical notice board poster to auto-extract text!
- **1-Click Test Presets**: Includes 4 realistic test sample chips (*WhatsApp Exam Forward*, *Hackathon Fest*, *Placement Drive*, *Hostel Mess Alert*).
- **Inline Field Edit**: Review and adjust extracted fields before publishing.

### 2. Organised Dashboard & Dual Views
- **Stream View**: High-legibility cards with takeaway boxes (*Scheduled Time*, *Venue*, *Status*).
- **Interactive Calendar View**: Month and weekly grid mapping campus notices directly onto their dates with day schedule popovers.
- **Dynamic Category Pills**: Real-time counter badges for *Academic*, *Urgent Deadlines*, *Free Food & Perks*, *Placements*, *Hackathons*, *Hostel/Admin*.
- **Natural Language Search**: Understands queries like `"deadlines this week"`, `"free pizza"`, `"placement talks"`.

### 3. Priority & Attention System
- **Pinned "Needs Attention Today" Hero Shelf**: Sticky top section highlighting items due in < 24 hours.
- **Visual Urgency Coding**: 🔴 Red (Urgent / Today), 🟡 Amber (This Week), ⚪ Grey (Upcoming / Past).
- **One-Tap "Mark as Done / Attended"**: Crosses off finished tasks to keep your radar clean.
- **Browser Reminders**: One-tap browser notification alert scheduling.

### 4. AI Weekly Executive Digest ("What do I need to know this week?")
- **One-Click Digest Generator**: Synthesizes this week's priorities into *Critical Deadlines*, *Confirmed Free Food Perks*, and *Must-Attend Talks*.
- **Sub-Filter Focus**: Focus digest by *"Only Academics"*, *"Only Free Food"*, or *"Only Placement & Tech"*.
- **WhatsApp Batch Summary Generator**: Formats a clean emoji-bulleted summary ready to copy and forward to class WhatsApp groups.
- **Audio Voice Synthesis**: Built-in speech synthesis (`Web Speech API`) to read your weekly briefing aloud!

### 5. Google Ecosystem Tools & Integrations
- **1-Click Google Calendar Sync**: Deep-links pre-filled events directly into Google Calendar with title, location, description, and dates.
- **Apple & Outlook Calendar (.ICS)**: Generates and downloads standard `.ics` files.
- **Google Fonts & Typography**: Google's `Plus Jakarta Sans` & `Inter`.
- **Google Material Symbols**: Clean, accessible iconography.

### 6. Additional & Stretch Features
- **Duplicate Notice Detection**: Detects similar notices and offers to merge.
- **Room Conflict & Collision Warning**: Alerts students when two events are double-booked in the same venue simultaneously.
- **Collapsible Raw Source**: Stores and displays the original unedited WhatsApp message for verification.
- **Student Profile**: Customizes alerts according to Academic Year, Department, and Interests.
- **Dark Mode**: Seamless toggle between Clean Paper and Midnight Obsidian themes.
- **100% Offline Support**: Client-side `localStorage` caching with JSON backup/restore.

---

## 📁 Repository Structure

```
Campus-Pulse/
├── index.html          # Semantic, accessible application shell & layout
├── vercel.json         # Production Vercel deployment configuration
├── PLAN.md             # 10-Fragment roadmap mapped to all 14 features
├── UI_PROMPT.md        # Functional UI/UX natural-language specification
├── css/
│   └── styles.css      # Dark mode, custom focus outlines, micro-animations
├── js/
│   ├── data.js         # Initial campus seed dataset & 1-click test presets
│   ├── storage.js      # LocalStorage persistence service & backup engine
│   ├── extractor.js    # NLP text parser (Indian slang, dates, venues, perks)
│   ├── digest.js       # Weekly AI briefing & WhatsApp batch formatter
│   ├── calendar.js     # Monthly interactive calendar grid & popover
│   └── app.js          # Main application controller & event wiring
└── README.md           # Project documentation
```

---

## 🚀 How to Run Locally

Because Campus Pulse has **zero build dependencies**, you can run it instantly using any of the following methods:

### Option 1: Direct Browser Launch
Simply double-click `index.html` or open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: Using Python 3
```bash
# In the Campus-Pulse directory:
python -m http.server 3000
```
Open `http://localhost:3000` in your browser.

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
- **Accessibility**: Semantic HTML5 landmarks, ARIA labels, keyboard navigation (`/` to focus search, `Esc` to close modals).
