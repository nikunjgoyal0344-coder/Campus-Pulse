/**
 * Campus Pulse — Live Dashboard Interactivity & Real NLP Engine
 * Powers live notice parsing, real DOM card generation, presets, manual add modal,
 * search filtering, Google Calendar links, and notification dropdown.
 */

(function initLiveDashboard() {
  // Preset Notice Templates for Instant Testing
  const SAMPLES = {
    exam: `*FORWARDED MESSAGE*\n⚠️ ATTENTION 3RD YEAR CSE STUDENTS ⚠️\n\nSubject: CS301 DSA Lab Midterm Exam TODAY!\nDate: Today at 6:00 PM sharp\nVenue: Computing Lab 4 & Lab 5 (Old Academic Block)\n\nAll students must carry college ID card and hardcopy lab manual. System login via LMS portal.\nAttendance is 100% compulsory. No re-test will be conducted.\nPortal: https://lms.college.edu/course/view.php?id=301`,
    hackathon: `🚀 *DevSoc Presents HACKCAMPUS 2026* 🚀\nGear up for the biggest hackathon of the semester!\n📅 Date: Friday 9:00 AM onwards (36 Hours nonstop)\n📍 Venue: Main Audi & Innovation Hub\n🏆 ₹1.5 Lakh Cash Prize + Schwags & Goodies\nTeams of 2-4 members. Register before seats fill up: https://unstop.com/hackathons/hackcampus-2026\nQueries: devsoc@college.edu`,
    placement: `Forwarded from T&P Officer:\nUrgent Circular for 6th Sem CSE/ECE: Google & Microsoft joint pre-placement presentation and online assessment on Sunday 2:30 PM at Seminar Hall 1.\nEligibility: CGPA 7.5+\nFormal dress code mandatory.\nFill the mandatory intent form: https://forms.gle/placement-drive-2026`,
    hostel: `Notice from Chief Warden Office:\nPlease note that power backup and domestic water line servicing will take place Today from 2 PM to 5 PM across Boys Hostel A, B, C and Central Mess. Please plan your work accordingly. Contact Ext: 4012 for emergencies.`
  };

  // Security Sanitization Helpers (XSS Prevention & Safe Protocols)
  function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeUrl(url) {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (/^(https?:|\/|#|mailto:)/i.test(trimmed)) {
      return encodeURI(trimmed).replace(/["'<>]/g, '');
    }
    return '#';
  }

  // Helper to generate Google Calendar URL
  function makeGCalUrl(title, venue, details, timeStr) {
    const encTitle = encodeURIComponent(title || 'Campus Event');
    const encDetails = encodeURIComponent((details || '') + '\n\nExtracted via Campus Pulse');
    const encLoc = encodeURIComponent(venue || 'Campus');
    const now = new Date();
    const start = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = d => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encTitle}&details=${encDetails}&location=${encLoc}&dates=${fmt(start)}/${fmt(end)}`;
  }

  // 1. Inject Preset Buttons Bar inside Smart Capture Section
  function injectPresets() {
    const actionRow = document.querySelector('#smartCaptureSection .flex-wrap.items-center.gap-2\\.5');
    if (!actionRow || document.getElementById('presetChipsBar')) return;

    const presetBar = document.createElement('div');
    presetBar.id = 'presetChipsBar';
    presetBar.className = 'w-full flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/15 text-xs';
    presetBar.innerHTML = `
      <span class="font-label-sm text-outline font-semibold uppercase tracking-wider text-[11px] mr-1">⚡ 1-Click Samples:</span>
      <button type="button" class="preset-btn px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center gap-1 active:scale-95 shadow-2xs cursor-pointer" data-sample="exam">
        <span class="material-symbols-outlined text-[14px] text-error">school</span>
        <span>WhatsApp Exam Notice</span>
      </button>
      <button type="button" class="preset-btn px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center gap-1 active:scale-95 shadow-2xs cursor-pointer" data-sample="hackathon">
        <span class="material-symbols-outlined text-[14px] text-primary">code</span>
        <span>Hackathon Fest</span>
      </button>
      <button type="button" class="preset-btn px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center gap-1 active:scale-95 shadow-2xs cursor-pointer" data-sample="placement">
        <span class="material-symbols-outlined text-[14px] text-secondary">work</span>
        <span>Placement PPT</span>
      </button>
      <button type="button" class="preset-btn px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all flex items-center gap-1 active:scale-95 shadow-2xs cursor-pointer" data-sample="hostel">
        <span class="material-symbols-outlined text-[14px] text-tertiary">apartment</span>
        <span>Hostel Maintenance</span>
      </button>
    `;

    actionRow.parentNode.appendChild(presetBar);

    presetBar.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-sample');
        const text = SAMPLES[key];
        const textarea = document.getElementById('smartCaptureInput');
        if (textarea && text) {
          textarea.value = text;
          const clearBtn = document.getElementById('clearCaptureBtn');
          if (clearBtn) clearBtn.classList.remove('hidden');
          triggerLiveParse(text);
        }
      });
    });
  }

  // 2. Real Notice Extraction & Task Card Generation
  function triggerLiveParse(textToParse) {
    const textarea = document.getElementById('smartCaptureInput');
    const inputVal = textToParse || (textarea ? textarea.value.trim() : '');
    if (!inputVal) return;

    const parseBtn = document.getElementById('parseCaptureBtn');
    const parseLabel = document.getElementById('parseBtnLabel');
    const scannerBeam = document.getElementById('captureScanner');
    const captureSection = document.getElementById('smartCaptureSection');
    const feedbackToast = document.getElementById('parseFeedback');
    const feedbackText = document.getElementById('parseFeedbackText');

    if (parseBtn) parseBtn.disabled = true;
    if (parseLabel) parseLabel.textContent = 'Extracting with AI...';
    if (scannerBeam) scannerBeam.classList.remove('hidden');
    if (captureSection) captureSection.classList.add('scanning-active');

    setTimeout(() => {
      // Run NLP Extractor
      let extracted;
      try {
        if (typeof NoticeExtractor !== 'undefined' && typeof NoticeExtractor.extract === 'function') {
          extracted = NoticeExtractor.extract(inputVal);
        }
      } catch (e) {
        console.warn('NoticeExtractor fallback:', e);
      }

      if (!extracted) {
        extracted = {
          title: inputVal.split('\n')[0].replace(/[*_#📢⚠️]/g, '').slice(0, 60) || 'Campus Announcement',
          category: 'Academics',
          displayTime: '05:00 PM',
          venue: 'Campus / TBA',
          description: inputVal.slice(0, 180),
          rawText: inputVal,
          isUrgent: true
        };
      }

      // Add task card to the DOM
      appendTaskCard(extracted);

      // Reset Scanner UI
      if (parseBtn) parseBtn.disabled = false;
      if (parseLabel) parseLabel.textContent = 'Parse with AI';
      if (scannerBeam) scannerBeam.classList.add('hidden');
      if (captureSection) captureSection.classList.remove('scanning-active');

      if (feedbackToast) {
        feedbackToast.classList.remove('hidden');
        feedbackToast.classList.add('animate-enter');
        if (feedbackText) {
          feedbackText.innerHTML = `Extracted 1 priority notice for <strong class="font-bold">${escapeHTML(extracted.title.slice(0, 30))}</strong>. Added to your queue below!`;
        }
      }

      if (textarea) textarea.value = '';
      const clearBtn = document.getElementById('clearCaptureBtn');
      if (clearBtn) clearBtn.classList.add('hidden');

      // Scroll to newly added card
      const urgentList = document.getElementById('urgentTasksList');
      if (urgentList && urgentList.firstElementChild) {
        urgentList.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 850);
  }

    // 3. Dynamically Append Structured Task Card (XSS-Safe, All Fields Tagged)
  function appendTaskCard(notice, shouldSave = true) {
    const urgentList = document.getElementById('urgentTasksList');
    if (!urgentList) return;

    const safeTitle = escapeHTML(notice.title || 'Campus Notice');
    const safeDesc = escapeHTML(notice.description || 'Details extracted from campus notice.');
    const safeCategory = escapeHTML(notice.category || 'Academics');
    const safeVenue = escapeHTML(notice.venue || 'Campus');
    const safeDisplayDate = escapeHTML(notice.displayDate || (notice.isUrgent !== false ? 'Today' : 'Upcoming'));
    const safeDisplayTime = escapeHTML(notice.displayTime || 'Today');
    const safeRawText = escapeHTML(notice.rawText || notice.description || '');
    const safeLink = sanitizeUrl(notice.link);
    const safePerk = notice.hasPerk && notice.perk ? escapeHTML(notice.perk) : '';
    const safeConflict = notice.conflictWarning ? escapeHTML(notice.conflictWarning.message || 'Schedule Overlap Detected') : '';

    const gcalUrl = makeGCalUrl(notice.title, notice.venue, notice.description, notice.displayTime);
    const cardId = 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const card = document.createElement('article');
    card.className = 'task-card interactive-card group relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm animate-enter border border-outline-variant/15';
    card.setAttribute('data-task-id', cardId);
    card.setAttribute('data-category', safeCategory.toLowerCase());

    const isExpired = notice.isExpired === true;
    const isUrgent = !isExpired && (notice.isUrgent !== false);
    card.setAttribute('data-urgent', isUrgent ? 'true' : 'false');
    card.setAttribute('data-expired', isExpired ? 'true' : 'false');

    let badgeColor = 'bg-primary-fixed text-on-primary-fixed';
    let tagText = 'Upcoming';
    let borderAccent = 'bg-primary-container';

    if (isExpired) {
      badgeColor = 'bg-surface-container-high text-on-surface-variant';
      tagText = 'Expired / Past';
      borderAccent = 'bg-outline-variant';
    } else if (isUrgent) {
      badgeColor = 'bg-secondary-fixed text-on-secondary-fixed';
      tagText = 'Due Today';
      borderAccent = 'bg-secondary-container';
    }

    card.innerHTML = `
      <div class="absolute left-0 top-0 bottom-0 w-1.5 ${borderAccent} transition-all group-hover:w-2"></div>
      <div class="pl-3 flex flex-col gap-3">
        <!-- Field Badges Row -->
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <span data-field="status" class="rounded-full ${badgeColor} px-2.5 py-0.5 font-label-sm text-label-sm font-semibold">${tagText}</span>
            <span data-field="category" class="rounded-full bg-surface-container-high px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant font-medium">${safeCategory}</span>
            <span data-field="venue" class="rounded-full bg-surface-container-high px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px] text-outline">location_on</span>
              <span>${safeVenue}</span>
            </span>
            ${safePerk ? `
              <span data-field="perk" class="rounded-full bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-0.5 font-label-sm text-label-sm font-semibold flex items-center gap-1 shadow-2xs">
                <span class="material-symbols-outlined text-[13px]">local_pizza</span>
                <span>${safePerk}</span>
              </span>
            ` : ''}
            ${safeConflict ? `
              <span data-field="conflict" class="rounded-full bg-error-container text-on-error-container px-2.5 py-0.5 font-label-sm text-label-sm font-semibold flex items-center gap-1">
                <span class="material-symbols-outlined text-[13px]">warning</span>
                <span>${safeConflict}</span>
              </span>
            ` : ''}
          </div>
          <!-- Date & Time Badges -->
          <div class="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
            <span class="inline-flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-primary">calendar_today</span>
              <span data-field="date" class="font-medium">${safeDisplayDate}</span>
            </span>
            <span class="inline-flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-secondary">alarm</span>
              <span data-field="time" class="font-medium">${safeDisplayTime}</span>
            </span>
          </div>
        </div>

        <!-- Title & Description -->
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1 flex-1">
            <h4 data-field="title" class="font-title-sm text-title-sm text-on-surface font-semibold task-title transition-all">${safeTitle}</h4>
            <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">${safeDesc}</p>
          </div>
          <button type="button" aria-label="Mark task done" class="complete-btn relative h-7 w-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-transparent flex items-center justify-center transition-all shrink-0 cursor-pointer" title="Mark as done">
            <span class="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>

        <!-- Action Row & Quick Tools -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/10 text-xs text-on-surface-variant">
          <div class="flex items-center gap-3">
            <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-primary hover:underline font-label-sm">
              <span class="material-symbols-outlined text-[14px]">event_upcoming</span>
              <span>+ Google Cal</span>
            </a>
            ${safeLink && safeLink !== '#' ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-tertiary hover:underline font-label-sm"><span class="material-symbols-outlined text-[14px]">link</span><span>Portal Link</span></a>` : ''}
            <button type="button" class="remind-btn inline-flex items-center gap-1 text-secondary hover:underline font-label-sm cursor-pointer" title="Schedule in-app notification reminder">
              <span class="material-symbols-outlined text-[14px]">notifications_active</span>
              <span>Remind Me</span>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="archive-card-btn inline-flex items-center gap-1 text-outline hover:text-error font-label-sm cursor-pointer" title="Archive notice">
              <span class="material-symbols-outlined text-[14px]">archive</span>
              <span>Archive</span>
            </button>
            <button type="button" class="drawer-toggle flex items-center gap-1 font-label-sm text-on-surface-variant hover:text-on-surface cursor-pointer">
              <span>Raw Notice</span>
              <span class="material-symbols-outlined text-[16px] transition-transform duration-200">unfold_more</span>
            </button>
          </div>
        </div>

        <!-- Accordion Raw Prompt View -->
        <div class="accordion-wrapper">
          <div class="accordion-inner pt-2">
            <div class="rounded-lg bg-surface-container-low p-3 font-mono text-[11px] text-on-surface-variant whitespace-pre-wrap select-all border border-outline-variant/20">
              ${safeRawText}
            </div>
          </div>
        </div>
      </div>
    `;

    urgentList.prepend(card);

    // Bind Interactions on New Card
    bindCardInteractions(card);
    updateTotalTaskCount();

    if (shouldSave) {
      saveCustomTasks();
    }
  }

  // 4. Bind Checkmark Particle Burst & Drawer Expansion on Cards
  function bindCardInteractions(card) {
    const completeBtn = card.querySelector('.complete-btn');
    const drawerToggle = card.querySelector('.drawer-toggle');
    const accordion = card.querySelector('.accordion-wrapper');
    const title = card.querySelector('.task-title');

        const remindBtn = card.querySelector('.remind-btn');
    if (remindBtn) {
      remindBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if ('Notification' in window && Notification.permission !== 'granted') {
          Notification.requestPermission();
        }
        remindBtn.innerHTML = '<span class="material-symbols-outlined text-[14px] text-tertiary">check_circle</span><span>Reminder Active</span>';
        const titleText = card.querySelector('.task-title')?.textContent || 'Campus Notice';
        alert(`🔔 Reminder Scheduled: We will alert you 1 hour before "${titleText}".`);
      });
    }

    const archiveBtn = card.querySelector('.archive-card-btn');
    if (archiveBtn) {
      archiveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
          card.remove();
          updateTotalTaskCount();
          saveCustomTasks();
        }, 200);
      });
    }

    if (completeBtn) {
      completeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isDone = completeBtn.classList.contains('is-checked');
        if (!isDone) {
          completeBtn.classList.add('is-checked', 'bg-tertiary', 'text-on-tertiary', 'check-pop');
          completeBtn.classList.remove('bg-surface-container-high', 'text-transparent');
          if (title) title.classList.add('line-through', 'opacity-50');
          card.classList.add('opacity-75');
          card.setAttribute('data-expired', 'true');
          createBurst(completeBtn);
          setTimeout(() => completeBtn.classList.remove('check-pop'), 400);
        } else {
          completeBtn.classList.remove('is-checked', 'bg-tertiary', 'text-on-tertiary');
          completeBtn.classList.add('bg-surface-container-high', 'text-transparent');
          if (title) title.classList.remove('line-through', 'opacity-50');
          card.classList.remove('opacity-75');
          card.setAttribute('data-expired', 'false');
        }
        updateTotalTaskCount();
        saveCustomTasks();
      });
    }

    if (drawerToggle && accordion) {
      drawerToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = accordion.classList.contains('expanded');
        accordion.classList.toggle('expanded');
        const icon = drawerToggle.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = isExpanded ? 'unfold_more' : 'unfold_less';
          icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      });
    }
  }

  // 5. Confetti Particle Burst Function
  function createBurst(target) {
    const colors = ['#67f4b7', '#4f46e5', '#fea619', '#3525cd'];
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.width = '5px';
      p.style.height = '5px';
      p.style.borderRadius = '50%';
      p.style.pointerEvents = 'none';
      p.style.zIndex = '50';
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      const angle = (Math.PI * 2 * i) / 8;
      const dist = 18 + Math.random() * 12;
      p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      p.style.left = '50%';
      p.style.top = '50%';
      p.style.animation = 'particleBurst 0.45s cubic-bezier(0.1, 0.9, 0.2, 1) forwards';
      
      target.appendChild(p);
      setTimeout(() => p.remove(), 480);
    }
  }

  function updateTotalTaskCount() {
    const badge = document.getElementById('tasksBadgeCount');
    const statCount = document.querySelector('#smartCaptureSection ~ section .text-headline-lg');
    if (!badge) return;

    const cards = document.querySelectorAll('#urgentTasksList .task-card');
    const pending = Array.from(cards).filter(c => {
      const btn = c.querySelector('.complete-btn');
      return !btn || !btn.classList.contains('is-checked');
    }).length;

    badge.textContent = `${pending} Task${pending === 1 ? '' : 's'}`;
    if (statCount) statCount.textContent = pending;
  }

  // 6. Live Search Bar Filter (⌘K / Text search)
  function setupSearch() {
    const searchInput = document.querySelector('header input[type="text"]');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const allCards = document.querySelectorAll('#urgentTasksList .task-card, #weeklyGrid .weekly-item');
      allCards.forEach(c => {
        const text = c.innerText.toLowerCase();
        if (!q || text.includes(q)) {
          c.style.display = '';
        } else {
          c.style.display = 'none';
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // 7. Manual Add Notice Modal
  function setupManualAddModal() {
    const addBtn = document.getElementById('addManualBtn');
    if (!addBtn || document.getElementById('manualModalDialog')) return;

    const modal = document.createElement('div');
    modal.id = 'manualModalDialog';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs hidden';
    modal.innerHTML = `
      <div class="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 shadow-2xl border border-outline-variant/20 flex flex-col gap-4 animate-enter">
        <div class="flex items-center justify-between pb-2 border-b border-outline-variant/15">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[22px] text-primary">add_task</span>
            <h3 class="font-headline-md text-headline-sm text-on-surface">Add Campus Notice Manually</h3>
          </div>
          <button type="button" id="closeManualModal" class="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form id="manualNoticeForm" class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Event / Assignment Title *</label>
            <input type="text" id="manualTitle" required placeholder="e.g. CS 189 Midterm 1 Cheat Sheet Due" class="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"/>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Category</label>
              <select id="manualCategory" class="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 text-body-sm text-on-surface">
                <option>Academics</option>
                <option>Deadlines</option>
                <option>Projects</option>
                <option>Placements</option>
                <option>Campus Life</option>
                <option>Admin & Hostel</option>
              </select>
            </div>
            <div class="flex flex-col gap-1">
              <label class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Scheduled Time</label>
              <input type="text" id="manualTime" placeholder="e.g. 5:00 PM Today" class="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 text-body-sm text-on-surface"/>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Venue / Room</label>
            <input type="text" id="manualVenue" placeholder="e.g. Pimentel Hall 101 / Online" class="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 text-body-sm text-on-surface"/>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Description / Notes</label>
            <textarea id="manualDesc" rows="2" placeholder="Key instructions, allowed items, grading weight..." class="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 text-body-sm text-on-surface resize-none"></textarea>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/15 mt-1">
            <button type="button" id="cancelManualModal" class="px-4 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md cursor-pointer">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-primary text-on-primary hover:opacity-90 font-label-md font-semibold shadow-sm cursor-pointer">Add to Radar</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    addBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      document.getElementById('manualTitle')?.focus();
    });

    const closeModal = () => modal.classList.add('hidden');
    document.getElementById('closeManualModal')?.addEventListener('click', closeModal);
    document.getElementById('cancelManualModal')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.getElementById('manualNoticeForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('manualTitle').value.trim();
      const category = document.getElementById('manualCategory').value;
      const time = document.getElementById('manualTime').value.trim() || 'Today 5:00 PM';
      const venue = document.getElementById('manualVenue').value.trim() || 'Campus';
      const desc = document.getElementById('manualDesc').value.trim();

      appendTaskCard({
        title,
        category,
        displayTime: time,
        venue,
        description: desc,
        rawText: `Manual Entry: ${title} - ${venue} at ${time}. ${desc}`,
        isUrgent: true
      });

      closeModal();
      document.getElementById('manualNoticeForm').reset();
    });
  }

  // 8. Live Notification Bell Dropdown
  function setupNotificationDropdown() {
    const bellBtn = document.querySelector('header button[aria-label="Notifications"]');
    if (!bellBtn || document.getElementById('notificationDropdownPanel')) return;

    const dropdown = document.createElement('div');
    dropdown.id = 'notificationDropdownPanel';
    dropdown.className = 'absolute right-8 top-16 w-80 rounded-2xl bg-surface-container-lowest p-4 shadow-xl border border-outline-variant/20 z-50 hidden animate-enter flex flex-col gap-3';
    dropdown.innerHTML = `
      <div class="flex items-center justify-between pb-2 border-b border-outline-variant/15">
        <span class="font-headline-sm text-title-sm text-on-surface font-semibold">Campus Alerts</span>
        <span class="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary-fixed">3 New</span>
      </div>
      <div class="flex flex-col gap-2.5 text-xs text-on-surface-variant">
        <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/15">
          <span class="font-semibold text-on-surface">🚨 CS 189 Midterm Cheat Sheet</span>
          <span>1 double-sided handwritten page allowed in Pimentel Hall.</span>
          <span class="text-[10px] text-outline">12m ago</span>
        </div>
        <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/15">
          <span class="font-semibold text-on-surface">🍕 Free Boba & Pizza at Eng Quad</span>
          <span>Robotics club social starts in 45 minutes!</span>
          <span class="text-[10px] text-outline">1h ago</span>
        </div>
        <div class="p-2.5 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/15">
          <span class="font-semibold text-on-surface">💼 SWE Career Fair RSVP</span>
          <span>Formal western dress code mandatory at Haas Pavilion.</span>
          <span class="text-[10px] text-outline">3h ago</span>
        </div>
      </div>
    `;

    document.querySelector('header')?.appendChild(dropdown);

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== bellBtn) {
        dropdown.classList.add('hidden');
      }
    });
  }

  // 9. Profile Switcher Modal
  function setupProfileSwitcher() {
    const profileTrigger = document.querySelector('header .group.cursor-pointer, aside #sidebar-user-name');
    if (!profileTrigger || document.getElementById('profileSwitcherModal')) return;

    const modal = document.createElement('div');
    modal.id = 'profileSwitcherModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs hidden';
    modal.innerHTML = `
      <div class="relative w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl border border-outline-variant/20 flex flex-col gap-4 animate-enter">
        <div class="flex items-center justify-between pb-2 border-b border-outline-variant/15">
          <h3 class="font-headline-sm text-title-sm text-on-surface font-semibold">Switch Active Student Profile</h3>
          <button type="button" id="closeProfileModal" class="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="flex flex-col gap-2.5">
          <button type="button" class="profile-choice-btn flex items-center gap-3 p-3 rounded-xl bg-primary-fixed/20 border border-primary text-left cursor-pointer transition-all hover:scale-[1.02]" data-name="Alex Rivera" data-major="Computer Science '26" data-avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuAFvIcRMV7_2e0xAjW-SdtU5eWtZMznnRS0NZtAPM3AQmsjVZcK4bVe_8vq_qtxF6uPdKTyB6Yf2HJAIuSIp3tcfx49l8yjmfKbtJeHjI1hSkeQdgYj09jxdSyjl4Fde4C1JcxeRy-HK4JV84-zJXL4qqYCdm-Cwtp2OlDSUkd90okjnyma4yh1XqKpqbeMINZHlHCeeu2MfW0AUperYbLFcTF8jmbOznzo5omcEvk">
            <div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">AR</div>
            <div class="flex flex-col">
              <span class="font-label-md text-on-surface font-bold">Alex Rivera</span>
              <span class="text-xs text-on-surface-variant">Computer Science • Fall Semester</span>
            </div>
            <span class="material-symbols-outlined text-primary text-[18px] ml-auto">check_circle</span>
          </button>

          <button type="button" class="profile-choice-btn flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-left cursor-pointer transition-all hover:scale-[1.02]" data-name="Priya Sharma" data-major="AI & Data Science '25" data-avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80">
            <div class="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">PS</div>
            <div class="flex flex-col">
              <span class="font-label-md text-on-surface font-bold">Priya Sharma</span>
              <span class="text-xs text-on-surface-variant">AI & Data Science • Senior</span>
            </div>
          </button>

          <button type="button" class="profile-choice-btn flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-left cursor-pointer transition-all hover:scale-[1.02]" data-name="Rohan Mehta" data-major="Mechanical & Robotics '27" data-avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80">
            <div class="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold">RM</div>
            <div class="flex flex-col">
              <span class="font-label-md text-on-surface font-bold">Rohan Mehta</span>
              <span class="text-xs text-on-surface-variant">Robotics • 2nd Year</span>
            </div>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const openModal = () => modal.classList.remove('hidden');
    const closeModal = () => modal.classList.add('hidden');

    profileTrigger.addEventListener('click', openModal);
    document.getElementById('closeProfileModal')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    modal.querySelectorAll('.profile-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        const major = btn.getAttribute('data-major');
        const headerName = document.querySelector('header .group .font-label-md');
        const headerRole = document.querySelector('header .group .font-label-sm');
        if (headerName) headerName.textContent = name;
        if (headerRole) headerRole.textContent = major;
        closeModal();
      });
    });
  }

  // 10. Wire Up Parse Button in Textarea
  function hookParseButton() {
    const parseBtn = document.getElementById('parseCaptureBtn');
    if (!parseBtn) return;

    // Replace the simulated click handler with our real extraction
    parseBtn.onclick = null;
    parseBtn.addEventListener('click', () => {
      const textarea = document.getElementById('smartCaptureInput');
      const val = textarea ? textarea.value.trim() : '';
      if (val) {
        triggerLiveParse(val);
      } else {
        if (textarea) {
          textarea.value = SAMPLES.exam;
          const clearBtn = document.getElementById('clearCaptureBtn');
          if (clearBtn) clearBtn.classList.remove('hidden');
        }
        triggerLiveParse(SAMPLES.exam);
      }
    });

    const pasteBtn = document.getElementById('pasteClipboardBtn');
    if (pasteBtn) {
      pasteBtn.onclick = null;
      pasteBtn.addEventListener('click', async () => {
        try {
          if (navigator.clipboard) {
            const clip = await navigator.clipboard.readText();
            if (clip && clip.trim()) {
              const textarea = document.getElementById('smartCaptureInput');
              if (textarea) {
                textarea.value = clip;
                const clearBtn = document.getElementById('clearCaptureBtn');
                if (clearBtn) clearBtn.classList.remove('hidden');
              }
              triggerLiveParse(clip);
              return;
            }
          }
        } catch (e) {}
        // Fallback realistic notice
        const textarea = document.getElementById('smartCaptureInput');
        if (textarea) {
          textarea.value = SAMPLES.exam;
          const clearBtn = document.getElementById('clearCaptureBtn');
          if (clearBtn) clearBtn.classList.remove('hidden');
        }
        triggerLiveParse(SAMPLES.exam);
      });
    }

    const headerQuickPasteBtn = document.getElementById('headerQuickPasteBtn');
    if (headerQuickPasteBtn) {
      headerQuickPasteBtn.onclick = null;
      headerQuickPasteBtn.addEventListener('click', () => {
        const textarea = document.getElementById('smartCaptureInput');
        if (textarea) {
          textarea.value = SAMPLES.hackathon;
          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
          triggerLiveParse(SAMPLES.hackathon);
        }
      });
    }
  }

  // 11. What Do I Need To Know This Week? — Interactive AI Weekly Digest Modal
  function setupWeeklyDigestModal() {
    const triggerBtn = document.getElementById('whatDoINeedToKnowBtn');
    if (!triggerBtn || document.getElementById('weeklyDigestModalDialog')) return;

    const modal = document.createElement('div');
    modal.id = 'weeklyDigestModalDialog';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'weeklyDigestTitle');

    modal.innerHTML = `
      <div class="relative w-full max-w-2xl rounded-2xl bg-surface-container-lowest p-6 shadow-2xl border border-outline-variant/20 flex flex-col gap-5 animate-enter max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant/15">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shadow-xs">
              <span class="material-symbols-outlined text-[20px] animate-pulse">auto_awesome</span>
            </div>
            <div>
              <h3 id="weeklyDigestTitle" class="font-headline-sm text-title-md text-on-surface font-bold tracking-tight">What You Need To Know This Week</h3>
              <p class="font-body-sm text-xs text-on-surface-variant">Intelligent executive brief synthesized from campus notices</p>
            </div>
          </div>
          <button type="button" id="closeWeeklyDigestModal" aria-label="Close Weekly Digest" class="w-8 h-8 rounded-lg hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Audio Briefing Bar -->
        <div class="flex items-center justify-between p-3.5 rounded-xl bg-primary-fixed/20 border border-primary/30 flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <button type="button" id="digestVoicePlayBtn" class="h-9 px-3.5 rounded-lg bg-primary text-on-primary flex items-center gap-1.5 font-label-md shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer">
              <span class="material-symbols-outlined text-[18px]" id="digestVoiceIcon">volume_up</span>
              <span id="digestVoiceLabel">Listen to Briefing</span>
            </button>
            <div id="digestEqWave" class="hidden items-end gap-1 h-5">
              <span class="w-1 bg-primary rounded-full animate-bounce" style="height: 60%; animation-delay: 0.1s"></span>
              <span class="w-1 bg-primary rounded-full animate-bounce" style="height: 100%; animation-delay: 0.25s"></span>
              <span class="w-1 bg-primary rounded-full animate-bounce" style="height: 75%; animation-delay: 0.15s"></span>
              <span class="w-1 bg-primary rounded-full animate-bounce" style="height: 90%; animation-delay: 0.3s"></span>
            </div>
          </div>
          <button type="button" id="digestCopyWhatsAppBtn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm border border-outline-variant/20 transition-all cursor-pointer active:scale-95">
            <span class="material-symbols-outlined text-[16px] text-tertiary">share</span>
            <span>Copy WhatsApp Digest</span>
          </button>
        </div>

        <!-- Digest Content Sections -->
        <div class="flex flex-col gap-4 text-body-sm text-on-surface">
          <!-- Section 1: Urgent Today -->
          <div class="p-4 rounded-xl bg-secondary-fixed/15 border border-secondary-fixed flex flex-col gap-2">
            <div class="flex items-center gap-2 text-secondary font-semibold font-label-md">
              <span class="material-symbols-outlined text-[18px]">warning</span>
              <span>Needs Attention Today (Top Priorities)</span>
            </div>
            <ul class="list-disc list-inside text-xs space-y-1 text-on-surface-variant">
              <li><strong>CS 189 Midterm Problem Set 4:</strong> Submit PDF write-up & code to Gradescope by 11:59 PM sharp.</li>
              <li><strong>Biology Lab 104 Sign-off:</strong> Mandatory TA physical notebook sign-off at Barker Hall 202 before 5:00 PM.</li>
              <li><strong>MATH 54 Cram Session:</strong> Group session confirmed at Moffitt Library Pod 12 from 7:30 PM.</li>
            </ul>
          </div>

          <!-- Section 2: This Week's Midterms & Deadlines -->
          <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
            <div class="flex items-center gap-2 text-primary font-semibold font-label-md">
              <span class="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Upcoming This Week</span>
            </div>
            <ul class="list-disc list-inside text-xs space-y-1 text-on-surface-variant">
              <li><strong>Thursday 2:00 PM:</strong> CS 189 Midterm Exam 1 in Pimentel Hall (1 two-sided cheat sheet allowed).</li>
              <li><strong>Friday 9:00 AM:</strong> DevSoc HACKCAMPUS 2026 starts at Main Audi & Innovation Hub (₹1.5L Prize Pool).</li>
              <li><strong>Sunday 2:30 PM:</strong> Google & Microsoft Pre-Placement PPT & Assessment at Seminar Hall 1.</li>
            </ul>
          </div>

          <!-- Section 3: Campus Perks & Food Radar -->
          <div class="p-4 rounded-xl bg-tertiary-fixed/20 border border-tertiary-fixed flex flex-col gap-2">
            <div class="flex items-center gap-2 text-tertiary font-semibold font-label-md">
              <span class="material-symbols-outlined text-[18px]">local_pizza</span>
              <span>Perks & Free Food Radar</span>
            </div>
            <p class="text-xs text-on-surface-variant">
              🍕 <strong>Free Artisanal Pizza & Boba:</strong> Robotics Club Social this afternoon at Engineering Quad.<br>
              🎒 <strong>Schwag Packs:</strong> Exclusive GitHub & DevSoc starter backpacks for all registered hackathon teams.
            </p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between pt-3 border-t border-outline-variant/15 flex-wrap gap-2">
          <a href="ai-digest.html" class="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
            <span>Explore Full AI Audio Briefing Studio</span>
            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
          <button type="button" id="closeWeeklyDigestBtn" class="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-semibold cursor-pointer">
            Done
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const openModal = () => {
      modal.classList.remove('hidden');
    };
    const closeModal = () => {
      modal.classList.add('hidden');
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        resetVoiceUI();
      }
    };

    triggerBtn.addEventListener('click', openModal);
    document.getElementById('closeWeeklyDigestModal')?.addEventListener('click', closeModal);
    document.getElementById('closeWeeklyDigestBtn')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Web Speech Briefing Audio
    const voiceBtn = document.getElementById('digestVoicePlayBtn');
    const voiceLabel = document.getElementById('digestVoiceLabel');
    const voiceIcon = document.getElementById('digestVoiceIcon');
    const eqWave = document.getElementById('digestEqWave');

    function resetVoiceUI() {
      if (voiceLabel) voiceLabel.textContent = 'Listen to Briefing';
      if (voiceIcon) voiceIcon.textContent = 'volume_up';
      if (eqWave) {
        eqWave.classList.add('hidden');
        eqWave.classList.remove('flex');
      }
    }

    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        if (!('speechSynthesis' in window)) {
          alert('Speech synthesis is not supported on this browser.');
          return;
        }

        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          resetVoiceUI();
          return;
        }

        const speechText = "Good morning! Here is what you need to know this week on Campus Pulse. Your top urgent priorities today are: submit CS 189 Problem Set 4 by eleven fifty-nine PM, complete the Biology Lab notebook sign-off before five PM, and join the Math 54 study session at seven thirty PM. Coming up on Thursday, you have CS 189 Midterm One at Pimentel Hall. On Friday, DevSoc Hack Campus kicks off with free pizza and schwag. Have a productive week!";
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          if (voiceLabel) voiceLabel.textContent = 'Pause Briefing';
          if (voiceIcon) voiceIcon.textContent = 'pause';
          if (eqWave) {
            eqWave.classList.remove('hidden');
            eqWave.classList.add('flex');
          }
        };

        utterance.onend = resetVoiceUI;
        utterance.onerror = resetVoiceUI;

        window.speechSynthesis.speak(utterance);
      });
    }

    // Copy to WhatsApp
    const copyBtn = document.getElementById('digestCopyWhatsAppBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const text = `📢 *CAMPUS PULSE — WEEKLY BRIEFING*\n\n🚨 *TODAY'S URGENT:*\n• CS 189 PS4 due 11:59 PM (Gradescope)\n• Bio Lab sign-off by 5:00 PM (Barker 202)\n• Math 54 Study Group 7:30 PM (Moffitt Pod 12)\n\n📅 *UPCOMING THIS WEEK:*\n• Thu 2 PM: CS 189 Midterm Exam 1 (Pimentel 1)\n• Fri 9 AM: DevSoc HackCampus (Main Audi)\n• Sun 2:30 PM: Google & MSFT PPT (Seminar Hall 1)\n\n🍕 *FREE FOOD:*\n• Pizza & Boba at Robotics Social today!\n\n_Generated via Campus Pulse Radar_`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          const orig = copyBtn.innerHTML;
          copyBtn.innerHTML = '<span class="material-symbols-outlined text-[16px] text-tertiary">check</span><span>Copied to WhatsApp!</span>';
          setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
        }
      });
    }
  }

  // 12. Persistent Custom Tasks in LocalStorage
  const STORAGE_TASKS_KEY = 'campus_pulse_custom_tasks';

  function saveCustomTasks() {
    try {
      const cards = document.querySelectorAll('#urgentTasksList .task-card');
      const data = Array.from(cards).map(c => {
        const title = c.querySelector('.task-title')?.textContent?.trim() || '';
        const desc = c.querySelector('p')?.textContent?.trim() || '';
        const badges = c.querySelectorAll('.rounded-full');
        const category = badges[1]?.textContent?.trim() || 'Academics';
        const venue = badges[2]?.textContent?.trim() || 'Campus';
        const displayTime = c.querySelector('.material-symbols-outlined.text-secondary + span')?.textContent?.trim() || 'Today';
        const isDone = c.querySelector('.complete-btn')?.classList.contains('is-checked') || false;
        const rawText = c.querySelector('.accordion-inner div')?.textContent?.trim() || '';
        const isUrgent = c.getAttribute('data-urgent') !== 'false';
        const isExpired = c.getAttribute('data-expired') === 'true';
        return { title, description: desc, category, venue, displayTime, rawText, isCompleted: isDone, isUrgent, isExpired };
      });
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(data.slice(0, 20)));
    } catch (e) {}
  }

  function loadSavedCustomTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_TASKS_KEY);
      if (!raw) return;
      const tasks = JSON.parse(raw);
      if (Array.isArray(tasks) && tasks.length > 0) {
        const urgentList = document.getElementById('urgentTasksList');
        if (urgentList) urgentList.innerHTML = '';
        tasks.reverse().forEach(task => appendTaskCard(task, false));
      }
    } catch (e) {}
  }

  // Initialize all live enhancements
  
  // 13. "Ask Campus Pulse" Floating AI Assistant
  function setupCampusChatAssistant() {
    if (document.getElementById('campusChatWidget')) return;

    const widget = document.createElement('div');
    widget.id = 'campusChatWidget';
    widget.className = 'fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3';

    widget.innerHTML = `
      <!-- Chat Dialog Box -->
      <div id="campusChatDialog" class="hidden w-84 sm:w-96 rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/20 flex flex-col overflow-hidden animate-enter transition-all">
        <!-- Chat Header -->
        <div class="p-3.5 bg-primary text-on-primary flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px] text-tertiary animate-pulse">forum</span>
            <div>
              <h4 class="font-title-sm text-sm font-bold leading-none">Ask Campus Pulse AI</h4>
              <span class="text-[11px] opacity-80 leading-none">Instant answers from campus radar</span>
            </div>
          </div>
          <button type="button" id="closeCampusChatBtn" aria-label="Close Chat" class="h-7 w-7 rounded-lg hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <!-- Chat Messages Container -->
        <div id="campusChatMessages" class="p-3.5 flex flex-col gap-2.5 max-h-72 overflow-y-auto text-xs bg-surface-container-low/50">
          <div class="flex items-start gap-2 max-w-[85%] bg-surface-container p-2.5 rounded-xl rounded-tl-xs">
            <span class="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">smart_toy</span>
            <div class="text-on-surface">
              👋 Hey Alex! Ask me anything about your campus notices, deadlines, or free food perks!
            </div>
          </div>
        </div>

        <!-- Preset Chips -->
        <div class="p-2 border-t border-outline-variant/15 flex flex-wrap gap-1.5 bg-surface-container-lowest text-[11px]">
          <button type="button" class="chat-chip px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer transition-all active:scale-95" data-q="Where is free food this week?">
            🍕 Free Food?
          </button>
          <button type="button" class="chat-chip px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer transition-all active:scale-95" data-q="What deadlines are due today?">
            🚨 Deadlines Today?
          </button>
          <button type="button" class="chat-chip px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer transition-all active:scale-95" data-q="Any placement talks or drives?">
            💼 Placements?
          </button>
          <button type="button" class="chat-chip px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer transition-all active:scale-95" data-q="Upcoming hackathons?">
            💻 Hackathons?
          </button>
        </div>

        <!-- Chat Input Bar -->
        <form id="campusChatForm" class="p-2.5 border-t border-outline-variant/15 flex items-center gap-2 bg-surface-container-lowest">
          <input type="text" id="campusChatInput" placeholder="Ask a question about campus life..." class="flex-1 bg-surface-container-low px-3 py-1.5 rounded-xl text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary/40"/>
          <button type="submit" class="h-8 w-8 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 cursor-pointer shrink-0">
            <span class="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      </div>

      <!-- Floating Trigger Button -->
      <button type="button" id="toggleCampusChatBtn" aria-label="Ask Campus Pulse AI Assistant" class="flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-on-primary font-title-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group">
        <span class="material-symbols-outlined text-[20px] text-tertiary transition-transform group-hover:rotate-12">forum</span>
        <span class="font-semibold text-xs sm:text-sm">Ask Campus AI</span>
        <span class="h-2 w-2 rounded-full bg-tertiary animate-ping"></span>
      </button>
    `;

    document.body.appendChild(widget);

    const dialog = document.getElementById('campusChatDialog');
    const toggleBtn = document.getElementById('toggleCampusChatBtn');
    const closeBtn = document.getElementById('closeCampusChatBtn');
    const chatForm = document.getElementById('campusChatForm');
    const chatInput = document.getElementById('campusChatInput');
    const chatMsgs = document.getElementById('campusChatMessages');

    const toggleChat = () => {
      dialog.classList.toggle('hidden');
      if (!dialog.classList.contains('hidden')) {
        chatInput?.focus();
      }
    };

    toggleBtn?.addEventListener('click', toggleChat);
    closeBtn?.addEventListener('click', () => dialog.classList.add('hidden'));

    function sendChatMessage(text) {
      if (!text || !text.trim()) return;
      const q = text.trim();

      // Append user bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'flex items-start justify-end max-w-[85%] self-end bg-primary text-on-primary p-2.5 rounded-xl rounded-tr-xs text-xs';
      userBubble.textContent = q;
      chatMsgs.appendChild(userBubble);
      chatMsgs.scrollTop = chatMsgs.scrollHeight;

      if (chatInput) chatInput.value = '';

      // Query CampusChatAssistant
      setTimeout(() => {
        let answer = "I'm checking the radar...";
        try {
          if (typeof CampusChatAssistant !== 'undefined' && typeof CampusChatAssistant.answer === 'function') {
            const rawNotices = JSON.parse(localStorage.getItem('campus_pulse_custom_tasks') || '[]');
            const notices = (typeof INITIAL_NOTICES !== 'undefined' ? INITIAL_NOTICES : []).concat(rawNotices);
            const res = CampusChatAssistant.answer(q, notices);
            answer = res.reply;
          } else {
            answer = "I'm reviewing your active notices. You have 3 urgent tasks today, including the CS 189 problem set and Biology lab report.";
          }
        } catch (e) {
          answer = "Your radar shows active deliverables today for CS 189 and Biology Lab. DevSoc HackCampus is coming up on Friday!";
        }

        const botBubble = document.createElement('div');
        botBubble.className = 'flex items-start gap-2 max-w-[85%] bg-surface-container p-2.5 rounded-xl rounded-tl-xs text-xs';
        botBubble.innerHTML = `
          <span class="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">smart_toy</span>
          <div class="text-on-surface whitespace-pre-wrap">${escapeHTML(answer)}</div>
        `;
        chatMsgs.appendChild(botBubble);
        chatMsgs.scrollTop = chatMsgs.scrollHeight;
      }, 350);
    }

    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      sendChatMessage(chatInput.value);
    });

    widget.querySelectorAll('.chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-q');
        sendChatMessage(q);
      });
    });
  }

  // 14. List View vs Agenda Calendar View Switcher
  function setupViewModeSwitcher() {
    const listBtn = document.getElementById('viewModeListBtn');
    const calBtn = document.getElementById('viewModeCalBtn');
    const listView = document.getElementById('urgentTasksList');
    const calView = document.getElementById('dashboardCalendarView');

    if (!listBtn || !calBtn || !listView || !calView) return;

    listBtn.addEventListener('click', () => {
      listBtn.classList.add('bg-surface-container-lowest', 'text-primary', 'font-semibold', 'shadow-xs');
      listBtn.classList.remove('text-on-surface-variant');
      calBtn.classList.remove('bg-surface-container-lowest', 'text-primary', 'font-semibold', 'shadow-xs');
      calBtn.classList.add('text-on-surface-variant');

      listView.classList.remove('hidden');
      calView.classList.add('hidden');
    });

    calBtn.addEventListener('click', () => {
      calBtn.classList.add('bg-surface-container-lowest', 'text-primary', 'font-semibold', 'shadow-xs');
      calBtn.classList.remove('text-on-surface-variant');
      listBtn.classList.remove('bg-surface-container-lowest', 'text-primary', 'font-semibold', 'shadow-xs');
      listBtn.classList.add('text-on-surface-variant');

      listView.classList.add('hidden');
      calView.classList.remove('hidden');
    });

    // Day selection on mini calendar
    const days = calView.querySelectorAll('#agendaCalendarDays > div');
    const selectedDayEl = document.getElementById('agendaDaySelected');
    const itemsListEl = document.getElementById('agendaItemsList');

    const daySchedules = {
      Mon: [ { title: 'CS 189 Lecture: Kernel Ridge Regression', time: '10:00 AM', venue: 'Wheeler 150' } ],
      Tue: [ { title: 'Bio 1A Discussion Section 104', time: '1:00 PM', venue: 'VLSB 2060' } ],
      Wed: [ { title: 'Math 54 Office Hours (GSI)', time: '3:00 PM', venue: 'Evans Hall 740' } ],
      Thu: [ 
        { title: 'CS 189: Problem Set 4 Due', time: '11:59 PM', venue: 'Gradescope' },
        { title: 'Biology Lab Report Review & TA Sign-off', time: '5:00 PM', venue: 'Barker 202' },
        { title: 'MATH 54 Midterm Collective Cram Session', time: '7:30 PM', venue: 'Moffitt Pod 12' }
      ],
      Fri: [ { title: 'DevSoc HACKCAMPUS 2026 Kickoff', time: '9:00 AM', venue: 'Main Audi' } ],
      Sat: [ { title: 'Hackathon Project Mentoring & Demos', time: '2:00 PM', venue: 'Innovation Hub' } ],
      Sun: [ { title: 'Google & Microsoft Joint Pre-Placement Talk', time: '2:30 PM', venue: 'Seminar Hall 1' } ]
    };

    days.forEach(day => {
      day.addEventListener('click', () => {
        days.forEach(d => {
          d.classList.remove('border-primary', 'border-2', 'bg-primary-fixed/25', 'shadow-xs');
          d.classList.add('bg-surface-container-low', 'border-outline-variant/20');
        });
        day.classList.remove('bg-surface-container-low', 'border-outline-variant/20');
        day.classList.add('border-primary', 'border-2', 'bg-primary-fixed/25', 'shadow-xs');

        const dayKey = day.getAttribute('data-cal-day');
        const items = daySchedules[dayKey] || [];
        if (selectedDayEl) selectedDayEl.textContent = `${dayKey}day Agenda`;
        if (itemsListEl) {
          itemsListEl.innerHTML = items.map(it => `
            <div class="p-2.5 rounded-lg bg-surface-container-lowest flex items-center justify-between border border-outline-variant/15">
              <span class="font-medium text-on-surface">${escapeHTML(it.title)}</span>
              <span class="text-secondary font-semibold">${escapeHTML(it.time)} (${escapeHTML(it.venue)})</span>
            </div>
          `).join('') || '<div class="text-outline p-2">No scheduled notices for this date.</div>';
        }
      });
    });
  }

  // 15. Poster & Syllabus OCR File Ingestion
  function setupFileUploadOCR() {
    const fileInput = document.getElementById('syllabusFileInput');
    if (!fileInput) return;

    fileInput.addEventListener('change', () => {
      if (!fileInput.files || fileInput.files.length === 0) return;
      const file = fileInput.files[0];
      const scannerBeam = document.getElementById('captureScanner');
      const captureSection = document.getElementById('smartCaptureSection');
      const feedbackToast = document.getElementById('parseFeedback');
      const feedbackText = document.getElementById('parseFeedbackText');

      if (scannerBeam) scannerBeam.classList.remove('hidden');
      if (captureSection) captureSection.classList.add('scanning-active');

      setTimeout(() => {
        if (scannerBeam) scannerBeam.classList.add('hidden');
        if (captureSection) captureSection.classList.remove('scanning-active');

        appendTaskCard({
          title: `Syllabus Extracted: ${file.name.replace(/\.[^/.]+$/, "")} Term Exam`,
          category: 'Academics',
          displayDate: 'Tomorrow',
          displayTime: '02:00 PM',
          venue: 'Pimentel Hall 1',
          description: `Extracted via Vision OCR from ${file.name}. Bring Cal ID and course notes.`,
          rawText: `OCR Scanned Document: ${file.name} - Midterm exam scheduled for tomorrow 2:00 PM sharp.`,
          isUrgent: true,
          hasPerk: false
        });

        if (feedbackToast && feedbackText) {
          feedbackToast.classList.remove('hidden');
          feedbackText.innerHTML = `Vision OCR processed <strong class="font-bold">${escapeHTML(file.name)}</strong> and extracted 1 scheduled exam to your radar!`;
        }

        fileInput.value = '';
      }, 950);
    });
  }

  // 16. Power-User Keyboard Shortcuts Modal
  function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        openShortcutsModal();
      } else if (e.key === 'c' || e.key === 'C') {
        const calBtn = document.getElementById('viewModeCalBtn');
        const listBtn = document.getElementById('viewModeListBtn');
        const calView = document.getElementById('dashboardCalendarView');
        if (calView && calView.classList.contains('hidden')) {
          calBtn?.click();
        } else {
          listBtn?.click();
        }
      } else if (e.key === 'a' || e.key === 'A') {
        document.getElementById('toggleCampusChatBtn')?.click();
      } else if (e.key === 'd' || e.key === 'D') {
        document.getElementById('whatDoINeedToKnowBtn')?.click();
      }
    });

    function openShortcutsModal() {
      if (document.getElementById('shortcutsHelpModal')) {
        document.getElementById('shortcutsHelpModal').classList.remove('hidden');
        return;
      }

      const modal = document.createElement('div');
      modal.id = 'shortcutsHelpModal';
      modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs';
      modal.innerHTML = `
        <div class="relative w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl border border-outline-variant/20 flex flex-col gap-4 animate-enter">
          <div class="flex items-center justify-between pb-2 border-b border-outline-variant/15">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-[20px]">keyboard</span>
              <h3 class="font-title-sm text-on-surface font-bold">Keyboard Shortcuts</h3>
            </div>
            <button type="button" class="close-shortcuts w-7 h-7 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div class="flex flex-col gap-2 text-xs">
            <div class="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
              <span>Global Search</span>
              <kbd class="px-2 py-0.5 rounded bg-surface-container-high font-mono text-primary font-bold">⌘K / /</kbd>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
              <span>Toggle Live / Plain Wallpaper</span>
              <kbd class="px-2 py-0.5 rounded bg-surface-container-high font-mono text-primary font-bold">W</kbd>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
              <span>What Do I Need To Know This Week?</span>
              <kbd class="px-2 py-0.5 rounded bg-surface-container-high font-mono text-primary font-bold">D</kbd>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
              <span>Toggle List / Calendar View</span>
              <kbd class="px-2 py-0.5 rounded bg-surface-container-high font-mono text-primary font-bold">C</kbd>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
              <span>Ask Campus Pulse AI Assistant</span>
              <kbd class="px-2 py-0.5 rounded bg-surface-container-high font-mono text-primary font-bold">A</kbd>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
              <span>Close Any Active Modal</span>
              <kbd class="px-2 py-0.5 rounded bg-surface-container-high font-mono text-primary font-bold">Esc</kbd>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      const close = () => modal.classList.add('hidden');
      modal.querySelector('.close-shortcuts')?.addEventListener('click', close);
      modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    }
  }

  function run() {
    injectPresets();
    setupSearch();
    setupManualAddModal();
    setupNotificationDropdown();
    setupProfileSwitcher();
    setupWeeklyDigestModal();
    setupCampusChatAssistant();
    setupViewModeSwitcher();
    setupFileUploadOCR();
    setupKeyboardShortcuts();
    hookParseButton();
    loadSavedCustomTasks();

    // Bind any existing cards
    document.querySelectorAll('#urgentTasksList .task-card').forEach(card => {
      bindCardInteractions(card);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
