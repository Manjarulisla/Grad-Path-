const express = require('express');
const router = express.Router();
const { getPool, calculateGrade } = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/admin/overview
router.get('/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = getPool();

    // 1. All students
    const [students] = await pool.query(`
      SELECT id, name, email, student_id, department, university, level_term, target_cgpa, completed_credits, created_at
      FROM users
      WHERE role = 'STUDENT'
      ORDER BY id ASC
    `);

    // 2. Compute live CGPA for each student
    const [courses] = await pool.query('SELECT user_id, credits, grade_point FROM courses WHERE grade_point IS NOT NULL');

    const studentsWithCgpa = students.map(s => {
      const studentCourses = courses.filter(c => c.user_id === s.id);
      let totalPts = 0;
      let totalCr = 0;
      studentCourses.forEach(c => {
        const cr = parseFloat(c.credits);
        const gp = parseFloat(c.grade_point);
        totalPts += cr * gp;
        totalCr += cr;
      });
      const liveCgpa = totalCr > 0 ? parseFloat((totalPts / totalCr).toFixed(2)) : 0.00;
      return {
        ...s,
        live_cgpa: liveCgpa,
        live_credits: totalCr,
        courses_graded: studentCourses.length
      };
    });

    // 3. Dept stats
    const totalStudents = students.length;
    const totalDeptCourses = courses.length;
    const avgCgpa = totalStudents > 0
      ? parseFloat((studentsWithCgpa.reduce((acc, s) => acc + s.live_cgpa, 0) / totalStudents).toFixed(2))
      : 0.00;

    // 4. Attendance alerts across department
    const [lowAttendanceCourses] = await pool.query(`
      SELECT c.code, c.title, c.attendance_held, c.attendance_attended, u.name as student_name, u.student_id
      FROM courses c
      JOIN users u ON c.user_id = u.id
      WHERE c.attendance_held > 0 AND (c.attendance_attended / c.attendance_held) < 0.75
    `);

    return res.json({
      metrics: {
        total_students: totalStudents,
        total_graded_courses: totalDeptCourses,
        department_avg_cgpa: avgCgpa,
        debarred_alert_count: lowAttendanceCourses.length
      },
      students: studentsWithCgpa,
      attendance_alerts: lowAttendanceCourses
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({ error: 'Server error fetching admin overview.' });
  }
});

// GET /api/admin/student/:id
router.get('/student/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const studentId = req.params.id;
    const pool = getPool();

    const [userRows] = await pool.query(
      'SELECT id, name, email, student_id, department, university, level_term, target_cgpa FROM users WHERE id = ?',
      [studentId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    const [semesters] = await pool.query(
      'SELECT * FROM semesters WHERE user_id = ? ORDER BY term_order ASC',
      [studentId]
    );

    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE user_id = ? ORDER BY id ASC',
      [studentId]
    );

    return res.json({
      student: userRows[0],
      semesters,
      courses
    });
  } catch (error) {
    console.error('Admin fetch student error:', error);
    return res.status(500).json({ error: 'Server error fetching student details.' });
  }
});

module.exports = router;
