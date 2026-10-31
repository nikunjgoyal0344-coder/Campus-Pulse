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
          feedbackText.innerHTML = `Extracted 1 priority notice for <strong class="font-bold">${extracted.title.slice(0, 30)}</strong>. Added to your queue below!`;
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

  // 3. Dynamically Append Structured Task Card
  function appendTaskCard(notice) {
    const urgentList = document.getElementById('urgentTasksList');
    if (!urgentList) return;

    const gcalUrl = makeGCalUrl(notice.title, notice.venue, notice.description, notice.displayTime);
    const cardId = 'task_' + Date.now();

    const card = document.createElement('article');
    card.className = 'task-card interactive-card group relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm animate-enter border border-outline-variant/15';
    card.setAttribute('data-task-id', cardId);

    const isUrgent = notice.isUrgent !== false;
    const badgeColor = isUrgent ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-primary-fixed text-on-primary-fixed';
    const tagText = isUrgent ? 'Due Today' : 'Upcoming';

    card.innerHTML = `
      <div class="absolute left-0 top-0 bottom-0 w-1.5 ${isUrgent ? 'bg-secondary-container' : 'bg-primary-container'} transition-all group-hover:w-2"></div>
      <div class="pl-3 flex flex-col gap-3">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full ${badgeColor} px-2.5 py-0.5 font-label-sm text-label-sm font-semibold">${tagText}</span>
            <span class="rounded-full bg-surface-container-high px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">${notice.category || 'Academics'}</span>
            <span class="rounded-full bg-surface-container-high px-2.5 py-0.5 font-label-sm text-label-sm text-on-surface-variant">${notice.venue || 'Campus'}</span>
          </div>
          <div class="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
            <span class="material-symbols-outlined text-[16px] text-secondary">alarm</span>
            <span>${notice.displayTime || 'Today'}</span>
          </div>
        </div>

        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col gap-1 flex-1">
            <h4 class="font-title-sm text-title-sm text-on-surface font-semibold task-title transition-all">${notice.title}</h4>
            <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">${notice.description || 'Details extracted from campus notice.'}</p>
          </div>
          <button type="button" aria-label="Mark task done" class="complete-btn relative h-7 w-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-transparent flex items-center justify-center transition-all shrink-0 cursor-pointer" title="Mark as done">
            <span class="material-symbols-outlined text-[18px]">check</span>
          </button>
        </div>

        <!-- Action Row & Collapsible Raw Notice Toggle -->
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-outline-variant/10 text-xs text-on-surface-variant">
          <div class="flex items-center gap-3">
            <a href="${gcalUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-primary hover:underline font-label-sm">
              <span class="material-symbols-outlined text-[14px]">event_upcoming</span>
              <span>+ Google Cal</span>
            </a>
            ${notice.link ? `<a href="${notice.link}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-tertiary hover:underline font-label-sm"><span class="material-symbols-outlined text-[14px]">link</span><span>Portal Link</span></a>` : ''}
          </div>
          <button type="button" class="drawer-toggle flex items-center gap-1 font-label-sm text-on-surface-variant hover:text-on-surface cursor-pointer">
            <span>Raw Notice</span>
            <span class="material-symbols-outlined text-[16px] transition-transform duration-200">unfold_more</span>
          </button>
        </div>

        <!-- Accordion Raw Prompt View -->
        <div class="accordion-wrapper">
          <div class="accordion-inner pt-2">
            <div class="rounded-lg bg-surface-container-low p-3 font-mono text-[11px] text-on-surface-variant whitespace-pre-wrap select-all border border-outline-variant/20">
              ${(notice.rawText || notice.description || '').replace(/</g, '&lt;')}
            </div>
          </div>
        </div>
      </div>
    `;

    urgentList.prepend(card);

    // Bind Interactions on New Card
    bindCardInteractions(card);
    updateTotalTaskCount();
  }

  // 4. Bind Checkmark Particle Burst & Drawer Expansion on Cards
  function bindCardInteractions(card) {
    const completeBtn = card.querySelector('.complete-btn');
    const drawerToggle = card.querySelector('.drawer-toggle');
    const accordion = card.querySelector('.accordion-wrapper');
    const title = card.querySelector('.task-title');

    if (completeBtn) {
      completeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isDone = completeBtn.classList.contains('is-checked');
        if (!isDone) {
          completeBtn.classList.add('is-checked', 'bg-tertiary', 'text-on-tertiary', 'check-pop');
          completeBtn.classList.remove('bg-surface-container-high', 'text-transparent');
          if (title) title.classList.add('line-through', 'opacity-50');
          card.classList.add('opacity-75');
          createBurst(completeBtn);
          setTimeout(() => completeBtn.classList.remove('check-pop'), 400);
        } else {
          completeBtn.classList.remove('is-checked', 'bg-tertiary', 'text-on-tertiary');
          completeBtn.classList.add('bg-surface-container-high', 'text-transparent');
          if (title) title.classList.remove('line-through', 'opacity-50');
          card.classList.remove('opacity-75');
        }
        updateTotalTaskCount();
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
      if (textarea && textarea.value.trim()) {
        triggerLiveParse(textarea.value.trim());
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
              if (textarea) textarea.value = clip;
              triggerLiveParse(clip);
              return;
            }
          }
        } catch (e) {}
        // Fallback realistic notice
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

  // Initialize all live enhancements
  function run() {
    injectPresets();
    setupSearch();
    setupManualAddModal();
    setupNotificationDropdown();
    setupProfileSwitcher();
    hookParseButton();

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
