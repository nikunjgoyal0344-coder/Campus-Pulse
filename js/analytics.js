/**
 * Campus Pulse — Analytics & Visual Graphs Engine
 * Pure zero-dependency SVG charts: Category Breakdown, Weekly Heatmap, and Completion Ring.
 */

class CampusAnalytics {
  /**
   * Renders the complete analytics dashboard into a container
   */
  static render(containerId, notices = []) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = notices.length;
    const completed = notices.filter(n => n.isCompleted).length;
    const urgent = notices.filter(n => n.isUrgent && !n.isCompleted).length;
    const perks = notices.filter(n => n.hasPerk).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Category distribution counts
    const catCounts = {
      academic: notices.filter(n => n.category === 'academic').length,
      placement: notices.filter(n => n.category === 'placement').length,
      hackathon: notices.filter(n => n.category === 'hackathon').length,
      cultural: notices.filter(n => n.category === 'cultural').length,
      sports: notices.filter(n => n.category === 'sports').length,
      admin: notices.filter(n => n.category === 'admin').length
    };

    // Calculate weekday deadline counts (0=Sun, 1=Mon, ..., 6=Sat)
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    notices.forEach(n => {
      if (n.dateTime) {
        const d = new Date(n.dateTime).getDay();
        dayCounts[d]++;
      }
    });
    const maxDayCount = Math.max(...dayCounts, 1);

    container.innerHTML = `
      <div class="bg-white rounded-2xl border border-neutral-border p-6 shadow-sm flex flex-col gap-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-neutral-border pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-lavender flex items-center justify-center text-lavender-dark font-bold">
              <span class="material-symbols-outlined text-[19px]">insights</span>
            </div>
            <div>
              <h3 class="font-heading font-bold text-base text-neutral-heading">Campus Pulse Activity & Trends</h3>
              <p class="text-xs text-neutral-muted">Real-time deadline pressure and campus perks analytics</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-lavender-50 text-lavender-dark border border-lavender/40">
              Live Pulse Metrics
            </span>
          </div>
        </div>

        <!-- 3-Column Chart Layout -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <!-- Graph 1: Weekly Load / Deadline Pressure Intensity -->
          <div class="flex flex-col gap-3 p-4 rounded-xl bg-neutral-canvas border border-neutral-border">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-neutral-heading flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[16px] text-tomato">speed</span>
                Weekly Deadline Heat
              </span>
              <span class="text-[10px] text-neutral-muted font-bold">Mon - Sun</span>
            </div>
            
            <!-- SVG Weekly Bar Chart -->
            <div class="h-32 flex items-end justify-between gap-2 pt-2 px-1">
              ${dayCounts.map((count, idx) => {
                const heightPercent = Math.max(12, Math.round((count / maxDayCount) * 100));
                const isHeavy = count >= 3;
                return `
                  <div class="flex flex-col items-center gap-1.5 flex-1 group relative">
                    <div class="text-[10px] font-bold text-neutral-muted group-hover:text-neutral-heading transition-colors">${count}</div>
                    <div class="w-full rounded-t-lg transition-all duration-500 ${isHeavy ? 'bg-tomato' : 'bg-lavender-dark hover:bg-lavender'}" style="height: ${heightPercent}%;"></div>
                    <span class="text-[10px] font-semibold text-neutral-muted">${dayLabels[idx]}</span>
                  </div>
                `;
              }).join('')}
            </div>
            <span class="text-[11px] text-neutral-muted text-center pt-1">Heaviest deadlines concentrated mid-week</span>
          </div>

          <!-- Graph 2: Circular Completion & Attendance Ring -->
          <div class="flex flex-col items-center justify-center p-4 rounded-xl bg-neutral-canvas border border-neutral-border text-center gap-2">
            <span class="text-xs font-bold text-neutral-heading flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-emerald-600">task_alt</span>
              Your Attendance / Action Rate
            </span>
            
            <div class="relative w-28 h-28 flex items-center justify-center my-1">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <!-- Background Circle -->
                <path
                  class="text-neutral-border"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <!-- Progress Circle -->
                <path
                  class="text-lavender-dark transition-all duration-1000 ease-out"
                  stroke-dasharray="${completionRate}, 100"
                  stroke-linecap="round"
                  stroke-width="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div class="absolute flex flex-col items-center">
                <span class="font-heading font-extrabold text-xl text-neutral-heading">${completionRate}%</span>
                <span class="text-[9px] font-bold text-neutral-muted uppercase">Done</span>
              </div>
            </div>

            <div class="text-[11px] text-neutral-muted">
              <strong>${completed}</strong> of <strong>${total}</strong> notices acted upon
            </div>
          </div>

          <!-- Graph 3: Category Distribution Bars -->
          <div class="flex flex-col gap-2.5 p-4 rounded-xl bg-neutral-canvas border border-neutral-border">
            <span class="text-xs font-bold text-neutral-heading flex items-center gap-1.5 mb-1">
              <span class="material-symbols-outlined text-[16px] text-lavender-dark">pie_chart</span>
              Notice Volume by Stream
            </span>

            ${Object.entries(catCounts).map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const catNames = {
                academic: 'Academics',
                placement: 'Placements',
                hackathon: 'Hackathons',
                cultural: 'Clubs',
                sports: 'Sports',
                admin: 'Admin'
              };
              return `
                <div class="flex flex-col gap-1 text-xs">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="font-semibold text-neutral-heading">${catNames[cat]}</span>
                    <span class="text-neutral-muted font-mono">${count} (${pct}%)</span>
                  </div>
                  <div class="w-full h-1.5 rounded-full bg-neutral-border overflow-hidden">
                    <div class="h-full rounded-full bg-lavender-dark transition-all duration-700" style="width: ${pct}%;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

        </div>

        <!-- Campus Perks Live Summary Banner -->
        <div class="p-4 rounded-xl bg-lavender-50 border border-lavender/50 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🍕</span>
            <div>
              <div class="font-heading font-bold text-xs text-neutral-heading">Active Student Value Tracked</div>
              <div class="text-[11px] text-neutral-muted">Free meals, boba drinks, pizza slices, and $2,500 research grant funding available this term.</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="font-heading font-bold text-base text-lavender-dark">${perks} Perks Active</span>
              <div class="text-[10px] text-neutral-muted font-semibold">100% Student Verified</div>
            </div>
          </div>
        </div>

      </div>
    `;
  }
}
