/**
 * Campus Pulse — AI Weekly Digest & WhatsApp Group Formatter
 * Generates an executive campus briefing, WhatsApp batch summary, and voice speech synthesis.
 */

class DigestGenerator {
  /**
   * Generates a structured executive digest for the week
   * @param {Array} notices
   * @param {string} filter 'all' | 'academic' | 'food' | 'career'
   */
  static generate(notices, filter = 'all') {
    const activeNotices = notices.filter(n => !n.isCompleted);
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    // Filter notices happening within the next 7 days
    const thisWeekNotices = activeNotices.filter(n => {
      if (!n.dateTime) return false;
      const d = new Date(n.dateTime);
      return d >= now && d <= nextWeek;
    });

    // Sub-filter if requested
    let filtered = thisWeekNotices;
    if (filter === 'academic') {
      filtered = thisWeekNotices.filter(n => n.category === 'academic' || n.category === 'deadline');
    } else if (filter === 'food') {
      filtered = thisWeekNotices.filter(n => n.hasPerk || n.category === 'food');
    } else if (filter === 'career') {
      filtered = thisWeekNotices.filter(n => n.category === 'placement' || n.category === 'hackathon');
    }

    // Grouping
    const urgentItems = filtered.filter(n => n.isUrgent);
    const perkItems = filtered.filter(n => n.hasPerk);
    const eventItems = filtered.filter(n => !n.isUrgent && !n.hasPerk);

    const totalCount = filtered.length;
    const urgentCount = urgentItems.length;

    // High level summary statement
    let headline = `You have ${totalCount} key items scheduled this week`;
    if (urgentCount > 0) {
      headline += `, including ${urgentCount} urgent deadline${urgentCount > 1 ? 's' : ''} requiring immediate action.`;
    } else {
      headline += ` with a relaxed schedule and no critical deadlines.`;
    }

    return {
      headline,
      totalCount,
      urgentCount,
      urgentItems,
      perkItems,
      eventItems,
      allWeekItems: filtered,
      generatedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
  }

  /**
   * Formats a clean, readable text digest for WhatsApp class groups
   */
  static formatForWhatsApp(notices) {
    const digest = this.generate(notices, 'all');
    let text = `*🎓 CAMPUS PULSE — WEEKLY STUDENT RADAR*\n`;
    text += `_Auto-cleaned & verified summary for the week_\n\n`;
    text += `📢 *Overview:* ${digest.headline}\n\n`;

    if (digest.urgentItems.length > 0) {
      text += `🚨 *CRITICAL DEADLINES & CUTOFFS:*\n`;
      digest.urgentItems.forEach((item, idx) => {
        text += `${idx + 1}. *${item.title}*\n`;
        text += `   ⏳ ${item.displayDate || 'Soon'} • ${item.displayTime || ''}\n`;
        text += `   📍 ${item.venue}\n`;
        if (item.link) text += `   🔗 Link: ${item.link}\n`;
        text += `\n`;
      });
    }

    if (digest.perkItems.length > 0) {
      text += `🍕 *FREE FOOD & CAMPUS PERKS:*\n`;
      digest.perkItems.forEach((item, idx) => {
        text += `${idx + 1}. *${item.title}*\n`;
        text += `   🎁 Perk: ${item.perk}\n`;
        text += `   📅 ${item.displayDate} at ${item.displayTime} • 📍 ${item.venue}\n\n`;
      });
    }

    if (digest.eventItems.length > 0) {
      text += `📅 *KEY TALKS & EVENTS:*\n`;
      digest.eventItems.forEach((item, idx) => {
        text += `• *${item.title}* (${item.displayDate})\n`;
        text += `  ${item.venue} — ${item.description.slice(0, 80)}...\n\n`;
      });
    }

    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `⚡ Powered by *Campus Pulse* (Zero spam, pure signal).`;
    return text;
  }

  /**
   * Voice Speech Synthesis Briefing
   */
  static speak(text, onEnd) {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }

  static stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
