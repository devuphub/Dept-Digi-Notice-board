import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

const DEFAULT_DEPARTMENTS = [
  { code: 'General', name: 'Campus-Wide & Central Admin', color: '#334155', shortDesc: 'Institution-wide circulars, holidays, and central announcements' },
  { code: 'CSE', name: 'Computer Science & Engineering', color: '#2563eb', shortDesc: 'Labs, hackathons, coding drives, and CSE academic schedules' },
  { code: 'IT', name: 'Information Technology', color: '#7c3aed', shortDesc: 'IT workshops, mini-project evaluations, and seminar notices' },
  { code: 'ECE', name: 'Electronics & Communication', color: '#059669', shortDesc: 'VLSI labs, embedded workshops, and hardware project updates' },
  { code: 'EN', name: 'Electrical & Electronics', color: '#d97706', shortDesc: 'Power systems lab schedules, industrial visits, and notices' },
  { code: 'ME', name: 'Mechanical Engineering', color: '#dc2626', shortDesc: 'CAD/CAM workshops, SAE updates, and workshop safety circulars' },
  { code: 'MCA', name: 'Master of Computer Applications', color: '#0891b2', shortDesc: 'PG project reviews, placement prep, and seminar schedules' },
];

function createSeedData() {
  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 3600 * 1000).toISOString();
  const daysAhead = (d) => new Date(now + d * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const adminPass = bcrypt.hashSync('Admin@123', 10);
  const facultyPass = bcrypt.hashSync('Faculty@123', 10);
  const studentPass = bcrypt.hashSync('Student@123', 10);

  const users = [
    {
      id: 'u-admin',
      username: 'admin',
      passwordHash: adminPass,
      name: 'Dr. R.K. Sharma',
      role: 'admin',
      department: 'All',
      designation: 'Chief Notice Administrator',
      bookmarks: [],
    },
    {
      id: 'u-fac-cse',
      username: 'faculty_cse',
      passwordHash: facultyPass,
      name: 'Prof. Ashish Bajpai',
      role: 'faculty',
      department: 'CSE',
      designation: 'CSE Dept Coordinator',
      bookmarks: [],
    },
    {
      id: 'u-fac-it',
      username: 'faculty_it',
      passwordHash: facultyPass,
      name: 'Prof. Neha Gupta',
      role: 'faculty',
      department: 'IT',
      designation: 'IT Dept Coordinator',
      bookmarks: [],
    },
    {
      id: 'u-fac-ece',
      username: 'faculty_ece',
      passwordHash: facultyPass,
      name: 'Prof. Vivek Verma',
      role: 'faculty',
      department: 'ECE',
      designation: 'ECE Dept Coordinator',
      bookmarks: [],
    },
    {
      id: 'u-stu-main',
      username: 'student',
      passwordHash: studentPass,
      name: 'Dev Upadhyay',
      role: 'student',
      department: 'CSE',
      designation: 'B.Tech Student (CSE)',
      bookmarks: ['n-1', 'n-3'],
    },
    {
      id: 'u-stu-it',
      username: 'student_it',
      passwordHash: studentPass,
      name: 'Ananya Singh',
      role: 'student',
      department: 'IT',
      designation: 'B.Tech Student (IT)',
      bookmarks: ['n-2'],
    },
    {
      id: 'u-stu-ece',
      username: 'student_ece',
      passwordHash: studentPass,
      name: 'Rohan Mehta',
      role: 'student',
      department: 'ECE',
      designation: 'B.Tech Student (ECE)',
      bookmarks: [],
    },
  ];

  const notices = [
    {
      id: 'n-1',
      title: 'End-Semester Practical Examination & Viva Schedule (Odd Sem 2026)',
      content:
        'All CSE 2nd, 3rd, and Final Year students are informed that the End-Semester Practical Examinations and Project Viva-Voce will commence from December 4, 2026 in Aryabhatta Block Labs (Labs 1–6). Students must carry their duly signed lab records, college ID card, and project synopsis. Reporting time is 9:00 AM sharp.',
      department: 'CSE',
      category: 'Exam',
      priority: 'Urgent',
      targetYear: 'All Years',
      pinned: true,
      authorId: 'u-fac-cse',
      authorName: 'Prof. Ashish Bajpai',
      authorRole: 'faculty',
      attachmentName: null,
      attachmentUrl: null,
      expiresAt: daysAhead(20),
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2),
      views: 148,
      acknowledgedBy: ['u-stu-main'],
    },
    {
      id: 'n-2',
      title: 'Campus Placement Drive: TCS Digital & Prime — Registration Open',
      content:
        'Training & Placement Cell, ABESEC Ghaziabad invites eligible Final Year B.Tech (CSE, IT, ECE, EN) and MCA students to register for the upcoming Campus Recruitment Drive. Minimum eligibility: 65% aggregate with no active backlogs. Complete registration on the T&P portal before November 30, 2026, 5:00 PM.',
      department: 'General',
      category: 'Placement',
      priority: 'Urgent',
      targetYear: '4th Year',
      pinned: true,
      authorId: 'u-admin',
      authorName: 'Dr. R.K. Sharma',
      authorRole: 'admin',
      attachmentName: null,
      attachmentUrl: null,
      expiresAt: daysAhead(12),
      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(5),
      views: 312,
      acknowledgedBy: ['u-stu-main', 'u-stu-it'],
    },
    {
      id: 'n-3',
      title: 'FSD Project Final Evaluation & GitHub/Render Submission Guidelines',
      content:
        'Students submitting their Full Stack Development (FSD) mini-projects must ensure their GitHub repository README.md includes the live deployed Render URL, Admin & Student login credentials, and proper ABESEC Ghaziabad header and footer branding. Live demonstration slots will be allocated department-wise.',
      department: 'CSE',
      category: 'Academic',
      priority: 'Important',
      targetYear: '3rd Year',
      pinned: false,
      authorId: 'u-fac-cse',
      authorName: 'Prof. Ashish Bajpai',
      authorRole: 'faculty',
      attachmentName: null,
      attachmentUrl: null,
      expiresAt: daysAhead(15),
      createdAt: hoursAgo(11),
      updatedAt: hoursAgo(11),
      views: 196,
      acknowledgedBy: ['u-stu-main'],
    },
    {
      id: 'n-4',
      title: 'Cloud Native & DevOps Hands-On Bootcamp — IT Seminar Hall',
      content:
        'The Department of Information Technology is organizing a two-day workshop on Docker, Kubernetes, and CI/CD pipelines on December 2–3, 2026 at Ramanujan Seminar Hall. Participation certificates will be issued to attendees with 100% session attendance.',
      department: 'IT',
      category: 'Events',
      priority: 'Normal',
      targetYear: 'All Years',
      pinned: false,
      authorId: 'u-fac-it',
      authorName: 'Prof. Neha Gupta',
      authorRole: 'faculty',
      attachmentName: null,
      attachmentUrl: null,
      expiresAt: daysAhead(10),
      createdAt: hoursAgo(22),
      updatedAt: hoursAgo(22),
      views: 94,
      acknowledgedBy: [],
    },
    {
      id: 'n-5',
      title: 'VLSI Design & Embedded IoT Lab Component Verification Notice',
      content:
        'ECE students working on 3rd-year hardware mini-projects are requested to verify and return issued microcontroller kits and breadboards to the Embedded Systems Lab Assistant before December 6, 2026 to receive lab clearance.',
      department: 'ECE',
      category: 'Academic',
      priority: 'Important',
      targetYear: '3rd Year',
      pinned: false,
      authorId: 'u-fac-ece',
      authorName: 'Prof. Vivek Verma',
      authorRole: 'faculty',
      attachmentName: null,
      attachmentUrl: null,
      expiresAt: daysAhead(14),
      createdAt: hoursAgo(30),
      updatedAt: hoursAgo(30),
      views: 68,
      acknowledgedBy: [],
    },
    {
      id: 'n-6',
      title: 'Revised Library & Innovation Center Timings During Exam Weeks',
      content:
        'For the convenience of students preparing for upcoming university examinations, the Central Library and Reading Hall at ABESEC Ghaziabad will remain open from 8:00 AM to 9:00 PM on all working days and Saturdays until December 24, 2026.',
      department: 'General',
      category: 'Circular',
      priority: 'Normal',
      targetYear: 'All Years',
      pinned: false,
      authorId: 'u-admin',
      authorName: 'Dr. R.K. Sharma',
      authorRole: 'admin',
      attachmentName: null,
      attachmentUrl: null,
      expiresAt: daysAhead(30),
      createdAt: hoursAgo(44),
      updatedAt: hoursAgo(44),
      views: 215,
      acknowledgedBy: [],
    },
    {
      id: 'n-7',
      title: 'CAD/CAM & SolidWorks Certification Batch Enrollment — ME Dept',
      content:
        'Mechanical Engineering students interested in the winter SolidWorks CSWA certification batch can submit their names to the ME Department Coordinator office by December 1, 2026. Limited to 45 seats on a first-come basis.',
      department: 'ME',
      category: 'Events',
      priority: 'Normal',
      targetYear: '2nd Year',
      pinned: false,
      authorId: 'u-admin',
      authorName: 'Dr. R.K. Sharma',
      authorRole: 'admin',
      attachmentName: null,
      attachmentUrl: null,
      expiresAt: daysAhead(9),
      createdAt: hoursAgo(58),
      updatedAt: hoursAgo(58),
      views: 53,
      acknowledgedBy: [],
    },
    {
      id: 'n-8',
      title: 'Industrial Visit to NTPC Dadri Substation — EN Department',
      content:
        'An educational industrial visit for EN 3rd Year students to NTPC Dadri is scheduled for December 8, 2026. Bus departure from ABESEC Main Gate at 7:45 AM. Formals and college ID card are mandatory.',
      department: 'EN',
      category: 'Events',
      priority: 'Important',
      targetYear: '3rd Year',
      pinned: false,
      authorId: 'u-admin',
      authorName: 'Dr. R.K. Sharma',
      authorRole: 'admin',
      attachmentName: null,
      attachmentUrl: null,
      expiresAt: daysAhead(11),
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(72),
      views: 49,
      acknowledgedBy: [],
    },
    {
      id: 'n-9',
      title: 'MCA Minor Project Synopsis & Guide Allocation List Published',
      content:
        'MCA 1st and 2nd year students can check the updated faculty guide allocation list on the department board. First review presentation (PPT, max 8 slides) is scheduled for December 5, 2026 in Block-B Room 204.',
      department: 'MCA',
      category: 'Academic',
      priority: 'Normal',
      targetYear: 'All Years',
      pinned: false,
      authorId: 'u-admin',
      authorName: 'Dr. R.K. Sharma',
      authorRole: 'admin',
      attachmentName: null,
      attachmentUrl: null,
      expiresAt: daysAhead(16),
      createdAt: hoursAgo(80),
      updatedAt: hoursAgo(80),
      views: 41,
      acknowledgedBy: [],
    },
  ];

  return {
    departments: DEFAULT_DEPARTMENTS,
    users,
    notices,
  };
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const seed = createSeedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || !parsed.notices || !parsed.departments) {
      throw new Error('Invalid DB shape');
    }
    return parsed;
  } catch {
    const seed = createSeedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }
}

export function readDb() {
  return ensureDb();
}

export function writeDb(data) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

export function generateId(prefix = 'id') {
  return `${prefix}-${crypto.randomBytes(5).toString('hex')}`;
}
