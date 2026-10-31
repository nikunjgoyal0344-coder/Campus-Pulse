/**
 * Campus Pulse — Intelligent NLP Notice Extractor
 * Extracts Title, Date, Time, Venue, Category, Perks, and URLs from chaotic campus forwards.
 * Handles Indian college slang ("tmrw", "kal", "audi 2", "attendance compulsory", "LMS").
 */

class NoticeExtractor {
  /**
   * Main extraction entry point
   * @param {string} rawText 
   * @param {Array} existingNotices 
   * @returns {Object} Extracted notice metadata with confidence scores
   */
  static extract(rawText, existingNotices = []) {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Please paste a campus notice or announcement first.');
    }

    const text = this.cleanBoilerplate(rawText);
    
    // 1. Extract Fields
    const title = this.extractTitle(text, rawText);
    const { dateTime, dateStr, timeStr, dateConfidence } = this.extractDateTime(text);
    const { venue, venueConfidence } = this.extractVenue(text);
    const { category, categoryConfidence } = this.classifyCategory(text);
    const { perk, hasPerk } = this.detectPerks(text);
    const link = this.extractLink(text);
    const description = this.generateSummary(text, title);
    const isUrgent = this.detectUrgency(text, dateTime);

    // 2. Duplicate Detection
    const duplicateMatch = this.detectDuplicate(title, dateStr, existingNotices);

    // 3. Time Conflict Detection
    const conflictMatch = this.detectConflict(dateTime, venue, existingNotices);

    return {
      id: 'notice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title,
      description,
      category,
      dateTime,
      displayDate: dateStr,
      displayTime: timeStr,
      venue,
      perk,
      hasPerk,
      link,
      rawText,
      source: this.detectSource(rawText),
      isUrgent,
      isCompleted: false,
      isBookmarked: false,
      tags: this.generateTags(category, hasPerk, isUrgent),
      confidence: {
        title: title.length > 5 ? 'high' : 'medium',
        date: dateConfidence,
        venue: venueConfidence,
        category: categoryConfidence
      },
      duplicateWarning: duplicateMatch,
      conflictWarning: conflictMatch
    };
  }

  /**
   * Strips noisy WhatsApp headers, emojis, and boilerplate
   */
  static cleanBoilerplate(text) {
    let cleaned = text
      .replace(/\*?Forwarded as received\*?/gi, '')
      .replace(/\*?Forwarded message\*?/gi, '')
      .replace(/\[\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?\][^:]*:/gi, '') // WhatsApp timestamps like [10:30 AM]
      .replace(/^\s*[-•–—]\s*/gm, '') // Bullet marks
      .trim();
    return cleaned;
  }

  /**
   * Extracts clean, concise title
   */
  static extractTitle(cleanedText, rawText) {
    // Check for explicit subject lines: "Subject: ...", "Notice: ...", "Event: ..."
    const subjectMatch = cleanedText.match(/(?:Subject|Notice|Event|Topic|Title)\s*[:\-]\s*([^\n\r.]+)/i);
    if (subjectMatch && subjectMatch[1].trim().length > 5) {
      return this.cleanTitleString(subjectMatch[1].trim());
    }

    // Check for prominent headers surrounded by emojis or asterisks: 🚨 ATTENTION ... 🚨
    const headerMatch = cleanedText.match(/(?:🚨|📢|⚡|🔥|\*)\s*([A-Z0-9\s&,:\-]{6,60})\s*(?:🚨|📢|⚡|🔥|\*)/);
    if (headerMatch && headerMatch[1].trim().length > 6) {
      return this.cleanTitleString(headerMatch[1].trim());
    }

    // Grab first non-empty meaningful sentence
    const lines = cleanedText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    for (const line of lines) {
      const stripped = line.replace(/[*_~`]/g, '').trim();
      // Skip lines that are just greetings or dates
      if (!/^(dear\s+all|hello|hi\s+guys|attention|greetings|notice\b)/i.test(stripped) && stripped.length > 8) {
        return this.cleanTitleString(stripped.slice(0, 75));
      }
    }

    return lines[0] ? this.cleanTitleString(lines[0].slice(0, 60)) : 'Campus Announcement';
  }

  static cleanTitleString(str) {
    return str
      .replace(/[*_~`#]/g, '')
      .replace(/^(attention|important|urgent|notice|reminder)\s*[:\-!]\s*/i, '')
      .trim();
  }

  /**
   * Intelligently parses dates & times including relative days and Indian slang
   */
  static extractDateTime(text) {
    const lower = text.toLowerCase();
    const now = new Date();
    let targetDate = new Date();
    let confidence = 'medium';
    let hasExplicitDate = false;

    // Detect Relative Date: "today", "aaj"
    if (/\b(today|tonight|aaj)\b/i.test(lower)) {
      targetDate = new Date();
      hasExplicitDate = true;
      confidence = 'high';
    } 
    // Detect Relative Date: "tomorrow", "tmrw", "tom", "kal"
    else if (/\b(tomorrow|tmrw|tomm|kal)\b/i.test(lower)) {
      targetDate.setDate(now.getDate() + 1);
      hasExplicitDate = true;
      confidence = 'high';
    } 
    // Detect "day after tomorrow", "parson"
    else if (/\b(day after tomorrow|parson)\b/i.test(lower)) {
      targetDate.setDate(now.getDate() + 2);
      hasExplicitDate = true;
      confidence = 'high';
    }
    // Detect Day of Week: "this Friday", "on Monday"
    else {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < days.length; i++) {
        const regex = new RegExp(`\\b(?:this|next|coming|on)?\\s*(${days[i]})\\b`, 'i');
        if (regex.test(lower)) {
          const currentDay = now.getDay();
          let diff = i - currentDay;
          if (diff <= 0) diff += 7; // next occurrence
          targetDate.setDate(now.getDate() + diff);
          hasExplicitDate = true;
          confidence = 'high';
          break;
        }
      }
    }

    // Detect Calendar Dates: e.g. "Nov 14", "14th November", "14/11", "2026-11-14"
    if (!hasExplicitDate) {
      const monthRegex = /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?\b/i;
      const match = text.match(monthRegex);
      if (match) {
        const monthName = match[0].split(/\s+/)[0];
        const day = parseInt(match[1], 10);
        const year = match[2] ? parseInt(match[2], 10) : now.getFullYear();
        const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
        targetDate = new Date(year, monthIndex, day);
        confidence = 'high';
        hasExplicitDate = true;
      }
    }

    // Default to +2 days if no date found
    if (!hasExplicitDate) {
      targetDate.setDate(now.getDate() + 2);
      confidence = 'low';
    }

    // Extract Time: e.g. "11:59 PM", "5:30 PM", "10 AM", "17:00", "at 6pm"
    let hours = 11;
    let minutes = 59;
    const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);

    if (timeMatch) {
      if (timeMatch[3]) {
        // 12-hour AM/PM
        let h = parseInt(timeMatch[1], 10);
        const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const meridian = timeMatch[3].toLowerCase();
        if (meridian === 'pm' && h < 12) h += 12;
        if (meridian === 'am' && h === 12) h = 0;
        hours = h;
        minutes = m;
      } else {
        // 24-hour
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
      }
    } else if (/\b(midnight|night)\b/i.test(lower)) {
      hours = 23;
      minutes = 59;
    } else if (/\b(noon)\b/i.test(lower)) {
      hours = 12;
      minutes = 0;
    }

    targetDate.setHours(hours, minutes, 0, 0);

    return {
      dateTime: targetDate.toISOString(),
      dateStr: formatDateString(targetDate.toISOString()),
      timeStr: formatTimeString(targetDate.toISOString()),
      dateConfidence: confidence
    };
  }

  /**
   * Extracts physical room, hall, or virtual link
   */
  static extractVenue(text) {
    // Check known campus location patterns
    const patterns = [
      /(?:venue|location|room|hall|place)\s*[:\-]\s*([^\n\r,]+)/i,
      /\b((?:seminar\s+hall|audi(?:torium)?|lab|room|block|atrium|studio|ground|turf|commons)\s*[-#]?\s*[A-Z0-9]+(?:\s+[A-Za-z0-9]+)?)\b/i,
      /\b(google\s+meet|zoom(?:\.us)?|ms\s+teams|lms(?:\s+portal)?)\b/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return {
          venue: match[1].replace(/[*_~`]/g, '').trim(),
          venueConfidence: 'high'
        };
      }
    }

    // Fallbacks
    if (/online|virtual|webinar|meet link/i.test(text)) {
      return { venue: 'Online (Video Meet)', venueConfidence: 'medium' };
    }

    return { venue: 'Campus Campus Ground / TBA', venueConfidence: 'low' };
  }

  /**
   * Categorizes notice using weighted keyword association
   */
  static classifyCategory(text) {
    const lower = text.toLowerCase();
    const scores = {
      deadline: 0,
      academic: 0,
      placement: 0,
      hackathon: 0,
      cultural: 0,
      sports: 0,
      admin: 0,
      food: 0
    };

    if (/deadline|last date|cutoff|due|submit by|penalty/i.test(lower)) scores.deadline += 4;
    if (/assignment|exam|midterm|endsem|syllabus|lecture|professor|dr\.|lab review|lms/i.test(lower)) scores.academic += 3;
    if (/placement|tpo|interview|internship|job|recruiter|ppt|stipend|ctc|resume/i.test(lower)) scores.placement += 4;
    if (/hackathon|hackverse|coding|developer|web3|ai\/ml|sprint|github|tech fest/i.test(lower)) scores.hackathon += 4;
    if (/cultural|dance|music|drama|auditions|fest|club|social|celebration|diwali/i.test(lower)) scores.cultural += 3;
    if (/sports|futsal|cricket|football|badminton|tournament|match|turf|athletic/i.test(lower)) scores.sports += 4;
    if (/hostel|mess|warden|water|electricity|maintenance|caretaker|campus bus/i.test(lower)) scores.admin += 3;
    if (/free food|pizza|boba|refreshments|lunch|dinner|snacks|buffet/i.test(lower)) scores.food += 2;

    let bestCat = 'academic';
    let highestScore = 0;

    for (const [cat, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        bestCat = cat;
      }
    }

    return {
      category: bestCat,
      categoryConfidence: highestScore >= 3 ? 'high' : 'medium'
    };
  }

  /**
   * Detects free food, stipends, prize pools, or student perks
   */
  static detectPerks(text) {
    const perkPatterns = [
      /(?:free\s+(?:food|pizza|boba|drinks|bagels|meals|snacks|coffee|lunch|dinner|refreshments)[^\n\r.,!]*)/i,
      /(?:prize\s+pool\s*[:\-]?\s*[\$₹][0-9,]+[^\n\r.,!]*)/i,
      /(?:[\$₹][0-9,]+\s*(?:direct\s+stipend|term\s+award|cash\s+prize|scholarship))/i,
      /(?:free\s+t-shirts?|goodies|swag\s+kits?)/i
    ];

    for (const pattern of perkPatterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          hasPerk: true,
          perk: match[0].replace(/[*_~`]/g, '').trim()
        };
      }
    }

    return { hasPerk: false, perk: 'Standard Event' };
  }

  /**
   * Extracts registration or portal link
   */
  static extractLink(text) {
    const urlMatch = text.match(/https?:\/\/[^\s<>"'{}|\\^`\[\]]+/i);
    return urlMatch ? urlMatch[0] : '';
  }

  /**
   * Generates a readable 1-2 sentence student summary
   */
  static generateSummary(text, title) {
    const cleaned = text.replace(/https?:\/\/[^\s]+/g, '').replace(/[*_~`]/g, '');
    const sentences = cleaned.split(/[.!\n\r]+/).map(s => s.trim()).filter(s => s.length > 15);
    
    // Pick the most informative sentence not already identical to title
    for (const sentence of sentences) {
      if (!sentence.toLowerCase().includes(title.toLowerCase().slice(0, 15))) {
        return sentence.slice(0, 140) + '.';
      }
    }
    return sentences[0] ? sentences[0].slice(0, 140) + '.' : 'No additional details provided.';
  }

  /**
   * Evaluates urgency based on keywords and proximity to now
   */
  static detectUrgency(text, dateTime) {
    if (/urgent|mandatory|compulsory|strict deadline|today|tonight|due tomorrow/i.test(text)) {
      return true;
    }
    if (dateTime) {
      const diffMs = new Date(dateTime).getTime() - Date.now();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 36;
    }
    return false;
  }

  static detectSource(rawText) {
    if (/\*?forwarded/i.test(rawText)) return 'Forwarded WhatsApp Notice';
    if (/@college\.edu|from:|subject:/i.test(rawText)) return 'Official University Email';
    if (/unstop|lms|portal/i.test(rawText)) return 'LMS / Portal Notification';
    if (/instagram|discord/i.test(rawText)) return 'Student Club Channel';
    return 'Campus Announcement';
  }

  static generateTags(category, hasPerk, isUrgent) {
    const tags = [];
    if (isUrgent) tags.push('Action Needed');
    if (hasPerk) tags.push('Perks Included');
    tags.push(category.charAt(0).toUpperCase() + category.slice(1));
    return tags;
  }

  /**
   * Checks for duplicate notice (Feature 11)
   */
  static detectDuplicate(title, dateStr, existingNotices) {
    if (!existingNotices || existingNotices.length === 0) return null;
    const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    for (const item of existingNotices) {
      const existingClean = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      // Match if titles share significant prefix or exact similarity
      if (existingClean.includes(cleanTitle.slice(0, 15)) || cleanTitle.includes(existingClean.slice(0, 15))) {
        return {
          matchedItem: item,
          message: `Similar notice found: "${item.title}". Would you like to merge or keep separate?`
        };
      }
    }
    return null;
  }

  /**
   * Checks for scheduling time conflicts (Feature 12)
   */
  static detectConflict(dateTime, venue, existingNotices) {
    if (!dateTime || !venue || !existingNotices) return null;
    const targetTime = new Date(dateTime).getTime();
    
    for (const item of existingNotices) {
      if (!item.dateTime) continue;
      const itemTime = new Date(item.dateTime).getTime();
      const diffMinutes = Math.abs(targetTime - itemTime) / (1000 * 60);
      
      // Conflict if within 60 minutes in same venue
      if (diffMinutes < 60 && item.venue.toLowerCase().includes(venue.toLowerCase().slice(0, 8))) {
        return {
          conflictingItem: item,
          message: `Scheduling overlap detected with "${item.title}" at ${venue} (${item.displayTime || ''}).`
        };
      }
    }
    return null;
  }
}
