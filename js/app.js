/**
 * Campus Pulse — Master Application Controller
 * Handles state, natural language parsing, UI rendering, Google Calendar sync,
 * interactive student login, SVG analytics graphs, and micro-animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // APPLICATION STATE
  // =========================================================================
  let notices = StorageService.getNotices();
  let profile = StorageService.getProfile();
  let activeCategory = 'all';
  let activeSearch = '';
  let activeSort = 'soonest';
  let currentView = 'list';
  let isSpeaking = false;
  let calendarInstance = null;
  let selectedLoginProfile = 'alex';

  // Initialize Theme
  const savedTheme = StorageService.getTheme();
  applyTheme(savedTheme);

  // Initialize Profile info in Sidebar
  updateSidebarProfile();

  // Initialize Calendar
  calendarInstance = new CampusCalendar('calendar-grid-root', (dateKey, dayNotices) => {
    openDayScheduleModal(dateKey, dayNotices);
  });

  // Initial Full Render
  renderApp();

  // =========================================================================
  // CORE RENDER PIPELINE
  // =========================================================================
  function renderApp() {
    renderMetrics();
    renderAnalytics();
    renderUrgentShelf();
    renderFeed();
    renderUpcomingDeadlinesRail();
    renderSamplePresets();
    updateConflictBadge();
  }

  // 1. Render Metric Highlights with Animated Numbers
  function renderMetrics() {
    const totalCount = notices.length;
    const urgentCount = notices.filter(n => n.isUrgent && !n.isCompleted).length;
    const perksCount = notices.filter(n => n.hasPerk && !n.isCompleted).length;

    animateCountUp('metric-total-count', totalCount);
    animateCountUp('metric-urgent-count', urgentCount);
    animateCountUp('metric-perks-count', perksCount);

    const elStatus = document.getElementById('status-pill-count');
    if (elStatus) elStatus.textContent = `${totalCount} Verified`;

    // Category Filter Counts
    const counts = {
      all: notices.length,
      urgent: notices.filter(n => n.isUrgent && !n.isCompleted).length,
      food: notices.filter(n => (n.hasPerk || n.category === 'food') && !n.isCompleted).length,
      placement: notices.filter(n => n.category === 'placement').length,
      hackathon: notices.filter(n => n.category === 'hackathon').length,
      academic: notices.filter(n => n.category === 'academic').length
    };

    for (const [key, val] of Object.entries(counts)) {
      const el = document.getElementById(`count-${key}`);
      if (el) el.textContent = val;
    }
  }

  // Smooth number count-up animation
  function animateCountUp(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const current = parseInt(el.textContent, 10) || 0;
    if (current === targetValue) {
      el.textContent = targetValue;
      return;
    }

    let start = current;
    const step = targetValue > current ? 1 : -1;
    const interval = setInterval(() => {
      start += step;
      el.textContent = start;
      if (start === targetValue) {
        clearInterval(interval);
      }
    }, 40);
  }

  // 2. Render Analytics Graphs
  function renderAnalytics() {
    if (typeof CampusAnalytics !== 'undefined') {
      CampusAnalytics.render('analytics-graphs-root', notices);
    }
  }

  // 3. Render Pinned Urgent "Needs Attention Today" Shelf
  function renderUrgentShelf() {
    const shelf = document.getElementById('urgent-hero-shelf');
    const container = document.getElementById('urgent-shelf-items');
    const countBadge = document.getElementById('urgent-shelf-count');
    if (!shelf || !container) return;

    const urgentItems = notices.filter(n => n.isUrgent && !n.isCompleted);
    if (urgentItems.length === 0) {
      shelf.classList.add('hidden');
      return;
    }

    shelf.classList.remove('hidden');
    countBadge.textContent = `${urgentItems.length} Item${urgentItems.length > 1 ? 's' : ''}`;

    container.innerHTML = urgentItems.slice(0, 4).map(item => `
      <div class="p-3.5 rounded-xl bg-white border border-tomato-200 shadow-xs flex items-start justify-between gap-3 animate-slide-up">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tomato-50 text-tomato border border-tomato-200">
              URGENT DUE
            </span>
            <span class="text-[11px] text-neutral-muted font-medium">${formatCategoryName(item.category)}</span>
          </div>
          <h3 class="text-sm font-bold text-neutral-heading line-clamp-1">${escapeHtml(item.title)}</h3>
          <p class="text-xs text-neutral-body line-clamp-1">${escapeHtml(item.description)}</p>
          <div class="flex items-center gap-2 text-[11px] text-neutral-muted pt-0.5">
            <span>📍 ${escapeHtml(item.venue)}</span>
            <span>•</span>
            <span class="font-bold text-tomato">${formatRelativeTime(item.dateTime)}</span>
          </div>
        </div>
        <div class="flex flex-col gap-1.5 shrink-0">
          <button class="btn-quick-done text-xs font-bold px-3 py-1.5 rounded-lg bg-tomato-50 hover:bg-tomato hover:text-white text-tomato border border-tomato-200 transition-all active:scale-95" data-id="${item.id}">
            Done ✓
          </button>
          ${item.link ? `
            <a href="${item.link}" target="_blank" rel="noopener" class="text-xs font-semibold px-2.5 py-1 text-center rounded-lg bg-neutral-canvas hover:bg-neutral-border text-neutral-heading transition-colors">
              Link ↗
            </a>
          ` : ''}
        </div>
      </div>
    `).join('');

    // Attach quick done events with confetti burst
    container.querySelectorAll('.btn-quick-done').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.target.getAttribute('data-id');
        const rect = e.target.getBoundingClientRect();
        triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        toggleItemDone(id);
      };
    });
  }

  // 4. Render Main Verified Feed
  function renderFeed() {
    const listContainer = document.getElementById('feed-cards-list');
    const emptyState = document.getElementById('feed-empty-state');
    const filterLabel = document.getElementById('active-filter-label');
    if (!listContainer) return;

    let filtered = [...notices];

    // Filter by Category
    if (activeCategory === 'urgent') {
      filtered = filtered.filter(n => n.isUrgent && !n.isCompleted);
    } else if (activeCategory === 'food') {
      filtered = filtered.filter(n => (n.hasPerk || n.category === 'food') && !n.isCompleted);
    } else if (activeCategory !== 'all') {
      filtered = filtered.filter(n => n.category === activeCategory);
    }

    // Natural Language & Keyword Search Filter
    if (activeSearch.trim()) {
      filtered = filterBySearchQuery(filtered, activeSearch.trim());
    }

    // Apply Sorting
    filtered = sortNotices(filtered, activeSort);

    // Update Filter Label
    if (filterLabel) {
      if (activeSearch) {
        filterLabel.textContent = `Search results for: "${activeSearch}" (${filtered.length})`;
      } else {
        filterLabel.textContent = `Showing: ${formatCategoryName(activeCategory)} (${filtered.length})`;
      }
    }

    // Check Empty State
    if (filtered.length === 0) {
      listContainer.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }
    emptyState.classList.add('hidden');

    // Build Cards HTML with staggered animation
    listContainer.innerHTML = filtered.map((item, idx) => createCardHTML(item, idx)).join('');

    // Attach Card Actions
    attachCardEvents(listContainer);

    // Sync Calendar if visible
    if (currentView === 'calendar' && calendarInstance) {
      calendarInstance.render(notices);
    }
  }

  // Card HTML Template
  function createCardHTML(item, idx) {
    const isCompleted = item.isCompleted;
    const isUrgent = item.isUrgent && !isCompleted;
    const gCalUrl = generateGoogleCalendarUrl(item);

    return `
      <div class="bg-white rounded-2xl border ${isUrgent ? 'border-2 border-neutral-heading shadow-md' : 'border-neutral-border hover:border-lavender'} p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative overflow-hidden group animate-slide-up ${isCompleted ? 'opacity-60 bg-neutral-canvas/60' : ''}" style="animation-delay: ${idx * 40}ms;" data-id="${item.id}">
        
        ${isUrgent ? '<div class="absolute top-0 left-0 right-0 h-1.5 bg-neutral-heading"></div>' : ''}

        <!-- Card Header Badges -->
        <div class="flex items-center justify-between flex-wrap gap-2 pt-0.5">
          <div class="flex items-center gap-2 flex-wrap">
            ${isCompleted ? `
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <span class="material-symbols-outlined text-[13px]">check_circle</span>
                ATTENDED / DONE
              </span>
            ` : isUrgent ? `
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-heading text-white text-xs font-bold">
                <span class="material-symbols-outlined text-[14px]">warning</span>
                ${formatRelativeTime(item.dateTime).toUpperCase()}
              </span>
            ` : `
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-neutral-canvas text-neutral-heading text-xs font-bold border border-neutral-border">
                ${formatRelativeTime(item.dateTime)}
              </span>
            `}

            <span class="px-2.5 py-0.5 rounded-full bg-lavender-50 text-lavender-dark text-xs font-semibold border border-lavender/50">
              ${formatCategoryName(item.category)}
            </span>

            ${item.hasPerk ? `
              <span class="px-2.5 py-0.5 rounded-full bg-lavender-100 text-lavender-dark text-xs font-bold border border-lavender/40 flex items-center gap-1">
                <span class="material-symbols-outlined text-[13px]">redeem</span>
                Perk Included
              </span>
            ` : ''}
          </div>

          <span class="text-xs text-neutral-muted flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px] text-neutral-subtle">chat</span>
            ${escapeHtml(item.source || 'Campus Forward')}
          </span>
        </div>

        <!-- Title & Description -->
        <div>
          <h3 class="font-heading font-bold text-lg text-neutral-heading group-hover:text-lavender-dark transition-colors ${isCompleted ? 'line-through text-neutral-muted' : ''}">
            ${escapeHtml(item.title)}
          </h3>
          <p class="text-sm text-neutral-body mt-1 leading-relaxed">
            ${escapeHtml(item.description)}
          </p>

          ${item.perk && item.perk !== 'Standard Event' ? `
            <div class="mt-2.5 p-2.5 rounded-xl bg-lavender-50 border border-lavender/50 flex items-center gap-2 text-xs font-semibold text-neutral-heading">
              <span>🎁</span>
              <span><strong>Confirmed Perk:</strong> ${escapeHtml(item.perk)}</span>
            </div>
          ` : ''}

          ${item.hasConflict ? `
            <div class="mt-2.5 p-2.5 rounded-xl bg-tomato-50 border border-tomato-200 flex items-center gap-2 text-xs font-semibold text-tomato">
              <span>⚠️</span>
              <span><strong>Scheduling Conflict:</strong> ${escapeHtml(item.conflictDetails || 'Clashes with another campus session.')}</span>
            </div>
          ` : ''}
        </div>

        <!-- Takeaway Highlight Box -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-neutral-canvas border border-neutral-border text-xs">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-neutral-heading text-[18px]">calendar_clock</span>
            <div>
              <div class="text-neutral-muted text-[10px] uppercase font-bold">Scheduled Time</div>
              <div class="font-semibold text-neutral-heading">${formatDateString(item.dateTime)} at ${formatTimeString(item.dateTime)}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-neutral-muted text-[18px]">location_on</span>
            <div>
              <div class="text-neutral-muted text-[10px] uppercase font-bold">Venue / Room</div>
              <div class="font-semibold text-neutral-heading">${escapeHtml(item.venue)}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-lavender-dark text-[18px]">verified</span>
            <div>
              <div class="text-neutral-muted text-[10px] uppercase font-bold">Status</div>
              <div class="font-bold text-neutral-heading text-xs">${isCompleted ? 'Completed' : (item.isUrgent ? 'Action Required' : 'Upcoming')}</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons Toolbar -->
        <div class="flex items-center justify-between pt-1 border-t border-neutral-border/60 flex-wrap gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <!-- 1-Click Google Calendar Sync -->
            <a href="${gCalUrl}" target="_blank" rel="noopener" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-heading hover:bg-neutral-body text-white text-xs font-bold transition-all shadow-sm active:scale-95">
              <span class="material-symbols-outlined text-[16px]">edit_calendar</span>
              <span>Google Calendar</span>
            </a>

            <!-- Download .ICS for Apple/Outlook Calendar -->
            <button class="btn-download-ics flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-canvas hover:bg-neutral-border text-neutral-heading text-xs font-semibold transition-colors" data-id="${item.id}" title="Download .ics file for Apple/Outlook">
              <span class="material-symbols-outlined text-[16px]">event</span>
              <span class="hidden sm:inline">.ICS</span>
            </button>

            <!-- Toggle Done with Confetti -->
            <button class="btn-toggle-done flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-canvas hover:bg-neutral-border text-neutral-heading'} text-xs font-semibold transition-colors active:scale-95" data-id="${item.id}">
              <span class="material-symbols-outlined text-[16px]">${isCompleted ? 'undo' : 'check'}</span>
              <span>${isCompleted ? 'Mark Pending' : 'Mark Done'}</span>
            </button>

            <!-- Set Browser Reminder -->
            <button class="btn-remind-me flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-canvas hover:bg-neutral-border text-neutral-heading text-xs font-semibold transition-colors" data-id="${item.id}" title="Set Notification Alert">
              <span class="material-symbols-outlined text-[16px]">notifications</span>
              <span class="hidden sm:inline">Remind Me</span>
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Share Clean Summary -->
            <button class="btn-share-notice p-1.5 rounded-lg hover:bg-neutral-canvas text-neutral-muted hover:text-neutral-heading transition-colors" data-id="${item.id}" title="Copy Clean Notice Summary">
              <span class="material-symbols-outlined text-[17px]">share</span>
            </button>

            <!-- View Original Raw Forward -->
            <button class="btn-view-raw p-1.5 rounded-lg hover:bg-neutral-canvas text-neutral-muted hover:text-neutral-heading transition-colors" data-id="${item.id}" title="View Original Raw WhatsApp Notice">
              <span class="material-symbols-outlined text-[17px]">visibility</span>
            </button>

            <!-- Delete Notice -->
            <button class="btn-delete-notice p-1.5 rounded-lg hover:bg-tomato-50 text-neutral-muted hover:text-tomato transition-colors" data-id="${item.id}" title="Delete Notice">
              <span class="material-symbols-outlined text-[17px]">delete</span>
            </button>
          </div>
        </div>

      </div>
    `;
  }

  // 5. Attach Card Interaction Handlers
  function attachCardEvents(container) {
    // Download .ICS
    container.querySelectorAll('.btn-download-ics').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = notices.find(n => n.id === id);
        if (item) downloadIcsFile(item);
      };
    });

    // Mark Done / Attended (with confetti celebration)
    container.querySelectorAll('.btn-toggle-done').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const rect = e.currentTarget.getBoundingClientRect();
        triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
        toggleItemDone(id);
      };
    });

    // Remind Me
    container.querySelectorAll('.btn-remind-me').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = notices.find(n => n.id === id);
        if (item) setupReminder(item);
      };
    });

    // Share Clean Notice
    container.querySelectorAll('.btn-share-notice').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = notices.find(n => n.id === id);
        if (item) {
          const text = `📌 *${item.title}*\n📅 ${formatDateString(item.dateTime)} at ${formatTimeString(item.dateTime)}\n📍 ${item.venue}\nℹ️ ${item.description}\n${item.link ? `🔗 ${item.link}` : ''}\n\n— Verified via Campus Pulse`;
          copyToClipboard(text, "Notice Copied!", "Structured summary copied to clipboard, ready to share.");
        }
      };
    });

    // View Raw Source
    container.querySelectorAll('.btn-view-raw').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = notices.find(n => n.id === id);
        if (item) openRawSourceModal(item.rawText || item.description);
      };
    });

    // Delete Notice
    container.querySelectorAll('.btn-delete-notice').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm("Are you sure you want to remove this notice?")) {
          notices = StorageService.deleteNotice(id);
          renderApp();
          triggerToast("Notice Removed", "Item removed from your campus radar.");
        }
      };
    });
  }

  // 6. Confetti Particle Burst Animation
  function triggerConfetti(x, y) {
    const colors = ['#C8B3E8', '#D4FF3F', '#E34234', '#4A326B', '#10B981', '#3B82F6'];
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.backgroundColor = color;
      p.style.left = `${x}px`;
      p.style.top = `${y}px`;

      const angle = Math.random() * 2 * Math.PI;
      const distance = 40 + Math.random() * 80;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 20;

      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  // 7. Render Upcoming Deadlines Right Rail
  function renderUpcomingDeadlinesRail() {
    const list = document.getElementById('upcoming-deadlines-list');
    if (!list) return;

    const urgentItems = notices.filter(n => !n.isCompleted).slice(0, 3);
    list.innerHTML = urgentItems.map(item => `
      <div class="p-3 rounded-xl bg-neutral-canvas border border-neutral-border flex flex-col gap-1 hover:border-lavender transition-all">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-neutral-heading flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px] ${item.isUrgent ? 'text-tomato' : 'text-neutral-muted'}">alarm</span>
            ${formatRelativeTime(item.dateTime)}
          </span>
          <span class="text-[10px] text-neutral-muted font-semibold">${formatCategoryName(item.category)}</span>
        </div>
        <div class="font-heading font-bold text-xs text-neutral-heading line-clamp-1">${escapeHtml(item.title)}</div>
        <div class="text-[11px] text-neutral-muted line-clamp-1">📍 ${escapeHtml(item.venue)}</div>
      </div>
    `).join('');
  }

  // 8. Render 1-Click Sample Preset Chips
  function renderSamplePresets() {
    const container = document.getElementById('sample-preset-chips');
    if (!container) return;

    container.innerHTML = SAMPLE_PRESETS.map(preset => `
      <button class="btn-load-preset text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-canvas hover:bg-lavender-100 border border-neutral-border text-neutral-heading transition-colors" data-id="${preset.id}">
        ${preset.label}
      </button>
    `).join('');

    container.querySelectorAll('.btn-load-preset').forEach(btn => {
      btn.onclick = (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const preset = SAMPLE_PRESETS.find(p => p.id === id);
        if (preset) {
          const textarea = document.getElementById('drop-paste-text');
          if (textarea) {
            textarea.value = preset.text;
            document.getElementById('paste-counter').textContent = `${preset.text.length} chars`;
            triggerToast("Preset Loaded", "Click 'Clean & Add' to process this sample notice.");
          }
        }
      };
    });
  }

  function updateConflictBadge() {
    const badge = document.getElementById('conflict-badge');
    const conflicts = notices.filter(n => n.hasConflict);
    if (badge) {
      badge.textContent = conflicts.length;
      if (conflicts.length === 0) badge.classList.add('hidden');
      else badge.classList.remove('hidden');
    }
  }

  // =========================================================================
  // NLP TEXT INGESTION & EXTRACTION HANDLERS
  // =========================================================================
  const dropPasteText = document.getElementById('drop-paste-text');
  const pasteCounter = document.getElementById('paste-counter');
  const cleanAddBtn = document.getElementById('clean-add-btn');

  if (dropPasteText && pasteCounter) {
    dropPasteText.addEventListener('input', (e) => {
      pasteCounter.textContent = `${e.target.value.length} chars`;
    });
  }

  if (cleanAddBtn && dropPasteText) {
    cleanAddBtn.addEventListener('click', () => {
      const rawText = dropPasteText.value.trim();
      if (!rawText) {
        triggerToast("Please paste text first", "Paste any WhatsApp message, email, or caption.");
        return;
      }

      try {
        const extracted = NoticeExtractor.extract(rawText, notices);

        // Check duplicate notice
        if (extracted.duplicateWarning) {
          const confirmMerge = confirm(extracted.duplicateWarning.message);
          if (!confirmMerge) return;
        }

        notices = StorageService.addNotice(extracted);
        dropPasteText.value = '';
        pasteCounter.textContent = '0 chars';
        renderApp();
        triggerToast("Notice Processed & Cleaned!", `"${extracted.title}" has been structured and added.`);
      } catch (err) {
        triggerToast("Error Extracting", err.message);
      }
    });
  }

  // Poster OCR Image Upload Simulation
  const posterFileInput = document.getElementById('poster-ocr-file-input');
  if (posterFileInput) {
    posterFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      triggerToast("Scanning Poster...", "Simulating OCR text recognition from notice board poster photo.");
      
      setTimeout(() => {
        const sampleOCR = `📢 CAMPUS RECRUITMENT & TECH WORKSHOP POSTER\nHost: Google Developer Student Clubs (GDSC)\nDate: Next Tuesday at 4:00 PM\nVenue: Turing Computer Lab 201\nPerks: Free high-speed Wi-Fi, custom stickers, and Domino's pizza buffet for registered attendees.\nRegistration link: https://gdsc.community.dev/events/campus-tech-sprint\nContact: lead@gdsc-campus.edu`;
        if (dropPasteText) {
          dropPasteText.value = sampleOCR;
          pasteCounter.textContent = `${sampleOCR.length} chars`;
        }
        triggerToast("OCR Scan Complete!", "Poster text extracted. Tap 'Clean & Add' to publish.");
      }, 1100);
    });
  }

  // =========================================================================
  // STUDENT LOGIN / ID CARD PORTAL
  // =========================================================================
  const loginModal = document.getElementById('login-modal');
  const btnOpenLogin = document.getElementById('btn-open-login');
  const btnHeaderLogin = document.getElementById('btn-header-login');
  const loginCloseBtn = document.getElementById('login-close-btn');
  const btnLoginConfirm = document.getElementById('btn-login-confirm');
  const btnGoogleLogin = document.getElementById('btn-google-login');

  function openLoginModal() {
    loginModal.classList.remove('hidden');
    updateIdCardPreview(selectedLoginProfile);
  }

  if (btnOpenLogin) btnOpenLogin.onclick = openLoginModal;
  if (btnHeaderLogin) btnHeaderLogin.onclick = openLoginModal;
  if (loginCloseBtn) loginCloseBtn.onclick = () => loginModal.classList.add('hidden');

  function updateIdCardPreview(profileKey) {
    const p = DEMO_PROFILES.find(item => item.id === profileKey) || DEMO_PROFILES[0];
    document.getElementById('id-card-roll').textContent = p.rollNo;
    document.getElementById('id-card-avatar').src = p.avatar;
    document.getElementById('id-card-name').textContent = p.name;
    document.getElementById('id-card-dept').textContent = p.dept;
    document.getElementById('id-card-year').textContent = `${p.year} • CGPA ${p.cgpa}`;
  }

  // 1-Click Fast Profile Switcher buttons inside Login Modal
  document.querySelectorAll('.profile-select-btn').forEach(btn => {
    btn.onclick = (e) => {
      document.querySelectorAll('.profile-select-btn').forEach(b => {
        b.classList.remove('border-2', 'border-lavender-dark', 'bg-lavender-50');
        b.classList.add('border', 'border-neutral-border', 'bg-neutral-canvas');
      });
      e.currentTarget.classList.remove('border', 'border-neutral-border', 'bg-neutral-canvas');
      e.currentTarget.classList.add('border-2', 'border-lavender-dark', 'bg-lavender-50');

      selectedLoginProfile = e.currentTarget.getAttribute('data-profile');
      updateIdCardPreview(selectedLoginProfile);
    };
  });

  function performLogin(profileKey) {
    const p = DEMO_PROFILES.find(item => item.id === profileKey) || DEMO_PROFILES[0];
    profile = { ...p };
    StorageService.saveProfile(profile);
    updateSidebarProfile();
    loginModal.classList.add('hidden');
    renderApp();
    triggerToast(`Welcome, ${profile.name}!`, `Logged in as ${profile.dept} student.`);
  }

  if (btnLoginConfirm) {
    btnLoginConfirm.onclick = () => performLogin(selectedLoginProfile);
  }

  if (btnGoogleLogin) {
    btnGoogleLogin.onclick = () => {
      triggerToast("Authenticating via Google...", "Verifying university single sign-on credentials.");
      setTimeout(() => {
        performLogin(selectedLoginProfile);
      }, 700);
    };
  }

  // =========================================================================
  // MODAL 1: QUICK ADD MODAL
  // =========================================================================
  const quickAddModal = document.getElementById('paste-announcement-modal');
  const btnQuickAddOpen = document.getElementById('btn-quick-add-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalSubmitBtn = document.getElementById('modal-submit-btn');
  const modalPasteArea = document.getElementById('modal-paste-area');
  const btnParsePreview = document.getElementById('btn-parse-preview');
  const modalExtractedPreview = document.getElementById('modal-extracted-preview');

  if (btnQuickAddOpen && quickAddModal) {
    btnQuickAddOpen.onclick = () => {
      quickAddModal.classList.remove('hidden');
      modalPasteArea.focus();
    };
  }

  function closeQuickAddModal() {
    quickAddModal.classList.add('hidden');
    modalPasteArea.value = '';
    modalExtractedPreview.classList.add('hidden');
  }

  if (modalCloseBtn) modalCloseBtn.onclick = closeQuickAddModal;
  if (modalCancelBtn) modalCancelBtn.onclick = closeQuickAddModal;

  if (btnParsePreview && modalPasteArea) {
    btnParsePreview.onclick = () => {
      const val = modalPasteArea.value.trim();
      if (!val) {
        alert("Please paste text into the box first.");
        return;
      }
      const extracted = NoticeExtractor.extract(val, notices);
      document.getElementById('modal-field-title').value = extracted.title;
      document.getElementById('modal-field-category').value = extracted.category;
      document.getElementById('modal-field-venue').value = extracted.venue;
      
      if (extracted.dateTime) {
        document.getElementById('modal-field-datetime').value = extracted.dateTime.slice(0, 16);
      }

      const conflictPill = document.getElementById('modal-conflict-pill');
      if (extracted.conflictWarning) {
        conflictPill.textContent = `⚠️ Warning: ${extracted.conflictWarning.message}`;
        conflictPill.classList.remove('hidden');
      } else {
        conflictPill.classList.add('hidden');
      }

      modalExtractedPreview.classList.remove('hidden');
    };
  }

  if (modalSubmitBtn && modalPasteArea) {
    modalSubmitBtn.onclick = () => {
      const val = modalPasteArea.value.trim();
      if (!val) {
        alert("Please paste announcement details first.");
        return;
      }

      let item = NoticeExtractor.extract(val, notices);

      // Overwrite with any manual edits from preview fields
      if (!modalExtractedPreview.classList.contains('hidden')) {
        const editedTitle = document.getElementById('modal-field-title').value.trim();
        const editedCategory = document.getElementById('modal-field-category').value;
        const editedVenue = document.getElementById('modal-field-venue').value.trim();
        const editedDateTime = document.getElementById('modal-field-datetime').value;

        if (editedTitle) item.title = editedTitle;
        if (editedCategory) item.category = editedCategory;
        if (editedVenue) item.venue = editedVenue;
        if (editedDateTime) {
          item.dateTime = new Date(editedDateTime).toISOString();
          item.displayDate = formatDateString(item.dateTime);
          item.displayTime = formatTimeString(item.dateTime);
        }
      }

      notices = StorageService.addNotice(item);
      closeQuickAddModal();
      renderApp();
      triggerToast("Announcement Added!", `"${item.title}" is now verified and live.`);
    };
  }

  // =========================================================================
  // MODAL 2: AI WEEKLY DIGEST ("What do I need to know this week?")
  // =========================================================================
  const weeklyDigestModal = document.getElementById('weekly-digest-modal');
  const btnWeeklyDigestHeader = document.getElementById('btn-weekly-digest-header');
  const navDigest = document.getElementById('nav-digest');
  const digestCloseBtn = document.getElementById('digest-close-btn');
  const digestContentArea = document.getElementById('digest-content-area');
  const btnCopyWhatsappDigest = document.getElementById('btn-copy-whatsapp-digest');
  const btnDigestSpeak = document.getElementById('btn-digest-speak');
  const speechBtnLabel = document.getElementById('speech-btn-label');

  function openWeeklyDigest(focus = 'all') {
    const digest = DigestGenerator.generate(notices, focus);
    renderDigestContent(digest);
    weeklyDigestModal.classList.remove('hidden');
  }

  if (btnWeeklyDigestHeader) btnWeeklyDigestHeader.onclick = () => openWeeklyDigest('all');
  if (navDigest) navDigest.onclick = () => openWeeklyDigest('all');
  if (digestCloseBtn) digestCloseBtn.onclick = () => {
    weeklyDigestModal.classList.add('hidden');
    DigestGenerator.stopSpeaking();
    isSpeaking = false;
    speechBtnLabel.textContent = "Listen to Briefing";
  };

  // Digest Focus Filter Buttons
  document.querySelectorAll('.digest-filter-btn').forEach(btn => {
    btn.onclick = (e) => {
      document.querySelectorAll('.digest-filter-btn').forEach(b => {
        b.classList.remove('bg-neutral-heading', 'text-white');
        b.classList.add('bg-neutral-canvas', 'text-neutral-heading');
      });
      e.target.classList.remove('bg-neutral-canvas', 'text-neutral-heading');
      e.target.classList.add('bg-neutral-heading', 'text-white');
      
      const focus = e.target.getAttribute('data-focus');
      const digest = DigestGenerator.generate(notices, focus);
      renderDigestContent(digest);
    };
  });

  function renderDigestContent(digest) {
    if (!digestContentArea) return;

    digestContentArea.innerHTML = `
      <div class="p-3.5 rounded-xl bg-lavender-50 border border-lavender/50 text-xs text-neutral-heading leading-relaxed">
        <strong>Executive Summary:</strong> ${digest.headline}
      </div>

      ${digest.urgentItems.length > 0 ? `
        <div class="flex flex-col gap-2">
          <h4 class="font-heading font-bold text-xs uppercase tracking-wider text-tomato flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">alarm</span>
            Critical Deadlines Requiring Action (${digest.urgentItems.length})
          </h4>
          <div class="flex flex-col gap-1.5">
            ${digest.urgentItems.map(item => `
              <div class="p-2.5 rounded-xl bg-neutral-canvas border border-neutral-border flex items-center justify-between text-xs">
                <div>
                  <div class="font-bold text-neutral-heading">${escapeHtml(item.title)}</div>
                  <div class="text-[11px] text-neutral-muted">Due: ${formatDateString(item.dateTime)} at ${formatTimeString(item.dateTime)} • 📍 ${escapeHtml(item.venue)}</div>
                </div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-tomato-50 text-tomato">URGENT</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${digest.perkItems.length > 0 ? `
        <div class="flex flex-col gap-2">
          <h4 class="font-heading font-bold text-xs uppercase tracking-wider text-neutral-heading flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-lavender-dark">local_pizza</span>
            Confirmed Perks & Free Food (${digest.perkItems.length})
          </h4>
          <div class="flex flex-col gap-1.5">
            ${digest.perkItems.map(item => `
              <div class="p-2.5 rounded-xl bg-lavender-50 border border-lavender/40 flex items-center justify-between text-xs">
                <div>
                  <div class="font-bold text-neutral-heading">${escapeHtml(item.title)}</div>
                  <div class="text-[11px] text-lavender-dark font-semibold">🎁 ${escapeHtml(item.perk)}</div>
                </div>
                <span class="text-[11px] text-neutral-muted">${formatDateString(item.dateTime)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${digest.eventItems.length > 0 ? `
        <div class="flex flex-col gap-2">
          <h4 class="font-heading font-bold text-xs uppercase tracking-wider text-neutral-muted flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">calendar_month</span>
            Key Talks & Workshops (${digest.eventItems.length})
          </h4>
          <div class="flex flex-col gap-1.5">
            ${digest.eventItems.map(item => `
              <div class="p-2.5 rounded-xl bg-neutral-canvas border border-neutral-border text-xs flex items-center justify-between">
                <div>
                  <div class="font-bold text-neutral-heading">${escapeHtml(item.title)}</div>
                  <div class="text-[11px] text-neutral-muted">${formatDateString(item.dateTime)} • ${escapeHtml(item.venue)}</div>
                </div>
                <span class="text-[10px] text-neutral-muted">${formatCategoryName(item.category)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  // 1-Click Copy WhatsApp Batch Summary
  if (btnCopyWhatsappDigest) {
    btnCopyWhatsappDigest.onclick = () => {
      const summaryText = DigestGenerator.formatForWhatsApp(notices);
      copyToClipboard(summaryText, "WhatsApp Digest Copied!", "Paste directly into your class or department WhatsApp group.");
    };
  }

  // Voice Synthesis Audio Briefing
  if (btnDigestSpeak) {
    btnDigestSpeak.onclick = () => {
      if (isSpeaking) {
        DigestGenerator.stopSpeaking();
        isSpeaking = false;
        speechBtnLabel.textContent = "Listen to Briefing";
      } else {
        const digest = DigestGenerator.generate(notices, 'all');
        let speechText = `Hello ${profile.name || 'Alex'}. Here is your Campus Pulse weekly briefing. ${digest.headline}. `;
        if (digest.urgentItems.length > 0) {
          speechText += `First, you have ${digest.urgentItems.length} urgent deadline to take care of: ${digest.urgentItems.map(i => i.title).join(', ')}. `;
        }
        if (digest.perkItems.length > 0) {
          speechText += `For free food and perks: ${digest.perkItems.map(i => i.perk).join(', ')}. `;
        }
        speechText += "That concludes your briefing. Stay on top of your schedule with Campus Pulse.";

        isSpeaking = true;
        speechBtnLabel.textContent = "Stop Speaking";
        DigestGenerator.speak(speechText, () => {
          isSpeaking = false;
          speechBtnLabel.textContent = "Listen to Briefing";
        });
      }
    };
  }

  // =========================================================================
  // MODAL 3: STUDENT PROFILE DRAWER
  // =========================================================================
  const profileModal = document.getElementById('profile-drawer-modal');
  const btnOpenProfile = document.getElementById('btn-open-profile');
  const profileCloseBtn = document.getElementById('profile-close-btn');
  const profileCancelBtn = document.getElementById('profile-cancel-btn');
  const profileForm = document.getElementById('profile-form');

  if (btnOpenProfile && profileModal) {
    btnOpenProfile.onclick = () => {
      document.getElementById('profile-name-input').value = profile.name || '';
      document.getElementById('profile-year-input').value = profile.year || '3rd Year';
      document.getElementById('profile-dept-input').value = profile.dept || '';
      document.getElementById('profile-interests-input').value = (profile.interests || []).join(', ');
      profileModal.classList.remove('hidden');
    };
  }

  function closeProfileModal() {
    profileModal.classList.add('hidden');
  }

  if (profileCloseBtn) profileCloseBtn.onclick = closeProfileModal;
  if (profileCancelBtn) profileCancelBtn.onclick = closeProfileModal;

  if (profileForm) {
    profileForm.onsubmit = (e) => {
      e.preventDefault();
      profile.name = document.getElementById('profile-name-input').value.trim() || 'Alex Rivera';
      profile.year = document.getElementById('profile-year-input').value;
      profile.dept = document.getElementById('profile-dept-input').value.trim();
      profile.interests = document.getElementById('profile-interests-input').value.split(',').map(s => s.trim()).filter(Boolean);

      StorageService.saveProfile(profile);
      updateSidebarProfile();
      closeProfileModal();
      triggerToast("Preferences Saved", "Your feed is now customized according to your interests.");
    };
  }

  function updateSidebarProfile() {
    const elName = document.getElementById('sidebar-user-name');
    const elRole = document.getElementById('sidebar-user-role');
    const elAvatar = document.getElementById('sidebar-user-avatar');
    if (elName) elName.textContent = profile.name || 'Alex Rivera';
    if (elRole) elRole.textContent = `${profile.dept ? profile.dept.slice(0, 16) + '...' : 'Student'} (${profile.year ? profile.year.slice(0, 3) : ''})`;
    if (elAvatar && profile.avatar) elAvatar.src = profile.avatar;
  }

  // =========================================================================
  // MODAL 4: RAW NOTICE SOURCE VIEWER
  // =========================================================================
  const rawSourceModal = document.getElementById('raw-source-modal');
  const rawSourceText = document.getElementById('raw-source-text');
  const rawSourceCloseBtn = document.getElementById('raw-source-close-btn');
  const rawSourceDoneBtn = document.getElementById('raw-source-done-btn');

  function openRawSourceModal(text) {
    rawSourceText.textContent = text || 'No raw message text available for this item.';
    rawSourceModal.classList.remove('hidden');
  }

  if (rawSourceCloseBtn) rawSourceCloseBtn.onclick = () => rawSourceModal.classList.add('hidden');
  if (rawSourceDoneBtn) rawSourceDoneBtn.onclick = () => rawSourceModal.classList.add('hidden');

  // =========================================================================
  // MODAL 5: DAY SCHEDULE MODAL (CALENDAR DAY CLICK)
  // =========================================================================
  const dayScheduleModal = document.getElementById('day-schedule-modal');
  const dayModalTitle = document.getElementById('day-modal-title');
  const dayModalItems = document.getElementById('day-modal-items');
  const dayModalCloseBtn = document.getElementById('day-modal-close-btn');

  function openDayScheduleModal(dateKey, dayNotices) {
    dayModalTitle.textContent = `Schedule for ${dateKey}`;
    if (dayNotices.length === 0) {
      dayModalItems.innerHTML = `<div class="text-xs text-neutral-muted py-4 text-center">No notices scheduled for this date.</div>`;
    } else {
      dayModalItems.innerHTML = dayNotices.map(item => `
        <div class="p-3 rounded-xl bg-neutral-canvas border border-neutral-border flex flex-col gap-1 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-neutral-heading">${escapeHtml(item.title)}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded ${item.isUrgent ? 'bg-tomato-50 text-tomato' : 'bg-white text-neutral-heading'}">${formatTimeString(item.dateTime)}</span>
          </div>
          <div class="text-neutral-muted text-[11px]">📍 ${escapeHtml(item.venue)} • ${formatCategoryName(item.category)}</div>
        </div>
      `).join('');
    }
    dayScheduleModal.classList.remove('hidden');
  }

  if (dayModalCloseBtn) dayModalCloseBtn.onclick = () => dayScheduleModal.classList.add('hidden');

  // =========================================================================
  // SEARCH, FILTERS & VIEW CONTROLS
  // =========================================================================
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearch = e.target.value;
      renderFeed();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
      }
    });
  }

  // Category Filter Pills
  document.querySelectorAll('#filter-chips .filter-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#filter-chips .filter-chip').forEach(b => {
        b.classList.remove('bg-neutral-heading', 'text-white', 'shadow-sm');
        b.classList.add('bg-neutral-canvas', 'text-neutral-heading');
      });
      e.currentTarget.classList.remove('bg-neutral-canvas', 'text-neutral-heading');
      e.currentTarget.classList.add('bg-neutral-heading', 'text-white', 'shadow-sm');

      activeCategory = e.currentTarget.getAttribute('data-category');
      renderFeed();
    });
  });

  // Metric Cards Click as Quick Filters
  const metricUrgentCard = document.getElementById('metric-urgent-card');
  if (metricUrgentCard) {
    metricUrgentCard.onclick = () => {
      const urgentBtn = document.querySelector('[data-category="urgent"]');
      if (urgentBtn) urgentBtn.click();
    };
  }

  const metricFoodCard = document.getElementById('metric-food-card');
  if (metricFoodCard) {
    metricFoodCard.onclick = () => {
      const foodBtn = document.querySelector('[data-category="food"]');
      if (foodBtn) foodBtn.click();
    };
  }

  // Sort Select Dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderFeed();
    });
  }

  // View Switcher (List vs Calendar)
  const btnViewList = document.getElementById('btn-view-list');
  const btnViewCalendar = document.getElementById('btn-view-calendar');
  const streamContainer = document.getElementById('stream-container');
  const calendarContainer = document.getElementById('calendar-container');

  function setView(view) {
    currentView = view;
    if (view === 'list') {
      streamContainer.classList.remove('hidden');
      calendarContainer.classList.add('hidden');
      btnViewList.classList.add('bg-neutral-heading', 'text-white');
      btnViewList.classList.remove('text-neutral-muted');
      btnViewCalendar.classList.remove('bg-neutral-heading', 'text-white');
      btnViewCalendar.classList.add('text-neutral-muted');
    } else {
      streamContainer.classList.add('hidden');
      calendarContainer.classList.remove('hidden');
      btnViewCalendar.classList.add('bg-neutral-heading', 'text-white');
      btnViewCalendar.classList.remove('text-neutral-muted');
      btnViewList.classList.remove('bg-neutral-heading', 'text-white');
      btnViewList.classList.add('text-neutral-muted');

      if (calendarInstance) calendarInstance.render(notices);
    }
  }

  if (btnViewList) btnViewList.onclick = () => setView('list');
  if (btnViewCalendar) btnViewCalendar.onclick = () => setView('calendar');

  const navCalendar = document.getElementById('nav-calendar');
  if (navCalendar) {
    navCalendar.onclick = (e) => {
      e.preventDefault();
      setView('calendar');
    };
  }

  const navFeed = document.getElementById('nav-feed');
  if (navFeed) {
    navFeed.onclick = (e) => {
      e.preventDefault();
      setView('list');
    };
  }

  const navAnalytics = document.getElementById('nav-analytics');
  if (navAnalytics) {
    navAnalytics.onclick = (e) => {
      e.preventDefault();
      const el = document.getElementById('analytics-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Conflict Navigation / Button
  const btnResolveConflict = document.getElementById('btn-resolve-conflict');
  const navConflicts = document.getElementById('nav-conflicts');
  function filterConflicts() {
    activeSearch = 'conflict';
    setView('list');
    renderFeed();
    triggerToast("Conflicts Filtered", "Showing notices with room or time scheduling overlaps.");
  }
  if (btnResolveConflict) btnResolveConflict.onclick = filterConflicts;
  if (navConflicts) {
    navConflicts.onclick = (e) => {
      e.preventDefault();
      filterConflicts();
    };
  }

  // Clear Filters button in Empty State
  const btnClearFilters = document.getElementById('btn-clear-filters');
  if (btnClearFilters) {
    btnClearFilters.onclick = () => {
      activeCategory = 'all';
      activeSearch = '';
      if (searchInput) searchInput.value = '';
      document.querySelector('[data-category="all"]').click();
    };
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.onclick = () => {
      sidebar.classList.toggle('-translate-x-full');
    };
  }

  // Reset Demo Data
  const btnDemoReset = document.getElementById('btn-demo-reset');
  if (btnDemoReset) {
    btnDemoReset.onclick = () => {
      if (confirm("Reset to clean initial campus demo notices?")) {
        notices = StorageService.resetToDemo();
        renderApp();
        triggerToast("Demo Dataset Restored", "All sample notices reloaded cleanly.");
      }
    };
  }

  // Export Data (JSON)
  const btnExportData = document.getElementById('btn-export-data');
  if (btnExportData) {
    btnExportData.onclick = () => {
      StorageService.exportJSON();
      triggerToast("Backup Downloaded", "Campus notices exported as JSON backup file.");
    };
  }

  // Theme Toggle Button
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
      const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      StorageService.setTheme(next);
      triggerToast(next === 'dark' ? "Dark Theme Active" : "Light Theme Active", "Theme preference saved.");
    };
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
      document.documentElement.classList.remove('dark');
      if (themeIcon) themeIcon.textContent = 'dark_mode';
    }
  }

  // =========================================================================
  // HELPER FUNCTIONS & GOOGLE CALENDAR DEEP LINKS
  // =========================================================================
  function toggleItemDone(id) {
    notices = StorageService.toggleCompleted(id);
    renderApp();
    const item = notices.find(n => n.id === id);
    if (item && item.isCompleted) {
      triggerToast("Marked as Done!", `"${item.title}" checked off your radar.`);
    } else {
      triggerToast("Restored to Active", `"${item ? item.title : 'Item'}" is back on active feed.`);
    }
  }

  function setupReminder(item) {
    if (!('Notification' in window)) {
      triggerToast("Reminder Alert Set", `We'll simulate an alert for: ${item.title}`);
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(`Campus Pulse Reminder: ${item.title}`, {
        body: `Starts ${formatDateString(item.dateTime)} at ${item.displayTime || ''} in ${item.venue}.`,
        icon: 'https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/radar/default/24px.svg'
      });
      triggerToast("Reminder Active", "Browser notification alert scheduled.");
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          triggerToast("Notifications Enabled", "You will now receive timely event alerts.");
        }
      });
    } else {
      triggerToast("Reminder Saved Locally", "Notification permission blocked; alert will display in-app.");
    }
  }

  function generateGoogleCalendarUrl(item) {
    if (!item.dateTime) return 'https://calendar.google.com';
    const start = new Date(item.dateTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    const formatGDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const dates = `${formatGDate(start)}/${formatGDate(end)}`;
    const text = encodeURIComponent(item.title);
    const details = encodeURIComponent(`${item.description}\n\nPerks: ${item.perk || 'None'}\n\nCleaned via Campus Pulse`);
    const location = encodeURIComponent(item.venue || 'Campus');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  }

  function downloadIcsFile(item) {
    const start = new Date(item.dateTime || Date.now());
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const formatIcs = (d) => 
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Campus Pulse//EN',
      'BEGIN:VEVENT',
      `UID:${item.id}@campuspulse.edu`,
      `DTSTAMP:${formatIcs(new Date())}`,
      `DTSTART:${formatIcs(start)}`,
      `DTEND:${formatIcs(end)}`,
      `SUMMARY:${item.title}`,
      `DESCRIPTION:${item.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${item.venue}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.slice(0, 20).replace(/[^a-z0-9]/gi, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast(".ICS File Downloaded", "Ready to import into Apple Calendar or Outlook.");
  }

  function filterBySearchQuery(list, query) {
    const q = query.toLowerCase();

    if (q.includes('deadline') || q.includes('urgent')) {
      return list.filter(n => n.isUrgent || n.category === 'deadline');
    }
    if (q.includes('food') || q.includes('pizza') || q.includes('boba') || q.includes('perk')) {
      return list.filter(n => n.hasPerk || n.category === 'food');
    }
    if (q.includes('placement') || q.includes('career') || q.includes('internship') || q.includes('job')) {
      return list.filter(n => n.category === 'placement');
    }
    if (q.includes('hackathon') || q.includes('coding') || q.includes('tech')) {
      return list.filter(n => n.category === 'hackathon');
    }
    if (q.includes('conflict') || q.includes('clash') || q.includes('double')) {
      return list.filter(n => n.hasConflict);
    }

    return list.filter(n => 
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      (n.venue && n.venue.toLowerCase().includes(q)) ||
      (n.perk && n.perk.toLowerCase().includes(q))
    );
  }

  function sortNotices(list, sortMode) {
    const sorted = [...list];
    if (sortMode === 'soonest') {
      sorted.sort((a, b) => new Date(a.dateTime || 0) - new Date(b.dateTime || 0));
    } else if (sortMode === 'urgent') {
      sorted.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
    } else if (sortMode === 'newest') {
      sorted.reverse();
    } else if (sortMode === 'alpha') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }

  function formatRelativeTime(isoString) {
    if (!isoString) return 'Upcoming';
    const diffMs = new Date(isoString).getTime() - Date.now();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 0) return 'Passed';
    if (diffHours <= 1) return 'In under 1 hour';
    if (diffHours <= 24) return `In ${diffHours} hours`;
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return `In ${diffDays} days`;
  }

  function formatCategoryName(cat) {
    const map = {
      academic: 'Academic',
      deadline: 'Deadline',
      placement: 'Placement',
      hackathon: 'Hackathon',
      cultural: 'Club Event',
      sports: 'Sports',
      admin: 'Hostel/Admin',
      food: 'Free Food',
      all: 'All Categories'
    };
    return map[cat] || 'Campus Notice';
  }

  function copyToClipboard(text, title, desc) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        triggerToast(title, desc);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      triggerToast(title, desc);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function triggerToast(title, desc) {
    const toast = document.getElementById('simple-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');
    if (!toast || !toastTitle || !toastDesc) return;

    toastTitle.textContent = title;
    toastDesc.textContent = desc;
    toast.classList.remove('translate-y-32', 'opacity-0', 'pointer-events-none');
    setTimeout(() => {
      toast.classList.add('translate-y-32', 'opacity-0', 'pointer-events-none');
    }, 3500);
  }
});
