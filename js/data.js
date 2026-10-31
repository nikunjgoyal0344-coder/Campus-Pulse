/**
 * Campus Pulse — Core Dataset & Category Definitions
 * Enriched with 12+ realistic campus notices and demo student profiles.
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

// Demo Student Profiles for Attractive 1-Click Login
const DEMO_PROFILES = [
  {
    id: 'alex',
    name: 'Alex Rivera',
    rollNo: '23CS0412',
    year: '3rd Year',
    dept: 'Computer Science & Design',
    collegeEmail: 'alex.rivera@campus.edu',
    cgpa: '8.8',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    interests: ['Tech', 'Hackathons', 'Placements', 'Free Food'],
    tags: ['Must Attend', 'Scholarship', 'Group Project']
  },
  {
    id: 'priya',
    name: 'Priya Sharma',
    rollNo: '22AI0189',
    year: '4th Year',
    dept: 'Artificial Intelligence & Data Science',
    collegeEmail: 'priya.sharma@campus.edu',
    cgpa: '9.3',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    interests: ['AI/ML', 'Placements', 'Research', 'Academic'],
    tags: ['Must Attend', 'Placement Lead']
  },
  {
    id: 'rohan',
    name: 'Rohan Mehta',
    rollNo: '24EC0521',
    year: '2nd Year',
    dept: 'Electronics & Robotics',
    collegeEmail: 'rohan.mehta@campus.edu',
    cgpa: '8.2',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    interests: ['Robotics', 'Sports', 'Cultural', 'Free Food'],
    tags: ['Robotics Club', 'Futsal Captain']
  }
];

function getDateOffset(daysOffset, hours = 10, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function formatDateString(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
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

// Rich 12+ Seed Notices (Time-relative to today's date)
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
    hasPerk: true,
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
    hasPerk: true,
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
  },
  {
    id: 'pulse-7',
    title: 'Microsoft IDC Campus Recruitment Assessment',
    description: 'Online coding round for Software Engineering roles. 3 algorithmic problems on HackerRank. Webcam proctoring mandatory.',
    category: 'placement',
    dateTime: getDateOffset(3, 18, 0),
    venue: 'Virtual (Online Proctoring Portal)',
    perk: 'Summer Internship + ₹1.2L Monthly Stipend',
    link: 'https://careers.microsoft.com/students',
    source: 'TPO Placement Cell Email',
    rawText: `Attention shortlisted candidates: The Microsoft IDC online assessment link will be live on Friday at 6:00 PM. Test duration: 90 mins. Ensure quiet environment and working webcam.`,
    isUrgent: false,
    isCompleted: false,
    isBookmarked: true,
    tags: ['Placement', 'Must Attend']
  },
  {
    id: 'pulse-8',
    title: 'Acoustic Jam Night & Open Mic Auditions',
    description: 'Campus Music & Drama Society informal open mic. Guitars, keyboards, and cajons provided. Open to singers, poets, and standup comedians.',
    category: 'cultural',
    dateTime: getDateOffset(3, 19, 0),
    venue: 'Open Air Amphitheatre',
    perk: 'Free Hot Chocolate & Cookies',
    link: 'https://clubs.college.edu/music-jam',
    source: 'Music Club Instagram Reel',
    rawText: `Chill vibes only! Acoustic Jam Night this Friday at 7 PM at the Amphitheatre. Free hot chocolate and baked cookies for everyone who performs or cheers!`,
    isUrgent: false,
    isCompleted: false,
    isBookmarked: false,
    tags: ['Cultural', 'Music']
  },
  {
    id: 'pulse-9',
    title: 'CS301 Database Systems Midterm Lab Practical Exam',
    description: 'Hands-on PostgreSQL schema normalization and complex SQL query writing exam. Closed book, no internet access during test.',
    category: 'academic',
    dateTime: getDateOffset(2, 10, 0),
    venue: 'Computing Centre Lab 4',
    perk: 'N/A',
    link: 'https://lms.college.edu/cs301',
    source: 'Course Coordinator Announcement',
    rawText: `Mandatory Lab Practical for CS301 Database Systems is scheduled for Thursday 10:00 AM in Lab 4. Bring signed lab records. Late arrivals will not be permitted.`,
    isUrgent: false,
    isCompleted: false,
    isBookmarked: true,
    tags: ['Academic', 'Exam']
  },
  {
    id: 'pulse-10',
    title: 'GDG Cloud & Generative AI Hands-on Workshop',
    description: 'Build and deploy multimodal Gemini AI applications. Free Google Cloud credits ($50 voucher) provided to all attendees who complete the lab.',
    category: 'hackathon',
    dateTime: getDateOffset(6, 14, 0),
    venue: 'Seminar Hall 3 (Aryabhata Block)',
    perk: '$50 Google Cloud Credits + Swag Kits',
    link: 'https://gdg.community.dev/events/genai-campus-lab',
    source: 'Google Developer Group Student Lead',
    rawText: `Learn how to build Gemini AI apps with Google Cloud! Workshop on Sunday at 2 PM in Seminar Hall 3. Bring your laptop. Free Cloud credits and swag badges provided.`,
    isUrgent: false,
    isCompleted: false,
    isBookmarked: false,
    tags: ['Tech', 'Workshop']
  },
  {
    id: 'pulse-11',
    title: 'Inter-College Badminton Open Championship',
    description: 'Singles and Doubles tournament for Men & Women. Yonex tournament-grade feather shuttles provided. Cash prizes for finalists.',
    category: 'sports',
    dateTime: getDateOffset(7, 9, 30),
    venue: 'Indoor Sports Arena Court 1-4',
    perk: 'Free Sports T-shirts & Gatorade',
    link: 'https://sports.college.edu/badminton-2026',
    source: 'Campus Sports Department Notice',
    rawText: `Badminton Open Championship registration closing soon! Matches kick off next Monday at 9:30 AM in the Indoor Arena. Free moisture-wicking team jerseys.`,
    isUrgent: false,
    isCompleted: false,
    isBookmarked: false,
    tags: ['Sports']
  },
  {
    id: 'pulse-12',
    title: 'Campus Shuttle Bus Schedule Revision',
    description: 'New morning and evening shuttle timings connecting South Metro Station, Central Campus, and North Residential Blocks.',
    category: 'admin',
    dateTime: getDateOffset(4, 8, 0),
    venue: 'Campus Main Gate Bus Bay',
    perk: 'Zero Fare with Student ID',
    link: 'https://admin.college.edu/transport',
    source: 'Transport Office Bulletin',
    rawText: `Notice from Transport Department: Effective Friday, campus shuttle bus frequency will increase during peak hours (8 AM - 10 AM and 5 PM - 7 PM). Free ride with college ID.`,
    isUrgent: false,
    isCompleted: false,
    isBookmarked: false,
    tags: ['Admin', 'Transport']
  }
];
