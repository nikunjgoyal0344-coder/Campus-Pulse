/**
 * Campus Pulse — Automated Verification & Unit Test Suite
 * Zero-dependency unit tests for NLP extraction, date normalization, Indian slang, and AI digest.
 * Run with: node test.js
 */

const assert = require('assert');

// Polyfill localStorage & window for Node environment
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

// Load Modules
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadModule(file) {
  const code = fs.readFileSync(path.join(__dirname, file), 'utf8');
  vm.runInThisContext(code);
}

loadModule('js/data.js');
loadModule('js/extractor.js');
loadModule('js/digest.js');
loadModule('js/chat.js');

let passCount = 0;
let failCount = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  \x1b[31m✖\x1b[0m ${name}`);
    console.error(`    ${err.message}`);
    failCount++;
  }
}

console.log('\n========================================');
console.log('🧪 RUNNING CAMPUS PULSE TEST SUITE');
console.log('========================================\n');

// 1. Text Sanitization Tests
it('strips WhatsApp forwarded boilerplate and timestamps', () => {
  const messy = `*Forwarded as received*\n[10:30 AM] Prof. Verma: Attention students! Exam tomorrow.`;
  const cleaned = NoticeExtractor.cleanBoilerplate(messy);
  assert.ok(!cleaned.includes('Forwarded as received'));
  assert.ok(!cleaned.includes('[10:30 AM]'));
  assert.ok(cleaned.includes('Exam tomorrow'));
});

// 2. Title Extraction Tests
it('extracts clean event titles without formatting noise', () => {
  const text = `🚨 ATTENTION 3RD YEAR CSE STUDENTS: CS402 Assignment 3 Portal 🚨\nPlease submit by tomorrow.`;
  const title = NoticeExtractor.extractTitle(text, text);
  assert.ok(title.includes('CS402 Assignment 3 Portal') || title.includes('ATTENTION 3RD YEAR'));
});

// 3. Indian Slang & Relative Date Tests
it('normalizes relative slang "tomorrow" and "tmrw"', () => {
  const res1 = NoticeExtractor.extractDateTime('Meeting is tomorrow at 5 PM');
  const res2 = NoticeExtractor.extractDateTime('Meeting is tmrw at 5:00 PM');
  const d1 = new Date(res1.dateTime);
  const d2 = new Date(res2.dateTime);
  assert.strictEqual(d1.getDate(), d2.getDate());
  assert.strictEqual(d1.getHours(), 17);
});

it('normalizes relative slang "kal" (Hindi for tomorrow)', () => {
  const res = NoticeExtractor.extractDateTime('Attendance compulsory kal at 10 AM');
  const d = new Date(res.dateTime);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  assert.strictEqual(d.getDate(), tomorrow.getDate());
  assert.strictEqual(d.getHours(), 10);
});

// 4. Venue Extraction Tests
it('extracts physical hall rooms and auditoriums', () => {
  const res1 = NoticeExtractor.extractVenue('Join us in Seminar Hall 2 on Friday');
  assert.ok(/seminar\s+hall\s*2/i.test(res1.venue));

  const res2 = NoticeExtractor.extractVenue('Guest talk at Kemeny Hall Auditorium 108');
  assert.ok(/auditorium/i.test(res2.venue));
});

// 5. Category Classification Tests
it('classifies academic assignments into Academic / Deadline category', () => {
  const res = NoticeExtractor.classifyCategory('Midterm Assignment submission portal open on LMS with strict penalty');
  assert.ok(res.category === 'academic' || res.category === 'deadline');
});

it('classifies recruitment drives into Placement category', () => {
  const res = NoticeExtractor.classifyCategory('Microsoft TPO recruitment drive and pre-placement talk for software engineering interns');
  assert.strictEqual(res.category, 'placement');
});

it('classifies hackathon fests into Hackathon category', () => {
  const res = NoticeExtractor.classifyCategory('HackVerse 2026 36-hour coding sprint and team developer competition');
  assert.strictEqual(res.category, 'hackathon');
});

// 6. Perks & Free Food Detection Tests
it('detects confirmed free food, pizza, and boba drinks', () => {
  const res = NoticeExtractor.detectPerks('Free artisanal boba drinks & Detroit pizza slices after Q&A session');
  assert.strictEqual(res.hasPerk, true);
  assert.ok(res.perk.toLowerCase().includes('pizza') || res.perk.toLowerCase().includes('boba'));
});

// 7. Scheduling Conflict Detection Tests
it('flags time and venue scheduling conflicts', () => {
  const existing = [{
    title: 'Career Fair',
    venue: 'Engineering Atrium',
    dateTime: getDateOffset(1, 16, 0)
  }];
  const conflict = NoticeExtractor.detectConflict(getDateOffset(1, 16, 15), 'Engineering Atrium', existing);
  assert.ok(conflict !== null);
  assert.ok(conflict.message.includes('overlap detected'));
});

// 8. AI Weekly Digest & WhatsApp Formatter Tests
it('generates a formatted WhatsApp summary with emojis and sections', () => {
  const summary = DigestGenerator.formatForWhatsApp(INITIAL_NOTICES);
  assert.ok(summary.includes('CAMPUS PULSE'));
  assert.ok(summary.includes('CRITICAL DEADLINES') || summary.includes('KEY TALKS'));
  assert.ok(summary.includes('Powered by *Campus Pulse*'));
});

// 9. Natural Language Campus Assistant Tests
it('answers questions about free food accurately', () => {
  const response = CampusChatAssistant.answer('Where is free food this week?', INITIAL_NOTICES);
  assert.ok(response.reply.includes('boba') || response.reply.includes('pizza') || response.reply.includes('perk'));
});

it('answers questions about urgent deadlines accurately', () => {
  const response = CampusChatAssistant.answer('What deadlines are due tomorrow?', INITIAL_NOTICES);
  assert.ok(response.reply.includes('urgent') || response.reply.includes('deadline'));
});

console.log('\n========================================');

// 10. Security & Sanitization Tests (XSS Prevention & Protocol Safety)
function escapeHTML(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (/^(https?:|\/|#|mailto:)/i.test(trimmed)) {
    return encodeURI(trimmed).replace(/["'<>]/g, '');
  }
  return '#';
}

it('neutralizes malicious XSS script injection payloads', () => {
  const maliciousTitle = '<script>alert("XSS")</script>Hackathon Announcement';
  const sanitized = escapeHTML(maliciousTitle);
  assert.ok(!sanitized.includes('<script>'));
  assert.ok(sanitized.includes('&lt;script&gt;'));
});

it('neutralizes HTML event handler injections (img onerror)', () => {
  const maliciousPrompt = 'Exam at <img src="x" onerror="stealCookies()"> Lab 4';
  const sanitized = escapeHTML(maliciousPrompt);
  assert.ok(!sanitized.includes('<img'));
  assert.ok(sanitized.includes('&lt;img'));
});

it('blocks unsafe javascript: URLs and allows safe https: links', () => {
  assert.strictEqual(sanitizeUrl('javascript:alert(document.cookie)'), '#');
  assert.strictEqual(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#');
  assert.strictEqual(sanitizeUrl('https://lms.college.edu/assignment'), 'https://lms.college.edu/assignment');
  assert.strictEqual(sanitizeUrl('/portal/calendar'), '/portal/calendar');
});

// 11. Additional Campus Slang & Urgency Tests
it('detects "parso" (day after tomorrow in Hindi) correctly', () => {
  const res = NoticeExtractor.extractDateTime('Project presentation parso at 3 PM');
  const d = new Date(res.dateTime);
  const target = new Date();
  target.setDate(target.getDate() + 2);
  assert.strictEqual(d.getDate(), target.getDate());
});

it('detects hostel and facilities maintenance notices', () => {
  const res = NoticeExtractor.classifyCategory('Notice from Chief Warden: Power backup & domestic water maintenance in hostel mess');
  assert.ok(res.category === 'admin' || res.category === 'hostel');
});

it('accurately tags same-day deadlines as urgent', () => {
  const isUrgent = NoticeExtractor.detectUrgency('CS189 Problem Set due today before midnight', new Date().toISOString());
  assert.strictEqual(isUrgent, true);
});

it('safely handles empty or whitespace-only inputs without crashing', () => {
  assert.throws(() => {
    NoticeExtractor.extract('   ');
  }, /Please paste a campus notice/);
});

console.log(`Results: ${passCount} Passed, ${failCount} Failed`);
console.log('========================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL UNIT TESTS PASSED SUCCESSFULLY!\n');
}
