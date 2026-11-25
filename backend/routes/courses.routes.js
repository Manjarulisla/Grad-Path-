const express = require('express');
const router = express.Router();
const { getPool, calculateGrade } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [courses] = await pool.query(
      `SELECT c.*, s.name as semester_name 
       FROM courses c 
       JOIN semesters s ON c.semester_id = s.id 
       WHERE c.user_id = ? 
       ORDER BY s.term_order ASC, c.id ASC`,
      [req.user.id]
    );
    return res.json({ courses });
  } catch (error) {
    console.error('Fetch courses error:', error);
    return res.status(500).json({ error: 'Server error fetching courses.' });
  }
});

// POST /api/courses
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { semester_id, code, title, credits, marks, grade, grade_point, is_retake, attendance_held, attendance_attended, difficulty } = req.body;

    if (!semester_id || !code || !title) {
      return res.status(400).json({ error: 'Semester, Course code and title are required.' });
    }

    const pool = getPool();

    // Verify semester belongs to user
    const [sem] = await pool.query('SELECT id FROM semesters WHERE id = ? AND user_id = ?', [semester_id, req.user.id]);
    if (sem.length === 0) {
      return res.status(400).json({ error: 'Invalid semester selected.' });
    }

    let finalGrade = grade || null;
    let finalGP = grade_point !== undefined && grade_point !== null ? parseFloat(grade_point) : null;

    if (marks !== undefined && marks !== null && marks !== '') {
      const calc = calculateGrade(marks);
      finalGrade = calc.grade;
      finalGP = calc.grade_point;
    }

    const [result] = await pool.query(`
      INSERT INTO courses (
        semester_id, user_id, code, title, credits, marks, grade, grade_point, 
        is_retake, attendance_held, attendance_attended, difficulty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      semester_id,
      req.user.id,
      code.trim().toUpperCase(),
      title.trim(),
      credits ? parseFloat(credits) : 3.0,
      marks !== undefined && marks !== '' ? parseFloat(marks) : null,
      finalGrade,
      finalGP,
      is_retake ? 1 : 0,
      attendance_held ? parseInt(attendance_held, 10) : 30,
      attendance_attended ? parseInt(attendance_attended, 10) : 26,
      difficulty ? parseInt(difficulty, 10) : 3
    ]);

    const [newCourse] = await pool.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      message: 'Course added successfully.',
      course: newCourse[0]
    });
  } catch (error) {
    console.error('Add course error:', error);
    return res.status(500).json({ error: 'Server error adding course.' });
  }
});

// PUT /api/courses/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { code, title, credits, marks, grade, grade_point, is_retake, attendance_held, attendance_attended, difficulty, semester_id } = req.body;

    const pool = getPool();

    let finalGrade = grade;
    let finalGP = grade_point;

    if (marks !== undefined && marks !== null && marks !== '') {
      const calc = calculateGrade(marks);
      finalGrade = calc.grade;
      finalGP = calc.grade_point;
    }

    await pool.query(`
      UPDATE courses SET
        code = COALESCE(?, code),
        title = COALESCE(?, title),
        credits = COALESCE(?, credits),
        marks = ?,
        grade = ?,
        grade_point = ?,
        is_retake = COALESCE(?, is_retake),
        attendance_held = COALESCE(?, attendance_held),
        attendance_attended = COALESCE(?, attendance_attended),
        difficulty = COALESCE(?, difficulty),
        semester_id = COALESCE(?, semester_id)
      WHERE id = ? AND user_id = ?
    `, [
      code ? code.trim().toUpperCase() : null,
      title ? title.trim() : null,
      credits ? parseFloat(credits) : null,
      marks !== undefined && marks !== '' ? parseFloat(marks) : null,
      finalGrade,
      finalGP,
      is_retake !== undefined ? (is_retake ? 1 : 0) : null,
      attendance_held !== undefined ? parseInt(attendance_held, 10) : null,
      attendance_attended !== undefined ? parseInt(attendance_attended, 10) : null,
      difficulty !== undefined ? parseInt(difficulty, 10) : null,
      semester_id || null,
      courseId,
      req.user.id
    ]);

    const [updated] = await pool.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    return res.json({ message: 'Course updated successfully.', course: updated[0] });
  } catch (error) {
    console.error('Update course error:', error);
    return res.status(500).json({ error: 'Server error updating course.' });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const pool = getPool();
    await pool.query('DELETE FROM courses WHERE id = ? AND user_id = ?', [courseId, req.user.id]);
    return res.json({ message: 'Course deleted successfully.' });
  } catch (error) {
    console.error('Delete course error:', error);
    return res.status(500).json({ error: 'Server error deleting course.' });
  }
});

module.exports = router;
