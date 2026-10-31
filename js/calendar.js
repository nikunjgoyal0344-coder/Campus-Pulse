/**
 * Campus Pulse — Interactive Campus Calendar View
 * Renders monthly & weekly schedule grid with interactive day-view modals.
 */

class CampusCalendar {
  constructor(containerId, onEventClick) {
    this.container = document.getElementById(containerId);
    this.currentDate = new Date();
    this.onEventClick = onEventClick;
  }

  render(notices = []) {
    if (!this.container) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const monthName = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Map notices by YYYY-MM-DD
    const noticesByDate = {};
    notices.forEach(n => {
      if (!n.dateTime) return;
      const dKey = n.dateTime.slice(0, 10);
      if (!noticesByDate[dKey]) noticesByDate[dKey] = [];
      noticesByDate[dKey].push(n);
    });

    const todayKey = new Date().toISOString().slice(0, 10);

    let html = `
      <div class="bg-white rounded-2xl border border-neutral-border p-6 shadow-sm flex flex-col gap-4">
        <!-- Calendar Header -->
        <div class="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-neutral-border">
          <div class="flex items-center gap-3">
            <h2 class="font-heading font-bold text-lg text-neutral-heading">${monthName}</h2>
            <button id="cal-today-btn" class="text-xs px-2.5 py-1 rounded-lg bg-neutral-canvas hover:bg-neutral-border text-neutral-heading font-semibold border border-neutral-border">
              Today
            </button>
          </div>
          <div class="flex items-center gap-1.5">
            <button id="cal-prev-btn" class="p-1.5 rounded-xl hover:bg-neutral-canvas text-neutral-heading border border-neutral-border" title="Previous Month">
              <span class="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button id="cal-next-btn" class="p-1.5 rounded-xl hover:bg-neutral-canvas text-neutral-heading border border-neutral-border" title="Next Month">
              <span class="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 text-center font-heading font-bold text-xs text-neutral-muted py-1">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-2">
    `;

    // Blank cells before first day
    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="min-h-[85px] rounded-xl bg-neutral-canvas/40 border border-transparent p-1"></div>`;
    }

    // Days in current month
    for (let day = 1; day <= totalDays; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const cellKey = `${year}-${monthStr}-${dayStr}`;
      const dayNotices = noticesByDate[cellKey] || [];
      const isToday = cellKey === todayKey;

      html += `
        <div class="cal-day-cell min-h-[90px] rounded-xl border ${isToday ? 'border-lavender-dark bg-lavender-50/40 ring-2 ring-lavender/40' : 'border-neutral-border/80 bg-white hover:border-lavender'} p-2 flex flex-col justify-between transition-all cursor-pointer group" data-date="${cellKey}">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold ${isToday ? 'w-5 h-5 rounded-full bg-lavender-dark text-white flex items-center justify-center' : 'text-neutral-heading'}">${day}</span>
            ${dayNotices.length > 0 ? `<span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-neutral-heading text-white">${dayNotices.length}</span>` : ''}
          </div>
          <div class="flex flex-col gap-1 mt-1">
            ${dayNotices.slice(0, 2).map(n => `
              <div class="text-[10px] font-medium truncate px-1.5 py-0.5 rounded ${n.isUrgent ? 'bg-tomato-50 text-tomato border border-tomato-200' : 'bg-neutral-canvas text-neutral-heading border border-neutral-border'}" title="${n.title}">
                ${n.isUrgent ? '⚡ ' : ''}${n.title}
              </div>
            `).join('')}
            ${dayNotices.length > 2 ? `<span class="text-[9px] text-neutral-muted font-bold">+${dayNotices.length - 2} more</span>` : ''}
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents(notices);
  }

  attachEvents(notices) {
    const prevBtn = document.getElementById('cal-prev-btn');
    const nextBtn = document.getElementById('cal-next-btn');
    const todayBtn = document.getElementById('cal-today-btn');

    if (prevBtn) {
      prevBtn.onclick = () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render(notices);
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render(notices);
      };
    }

    if (todayBtn) {
      todayBtn.onclick = () => {
        this.currentDate = new Date();
        this.render(notices);
      };
    }

    // Attach day cell click to open Day Schedule Modal
    const cells = this.container.querySelectorAll('.cal-day-cell');
    cells.forEach(cell => {
      cell.onclick = () => {
        const dateKey = cell.getAttribute('data-date');
        const dayNotices = notices.filter(n => n.dateTime && n.dateTime.startsWith(dateKey));
        if (this.onEventClick) {
          this.onEventClick(dateKey, dayNotices);
        }
      };
    });
  }
}
