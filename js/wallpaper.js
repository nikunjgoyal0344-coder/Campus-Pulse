/**
 * Campus Pulse — Live Ambient Wallpaper & Plain Canvas Engine
 * GPU-accelerated harmonic mesh orbs with interactive constellation particle canvas.
 * Persists user preference (Live vs Plain) in localStorage.
 */

(function initLiveWallpaper() {
  const STORAGE_KEY = 'campus_pulse_wallpaper_mode';

  // 1. Create Background Container & Canvas if not present
  function setupWallpaperDOM() {
    if (document.getElementById('liveWallpaperContainer')) return;

    const container = document.createElement('div');
    container.id = 'liveWallpaperContainer';
    container.setAttribute('aria-hidden', 'true');
    container.className = 'fixed inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-700';

    container.innerHTML = `
      <!-- Ambient Fluid Mesh Gradient Orbs -->
      <div class="wallpaper-orb orb-indigo"></div>
      <div class="wallpaper-orb orb-amber"></div>
      <div class="wallpaper-orb orb-emerald"></div>
      <div class="wallpaper-orb orb-violet"></div>
      <!-- Interactive Starlight Particle Canvas -->
      <canvas id="wallpaperCanvas" class="absolute inset-0 w-full h-full opacity-60"></canvas>
    `;

    document.body.prepend(container);
  }

  // 2. Interactive Canvas Particles (Twinkling ambient dust & parallax)
  let animationFrameId = null;
  let particles = [];
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 };

  function initParticles() {
    const canvas = document.getElementById('wallpaperCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    }, { passive: true });

    // Generate ~35 subtle floating sparks
    const count = Math.min(38, Math.floor(window.innerWidth / 35));
    particles = [];
    const colors = ['rgba(79, 70, 229, 0.45)', 'rgba(103, 244, 183, 0.4)', 'rgba(254, 166, 25, 0.35)', 'rgba(195, 192, 255, 0.4)'];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2.2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        baseX: 0,
        baseY: 0,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random() * Math.PI
      });
    }

    let isRunning = false;

    function stopAnimation() {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      isRunning = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function startAnimation() {
      if (isRunning || document.body.classList.contains('wallpaper-plain') || document.hidden) return;
      isRunning = true;
      animate();
    }

    function animate() {
      if (!isRunning || document.body.classList.contains('wallpaper-plain') || document.hidden) {
        stopAnimation();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      const parallaxX = (mouse.x - canvas.width / 2) * 0.025;
      const parallaxY = (mouse.y - canvas.height / 2) * 0.025;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        const currentRadius = p.radius * (0.8 + 0.25 * Math.sin(p.pulseVal));
        const renderX = p.x + parallaxX;
        const renderY = p.y + parallaxY;

        ctx.beginPath();
        ctx.arc(renderX, renderY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect nearby particles with subtle filament lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(p2.x + parallaxX, p2.y + parallaxY);
            ctx.strokeStyle = `rgba(79, 70, 229, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    }

    // Power-saving tab visibility listener
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    });

    window.CampusWallpaperCanvas = {
      start: startAnimation,
      stop: stopAnimation
    };

    startAnimation();
  }

  // 3. Wallpaper Mode Management (Live vs Plain)
  function getSavedMode() {
    try {
      const mode = localStorage.getItem(STORAGE_KEY);
      return mode === 'plain' ? 'plain' : 'live';
    } catch (e) {
      return 'live';
    }
  }

  function applyWallpaperMode(mode) {
    if (mode === 'plain') {
      document.body.classList.remove('wallpaper-live');
      document.body.classList.add('wallpaper-plain');
      if (window.CampusWallpaperCanvas) window.CampusWallpaperCanvas.stop();
    } else {
      document.body.classList.remove('wallpaper-plain');
      document.body.classList.add('wallpaper-live');
      if (window.CampusWallpaperCanvas) window.CampusWallpaperCanvas.start();
    }

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}

    updateToggleButtons(mode);
  }

  function toggleWallpaperMode() {
    const current = document.body.classList.contains('wallpaper-plain') ? 'plain' : 'live';
    const next = current === 'live' ? 'plain' : 'live';
    applyWallpaperMode(next);

    // Toast feedback if available
    if (window.App && typeof window.App.showToast === 'function') {
      window.App.showToast(next === 'live' ? '🌌 Live Ambient Wallpaper Activated' : '📄 Switched to Plain Canvas', 'info');
    }
  }

  function updateToggleButtons(mode) {
    document.querySelectorAll('.wallpaper-toggle-btn').forEach(btn => {
      const icon = btn.querySelector('.wallpaper-toggle-icon');
      const label = btn.querySelector('.wallpaper-toggle-label');
      
      if (mode === 'live') {
        if (icon) icon.textContent = 'motion_photos_on';
        btn.setAttribute('title', 'Switch to Plain Background (W)');
        btn.setAttribute('aria-label', 'Switch to Plain Background');
        if (label) label.textContent = 'Live Wallpaper';
        btn.classList.add('text-primary');
      } else {
        if (icon) icon.textContent = 'motion_photos_off';
        btn.setAttribute('title', 'Switch to Live Wallpaper (W)');
        btn.setAttribute('aria-label', 'Switch to Live Wallpaper');
        if (label) label.textContent = 'Plain Canvas';
        btn.classList.remove('text-primary');
      }
    });
  }

  // 4. Inject Switch Button in Header next to theme toggle
  function injectToggleButton() {
    const headers = document.querySelectorAll('header');
    headers.forEach(header => {
      if (header.querySelector('.wallpaper-toggle-btn')) return;

      const themeBtn = header.querySelector('#themeToggleBtn, #darkModeToggle, button[aria-label*="color"], button[aria-label*="theme"]');
      if (themeBtn && themeBtn.parentNode) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'wallpaper-toggle-btn relative w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface active:scale-90 flex items-center justify-center transition-all cursor-pointer group shadow-2xs';
        toggleBtn.setAttribute('title', 'Toggle Live Wallpaper (W)');
        toggleBtn.innerHTML = `
          <span class="material-symbols-outlined text-[20px] wallpaper-toggle-icon transition-transform duration-300 group-hover:rotate-45">motion_photos_on</span>
          <span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
        `;
        toggleBtn.addEventListener('click', toggleWallpaperMode);
        themeBtn.parentNode.insertBefore(toggleBtn, themeBtn);
      }
    });
  }

  // 5. Keyboard shortcut: 'W' toggles wallpaper
  window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      toggleWallpaperMode();
    }
  });

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupWallpaperDOM();
      injectToggleButton();
      initParticles();
      applyWallpaperMode(getSavedMode());
    });
  } else {
    setupWallpaperDOM();
    injectToggleButton();
    initParticles();
    applyWallpaperMode(getSavedMode());
  }

  // Expose global controller
  window.CampusWallpaper = {
    toggle: toggleWallpaperMode,
    setMode: applyWallpaperMode,
    getMode: getSavedMode
  };
})();
