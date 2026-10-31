/**
 * Campus Pulse — Local Storage & Persistence Service
 * Enables 100% offline functionality with zero external database dependencies.
 */

const STORAGE_KEYS = {
  NOTICES: 'campuspulse_notices_v1',
  PROFILE: 'campuspulse_profile_v1',
  HISTORY: 'campuspulse_raw_history_v1',
  THEME: 'campuspulse_theme_v1'
};

const DEFAULT_PROFILE = {
  name: 'Alex Rivera',
  year: '3rd Year',
  dept: 'Computer Science & Engineering',
  interests: ['Tech', 'Hackathons', 'Placements', 'Free Food'],
  customTags: ['Must Attend', 'Scholarship', 'Group Project']
};

class StorageService {
  static getNotices() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
      if (data) {
        return JSON.parse(data);
      }
      // Initialize with seed data if fresh
      this.saveAllNotices(INITIAL_NOTICES);
      return [...INITIAL_NOTICES];
    } catch (err) {
      console.warn('Storage read error, using fallback:', err);
      return [...INITIAL_NOTICES];
    }
  }

  static saveAllNotices(notices) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    } catch (err) {
      console.error('Storage write error:', err);
    }
  }

  static addNotice(notice) {
    const notices = this.getNotices();
    // Prepend new notice so it appears at top of feed
    notices.unshift(notice);
    this.saveAllNotices(notices);
    this.recordHistory(notice.rawText || notice.description, notice.title);
    return notices;
  }

  static updateNotice(updatedNotice) {
    const notices = this.getNotices().map(item => 
      item.id === updatedNotice.id ? { ...item, ...updatedNotice } : item
    );
    this.saveAllNotices(notices);
    return notices;
  }

  static deleteNotice(id) {
    const notices = this.getNotices().filter(item => item.id !== id);
    this.saveAllNotices(notices);
    return notices;
  }

  static toggleCompleted(id) {
    const notices = this.getNotices().map(item => {
      if (item.id === id) {
        return { ...item, isCompleted: !item.isCompleted };
      }
      return item;
    });
    this.saveAllNotices(notices);
    return notices;
  }

  static toggleBookmark(id) {
    const notices = this.getNotices().map(item => {
      if (item.id === id) {
        return { ...item, isBookmarked: !item.isBookmarked };
      }
      return item;
    });
    this.saveAllNotices(notices);
    return notices;
  }

  static getProfile() {
    try {
      const profile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return profile ? JSON.parse(profile) : { ...DEFAULT_PROFILE };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  }

  static saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.error('Profile write error:', err);
    }
  }

  static getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  }

  static setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  static recordHistory(rawText, title) {
    if (!rawText) return;
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
      history.unshift({
        id: 'hist_' + Date.now(),
        title: title || 'Campus Notice',
        rawText,
        timestamp: new Date().toISOString()
      });
      // Keep last 25 items
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 25)));
    } catch (err) {
      console.warn('History record error:', err);
    }
  }

  static getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    } catch {
      return [];
    }
  }

  static resetToDemo() {
    localStorage.removeItem(STORAGE_KEYS.NOTICES);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    this.saveAllNotices(INITIAL_NOTICES);
    return [...INITIAL_NOTICES];
  }

  static exportJSON() {
    const data = {
      notices: this.getNotices(),
      profile: this.getProfile(),
      exportedAt: new Date().toISOString(),
      appName: 'Campus Pulse'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus-pulse-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.notices && Array.isArray(parsed.notices)) {
        this.saveAllNotices(parsed.notices);
        if (parsed.profile) this.saveProfile(parsed.profile);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Import parse error:', err);
      return false;
    }
  }
}
