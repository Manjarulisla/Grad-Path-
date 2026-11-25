const express = require('express');
const router = express.Router();
const { getPool, calculateGrade } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/semesters - get all semesters with courses and calculated SGPA
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [semesters] = await pool.query(
      'SELECT * FROM semesters WHERE user_id = ? ORDER BY term_order ASC, id ASC',
      [userId]
    );

    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE user_id = ? ORDER BY id ASC',
      [userId]
    );

    const semestersWithCourses = semesters.map(sem => {
      const semCourses = courses.filter(c => c.semester_id === sem.id);
      
      let totalPoints = 0;
      let totalCredits = 0;
      let earnedCredits = 0;

      semCourses.forEach(c => {
        const credit = parseFloat(c.credits) || 0;
        if (c.grade_point !== null && c.grade_point !== undefined) {
          const gp = parseFloat(c.grade_point);
          totalPoints += gp * credit;
          totalCredits += credit;
          if (gp > 0) {
            earnedCredits += credit;
          }
        }
      });

      const sgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : null;

      return {
        ...sem,
        courses: semCourses,
        sgpa,
        total_credits: totalCredits,
        earned_credits: earnedCredits,
        course_count: semCourses.length
      };
    });

    return res.json({ semesters: semestersWithCourses });
  } catch (error) {
    console.error('Fetch semesters error:', error);
    return res.status(500).json({ error: 'Server error fetching semesters.' });
  }
});

// POST /api/semesters - create semester
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, term_order, is_completed } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Semester name is required.' });
    }

    const pool = getPool();
    const [result] = await pool.query(`
      INSERT INTO semesters (user_id, name, term_order, is_completed)
      VALUES (?, ?, ?, ?)
    `, [
      req.user.id,
      name.trim(),
      term_order ? parseInt(term_order, 10) : 1,
      is_completed ? 1 : 0
    ]);

    const [newSem] = await pool.query('SELECT * FROM semesters WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      message: 'Semester created successfully.',
      semester: { ...newSem[0], courses: [], sgpa: null, total_credits: 0 }
    });
  } catch (error) {
    console.error('Create semester error:', error);
    return res.status(500).json({ error: 'Server error creating semester.' });
  }
});

// PUT /api/semesters/:id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const semId = req.params.id;
    const { name, term_order, is_completed } = req.body;
    const pool = getPool();

    await pool.query(`
      UPDATE semesters 
      SET name = COALESCE(?, name), term_order = COALESCE(?, term_order), is_completed = COALESCE(?, is_completed)
      WHERE id = ? AND user_id = ?
    `, [name, term_order, is_completed, semId, req.user.id]);

    const [updated] = await pool.query('SELECT * FROM semesters WHERE id = ?', [semId]);
    return res.json({ message: 'Semester updated.', semester: updated[0] });
  } catch (error) {
    console.error('Update semester error:', error);
    return res.status(500).json({ error: 'Server error updating semester.' });
  }
});

// DELETE /api/semesters/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const semId = req.params.id;
    const pool = getPool();

    await pool.query('DELETE FROM semesters WHERE id = ? AND user_id = ?', [semId, req.user.id]);
    return res.json({ message: 'Semester deleted successfully.' });
  } catch (error) {
    console.error('Delete semester error:', error);
    return res.status(500).json({ error: 'Server error deleting semester.' });
  }
});

module.exports = router;
