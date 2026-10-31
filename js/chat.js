/**
 * Campus Pulse — "Ask Campus Pulse" Natural Language Assistant
 * Answers student questions conversationally based on active campus notices.
 */

class CampusChatAssistant {
  static answer(query, notices = []) {
    const q = query.toLowerCase().trim();
    const active = notices.filter(n => !n.isCompleted);

    // 1. Free Food & Perks Queries
    if (q.includes('food') || q.includes('pizza') || q.includes('boba') || q.includes('perk') || q.includes('eat') || q.includes('free')) {
      const perkNotices = active.filter(n => n.hasPerk || n.category === 'food');
      if (perkNotices.length === 0) {
        return {
          reply: "I checked the radar, but there are no verified free food notices currently listed for this week. Keep an eye on student club announcements!",
          relatedItems: []
        };
      }
      const list = perkNotices.map(n => `• **${n.title}**: ${n.perk} (${formatDateString(n.dateTime)} at ${n.venue})`).join('\n');
      return {
        reply: `Here are the verified free food & campus perks I found on your radar:\n\n${list}\n\nMake sure to RSVP early if a form link is required!`,
        relatedItems: perkNotices
      };
    }

    // 2. Deadlines & Urgent Tasks Queries
    if (q.includes('deadline') || q.includes('urgent') || q.includes('due') || q.includes('tomorrow') || q.includes('today')) {
      const urgent = active.filter(n => n.isUrgent);
      if (urgent.length === 0) {
        return {
          reply: "Great news! You have zero urgent deadlines due within the next 24 hours. Your schedule is clear today.",
          relatedItems: []
        };
      }
      const list = urgent.map(n => `• **${n.title}**: Due ${formatDateString(n.dateTime)} at ${formatTimeString(n.dateTime)} (📍 ${n.venue})`).join('\n');
      return {
        reply: `⚠️ You have **${urgent.length} urgent deadline${urgent.length > 1 ? 's' : ''}** needing immediate attention:\n\n${list}\n\nDon't forget to mark them as Done once completed!`,
        relatedItems: urgent
      };
    }

    // 3. Placement & Career Queries
    if (q.includes('placement') || q.includes('job') || q.includes('career') || q.includes('intern') || q.includes('company') || q.includes('tpo')) {
      const placements = active.filter(n => n.category === 'placement');
      if (placements.length === 0) {
        return {
          reply: "No active placement drives are currently on the radar. Check back soon for TPO updates.",
          relatedItems: []
        };
      }
      const list = placements.map(n => `• **${n.title}**: ${formatDateString(n.dateTime)} (${n.venue}) — ${n.description.slice(0, 80)}...`).join('\n');
      return {
        reply: `Here are the active placement talks and recruitment schedules:\n\n${list}\n\nRemember to bring hard copies of your resume and follow the required dress code!`,
        relatedItems: placements
      };
    }

    // 4. Hackathons & Tech Workshops
    if (q.includes('hackathon') || q.includes('code') || q.includes('tech') || q.includes('workshop')) {
      const tech = active.filter(n => n.category === 'hackathon');
      const list = tech.map(n => `• **${n.title}**: ${formatDateString(n.dateTime)} at ${n.venue}`).join('\n');
      return {
        reply: `Here are the upcoming tech sprints & workshops:\n\n${list || 'No tech events found.'}`,
        relatedItems: tech
      };
    }

    // 5. General Fallback with Search
    const matches = active.filter(n => 
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      (n.venue && n.venue.toLowerCase().includes(q))
    );

    if (matches.length > 0) {
      const list = matches.slice(0, 3).map(n => `• **${n.title}** (${formatDateString(n.dateTime)} in ${n.venue})`).join('\n');
      return {
        reply: `I found ${matches.length} notice${matches.length > 1 ? 's' : ''} matching your query:\n\n${list}`,
        relatedItems: matches
      };
    }

    return {
      reply: `I couldn't find any campus notices matching "${query}". Try asking about *"free food"*, *"deadlines this week"*, *"placement talks"*, or *"hackathons"*.`,
      relatedItems: []
    };
  }
}
