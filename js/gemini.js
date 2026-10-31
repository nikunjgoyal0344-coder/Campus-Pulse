/**
 * Campus Pulse — Google Gemini AI Integration Engine
 * Connects directly to Google's Gemini API for live LLM extraction with instant fallback to client-side NLP.
 */

class GeminiService {
  static STORAGE_KEY = 'campuspulse_gemini_key_v1';

  static getApiKey() {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  }

  static setApiKey(key) {
    if (key) {
      localStorage.setItem(this.STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  static isConfigured() {
    return Boolean(this.getApiKey());
  }

  /**
   * Calls Google Gemini REST API or falls back to local NLP
   */
  static async extractWithGemini(rawText, fallbackNotices = []) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      // Use built-in client-side parser
      return NoticeExtractor.extract(rawText, fallbackNotices);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are the Campus Pulse AI notice parser. Extract structured details from this campus announcement into pure valid JSON with these exact keys:
{
  "title": "Clean heading",
  "category": "academic | deadline | placement | hackathon | cultural | sports | admin",
  "dateTime": "ISO 8601 string or best estimate",
  "venue": "Hall or Room",
  "perk": "Free food, stipend, or prize if mentioned, else None",
  "description": "1 concise sentence summary",
  "link": "URL or empty string",
  "isUrgent": true or false
}

Raw Announcement:
"${rawText}"`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: 'application/json' }
        })
      });

      if (!response.ok) {
        console.warn('Gemini API call failed, falling back to local extractor');
        return NoticeExtractor.extract(rawText, fallbackNotices);
      }

      const data = await response.json();
      const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawJson);

      return {
        id: 'notice_gemini_' + Date.now(),
        title: parsed.title || 'Campus Event',
        category: parsed.category || 'academic',
        dateTime: parsed.dateTime || new Date().toISOString(),
        venue: parsed.venue || 'Campus Venue',
        perk: parsed.perk || 'Standard Event',
        hasPerk: parsed.perk && parsed.perk !== 'None',
        description: parsed.description || 'Verified campus announcement.',
        link: parsed.link || '',
        rawText,
        source: 'Google Gemini 1.5 Flash Parser',
        isUrgent: Boolean(parsed.isUrgent),
        isCompleted: false,
        isBookmarked: false,
        tags: ['Gemini AI', parsed.category],
        confidence: { title: 'high', date: 'high', venue: 'high', category: 'high' }
      };
    } catch (err) {
      console.warn('Gemini parser error, using built-in NLP:', err);
      return NoticeExtractor.extract(rawText, fallbackNotices);
    }
  }
}
