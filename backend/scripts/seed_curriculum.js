const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seedRealCurriculum() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gradpath_db'
  });
  console.log('Connected to MySQL...');

  // Create otp_codes table if not exists
  await conn.query(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(150) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('otp_codes table verified.');

  const adminPass = await bcrypt.hash('Admin@12345', 10);
  const studentPass = await bcrypt.hash('Student@12345', 10);

  // 1. Update Admin (Md. Abdullah - Lecturer, CySE)
  await conn.query(`
    UPDATE users 
    SET name = 'Md. Abdullah (Lecturer & Faculty Admin)',
        email = 'mdabdullah0001@uftb.ac.bd',
        password = ?,
        student_id = 'EMP-CySE-002',
        role = 'ADMIN',
        department = 'Cyber Security Engineering',
        university = 'University of Frontier Technology, Bangladesh (UFTB)',
        level_term = 'Faculty'
    WHERE id = 1
  `, [adminPass]);

  // 2. Update Student 1 (Kawsar)
  await conn.query(`
    UPDATE users 
    SET name = 'Md. Mobinur Mustofa Kawsar',
        email = '2404031@uftb.ac.bd',
        password = ?,
        student_id = '2404031',
        role = 'STUDENT',
        department = 'Cyber Security Engineering',
        university = 'University of Frontier Technology, Bangladesh (UFTB)',
        level_term = 'Level 2, Term 1',
        target_cgpa = 3.80
    WHERE id = 2
  `, [studentPass]);

  // 3. Update Student 2 (Tamim)
  await conn.query(`
    UPDATE users 
    SET name = 'Md. Manjarul Islam Tamim',
        email = '2404026@uftb.ac.bd',
        password = ?,
        student_id = '2404026',
        role = 'STUDENT',
        department = 'Cyber Security Engineering',
        university = 'University of Frontier Technology, Bangladesh (UFTB)',
        level_term = 'Level 2, Term 1',
        target_cgpa = 3.75
    WHERE id = 3
  `, [studentPass]);

  // Clean old semesters and courses for Kawsar and Tamim
  await conn.query('DELETE FROM semesters WHERE user_id IN (2, 3)');

  // 2025-26 (L-1, T-1) Official Courses from Syllabus Image
  const l1t1_courses = [
    { code: 'CySE 111', title: 'Structured Programming Language', credits: 3.0, marks: 82, held: 28, attended: 27 },
    { code: 'CySE 112', title: 'Structured Programming Language Sessional', credits: 1.5, marks: 85, held: 14, attended: 14 },
    { code: 'CySE 113', title: 'Computer Networking', credits: 3.0, marks: 78, held: 28, attended: 26 },
    { code: 'CySE 114', title: 'Computer Networking Sessional', credits: 1.5, marks: 88, held: 14, attended: 14 },
    { code: 'CySE 115', title: 'Discrete Mathematics and Graph Theory', credits: 3.0, marks: 74, held: 28, attended: 25 },
    { code: 'CySE 117', title: 'Basic Principles of Cyber Security', credits: 3.0, marks: 84, held: 28, attended: 27 },
    { code: 'MATH 119', title: 'Engineering Mathematics', credits: 3.0, marks: 76, held: 28, attended: 24 },
    { code: 'CySE 110', title: 'Presentation Skills Development Sessional', credits: 1.5, marks: 85, held: 14, attended: 14 }
  ];

  // 2024-25 (L-2, T-1) Official Courses from Syllabus Image (Current Term)
  const l2t1_courses = [
    { code: 'CSE 201', title: 'Database Management System', credits: 3.0, held: 24, attended: 23 },
    { code: 'CSE 202', title: 'Database Management System Sessional', credits: 1.5, held: 12, attended: 12 },
    { code: 'CSE 203', title: 'Operating System and Unix Programming', credits: 3.0, held: 24, attended: 22 },
    { code: 'CSE 204', title: 'Operating System and Unix Programming Sessional', credits: 1.5, held: 12, attended: 12 },
    { code: 'PROG 211', title: 'Android and Web Application Development', credits: 3.0, held: 24, attended: 24 },
    { code: 'PROG 212', title: 'Android and Web Application Development Sessional', credits: 1.5, held: 12, attended: 12 },
    { code: 'SEC 203', title: 'Threat Modelling and Security Monitoring', credits: 3.0, held: 24, attended: 23 },
    { code: 'SEC 204', title: 'Threat Modelling and Security Monitoring Sessional', credits: 1.5, held: 12, attended: 12 },
    { code: 'MATH 217', title: 'Advanced Mathematics', credits: 3.0, held: 24, attended: 21 }
  ];

  function calcGP(m) {
    if (m >= 80) return { grade: 'A+', gp: 4.00 };
    if (m >= 75) return { grade: 'A',  gp: 3.75 };
    if (m >= 70) return { grade: 'A-', gp: 3.50 };
    if (m >= 65) return { grade: 'B+', gp: 3.25 };
    if (m >= 60) return { grade: 'B',  gp: 3.00 };
    return { grade: 'B-', gp: 2.75 };
  }

  for (const uid of [2, 3]) {
    // Semester 1: Level 1, Term 1 (Completed)
    const [s1] = await conn.query('INSERT INTO semesters (user_id, name, term_order, is_completed) VALUES (?, ?, 1, 1)', [uid, 'Level 1, Term 1']);
    let totalPts = 0;
    let totalCrs = 0;
    for (const c of l1t1_courses) {
      const g = calcGP(c.marks);
      totalPts += c.credits * g.gp;
      totalCrs += c.credits;
      await conn.query(`
        INSERT INTO courses (semester_id, user_id, code, title, credits, marks, grade, grade_point, is_retake, attendance_held, attendance_attended, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 3)
      `, [s1.insertId, uid, c.code, c.title, c.credits, c.marks, g.grade, g.gp, c.held, c.attended]);
    }

    // Semester 2: Level 2, Term 1 (Running)
    const [s2] = await conn.query('INSERT INTO semesters (user_id, name, term_order, is_completed) VALUES (?, ?, 2, 0)', [uid, 'Level 2, Term 1']);
    for (const c of l2t1_courses) {
      await conn.query(`
        INSERT INTO courses (semester_id, user_id, code, title, credits, is_retake, attendance_held, attendance_attended, difficulty)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?, 3)
      `, [s2.insertId, uid, c.code, c.title, c.credits, c.held, c.attended]);
    }

    // Update user completed credits
    await conn.query('UPDATE users SET completed_credits = ? WHERE id = ?', [totalCrs, uid]);
  }

  console.log('Real official curriculum successfully populated for Kawsar and Tamim!');
  await conn.end();
}

seedRealCurriculum().catch(console.error);
