/**
 * Campus Pulse — Interactive Poster Scanner & OCR Canvas Studio
 * Provides simulated computer vision OCR scanning with laser sweep animation and bounding box detection.
 */

class PosterScannerStudio {
  static samplePosters = [
    {
      id: 'poster-deepmind',
      title: 'Google DeepMind Tech Keynote Poster',
      text: `📢 GOOGLE DEEPMIND CAMPUS KEYNOTE 📢\nSpeaker: Dr. Aris Thorne (Research Scientist)\nTopic: Deliberate Reasoning in Modern AI Models\nDate: Tomorrow at 5:30 PM\nVenue: Kemeny Hall Auditorium 108\n🎁 Confirmed Perks: Free Artisanal Boba Drinks & Detroit Pizza Slices for attendees!\nRSVP form: https://rsvp.college.edu/deepmind-talk`,
      color: '#4A326B',
      accent: '#D4FF3F'
    },
    {
      id: 'poster-hackathon',
      title: 'HackVerse 2026 36-Hour Hackathon Poster',
      text: `⚡ HACKVERSE 2026: 36-HOUR NATIONAL HACKATHON ⚡\nDate: Friday at 10:00 AM\nLocation: Main Auditorium & Ground Floor Labs\nCash Prize Pool: ₹1,50,000 + Tech Sponsor Fast-Tracks\nPerks: Free weekend breakfast, midnight pizza & Red Bull\nRegister team of 2-4: https://unstop.com/hackathons/hackverse-2026`,
      color: '#0F172A',
      accent: '#38BDF8'
    },
    {
      id: 'poster-exam',
      title: 'CS-402 LMS Assignment & Lab Doubt Review Notice',
      text: `🚨 URGENT NOTICE TO 3RD YEAR CSE STUDENTS 🚨\nCourse: CS-402 Machine Learning\nAssignment 3 Portal: Open on LMS\nSTRICT DEADLINE: Tomorrow at 11:59 PM sharp!\nDoubt Review: Tomorrow 2:00 PM - 4:00 PM in Lab 304.\nAttendance is compulsory for all project groups.`,
      color: '#991B1B',
      accent: '#FDE047'
    }
  ];

  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.isScanning = false;
    this.scanProgress = 0;
    this.activePoster = PosterScannerStudio.samplePosters[0];
    this.animationId = null;
  }

  setPoster(posterId) {
    const poster = PosterScannerStudio.samplePosters.find(p => p.id === posterId);
    if (poster) {
      this.activePoster = poster;
      this.drawPoster();
    }
  }

  drawPoster() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background
    ctx.fillStyle = this.activePoster.color;
    ctx.fillRect(0, 0, w, h);

    // Decorative grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Border Frame
    ctx.strokeStyle = this.activePoster.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Poster Header
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("CAMPUS BULLETIN NOTICE", w / 2, 40);

    // Event Title
    ctx.fillStyle = this.activePoster.accent;
    ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(this.activePoster.title.slice(0, 32), w / 2, 70);

    // Draw Simulated Notice Body Lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    const lines = this.activePoster.text.split('\n');
    lines.slice(0, 8).forEach((line, i) => {
      ctx.fillText(line.slice(0, 38), 24, 110 + i * 20);
    });

    // If scanning, draw bounding boxes & laser
    if (this.isScanning) {
      // Sweeping Neon Laser
      const laserY = (this.scanProgress / 100) * h;
      const gradient = ctx.createLinearGradient(0, laserY - 15, 0, laserY + 15);
      gradient.addColorStop(0, 'rgba(212, 255, 63, 0)');
      gradient.addColorStop(0.5, 'rgba(212, 255, 63, 0.9)');
      gradient.addColorStop(1, 'rgba(212, 255, 63, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(10, laserY - 15, w - 20, 30);

      ctx.strokeStyle = '#D4FF3F';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, laserY);
      ctx.lineTo(w - 10, laserY);
      ctx.stroke();

      // Bounding Boxes over detected text zones
      if (this.scanProgress > 25) {
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 55, w - 40, 22);
      }
      if (this.scanProgress > 50) {
        ctx.strokeStyle = '#34D399';
        ctx.strokeRect(20, 105, w - 40, 60);
      }
      if (this.scanProgress > 75) {
        ctx.strokeStyle = '#F43F5E';
        ctx.strokeRect(20, 175, w - 40, 50);
      }
    }
  }

  startScan(onComplete) {
    this.isScanning = true;
    this.scanProgress = 0;

    const animate = () => {
      this.scanProgress += 1.8;
      this.drawPoster();

      if (this.scanProgress < 100) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.isScanning = false;
        this.drawPoster();
        if (onComplete) onComplete(this.activePoster.text);
      }
    };
    animate();
  }
}
