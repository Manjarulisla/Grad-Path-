const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// 1. GET /api/study/schedule - Smart Study Schedule & Priority Engine
// Priority Formula: (Credits * Difficulty) / DaysLeft
router.get('/schedule', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [tasks] = await pool.query(`
      SELECT sp.*, c.code as course_code, c.title as course_title, c.credits, c.difficulty
      FROM study_plans sp
      LEFT JOIN courses c ON sp.course_id = c.id
      WHERE sp.user_id = ?
      ORDER BY sp.priority_score DESC, sp.days_left ASC
    `, [userId]);

    // Recalculate priority scores dynamically based on credits, difficulty, days_left
    let totalScore = 0;
    const computedTasks = tasks.map(t => {
      const credits = parseFloat(t.credits) || 3.0;
      const diff = parseInt(t.difficulty, 10) || 3;
      const days = Math.max(parseInt(t.days_left, 10) || 1, 1);
      
      const priorityScore = parseFloat(((credits * diff) / days).toFixed(2));
      totalScore += priorityScore;

      return {
        ...t,
        computed_priority: priorityScore,
      };
    });

    // Allocate weekly available hours (default 24 study hours per week)
    const weeklyHours = 24.0;
    const prioritizedTasks = computedTasks.map(t => {
      const share = totalScore > 0 ? (t.computed_priority / totalScore) * weeklyHours : 4.0;
      return {
        ...t,
        recommended_weekly_hours: parseFloat(Math.max(share, 1.0).toFixed(1)),
        urgency: t.days_left <= 3 ? 'URGENT' : (t.days_left <= 7 ? 'HIGH' : 'NORMAL')
      };
    });

    return res.json({
      tasks: prioritizedTasks,
      total_score: parseFloat(totalScore.toFixed(2)),
      weekly_budget_hours: weeklyHours
    });
  } catch (error) {
    console.error('Study schedule error:', error);
    return res.status(500).json({ error: 'Server error generating study schedule.' });
  }
});

// 2. POST /api/study/tasks - Create new study task
router.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { course_id, title, allocated_hours, days_left, exam_date, notes } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const pool = getPool();
    const [result] = await pool.query(`
      INSERT INTO study_plans (user_id, course_id, title, allocated_hours, days_left, exam_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      course_id || null,
      title.trim(),
      allocated_hours ? parseFloat(allocated_hours) : 4.0,
      days_left ? parseInt(days_left, 10) : 7,
      exam_date || null,
      notes || null
    ]);

    const [newTask] = await pool.query('SELECT * FROM study_plans WHERE id = ?', [result.insertId]);
    return res.status(201).json({ message: 'Study plan created.', task: newTask[0] });
  } catch (error) {
    console.error('Create study plan error:', error);
    return res.status(500).json({ error: 'Server error creating study plan.' });
  }
});

// 3. PUT /api/study/tasks/:id - Update task or toggle status
router.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, allocated_hours, days_left, status, exam_date, notes } = req.body;
    const pool = getPool();

    await pool.query(`
      UPDATE study_plans SET
        title = COALESCE(?, title),
        allocated_hours = COALESCE(?, allocated_hours),
        days_left = COALESCE(?, days_left),
        status = COALESCE(?, status),
        exam_date = COALESCE(?, exam_date),
        notes = COALESCE(?, notes)
      WHERE id = ? AND user_id = ?
    `, [
      title ? title.trim() : null,
      allocated_hours ? parseFloat(allocated_hours) : null,
      days_left ? parseInt(days_left, 10) : null,
      status || null,
      exam_date || null,
      notes || null,
      taskId,
      req.user.id
    ]);

    const [updated] = await pool.query('SELECT * FROM study_plans WHERE id = ?', [taskId]);
    return res.json({ message: 'Study plan updated.', task: updated[0] });
  } catch (error) {
    console.error('Update study task error:', error);
    return res.status(500).json({ error: 'Server error updating study task.' });
  }
});

// 4. DELETE /api/study/tasks/:id
router.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const taskId = req.params.id;
    const pool = getPool();
    await pool.query('DELETE FROM study_plans WHERE id = ? AND user_id = ?', [taskId, req.user.id]);
    return res.json({ message: 'Study plan deleted.' });
  } catch (error) {
    console.error('Delete study plan error:', error);
    return res.status(500).json({ error: 'Server error deleting study plan.' });
  }
});

// 5. POST /api/study/pomodoro - Log completed focus session
router.post('/pomodoro', authenticateToken, async (req, res) => {
  try {
    const { course_id, session_type, duration_minutes, topic } = req.body;
    const pool = getPool();

    const [result] = await pool.query(`
      INSERT INTO pomodoro_logs (user_id, course_id, session_type, duration_minutes, topic)
      VALUES (?, ?, ?, ?, ?)
    `, [
      req.user.id,
      course_id || null,
      session_type || 'study',
      duration_minutes ? parseInt(duration_minutes, 10) : 25,
      topic || 'Focused Study'
    ]);

    return res.status(201).json({
      message: 'Focus session logged successfully!',
      log_id: result.insertId
    });
  } catch (error) {
    console.error('Log pomodoro error:', error);
    return res.status(500).json({ error: 'Server error saving focus session.' });
  }
});

// 6. GET /api/study/pomodoro/stats - Focus statistics
router.get('/pomodoro/stats', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [allLogs] = await pool.query(`
      SELECT pl.*, c.code as course_code 
      FROM pomodoro_logs pl
      LEFT JOIN courses c ON pl.course_id = c.id
      WHERE pl.user_id = ?
      ORDER BY pl.completed_at DESC
      LIMIT 20
    `, [userId]);

    const [totals] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN session_type = 'study' THEN 1 END) as total_sessions,
        COALESCE(SUM(CASE WHEN session_type = 'study' THEN duration_minutes ELSE 0 END), 0) as total_study_minutes,
        COUNT(CASE WHEN DATE(completed_at) = CURDATE() AND session_type = 'study' THEN 1 END) as today_sessions,
        COALESCE(SUM(CASE WHEN DATE(completed_at) = CURDATE() AND session_type = 'study' THEN duration_minutes ELSE 0 END), 0) as today_minutes
      FROM pomodoro_logs
      WHERE user_id = ?
    `, [userId]);

    return res.json({
      stats: totals[0],
      recent_logs: allLogs
    });
  } catch (error) {
    console.error('Pomodoro stats error:', error);
    return res.status(500).json({ error: 'Server error fetching pomodoro stats.' });
  }
});

module.exports = router;
