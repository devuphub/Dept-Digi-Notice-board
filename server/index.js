import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { readDb, writeDb, generateId } from './store.js';
import { optionalAuth, requireAuth, requireRoles, sanitizeUser, signToken } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, PNG, JPG, WEBP, or TXT files up to 5MB are allowed.'));
    }
  },
});

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// Initialize DB on boot
readDb();

// Health check for Render
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ABESEC Bulletin — ABESEC Ghaziabad',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const db = readDb();
  const user = db.users.find(
    (u) => u.username.toLowerCase() === String(username).trim().toLowerCase()
  );
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const token = signToken(user);
  return res.json({
    token,
    user: sanitizeUser(user),
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// Departments
app.get('/api/departments', (_req, res) => {
  const db = readDb();
  const counts = {};
  for (const notice of db.notices) {
    counts[notice.department] = (counts[notice.department] || 0) + 1;
  }
  const departments = db.departments.map((dept) => ({
    ...dept,
    noticeCount: counts[dept.code] || 0,
  }));
  res.json({ departments, totalNotices: db.notices.length });
});

app.post('/api/departments', requireRoles('admin'), (req, res) => {
  const { code, name, color, shortDesc } = req.body || {};
  if (!code || !name) {
    return res.status(400).json({ error: 'Department code and name are required.' });
  }
  const cleanCode = String(code).trim().toUpperCase().slice(0, 12);
  const db = readDb();
  if (db.departments.some((d) => d.code.toLowerCase() === cleanCode.toLowerCase())) {
    return res.status(409).json({ error: 'Department code already exists.' });
  }
  const newDept = {
    code: cleanCode,
    name: String(name).trim(),
    color: color || '#2563eb',
    shortDesc: shortDesc ? String(shortDesc).trim() : `${String(name).trim()} official circulars and updates`,
  };
  db.departments.push(newDept);
  writeDb(db);
  return res.status(201).json({ department: { ...newDept, noticeCount: 0 } });
});

// Notices listing with filters
app.get('/api/notices', optionalAuth, (req, res) => {
  const {
    department = 'All',
    category = 'All',
    priority = 'All',
    targetYear = 'All',
    search = '',
    bookmarked = 'false',
  } = req.query;

  const db = readDb();
  let items = [...db.notices];

  if (department && department !== 'All') {
    items = items.filter((n) => n.department.toLowerCase() === String(department).toLowerCase());
  }
  if (category && category !== 'All') {
    items = items.filter((n) => n.category.toLowerCase() === String(category).toLowerCase());
  }
  if (priority && priority !== 'All') {
    items = items.filter((n) => n.priority.toLowerCase() === String(priority).toLowerCase());
  }
  if (targetYear && targetYear !== 'All') {
    items = items.filter(
      (n) => n.targetYear === 'All Years' || n.targetYear.toLowerCase() === String(targetYear).toLowerCase()
    );
  }
  if (search && String(search).trim()) {
    const q = String(search).trim().toLowerCase();
    items = items.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.department.toLowerCase().includes(q) ||
        n.authorName.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }
  if (bookmarked === 'true' && req.user) {
    const savedSet = new Set(req.user.bookmarks || []);
    items = items.filter((n) => savedSet.has(n.id));
  }

  // Sort: Pinned first, then Urgent > Important > Normal, then newest first
  const priorityRank = { Urgent: 3, Important: 2, Normal: 1 };
  items.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const dateDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (a.pinned && b.pinned) {
      const pDiff = (priorityRank[b.priority] || 1) - (priorityRank[a.priority] || 1);
      if (pDiff !== 0) return pDiff;
    }
    return dateDiff;
  });

  const userBookmarks = new Set(req.user?.bookmarks || []);
  const enriched = items.map((n) => ({
    ...n,
    acknowledgedCount: (n.acknowledgedBy || []).length,
    isAcknowledged: req.user ? (n.acknowledgedBy || []).includes(req.user.id) : false,
    isBookmarked: req.user ? userBookmarks.has(n.id) : false,
  }));

  res.json({ notices: enriched });
});

// Single notice view (increments views)
app.post('/api/notices/:id/view', (req, res) => {
  const db = readDb();
  const notice = db.notices.find((n) => n.id === req.params.id);
  if (!notice) {
    return res.status(404).json({ error: 'Notice not found.' });
  }
  notice.views = (notice.views || 0) + 1;
  writeDb(db);
  return res.json({ views: notice.views });
});

// Create notice (Admin or Faculty for their department)
app.post(
  '/api/notices',
  requireRoles('admin', 'faculty'),
  upload.single('attachment'),
  (req, res) => {
    const {
      title,
      content,
      department,
      category = 'Academic',
      priority = 'Normal',
      targetYear = 'All Years',
      pinned = 'false',
      expiresAt = '',
    } = req.body || {};

    if (!title || !content || !department) {
      return res.status(400).json({ error: 'Title, content, and department are required.' });
    }

    if (
      req.user.role === 'faculty' &&
      req.user.department !== department &&
      department !== 'General'
    ) {
      return res.status(403).json({
        error: `Faculty coordinators can only publish notices for ${req.user.department} or General.`,
      });
    }

    const db = readDb();
    const now = new Date().toISOString();
    const newNotice = {
      id: generateId('n'),
      title: String(title).trim(),
      content: String(content).trim(),
      department: String(department).trim(),
      category: String(category).trim(),
      priority: ['Urgent', 'Important', 'Normal'].includes(priority) ? priority : 'Normal',
      targetYear: String(targetYear).trim() || 'All Years',
      pinned: pinned === true || pinned === 'true',
      authorId: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      attachmentName: req.file ? req.file.originalname : null,
      attachmentUrl: req.file ? `/uploads/${req.file.filename}` : null,
      expiresAt: expiresAt || null,
      createdAt: now,
      updatedAt: now,
      views: 0,
      acknowledgedBy: [],
    };

    db.notices.unshift(newNotice);
    writeDb(db);
    return res.status(201).json({
      notice: {
        ...newNotice,
        acknowledgedCount: 0,
        isAcknowledged: false,
        isBookmarked: false,
      },
    });
  }
);

// Update notice
app.put(
  '/api/notices/:id',
  requireRoles('admin', 'faculty'),
  upload.single('attachment'),
  (req, res) => {
    const db = readDb();
    const idx = db.notices.findIndex((n) => n.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Notice not found.' });
    }

    const existing = db.notices[idx];
    if (
      req.user.role === 'faculty' &&
      existing.authorId !== req.user.id &&
      existing.department !== req.user.department
    ) {
      return res.status(403).json({ error: 'You can only edit notices from your department.' });
    }

    const {
      title,
      content,
      department,
      category,
      priority,
      targetYear,
      pinned,
      expiresAt,
      removeAttachment,
    } = req.body || {};

    if (
      req.user.role === 'faculty' &&
      department &&
      department !== req.user.department &&
      department !== 'General'
    ) {
      return res.status(403).json({
        error: `Faculty coordinators can only assign notices to ${req.user.department} or General.`,
      });
    }

    const updated = {
      ...existing,
      title: title !== undefined ? String(title).trim() : existing.title,
      content: content !== undefined ? String(content).trim() : existing.content,
      department: department !== undefined ? String(department).trim() : existing.department,
      category: category !== undefined ? String(category).trim() : existing.category,
      priority:
        priority && ['Urgent', 'Important', 'Normal'].includes(priority)
          ? priority
          : existing.priority,
      targetYear: targetYear !== undefined ? String(targetYear).trim() : existing.targetYear,
      pinned:
        pinned !== undefined ? pinned === true || pinned === 'true' : existing.pinned,
      expiresAt: expiresAt !== undefined ? expiresAt || null : existing.expiresAt,
      updatedAt: new Date().toISOString(),
    };

    if (req.file) {
      updated.attachmentName = req.file.originalname;
      updated.attachmentUrl = `/uploads/${req.file.filename}`;
    } else if (removeAttachment === 'true') {
      updated.attachmentName = null;
      updated.attachmentUrl = null;
    }

    db.notices[idx] = updated;
    writeDb(db);
    return res.json({
      notice: {
        ...updated,
        acknowledgedCount: (updated.acknowledgedBy || []).length,
        isAcknowledged: (updated.acknowledgedBy || []).includes(req.user.id),
        isBookmarked: (req.user.bookmarks || []).includes(updated.id),
      },
    });
  }
);

// Toggle pin
app.patch('/api/notices/:id/pin', requireRoles('admin', 'faculty'), (req, res) => {
  const db = readDb();
  const notice = db.notices.find((n) => n.id === req.params.id);
  if (!notice) {
    return res.status(404).json({ error: 'Notice not found.' });
  }
  if (
    req.user.role === 'faculty' &&
    notice.department !== req.user.department &&
    notice.authorId !== req.user.id
  ) {
    return res.status(403).json({ error: 'You can only pin notices from your department.' });
  }
  notice.pinned = !notice.pinned;
  notice.updatedAt = new Date().toISOString();
  writeDb(db);
  return res.json({ pinned: notice.pinned });
});

// Delete notice
app.delete('/api/notices/:id', requireRoles('admin', 'faculty'), (req, res) => {
  const db = readDb();
  const idx = db.notices.findIndex((n) => n.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Notice not found.' });
  }
  const existing = db.notices[idx];
  if (
    req.user.role === 'faculty' &&
    existing.department !== req.user.department &&
    existing.authorId !== req.user.id
  ) {
    return res.status(403).json({ error: 'You can only delete notices from your department.' });
  }
  db.notices.splice(idx, 1);
  for (const u of db.users) {
    if (Array.isArray(u.bookmarks)) {
      u.bookmarks = u.bookmarks.filter((bid) => bid !== existing.id);
    }
  }
  writeDb(db);
  return res.json({ deleted: true, id: existing.id });
});

// Acknowledge / Mark Read (any signed-in user)
app.post('/api/notices/:id/acknowledge', requireAuth, (req, res) => {
  const db = readDb();
  const notice = db.notices.find((n) => n.id === req.params.id);
  if (!notice) {
    return res.status(404).json({ error: 'Notice not found.' });
  }
  notice.acknowledgedBy = notice.acknowledgedBy || [];
  const idx = notice.acknowledgedBy.indexOf(req.user.id);
  let isAcknowledged = false;
  if (idx === -1) {
    notice.acknowledgedBy.push(req.user.id);
    isAcknowledged = true;
  } else {
    notice.acknowledgedBy.splice(idx, 1);
    isAcknowledged = false;
  }
  writeDb(db);
  return res.json({
    isAcknowledged,
    acknowledgedCount: notice.acknowledgedBy.length,
  });
});

// Toggle bookmark (any signed-in user)
app.post('/api/notices/:id/bookmark', requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.user.id);
  const notice = db.notices.find((n) => n.id === req.params.id);
  if (!user || !notice) {
    return res.status(404).json({ error: 'Notice or user not found.' });
  }
  user.bookmarks = user.bookmarks || [];
  const idx = user.bookmarks.indexOf(notice.id);
  let isBookmarked = false;
  if (idx === -1) {
    user.bookmarks.push(notice.id);
    isBookmarked = true;
  } else {
    user.bookmarks.splice(idx, 1);
    isBookmarked = false;
  }
  writeDb(db);
  return res.json({ isBookmarked, bookmarks: user.bookmarks });
});

// Multer & API error handler
app.use((err, _req, res, _next) => {
  if (err) {
    return res.status(400).json({ error: err.message || 'Request failed.' });
  }
  return res.status(500).json({ error: 'Internal server error.' });
});

// Serve React frontend in production (or whenever dist exists)
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`ABESEC Digital Notice Board server running on http://localhost:${PORT}`);
});
