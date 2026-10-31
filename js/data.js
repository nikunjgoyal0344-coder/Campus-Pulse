/**
 * Campus Pulse — Core Dataset & Category Definitions
 * Includes dynamic date calculation so demo data always stays relevant to today!
 */

const CATEGORIES = [
  { id: 'all', name: 'All Notices', icon: 'dynamic_feed', color: 'slate' },
  { id: 'academic', name: 'Academic & Exams', icon: 'school', color: 'indigo' },
  { id: 'deadline', name: 'Urgent Deadlines', icon: 'alarm', color: 'tomato' },
  { id: 'placement', name: 'Career & Placement', icon: 'work', color: 'emerald' },
  { id: 'hackathon', name: 'Hackathons & Tech', icon: 'code', color: 'violet' },
  { id: 'cultural', name: 'Cultural & Clubs', icon: 'celebration', color: 'amber' },
  { id: 'sports', name: 'Sports & Fitness', icon: 'sports_soccer', color: 'sky' },
  { id: 'admin', name: 'Hostel & Admin', icon: 'apartment', color: 'stone' },
  { id: 'food', name: 'Free Food & Perks', icon: 'local_pizza', color: 'chartreuse' },
  { id: 'social', name: 'Social & Meetups', icon: 'groups', color: 'pink' }
];

// Helper to format date offset relative to today
function getDateOffset(daysOffset, hours = 10, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function formatDateString(isoString) {
  const d = new Date(isoString);
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

function formatTimeString(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// 4 Realistic Campus Notice Presets for 1-Click Dropzone Testing
const SAMPLE_PRESETS = [
  {
    id: 'preset-exam',
    label: '📱 WhatsApp Exam Forward',
    text: `*Forwarded as received*
🚨 ATTENTION 3RD YEAR CSE & IT STUDENTS!! 🚨
Mid-Term Assignment 3 for CS-402 (Machine Learning & AI) submission portal is now open on LMS.
⚠️ STRICT DEADLINE: Tomorrow night at 11:59 PM sharp! Late submissions will incur a 20% mark deduction.
Also, Dr. Sharma will hold an in-person Doubt Clearing & Lab Review tomorrow from 2:00 PM to 4:00 PM in Lab 304 (Turing Block). Attendance is highly recommended.
LMS link: https://lms.college.edu/cs402/submit`
  },
  {
    id: 'preset-hackathon',
    label: '💻 Hackathon Fest Call',
    text: `⚡ HackVerse 2026: 36-Hour National Campus Hackathon! ⚡
Calling all coders, designers, and innovators!
📅 Date: This Friday at 10:00 AM (48-hr sprint starts)
📍 Venue: Main Auditorium & Maker Studio (Ground Floor)
🏆 Cash Prize Pool: ₹1,50,000 + Direct interview fast-tracks with tech sponsors!
🍕 Confirmed Perks: Free breakfast, unlimited midnight coffee, and Detroit pizza slices for all participants!
Teams of 2 to 4 students. Open to all branches and years.
Register team before Thursday 5 PM: https://unstop.com/hackathons/hackverse-2026`
  },
  {
    id: 'preset-placement',
    label: '🏢 Placement PPT & Drive',
    text: `Training & Placement Cell (TPO) Notice:
Company: Google Cloud & DeepMind Campus Outreach
Role: Software Engineering Intern (Summer 2027)
Eligibility: B.Tech 3rd Year (CSE, ECE, AI/DS) with CGPA 7.5+ and no active backlogs.
Pre-Placement Talk (PPT) & Online Assessment Briefing:
📅 Day & Time: Thursday at 3:00 PM
📍 Venue: Kemeny Hall Auditorium 108
👔 Dress Code: Strict Western Formals mandatory with college ID card.
Register your resume in TPO portal: https://tpo.college.edu/jobs/google-swe`
  },
  {
    id: 'preset-hostel',
    label: '🏠 Hostel Mess Alert',
    text: `Chief Warden Office Notice #412
Date: Today
Subject: Urgent Water Pipeline Repair & Mess Schedule Adjustment
Dear Residents of Hostel Blocks A, B, and C:
Please note that central municipal water line maintenance will take place tomorrow from 9:00 AM to 1:00 PM. Overhead tanks will have limited backup.
Additionally, Special Diwali Dinner will be served in the Central Dining Hall this Saturday at 7:30 PM with live sweet stalls and musical performances!
Contact Hostel Caretaker Mr. Verma at 98765-43210 for emergency queries.`
  }
];

// Initial Rich Seed Notices (Time-relative to today's date)
const INITIAL_NOTICES = [
  {
    id: 'pulse-1',
    title: 'Fall Undergraduate Research Fellowship & Grant ($2,500)',
    description: 'Institutional funding for undergraduate lab research this term. Requires faculty advisor signature and a concise 2-page project methodology.',
    category: 'academic',
    dateTime: getDateOffset(0, 23, 59), // Closes tonight!
    venue: 'Dean Hall 302 / LMS Research Portal',
    perk: '$2,500 Direct Student Stipend',
    link: 'https://research.college.edu/grants/apply',
    source: 'Bio-Eng Faculty Mailing List',
    rawText: `*From Dean of Research*: Fall Undergraduate Research Fellowship applications are closing tonight at 11:59 PM. Please submit your 2-page methodology with advisor signature to Dean Hall 302 or through the portal. Funding is $2,500.`,
    isUrgent: true,
    isCompleted: false,
    isBookmarked: true,
    tags: ['Must Attend', 'Scholarship']
  },
  {
    id: 'pulse-2',
    title: 'Google DeepMind Tech Talk: How Modern AI Models Reason',
    description: 'Keynote session by Dr. Aris Thorne (DeepMind) on deliberate reasoning models. Free admission, priority seating for students.',
    category: 'hackathon',
    dateTime: getDateOffset(1, 17, 30), // Tomorrow evening
    venue: 'Kemeny Hall Auditorium 108',
    perk: 'Free Artisanal Boba Drinks & Detroit Pizza after Q&A',
    link: 'https://rsvp.college.edu/deepmind-talk',
    source: 'Forwarded from CS Class WhatsApp',
    rawText: `Hey everyone! Google DeepMind is hosting an exclusive campus talk tomorrow at 5:30 PM in Kemeny Hall Auditorium 108. Free artisanal boba & pizza served! RSVP here: https://rsvp.college.edu/deepmind-talk`,
    isUrgent: true,
    isCompleted: false,
    isBookmarked: true,
    tags: ['Must Attend', 'Tech']
  },
  {
    id: 'pulse-3',
    title: 'Annual Engineering Career Gala & Resume Review',
    description: 'Conflicting start times detected between Career Center official email (4:00 PM) and Student Union lobby poster (5:30 PM). Coordinator checking underway.',
    category: 'placement',
    dateTime: getDateOffset(2, 16, 0), // In 2 days
    venue: 'Engineering Atrium',
    perk: 'Free Resume Printouts & Professional Headshots',
    link: 'https://careers.college.edu/gala-2026',
    source: 'Scanned: Lobby Bulletin Board vs Email',
    rawText: `Career Fair notice: Atrium lobby flyers show 5:30 PM start, but career center email says 4:00 PM. Meet top recruiters from Microsoft, Adobe, and Amazon in the Engineering Atrium.`,
    isUrgent: false,
    isCompleted: false,
    isBookmarked: false,
    hasConflict: true,
    conflictDetails: 'Double-Booking: Debate Society & Robotics Demo also reserved Engineering Atrium at 4:30 PM',
    tags: ['Career']
  },
  {
    id: 'pulse-4',
    title: 'Designathon 2026: 48-Hour UI/UX Campus Sprint',
    description: 'Design sprint for student teams of 2 to 4 to craft public campus interfaces. Mentored live by designers from Figma and IDEO. Beginners welcome!',
    category: 'cultural',
    dateTime: getDateOffset(4, 10, 0), // In 4 days
    venue: 'Maker Studio Hub (Room 204)',
    perk: '$6,000 Prize Pool + Free Weekend Meals',
    link: 'https://designathon.college.edu/register',
    source: 'Design Club Instagram Caption',
    rawText: `Designathon 2026 is back! 48-Hour UI/UX sprint starting in 4 days at 10 AM. Free meals all weekend. Prizes worth $6,000. Register your team of 2-4 at https://designathon.college.edu/register`,
    isUrgent: false,
    isCompleted: false,
    isBookmarked: false,
    tags: ['Group Project', 'Design']
  },
  {
    id: 'pulse-5',
    title: 'Inter-Department Futsal Tournament & Cheer Trials',
    description: 'Knockout matches between departments (CSE vs Mech vs ECE). Trophies and custom department jerseys for winners. Registration fee covered by sports budget.',
    category: 'sports',
    dateTime: getDateOffset(5, 16, 30), // In 5 days
    venue: 'Sports Complex Main Turf',
    perk: 'Free Energy Drinks & Refreshments',
    link: 'https://sports.college.edu/futsal-2026',
    source: 'Sports Secretary Forward',
    rawText: `Inter-Department Futsal Tournament kick-off this Saturday 4:30 PM at the Main Turf! Register your 7-player roster before Friday noon. Energy drinks provided.`,
    isUrgent: false,
    isCompleted: false,
    isBookmarked: false,
    tags: ['Sports']
  },
  {
    id: 'pulse-6',
    title: 'Hostel Water Supply Maintenance Notice',
    description: 'Municipal pipeline repair. Water supply in Blocks A, B, and C will be suspended from 9 AM to 1 PM tomorrow. Overhead backup only.',
    category: 'admin',
    dateTime: getDateOffset(1, 9, 0),
    venue: 'Hostel Blocks A, B, C',
    perk: 'N/A',
    link: '',
    source: 'Chief Warden Office WhatsApp Group',
    rawText: `Urgent Hostel Maintenance: Pipeline repairs tomorrow from 9:00 AM to 1:00 PM. Water supply suspended. Store water in advance.`,
    isUrgent: true,
    isCompleted: false,
    isBookmarked: false,
    tags: ['Hostel']
  }
];
