const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token missing or invalid.' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'gradpath_jwt_secret_key_2026_super_secure'
    );

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, name, email, student_id, role, department, university, level_term, target_cgpa, completed_credits FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token expired or invalid.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
};
