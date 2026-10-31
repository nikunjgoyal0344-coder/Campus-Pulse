/**
 * Campus Pulse — Responsive Drawer & Mobile Navigation Engine
 * Provides fluid slide-out sidebar drawer, backdrop dismissal, and mobile navigation bar.
 */

(function initResponsiveLayout() {
  function setupResponsive() {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return;

    sidebar.id = 'appSidebar';
    sidebar.classList.add('transition-transform', 'duration-300', 'ease-in-out');

    // Default: Hidden on screens < 1024px, visible on lg screens
    if (!sidebar.classList.contains('-translate-x-full')) {
      sidebar.classList.add('-translate-x-full', 'lg:translate-x-0');
    }

    // Fix wrapper padding and header positioning
    const wrapper = sidebar.nextElementSibling;
    if (wrapper) {
      wrapper.classList.remove('pl-64');
      wrapper.classList.add('pl-0', 'lg:pl-64', 'w-full', 'min-h-screen');
    }

    const header = document.querySelector('header');
    if (header) {
      header.classList.remove('left-64');
      header.classList.add('left-0', 'lg:left-64', 'px-4', 'sm:px-8');

      // Inject Mobile Hamburger Button if not present
      if (!document.getElementById('mobileMenuBtn')) {
        const hamburger = document.createElement('button');
        hamburger.id = 'mobileMenuBtn';
        hamburger.type = 'button';
        hamburger.setAttribute('aria-label', 'Open navigation menu');
        hamburger.className = 'lg:hidden w-9 h-9 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center mr-2 shrink-0 active:scale-95 transition-all shadow-2xs cursor-pointer';
        hamburger.innerHTML = '<span class="material-symbols-outlined text-[20px]">menu</span>';
        header.firstElementChild?.prepend(hamburger);

        hamburger.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSidebar(true);
        });
      }
    }

    // Backdrop for Mobile Drawer
    let backdrop = document.getElementById('sidebarBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebarBackdrop';
      backdrop.className = 'fixed inset-0 bg-black/50 backdrop-blur-xs z-45 hidden lg:hidden transition-opacity duration-300 opacity-0';
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', () => toggleSidebar(false));
    }

    function toggleSidebar(open) {
      const isCurrentlyOpen = !sidebar.classList.contains('-translate-x-full');
      const shouldOpen = open !== undefined ? open : !isCurrentlyOpen;

      if (shouldOpen) {
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
        requestAnimationFrame(() => {
          backdrop.classList.remove('opacity-0');
          backdrop.classList.add('opacity-100');
        });
      } else {
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        setTimeout(() => backdrop.classList.add('hidden'), 280);
      }
    }

    // Close mobile drawer when clicking any link inside
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          toggleSidebar(false);
        }
      });
    });

    // Close with Esc key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') toggleSidebar(false);
    });

    // Replace external logo with local branded SVG logo
    document.querySelectorAll('img[alt*="Campus Pulse Logo"], img[alt*="Logo"]').forEach(img => {
      img.src = 'logo.svg';
      img.className = 'h-8 w-8 object-contain rounded-lg shadow-sm';
    });

    // Inject Mobile Bottom Nav if not present
    if (!document.getElementById('mobileBottomNav')) {
      const bottomNav = document.createElement('nav');
      bottomNav.id = 'mobileBottomNav';
      bottomNav.className = 'lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/20 z-40 flex items-center justify-around px-2 shadow-lg';

      const currentPath = window.location.pathname.split('/').pop() || 'index.html';

      const items = [
        { href: 'index.html', label: 'Radar', icon: 'dashboard', active: currentPath === 'index.html' || currentPath === '' },
        { href: 'calendar.html', label: 'Calendar', icon: 'calendar_today', active: currentPath === 'calendar.html' },
        { href: 'ai-digest.html', label: 'Digest', icon: 'auto_awesome', active: currentPath === 'ai-digest.html' },
        { href: 'insights.html', label: 'Insights', icon: 'insights', active: currentPath === 'insights.html' }
      ];

      bottomNav.innerHTML = items.map(item => `
        <a href="${item.href}" class="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${item.active ? 'text-primary font-bold scale-105' : 'text-on-surface-variant hover:text-on-surface'}">
          <span class="material-symbols-outlined text-[20px]">${item.icon}</span>
          <span class="text-[10px] font-label-sm">${item.label}</span>
        </a>
      `).join('');

      document.body.appendChild(bottomNav);

      // Add extra bottom padding on mobile so bottom content is never obscured by bottom nav
      const main = document.querySelector('main');
      if (main) {
        main.classList.add('pb-24', 'lg:pb-12');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupResponsive);
  } else {
    setupResponsive();
  }
})();
