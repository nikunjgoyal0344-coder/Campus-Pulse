# 🛠️ Campus Pulse — Functional & Structural UI/UX Prompt

> A functional and structural prompt focusing purely on application architecture, component hierarchy, user interactions, and core system functions. All styling and color-grading references have been omitted.

---

```markdown
### SYSTEM ROLE & OBJECTIVE
You are a Lead Software Architect and UX Engineer. Build a fully functional, zero-instruction web application named "Campus Pulse". The application converts unstructured, chaotic campus announcements (WhatsApp forwards, emails, poster captions) into an intelligent, searchable, priority-ranked student radar with calendar integration, duplicate/conflict detection, and weekly AI summaries.

---

### 1. APPLICATION ARCHITECTURE & LAYOUT STRUCTURE

```
[ Campus Pulse Application Root ]
├── 1. Top Navigation Bar
│   ├── Brand Identifier (App Title + Version Indicator)
│   ├── "What do I need to know this week?" Action Button (Triggers AI Weekly Digest Modal)
│   ├── View Theme Switcher (Toggles Theme State)
│   └── Student Profile Trigger Button (Opens Profile Configuration Drawer)
│
├── 2. Pinned Top Shelf: "Needs Attention Today"
│   ├── Section Header (Active Urgent Count + Countdown Indicator)
│   └── Urgent Item Grid / Carousel (Cards with deadline < 24 hours)
│
├── 3. Smart Radar Ingestion Hub
│   ├── Large Multiline Text Input (Dropzone for messy notices)
│   ├── OCR Poster Photo File Upload Button & File Input Handler
│   ├── One-Click Sample Notice Preset Buttons (Exam, Hackathon, Placement, Hostel)
│   ├── Extracted Fields Review & Inline-Edit Panel (Title, Date, Time, Venue, Category)
│   ├── Duplicate Notice Warning & Merge Prompt
│   ├── Schedule Conflict Warning Indicator
│   └── "Save to Radar" Confirmation Action
│
├── 4. Search, Filter & View Controls Toolbar
│   ├── Universal Natural-Language Search Bar (Titles, Venues, Descriptions, Relative Dates)
│   ├── Category Filter Pills Bar with Live Count Badges (Academic, Club, Cultural, Sports, Deadline, Placement, Admin, Social, Other)
│   ├── Status / Time Range Segmented Filters (All, Today, This Week, Upcoming, Expired)
│   └── Dual View Switcher (Stream List View ⇄ Interactive Calendar View)
│
├── 5. Main Content Area (Conditional Rendering based on View Switcher)
│   ├── Stream List View:
│   │   ├── Active Cards Container (Sorted by Urgency / Nearest Deadline)
│   │   ├── Completed / Attended Section (Collapsible archive)
│   │   └── Empty State Guide (Instructions and preset hints when no cards match)
│   └── Interactive Calendar View:
│       ├── Month / Week Navigation Controls (Previous, Today, Next)
│       ├── Calendar Date Grid (Date cells with event badge counters)
│       └── Day Detail Modal / Flyout (Displays notices occurring on selected date)
│
└── 6. Interactive Modals & Drawers
    ├── AI Weekly Digest Modal (Summary sections, category focus filters, WhatsApp batch copy, speech synthesis)
    ├── Student Profile Drawer (Year, Department, Interests, Personal Tags)
    ├── Raw Notice Source Viewer (Displays unaltered original pasted text)
    └── Toast Notification / Alert Dispatcher
```

---

### 2. DETAILED COMPONENT SPECIFICATIONS & FUNCTIONS

#### A. Top Navigation Bar
- **Functions**:
  - `openDigestModal()`: Aggregates active items for the current week and opens the AI executive summary.
  - `openProfileDrawer()`: Opens the student preference settings.
  - `toggleTheme()`: Toggles and persists user interface preference in `localStorage`.

#### B. Pinned Shelf: "Needs Attention Today"
- **Visibility Condition**: Automatically renders only when one or more saved items have a deadline or start time within 24 hours of current system time.
- **Card Contents & Actions**:
  - Item Title and Category tag.
  - Remaining time counter (calculated dynamically against system clock).
  - Quick Action: `markAsDone(itemId)` — instantly flags item completed and moves it out of active urgent view.
  - Quick Action: `openExternalLink(url)` — opens registration/form link if present.

#### C. Smart Radar Ingestion Hub
- **Functions**:
  - `handleTextInput(rawText)`: Receives messy pasted text and triggers the parsing engine.
  - `handlePosterUpload(file)`: Simulates / performs OCR text extraction from uploaded image file and pipes text directly into `handleTextInput()`.
  - `loadSamplePreset(presetKey)`: Populates input with realistic campus forwards (e.g., messy exam alert, hackathon notice, placement PPT) for instant one-click testing.
  - `reviewExtractedData()`: Displays editable chip inputs for:
    - Title (String)
    - Date (YYYY-MM-DD)
    - Time (HH:MM in 12h / 24h format)
    - Venue / Location (String: hall number, audi, online link)
    - Category (Dropdown / Pill selector)
    - Registration Link (URL)
    - Raw Original Text (Stored reference)
  - `checkDuplicates(extractedItem)`: Checks current store for matching dates and high string similarity. If matched, prompts: *"Similar notice already exists. Merge or create new?"*
  - `checkTimeConflicts(extractedItem)`: Checks for overlapping events at the exact same date and time slot. Flags warning: *"You have another event scheduled at this time."*
  - `saveNotice(item)`: Commits validated card to local storage and updates all feed views.

#### D. Universal Search & Filter Controls
- **Functions**:
  - `executeSearch(query)`: Real-time debounced query evaluator. Supports:
    - Text search across titles, descriptions, venues, contacts.
    - Natural language queries: `"deadlines next week"`, `"placement talks"`, `"events in audi 2"`.
  - `filterByCategory(categoryName)`: Filters displayed cards by selected category. Updates active badge count.
  - `filterByTimeStatus(status)`: Filters by `Today`, `This Week`, `Upcoming`, or `Expired`.
  - `switchView(viewMode)`: Toggles between `'list'` and `'calendar'`.

#### E. Event Card Structure & Actions
Each card in the stream contains:
- **Structural Fields**:
  - Urgency Badge (`URGENT`, `THIS WEEK`, `UPCOMING`, `EXPIRED`).
  - Category Badge (`Academic`, `Club`, `Cultural`, `Sports`, `Deadline`, `Placement`, `Admin`, `Social`, `Other`).
  - Item Title and Formatted Date/Time.
  - Dynamic Countdown String (e.g., `"in 2 hours"`, `"tomorrow"`, `"in 4 days"`).
  - Venue / Location tag.
  - Concise Description.
  - Registration URL link button (if extracted).
- **Interactive Card Actions**:
  - `addToGoogleCalendar(item)`: Constructs and opens pre-filled Google Calendar URL (`https://calendar.google.com/calendar/render?...`).
  - `downloadIcsFile(item)`: Generates and downloads a standard `.ics` calendar file.
  - `toggleReminder(item)`: Requests browser notification permission and schedules a reminder notification.
  - `markAsDone(item)`: Toggles item between active and completed states.
  - `copyCleanNotice(item)`: Copies a sanitized, structured summary of the notice to clipboard.
  - `viewRawSource(item)`: Expands a collapsible drawer revealing original unstructured text.
  - `deleteNotice(itemId)`: Removes item with undo prompt.

#### F. Interactive Calendar View
- **Functions**:
  - `renderMonthGrid(year, month)`: Generates standard 7-column calendar grid (Sunday to Saturday).
  - `populateEventMarkers()`: Adds category and urgency dot indicators to dates with scheduled notices.
  - `navigateMonth(direction)`: Handles Next Month, Previous Month, and "Jump to Today".
  - `onDateClick(dateString)`: Opens flyout modal listing all notices scheduled for that specific date.

#### G. AI Weekly Digest Modal ("What do I need to know this week?")
- **Functions**:
  - `generateWeeklySummary()`: Aggregates notices scheduled within the current rolling 7 days and categorizes them into:
    1. Critical Deadlines & Exam Requirements
    2. Recommended Talks, Hackathons & Events
    3. General Campus / Administrative Updates
  - `filterDigest(focusCategory)`: Re-summarizes dynamically for `"Only Academics"`, `"Only Deadlines"`, or `"Only Free Events"`.
  - `copyWhatsAppDigest()`: Formats the entire weekly summary with bullet points and emojis ready to paste into class WhatsApp groups.
  - `playVoiceBriefing()`: Uses Web Speech API (`window.speechSynthesis`) to read the digest aloud.
  - `stopVoiceBriefing()`: Halts ongoing audio playback.

#### H. Student Profile Drawer & Personalization
- **Stored Attributes**:
  - Academic Year: 1st, 2nd, 3rd, 4th Year.
  - Department / Branch: e.g., Computer Science, Mechanical, Electronics, Management.
  - Interest Tags: Coding, Hackathons, Placements, Cultural, Sports, Academics.
  - Personal Custom Tags: "Must Attend", "Optional", "Group Project".
- **Functions**:
  - `saveProfile(profileData)`: Persists user profile to `localStorage`.
  - `applyProfileSorting()`: Automatically boosts notices matching student branch and interest tags to the top of the feed.

#### I. Data Backup, Export & Offline Service
- **Functions**:
  - `exportData(format)`: Exports all notices to JSON or CSV format.
  - `importData(file)`: Restores notices from a backup JSON file.
  - `resetToDemoData()`: Re-populates the app with default realistic campus notices for testing.
  - Offline Operation: All queries and mutations operate directly on client-side state and `localStorage` with zero network dependency.
```
