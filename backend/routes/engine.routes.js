const express = require('express');
const router = express.Router();
const { getPool, calculateGrade } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// 1. GET /api/engine/cgpa - Current official CGPA & academic standing
router.get('/cgpa', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    // Fetch user profile
    const [userRows] = await pool.query('SELECT target_cgpa FROM users WHERE id = ?', [userId]);
    const targetCgpa = userRows.length > 0 ? parseFloat(userRows[0].target_cgpa) : 3.80;

    // Fetch all semesters
    const [semesters] = await pool.query(
      'SELECT * FROM semesters WHERE user_id = ? ORDER BY term_order ASC',
      [userId]
    );

    // Fetch all completed courses
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE user_id = ? ORDER BY id ASC',
      [userId]
    );

    let totalPoints = 0;
    let completedCredits = 0;
    let attemptedCredits = 0;
    let passedCredits = 0;

    const semesterBreakdown = semesters.map(sem => {
      const semCourses = courses.filter(c => c.semester_id === sem.id);
      let semPoints = 0;
      let semCredits = 0;

      semCourses.forEach(c => {
        const credit = parseFloat(c.credits) || 0;
        attemptedCredits += credit;
        if (c.grade_point !== null && c.grade_point !== undefined) {
          const gp = parseFloat(c.grade_point);
          semPoints += gp * credit;
          semCredits += credit;
          totalPoints += gp * credit;
          completedCredits += credit;
          if (gp > 0) passedCredits += credit;
        }
      });

      const sgpa = semCredits > 0 ? parseFloat((semPoints / semCredits).toFixed(2)) : null;
      return {
        semester_id: sem.id,
        name: sem.name,
        sgpa,
        credits: semCredits,
        is_completed: Boolean(sem.is_completed),
        course_count: semCourses.length
      };
    });

    const cgpa = completedCredits > 0 ? parseFloat((totalPoints / completedCredits).toFixed(2)) : 0.00;

    // Academic Standing classification
    let standing = 'Good Standing';
    let standingColor = 'emerald';
    if (cgpa >= 3.75) {
      standing = 'Distinction (First Class)';
      standingColor = 'emerald';
    } else if (cgpa >= 3.00) {
      standing = 'Good Standing';
      standingColor = 'sky';
    } else if (cgpa >= 2.50) {
      standing = 'Satisfactory';
      standingColor = 'amber';
    } else if (completedCredits > 0) {
      standing = 'Academic Warning (Probation Risk)';
      standingColor = 'rose';
    }

    // Update completed_credits on user record
    await pool.query('UPDATE users SET completed_credits = ? WHERE id = ?', [completedCredits, userId]);

    return res.json({
      cgpa,
      target_cgpa: targetCgpa,
      completed_credits: completedCredits,
      attempted_credits: attemptedCredits,
      passed_credits: passedCredits,
      total_degree_credits: 140.0,
      completion_percentage: parseFloat(((completedCredits / 140.0) * 100).toFixed(1)),
      standing,
      standingColor,
      semester_breakdown: semesterBreakdown
    });
  } catch (error) {
    console.error('CGPA calculation error:', error);
    return res.status(500).json({ error: 'Server error computing CGPA.' });
  }
});

// 2. POST /api/engine/target-predict - CGPA Target Predictor Formula
// Formula: Required GPA = [ Target * (Cd + Cn) - (Current_CGPA * Cd) ] / Cn
router.post('/target-predict', authenticateToken, async (req, res) => {
  try {
    const { target_cgpa, remaining_credits, total_semesters_left, custom_current_cgpa, custom_completed_credits } = req.body;
    const pool = getPool();

    let totalPoints = 0;
    let completedCredits = 0;
    let currentCGPA = 0;

    if (custom_current_cgpa !== undefined && custom_current_cgpa !== null && custom_current_cgpa !== '') {
      currentCGPA = parseFloat(custom_current_cgpa);
      completedCredits = (custom_completed_credits !== undefined && custom_completed_credits !== null && custom_completed_credits !== '') 
        ? parseFloat(custom_completed_credits) 
        : 36.0;
      totalPoints = currentCGPA * completedCredits;
    } else {
      // Get current CGPA and completed credits from DB
      const [courses] = await pool.query(
        'SELECT credits, grade_point FROM courses WHERE user_id = ? AND grade_point IS NOT NULL',
        [req.user.id]
      );

      courses.forEach(c => {
        const cr = parseFloat(c.credits);
        const gp = parseFloat(c.grade_point);
        totalPoints += cr * gp;
        completedCredits += cr;
      });

      currentCGPA = completedCredits > 0 ? totalPoints / completedCredits : 0;
    }
    const target = target_cgpa ? parseFloat(target_cgpa) : 3.80;
    const remCredits = remaining_credits ? parseFloat(remaining_credits) : Math.max(140 - completedCredits, 18);
    const semsLeft = total_semesters_left ? parseInt(total_semesters_left, 10) : 5;

    const totalCredits = completedCredits + remCredits;
    const requiredTotalPoints = target * totalCredits;
    const pointsNeeded = requiredTotalPoints - totalPoints;
    const requiredGPA = remCredits > 0 ? pointsNeeded / remCredits : 0;

    let status = 'Achievable';
    let message = '';
    let feasible = true;

    if (requiredGPA > 4.00) {
      status = 'Mathematically Unreachable';
      feasible = false;
      message = `To achieve a ${target.toFixed(2)} CGPA, you would need an average GPA of ${requiredGPA.toFixed(2)}, which exceeds the maximum possible 4.00 scale. Consider retaking low-grade courses or adjusting your target to ${( (totalPoints + 4.00 * remCredits) / totalCredits ).toFixed(2)}.`;
    } else if (requiredGPA >= 3.75) {
      status = 'High Target (Requires A / A+)';
      message = `You need an average of ${requiredGPA.toFixed(2)} in remaining ${remCredits} credits. Maintain consistent A and A+ grades.`;
    } else if (requiredGPA >= 3.00) {
      status = 'Moderately Achievable';
      message = `You need an average GPA of ${requiredGPA.toFixed(2)} in remaining credits. Steady performance will achieve your target.`;
    } else if (requiredGPA <= 0) {
      status = 'Target Already Exceeded';
      message = `Your current performance already exceeds your target CGPA of ${target.toFixed(2)}!`;
    } else {
      status = 'Easily Achievable';
      message = `You need an average GPA of only ${requiredGPA.toFixed(2)} to reach your goal.`;
    }

    // Recommended plan per remaining semester
    const creditsPerSem = (remCredits / Math.max(semsLeft, 1)).toFixed(1);
    const semesterPlan = [];
    for (let i = 1; i <= semsLeft; i++) {
      semesterPlan.push({
        semester_index: i,
        name: `Upcoming Term ${i}`,
        estimated_credits: parseFloat(creditsPerSem),
        recommended_gpa: Math.min(Math.max(parseFloat(requiredGPA.toFixed(2)), 2.00), 4.00)
      });
    }

    return res.json({
      current_cgpa: parseFloat(currentCGPA.toFixed(2)),
      target_cgpa: target,
      completed_credits: completedCredits,
      remaining_credits: remCredits,
      required_gpa: parseFloat(requiredGPA.toFixed(2)),
      max_possible_cgpa: parseFloat(((totalPoints + 4.00 * remCredits) / totalCredits).toFixed(2)),
      feasible,
      status,
      message,
      semester_plan: semesterPlan
    });
  } catch (error) {
    console.error('Target predict error:', error);
    return res.status(500).json({ error: 'Server error predicting target CGPA.' });
  }
});

// 3. POST /api/engine/whatif - What-If Simulator
router.post('/whatif', authenticateToken, async (req, res) => {
  try {
    const { simulated_courses } = req.body;
    if (!Array.isArray(simulated_courses)) {
      return res.status(400).json({ error: 'simulated_courses must be an array.' });
    }

    const pool = getPool();
    const [existingCourses] = await pool.query(
      'SELECT credits, grade_point FROM courses WHERE user_id = ? AND grade_point IS NOT NULL',
      [req.user.id]
    );

    let curPoints = 0;
    let curCredits = 0;
    existingCourses.forEach(c => {
      const cr = parseFloat(c.credits);
      const gp = parseFloat(c.grade_point);
      curPoints += cr * gp;
      curCredits += cr;
    });

    const currentCGPA = curCredits > 0 ? curPoints / curCredits : 0;

    let simPoints = 0;
    let simCredits = 0;

    simulated_courses.forEach(sc => {
      const cr = parseFloat(sc.credits) || 3.0;
      let gp = parseFloat(sc.grade_point);
      if (isNaN(gp) && sc.marks) {
        gp = calculateGrade(sc.marks).grade_point || 0;
      }
      simPoints += (gp || 0) * cr;
      simCredits += cr;
    });

    const newTotalPoints = curPoints + simPoints;
    const newTotalCredits = curCredits + simCredits;
    const projectedCGPA = newTotalCredits > 0 ? newTotalPoints / newTotalCredits : 0;
    const simulatedTermSGPA = simCredits > 0 ? simPoints / simCredits : 0;
    const diff = projectedCGPA - currentCGPA;

    return res.json({
      current_cgpa: parseFloat(currentCGPA.toFixed(2)),
      projected_cgpa: parseFloat(projectedCGPA.toFixed(2)),
      simulated_term_sgpa: parseFloat(simulatedTermSGPA.toFixed(2)),
      cgpa_delta: parseFloat(diff.toFixed(2)),
      is_positive: diff >= 0,
      total_credits_after: newTotalCredits,
      courses_evaluated: simulated_courses.length
    });
  } catch (error) {
    console.error('What-if error:', error);
    return res.status(500).json({ error: 'Server error running what-if simulation.' });
  }
});

// 4. GET /api/engine/retake-planner - Retake Impact & Ranking
// Impact formula: credit * (new_gp - old_gp) / total_credits
router.get('/retake-planner', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [courses] = await pool.query(`
      SELECT c.*, s.name as semester_name
      FROM courses c
      JOIN semesters s ON c.semester_id = s.id
      WHERE c.user_id = ? AND c.grade_point IS NOT NULL
      ORDER BY c.grade_point ASC
    `, [req.user.id]);

    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach(c => {
      const cr = parseFloat(c.credits);
      const gp = parseFloat(c.grade_point);
      totalPoints += cr * gp;
      totalCredits += cr;
    });

    const currentCGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

    // Filter courses eligible for retake (grade < A or grade_point <= 3.25)
    const retakeCandidates = courses
      .filter(c => parseFloat(c.grade_point) <= 3.25)
      .map(c => {
        const cr = parseFloat(c.credits);
        const oldGp = parseFloat(c.grade_point);

        // Calculate potential gain if retaken to A+ (4.00)
        const maxNewGp = 4.00;
        const potentialBoost = totalCredits > 0 ? (cr * (maxNewGp - oldGp)) / totalCredits : 0;
        const newProjectedCGPA = currentCGPA + potentialBoost;

        // Calculate potential gain if retaken to A (3.75)
        const aBoost = totalCredits > 0 ? (cr * (3.75 - oldGp)) / totalCredits : 0;

        return {
          course_id: c.id,
          code: c.code,
          title: c.title,
          semester_name: c.semester_name,
          credits: cr,
          current_grade: c.grade,
          current_grade_point: oldGp,
          marks: c.marks,
          potential_boost_to_aplus: parseFloat(potentialBoost.toFixed(3)),
          potential_boost_to_a: parseFloat(aBoost.toFixed(3)),
          projected_cgpa_if_aplus: parseFloat(newProjectedCGPA.toFixed(2)),
          recommendation: oldGp < 2.50 ? 'High Priority Retake' : (oldGp <= 3.00 ? 'Moderate Value' : 'Optional Upgrade')
        };
      })
      .sort((a, b) => b.potential_boost_to_aplus - a.potential_boost_to_aplus);

    return res.json({
      current_cgpa: parseFloat(currentCGPA.toFixed(2)),
      total_credits: totalCredits,
      retake_candidates_count: retakeCandidates.length,
      retake_candidates: retakeCandidates
    });
  } catch (error) {
    console.error('Retake planner error:', error);
    return res.status(500).json({ error: 'Server error computing retake planner.' });
  }
});

// 5. POST /api/engine/final-marks - Final Marks Calculator
router.post('/final-marks', (req, res) => {
  try {
    const { continuous_marks, continuous_total, target_grade, final_total } = req.body;

    const earnedContinuous = parseFloat(continuous_marks) || 0;
    const maxContinuous = parseFloat(continuous_total) || 40;
    const maxFinal = parseFloat(final_total) || 60;
    const gradeTarget = target_grade || 'A+';

    // Grade mark cutoffs out of 100
    const cutoffs = {
      'A+': 80,
      'A': 75,
      'A-': 70,
      'B+': 65,
      'B': 60,
      'B-': 55,
      'C+': 50,
      'C': 45,
      'D': 40
    };

    const targetTotal = cutoffs[gradeTarget] || 80;
    const totalScale = maxContinuous + maxFinal;
    const scaledTarget = (targetTotal / 100) * totalScale;
    const marksNeededInFinal = scaledTarget - earnedContinuous;

    const percentageNeededInFinal = maxFinal > 0 ? (marksNeededInFinal / maxFinal) * 100 : 0;
    let achievable = true;
    let feedback = '';

    if (marksNeededInFinal > maxFinal) {
      achievable = false;
      feedback = `Target ${gradeTarget} is unreachable because you need ${marksNeededInFinal.toFixed(1)} marks, which exceeds the final exam total of ${maxFinal}. Try aiming for a lower grade.`;
    } else if (marksNeededInFinal <= 0) {
      feedback = `Congratulations! You have already secured enough continuous marks for ${gradeTarget}! Just attend the exam to pass.`;
    } else {
      feedback = `You need ${marksNeededInFinal.toFixed(1)} out of ${maxFinal} marks (${percentageNeededInFinal.toFixed(1)}%) in the final exam to secure an ${gradeTarget}.`;
    }

    return res.json({
      earned_continuous: earnedContinuous,
      max_continuous: maxContinuous,
      max_final: maxFinal,
      target_grade: gradeTarget,
      target_total_needed: scaledTarget,
      marks_needed_in_final: Math.max(parseFloat(marksNeededInFinal.toFixed(1)), 0),
      percentage_needed: parseFloat(percentageNeededInFinal.toFixed(1)),
      achievable,
      feedback
    });
  } catch (error) {
    console.error('Final marks calculator error:', error);
    return res.status(500).json({ error: 'Server error computing final marks.' });
  }
});

// 6. GET /api/engine/attendance - Safe-Bunk Calculator
// Formula: Safe skips = floor(Attended / Min_ratio - Held)
// If debarred: Needed consecutive classes = ceil( (Min_ratio * Held - Attended) / (1 - Min_ratio) )
router.get('/attendance', authenticateToken, async (req, res) => {
  try {
    const minRatio = parseFloat(req.query.min_ratio) || 0.75; // default 75%
    const pool = getPool();

    const [courses] = await pool.query(`
      SELECT c.id, c.code, c.title, c.attendance_held, c.attendance_attended, s.name as semester_name
      FROM courses c
      JOIN semesters s ON c.semester_id = s.id
      WHERE c.user_id = ?
      ORDER BY s.term_order DESC, c.id ASC
    `, [req.user.id]);

    const report = courses.map(c => {
      const held = parseInt(c.attendance_held, 10) || 0;
      const attended = parseInt(c.attendance_attended, 10) || 0;
      const percentage = held > 0 ? parseFloat(((attended / held) * 100).toFixed(1)) : 100;

      let safeBunks = 0;
      let recoverClassesNeeded = 0;
      let status = 'SAFE';

      if (held === 0) {
        status = 'SAFE';
      } else if (percentage >= minRatio * 100) {
        safeBunks = Math.floor(attended / minRatio - held);
        if (safeBunks <= 1) {
          status = 'WARNING';
        } else {
          status = 'SAFE';
        }
      } else {
        status = 'CRITICAL';
        // Formula for consecutive classes needed
        recoverClassesNeeded = Math.ceil((minRatio * held - attended) / (1 - minRatio));
      }

      return {
        course_id: c.id,
        code: c.code,
        title: c.title,
        semester_name: c.semester_name,
        held,
        attended,
        missed: Math.max(held - attended, 0),
        percentage,
        min_required_percentage: minRatio * 100,
        safe_bunks_allowed: Math.max(safeBunks, 0),
        classes_needed_to_recover: Math.max(recoverClassesNeeded, 0),
        status
      };
    });

    const safeCount = report.filter(r => r.status === 'SAFE').length;
    const warningCount = report.filter(r => r.status === 'WARNING').length;
    const criticalCount = report.filter(r => r.status === 'CRITICAL').length;

    return res.json({
      courses: report,
      summary: {
        total_courses: report.length,
        safe_count: safeCount,
        warning_count: warningCount,
        critical_count: criticalCount,
        overall_status: criticalCount > 0 ? 'CRITICAL_RISK' : (warningCount > 0 ? 'NEEDS_ATTENTION' : 'GOOD_ATTENDANCE')
      }
    });
  } catch (error) {
    console.error('Attendance calculator error:', error);
    return res.status(500).json({ error: 'Server error computing attendance.' });
  }
});

module.exports = router;
