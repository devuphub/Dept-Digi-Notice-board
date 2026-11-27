import jwt from 'jsonwebtoken';
import { readDb } from './store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'abesec-digi-notice-board-secret-2026';

export function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      department: user.department,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department,
    designation: user.designation || user.role,
    bookmarks: user.bookmarks || [],
  };
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = readDb();
    const user = db.users.find((u) => u.id === decoded.id);
    req.user = user || null;
  } catch {
    req.user = null;
  }
  return next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }
    return next();
  });
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'You do not have permission to perform this action.' });
      }
      return next();
    });
  };
}
