import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { User } from './models.js';

export async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ message: 'Account not found' });
    next();
  } catch { res.status(401).json({ message: 'Invalid or expired session' }); }
}

export const optionalAuth = async (req, _res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) try { req.user = await User.findById(jwt.verify(token, config.jwtSecret).id); } catch {}
  next();
};

export const permit = (...roles) => (req, res, next) => roles.includes(req.user?.role)
  ? next() : res.status(403).json({ message: 'Insufficient permission' });

export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

