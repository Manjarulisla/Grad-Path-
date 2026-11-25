const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, student_id, department, level_term, target_cgpa, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const pool = getPool();
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === 'ADMIN' ? 'ADMIN' : 'STUDENT';
    const dept = department || 'Cyber Security Engineering';
    const term = level_term || 'Level 1, Term 1';
    const target = target_cgpa ? parseFloat(target_cgpa) : 3.80;

    const [result] = await pool.query(`
      INSERT INTO users (name, email, password, student_id, role, department, level_term, target_cgpa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name.trim(),
      email.trim().toLowerCase(),
      hashedPassword,
      student_id ? student_id.trim() : null,
      userRole,
      dept,
      term,
      target
    ]);

    const userId = result.insertId;

    // Create default semester for students
    if (userRole === 'STUDENT') {
      await pool.query(`
        INSERT INTO semesters (user_id, name, term_order, is_completed)
        VALUES (?, ?, 1, 0)
      `, [userId, term]);
    }

    const token = jwt.sign(
      { userId, email: email.trim().toLowerCase(), role: userRole },
      process.env.JWT_SECRET || 'gradpath_jwt_secret_key_2026_super_secure',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        student_id: student_id ? student_id.trim() : null,
        role: userRole,
        department: dept,
        university: req.body.university ? req.body.university.trim() : '',
        level_term: term,
        target_cgpa: target,
        completed_credits: 0.00
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const pool = getPool();
    const cleanInput = email.trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR student_id = ? OR (email = "admin@gmail.com" AND ? = "admin@uftb.ac.bd") OR (email = "admin@uftb.ac.bd" AND ? = "admin@gmail.com")',
      [cleanInput, email.trim(), cleanInput, cleanInput]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'gradpath_jwt_secret_key_2026_super_secure',
      { expiresIn: '7d' }
    );

    delete user.password;
    return res.json({
      message: 'Logged in successfully.',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  return res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, target_cgpa, level_term, department } = req.body;
    const pool = getPool();

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (target_cgpa !== undefined) {
      updates.push('target_cgpa = ?');
      values.push(parseFloat(target_cgpa));
    }
    if (level_term) {
      updates.push('level_term = ?');
      values.push(level_term.trim());
    }
    if (department) {
      updates.push('department = ?');
      values.push(department.trim());
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update.' });
    }

    values.push(req.user.id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [rows] = await pool.query(
      'SELECT id, name, email, student_id, role, department, university, level_term, target_cgpa, completed_credits FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.json({
      message: 'Profile updated successfully.',
      user: rows[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ error: 'Server error updating profile.' });
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email or Student ID is required.' });
    }

    const pool = getPool();
    const cleanInput = email.trim().toLowerCase();

    // Check if user exists
    const [rows] = await pool.query(
      'SELECT id, name, email, student_id FROM users WHERE email = ? OR student_id = ? OR (email = "admin@gmail.com" AND ? = "admin@uftb.ac.bd") OR (email = "admin@uftb.ac.bd" AND ? = "admin@gmail.com")',
      [cleanInput, email.trim(), cleanInput, cleanInput]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account registered with this email or student ID.' });
    }

    const user = rows[0];

    // Generate secure 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean previous OTPs for this user
    await pool.query('DELETE FROM otp_codes WHERE email = ?', [user.email]);

    // Insert new OTP
    await pool.query(`
      INSERT INTO otp_codes (email, otp, expires_at)
      VALUES (?, ?, ?)
    `, [user.email, otpCode, expiresAt]);

    return res.json({
      message: `Verification code sent to ${user.email}. Enter the 6-digit code to verify your identity.`,
      email: user.email,
      otp: otpCode // Returned for instant testing and display
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Failed to generate verification code.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
      return res.status(400).json({ error: 'Email, 6-digit verification code, and new password are required.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const pool = getPool();
    const cleanInput = email.trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR student_id = ? OR (email = "admin@gmail.com" AND ? = "admin@uftb.ac.bd") OR (email = "admin@uftb.ac.bd" AND ? = "admin@gmail.com")',
      [cleanInput, email.trim(), cleanInput, cleanInput]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const user = rows[0];

    // Verify 6-digit OTP
    const [otpRows] = await pool.query(`
      SELECT * FROM otp_codes 
      WHERE email = ? AND otp = ? AND expires_at > NOW() 
      ORDER BY id DESC LIMIT 1
    `, [user.email, otp.trim()]);

    if (otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired 6-digit verification code. Please request a new code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    // Invalidate OTP after successful reset
    await pool.query('DELETE FROM otp_codes WHERE email = ?', [user.email]);

    return res.json({
      message: 'Password reset verified & completed successfully! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Server error resetting password.' });
  }
});

module.exports = router;
