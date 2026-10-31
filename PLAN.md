# 🎓 Campus Pulse — Project Roadmap & Task Breakdown

> **Project Mission**: Transform chaotic campus notices (WhatsApp forwards, emails, posters) into a single, intelligent, priority-ranked campus radar for students.
>
> **Repository**: `https://github.com/nikunjgoyal0344-coder/Campus-Pulse.git`  
> **Deployment Target**: Vercel (Production Static Web Application)  
> **Repository Constraints**: Exactly 1 branch (`main`), strictly < 10 MB total size.

---

## 🏗️ Architecture & Technology Stack
- **Frontend Core**: Vanilla HTML5 (Semantic & Accessible), Modular ES6+ JavaScript, Responsive CSS3 (Custom Properties & Fluid Layouts).
- **Google Ecosystem Tools**:
  - **Google Gemini AI API Integration**: AI-powered unstructured extraction & weekly synthesis (with zero-config instant offline fallback parser).
  - **Google Calendar 1-Click Sync**: Direct deep-linking with pre-filled event metadata.
  - **Google Fonts & Design**: Google `Plus Jakarta Sans` typography + Google Material Symbols.
- **Persistence & Privacy**: Local-first `localStorage` storage engine with zero external database dependencies.
- **Vercel Ready**: Optimized static architecture with `vercel.json` routing and caching headers.

---

## 📦 Fragment Breakdown (Directly Mapped to 14 Feature Checklist)

### 🔹 Fragment 1: Scaffolding, Design System & Offline Foundation (Features 5, 13, 14)
- [ ] Create `index.html` with semantic structure (Header, Hero Radar, Quick Actions, Main Stream, Calendar View, Drawers, Modals).
- [ ] Setup `css/styles.css` containing:
  - Minimal, calm design with lots of whitespace and clear visual hierarchy.
  - Light & Dark mode themes with accessible WCAG AAA contrast.
  - Mobile-first responsive layouts (looks beautiful on phone and desktop).
  - Urgency color scheme: 🔴 Red (Today/Urgent), 🟡 Amber (This Week), ⚪ Grey (Later/Expired).
- [ ] Create `vercel.json` for zero-configuration instantaneous Vercel deployments.
- [ ] Create `.gitignore` to keep git history pristine and guarantee `< 10 MB`.
- [ ] Offline-ready architecture (`localStorage` caching for instant offline viewing).

---

### 🔹 Fragment 2: Seed Dataset & Local Storage Service (Features 2, 7, 9, 14)
- [ ] Create `js/data.js`:
  - Categories: `Academic`, `Club`, `Cultural`, `Sports`, `Deadline`, `Placement`, `Admin`, `Social`, `Other`.
  - Realistic Indian college campus notices (messy WhatsApp forwards with emojis, "tmrw", "audi-2", compulsory attendance).
- [ ] Implement `StorageService` in `js/storage.js`:
  - Full CRUD operations with `localStorage` persistence.
  - History of added notices with collapsible original raw text storage.
  - Personal profile data (Year, Department, Interests, Custom Tags: *Must Attend*, *Optional*, *Group Project*).
  - "Mark as Done" / "Mark as Attended" state tracker.

---

### 🔹 Fragment 3: Smart NLP & Extraction Engine (Features 1, 11, 12)
- [ ] Create `js/extractor.js`:
  - **Text Parser**: Automatically extracts Title, Date, Time, Venue, Category, Short Description, and Registration/Google Form Links.
  - **Relative Date Engine**: Resolves "today", "tomorrow", "tmrw", "kal", "next Monday", "Friday 5 PM", "23:59".
  - **Category Auto-Classifier**: Intelligently tags notices into Academic, Club, Cultural, Sports, Deadline, Placement, Admin, Social, Other.
  - **Urgency Detector**: Identifies deadlines < 24h, today's events, and high-priority keywords.
  - **Duplicate Detection (Feature 11)**: Detects similar titles and dates; offers "Merge" or "Keep separate".
  - **Time Conflict Warning (Feature 12)**: Checks for overlapping events and flags a friendly scheduling conflict warning.

---

### 🔹 Fragment 4: Smart Text Input Hub & Poster OCR (Feature 1)
- [ ] Build **Smart Text Input Drawer**:
  - Large paste box on home screen with gentle empty state guidance ("Paste any notice here and watch the magic").
  - 1-Click test presets for fast evaluation (Exam forward, Hackathon poster, Placement drive, Hostel notice).
  - **Poster Photo Upload (OCR Simulation)**: Upload/snap a photo of a notice board poster with instant text recognition & extraction.
  - **Confidence Indicators & 1-Tap Field Edit**: Inline editable chips for Title, Date, Time, Venue, and Category before saving.
  - Original raw text preserved and collapsible.

---

### 🔹 Fragment 5: Dashboard, Priority & "Needs Attention Today" (Features 2, 3, 6)
- [ ] Build pinned **"Needs Attention Today" Shelf** at the top of the dashboard.
- [ ] Build **Dashboard Stream & Card Feed**:
  - Badges: `Urgent`, `Upcoming`, `Happening Today`, `Expired`.
  - Color cues: 🔴 Red (urgent/today), 🟡 Amber (this week), ⚪ Grey (later/expired).
  - **1-Tap Quick Actions on Cards**:
    - 📅 Add to Google Calendar / Apple Calendar.
    - 🔗 Copy registration link.
    - 📋 Share cleaned version of the notice.
    - 🔔 Set personal reminder (browser notification or in-app alert).
    - ✅ Mark as Done / Attended (moves out of active view or marks completed).
    - 🗑️ Delete or Archive.

---

### 🔹 Fragment 6: Interactive Calendar View (Feature 2)
- [ ] Build `js/calendar.js`:
  - Toggle between **List view** and **Calendar view**.
  - Month and weekly view mapping campus events directly to their respective dates.
  - Category and urgency dot badges on calendar days.
  - Popover modal showing day's scheduled events on click.

---

### 🔹 Fragment 7: Smart Search, Filters & Personalisation (Features 2, 7, 8)
- [ ] Build **Smart Search Bar**:
  - Works on title, venue, and description.
  - Natural language query understanding (`"deadlines next week"`, `"cultural events"`, `"placement talks"`).
- [ ] Build **Filter Controls**:
  - Category filter chips with active count badges (Academic, Club, Cultural, Sports, Deadline, Placement, Admin, Social, Other).
  - Time filter: *Today*, *This Week*, *Upcoming*, *Expired*.
- [ ] Build **Student Profile Drawer**:
  - Year, Department, Interests.
  - AI feed prioritization based on user interests.
  - Personal tags (*Must Attend*, *Optional*, *Group Project*).

---

### 🔹 Fragment 8: AI Weekly Digest & WhatsApp Group Forward (Features 4, 10)
- [ ] Create `js/digest.js`:
  - Prominent **"What do I need to know this week?"** button on the home screen.
  - Generates a short, readable digest of deadlines, important events, and priority items.
  - Regenerate with focused filters: *"Only Academic"*, *"Only Free Events"*, *"Only Deadlines"*.
  - **Batch WhatsApp Forward**: 1-click formatted copy with clean emojis for batch WhatsApp groups.
  - Audio speech synthesis ("Listen to Briefing") via Web Speech API.

---

### 🔹 Fragment 9: Google Tools & Calendar Export (Features 6, 10)
- [ ] Google Calendar deep link generator with pre-filled event details.
- [ ] `.ics` iCalendar export for Apple Calendar and mobile devices.
- [ ] Data Export: Export this week's items or all cards as formatted text or JSON.

---

### 🔹 Fragment 10: Final Polish, Security, a11y & Verification (Features 5, 13, 14)
- [ ] Zero-instruction UX audit (intuitive empty states, friendly tooltips, calm visual hierarchy).
- [ ] Security: Sanitization of all user inputs to prevent XSS.
- [ ] Accessibility: Keyboard navigation (Tab, Esc, `/` to focus search), semantic landmarks, ARIA labels.
- [ ] Git & Size Audit: Verify strictly 1 branch (`main`) and repository size < 10 MB.
- [ ] Vercel deployment check.
