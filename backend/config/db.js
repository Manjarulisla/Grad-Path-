const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gradpath_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;

async function initDB() {
  try {
    // 1. Connect without database to ensure database exists
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConnection.end();

    // 2. Create connection pool to the database
    pool = mysql.createPool(dbConfig);
    console.log(`[DB] Connected to MySQL database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);

    // 3. Create Tables
    await createTables();

    // 4. Seed initial data if empty
    await seedInitialData();

    return pool;
  } catch (error) {
    console.error('[DB] Connection error:', error.message);
    throw error;
  }
}

async function createTables() {
  const connection = await pool.getConnection();
  try {
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        student_id VARCHAR(50) DEFAULT NULL,
        role ENUM('STUDENT', 'ADMIN') DEFAULT 'STUDENT',
        department VARCHAR(150) DEFAULT 'Cyber Security Engineering',
        university VARCHAR(150) DEFAULT '',
        level_term VARCHAR(50) DEFAULT 'Level 2, Term 1',
        target_cgpa DECIMAL(3,2) DEFAULT 3.80,
        completed_credits DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Semesters table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS semesters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        term_order INT NOT NULL DEFAULT 1,
        is_completed TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Courses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        semester_id INT NOT NULL,
        user_id INT NOT NULL,
        code VARCHAR(30) NOT NULL,
        title VARCHAR(150) NOT NULL,
        credits DECIMAL(3,1) NOT NULL DEFAULT 3.0,
        marks DECIMAL(5,2) DEFAULT NULL,
        grade VARCHAR(5) DEFAULT NULL,
        grade_point DECIMAL(3,2) DEFAULT NULL,
        is_retake TINYINT(1) DEFAULT 0,
        attendance_held INT DEFAULT 30,
        attendance_attended INT DEFAULT 26,
        difficulty INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Study plans table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT DEFAULT NULL,
        title VARCHAR(200) NOT NULL,
        allocated_hours DECIMAL(4,1) DEFAULT 4.0,
        days_left INT DEFAULT 7,
        priority_score DECIMAL(5,2) DEFAULT 0.00,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        exam_date DATE DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Pomodoro Logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pomodoro_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT DEFAULT NULL,
        session_type ENUM('study', 'short_break', 'long_break') DEFAULT 'study',
        duration_minutes INT DEFAULT 25,
        topic VARCHAR(150) DEFAULT 'Focused Study',
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // OTP Codes table for verified password reset
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('[DB] Database tables verified & ready.');
  } finally {
    connection.release();
  }
}

// Bangladeshi 4.00 Grade Table
function calculateGrade(marks) {
  if (marks === null || marks === undefined) return { grade: null, grade_point: null };
  const m = parseFloat(marks);
  if (m >= 80) return { grade: 'A+', grade_point: 4.00 };
  if (m >= 75) return { grade: 'A',  grade_point: 3.75 };
  if (m >= 70) return { grade: 'A-', grade_point: 3.50 };
  if (m >= 65) return { grade: 'B+', grade_point: 3.25 };
  if (m >= 60) return { grade: 'B',  grade_point: 3.00 };
  if (m >= 55) return { grade: 'B-', grade_point: 2.75 };
  if (m >= 50) return { grade: 'C+', grade_point: 2.50 };
  if (m >= 45) return { grade: 'C',  grade_point: 2.25 };
  if (m >= 40) return { grade: 'D',  grade_point: 2.00 };
  return { grade: 'F', grade_point: 0.00 };
}

async function seedInitialData() {
  const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count > 0) {
    return; // Already seeded
  }

  console.log('[DB] Seeding demonstration users and academic records...');
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@12345', salt);
  const studentPassword = await bcrypt.hash('Student@12345', salt);

  // 1. Admin
  await pool.query(`
    INSERT INTO users (name, email, password, student_id, role, department, level_term)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    'Md. Abdullah (Instructor & Admin)',
    'admin@uftb.ac.bd',
    adminPassword,
    'EMP-CSE-102',
    'ADMIN',
    'Department of Cyber Security Engineering',
    'Faculty'
  ]);

  // 2. Student 1: Md. Mobinur Mustofa Kawsar
  const [student1Res] = await pool.query(`
    INSERT INTO users (name, email, password, student_id, role, department, level_term, target_cgpa, completed_credits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Md. Mobinur Mustofa Kawsar',
    '2404031@uftb.ac.bd',
    studentPassword,
    '2404031',
    'STUDENT',
    'Cyber Security Engineering',
    'Level 2, Term 1',
    3.80,
    25.0
  ]);
  const student1Id = student1Res.insertId;

  // 3. Student 2: Md. Manjarul Islam Tamim
  const [student2Res] = await pool.query(`
    INSERT INTO users (name, email, password, student_id, role, department, level_term, target_cgpa, completed_credits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Md. Manjarul Islam Tamim',
    '2404026@uftb.ac.bd',
    studentPassword,
    '2404026',
    'STUDENT',
    'Cyber Security Engineering',
    'Level 2, Term 1',
    3.75,
    25.0
  ]);
  const student2Id = student2Res.insertId;

  // Populate Student 1 Semesters & Courses
  // Semester 1: Level 1 Term 1
  const [sem1] = await pool.query(`
    INSERT INTO semesters (user_id, name, term_order, is_completed)
    VALUES (?, ?, 1, 1)
  `, [student1Id, 'Level 1, Term 1']);
  const s1Id = sem1.insertId;

  const s1Courses = [
    { code: 'CSE111', title: 'Structured Programming Language', credits: 3.0, marks: 84, held: 30, attended: 28, diff: 3 },
    { code: 'CSE112', title: 'Structured Programming Language Sessional', credits: 1.5, marks: 88, held: 14, attended: 14, diff: 2 },
    { code: 'MATH113', title: 'Differential and Integral Calculus', credits: 3.0, marks: 78, held: 30, attended: 27, diff: 4 },
    { code: 'PHY115', title: 'Physics: Waves, Optics & Thermodynamics', credits: 3.0, marks: 72, held: 30, attended: 25, diff: 3 },
    { code: 'HUM117', title: 'English Communication Skills', credits: 2.0, marks: 82, held: 22, attended: 20, diff: 2 }
  ];

  for (const c of s1Courses) {
    const { grade, grade_point } = calculateGrade(c.marks);
    await pool.query(`
      INSERT INTO courses (semester_id, user_id, code, title, credits, marks, grade, grade_point, attendance_held, attendance_attended, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [s1Id, student1Id, c.code, c.title, c.credits, c.marks, grade, grade_point, c.held, c.attended, c.diff]);
  }

  // Semester 2: Level 1 Term 2
  const [sem2] = await pool.query(`
    INSERT INTO semesters (user_id, name, term_order, is_completed)
    VALUES (?, ?, 2, 1)
  `, [student1Id, 'Level 1, Term 2']);
  const s2Id = sem2.insertId;

  const s2Courses = [
    { code: 'CSE121', title: 'Object Oriented Programming', credits: 3.0, marks: 86, held: 30, attended: 29, diff: 4 },
    { code: 'CSE122', title: 'Object Oriented Programming Sessional', credits: 1.5, marks: 80, held: 14, attended: 13, diff: 3 },
    { code: 'CSE123', title: 'Discrete Mathematics', credits: 3.0, marks: 68, held: 30, attended: 24, diff: 5 },
    { code: 'MATH125', title: 'Linear Algebra and Differential Equations', credits: 3.0, marks: 74, held: 30, attended: 26, diff: 4 },
    { code: 'EEE127', title: 'Basic Electrical Engineering', credits: 3.0, marks: 63, held: 30, attended: 25, diff: 3 }
  ];

  for (const c of s2Courses) {
    const { grade, grade_point } = calculateGrade(c.marks);
    await pool.query(`
      INSERT INTO courses (semester_id, user_id, code, title, credits, marks, grade, grade_point, attendance_held, attendance_attended, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [s2Id, student1Id, c.code, c.title, c.credits, c.marks, grade, grade_point, c.held, c.attended, c.diff]);
  }

  // Semester 3: Level 2 Term 1 (Current Active Semester)
  const [sem3] = await pool.query(`
    INSERT INTO semesters (user_id, name, term_order, is_completed)
    VALUES (?, ?, 3, 0)
  `, [student1Id, 'Level 2, Term 1']);
  const s3Id = sem3.insertId;

  const s3Courses = [
    { code: 'PROG212', title: 'Android and Web Application Development Sessional', credits: 2.0, marks: 38, held: 14, attended: 14, diff: 4 },
    { code: 'CSE211', title: 'Data Structures and Algorithms', credits: 3.0, marks: 34, held: 28, attended: 26, diff: 5 },
    { code: 'CSE213', title: 'Fundamentals of Cyber Security', credits: 3.0, marks: 37, held: 28, attended: 27, diff: 4 },
    { code: 'MATH215', title: 'Probability and Statistics for Engineers', credits: 3.0, marks: 31, held: 28, attended: 22, diff: 4 },
    { code: 'HUM217', title: 'Cyber Ethics, Intellectual Property and Law', credits: 2.0, marks: 36, held: 20, attended: 18, diff: 2 }
  ];

  const insertedCourses = [];
  for (const c of s3Courses) {
    // Current semester marks are continuous assessment out of 40 for now
    const [cRes] = await pool.query(`
      INSERT INTO courses (semester_id, user_id, code, title, credits, marks, grade, grade_point, attendance_held, attendance_attended, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)
    `, [s3Id, student1Id, c.code, c.title, c.credits, c.marks, c.held, c.attended, c.diff]);
    insertedCourses.push({ id: cRes.insertId, ...c });
  }

  // Study Plans for Student 1
  await pool.query(`
    INSERT INTO study_plans (user_id, course_id, title, allocated_hours, days_left, priority_score, status, exam_date, notes)
    VALUES 
    (?, ?, 'PROG212: Final Project Defense & Android Deployment', 6.0, 5, 4.80, 'in_progress', '2026-12-05', 'Complete GradPath with full MySQL integration and bilingual UI'),
    (?, ?, 'CSE211: Balanced BSTs & Graph Algorithms Revision', 8.0, 8, 4.60, 'pending', '2026-12-08', 'Practice Dijkstra, Bellman-Ford, and AVL tree rotations'),
    (?, ?, 'CSE213: Cryptography & Buffer Overflow Lab Defense', 5.0, 12, 3.80, 'pending', '2026-12-12', 'Review RSA, AES encryption modes, and stack canary mechanisms')
  `, [
    student1Id, insertedCourses[0].id,
    student1Id, insertedCourses[1].id,
    student1Id, insertedCourses[2].id
  ]);

  // Pomodoro Logs for Student 1
  await pool.query(`
    INSERT INTO pomodoro_logs (user_id, course_id, session_type, duration_minutes, topic)
    VALUES 
    (?, ?, 'study', 25, 'GradPath REST API Authentication Setup'),
    (?, ?, 'study', 25, 'CGPA Target Predictor Logic Verification'),
    (?, ?, 'short_break', 5, 'Quick hydration break'),
    (?, ?, 'study', 25, 'Safe-Bunk Formula & Attendance Component'),
    (?, ?, 'study', 25, 'Data Structures Heap & Priority Queue Problem Solving')
  `, [
    student1Id, insertedCourses[0].id,
    student1Id, insertedCourses[0].id,
    student1Id, null,
    student1Id, insertedCourses[0].id,
    student1Id, insertedCourses[1].id
  ]);

  // Populate Student 2 (Md. Manjarul Islam Tamim)
  const [s2Sem1] = await pool.query(`
    INSERT INTO semesters (user_id, name, term_order, is_completed)
    VALUES (?, 'Level 1, Term 1', 1, 1)
  `, [student2Id]);
  for (const c of s1Courses) {
    const { grade, grade_point } = calculateGrade(c.marks - 2);
    await pool.query(`
      INSERT INTO courses (semester_id, user_id, code, title, credits, marks, grade, grade_point, attendance_held, attendance_attended, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [s2Sem1.insertId, student2Id, c.code, c.title, c.credits, c.marks - 2, grade, grade_point, c.held, c.attended - 1, c.diff]);
  }

  const [s2Sem2] = await pool.query(`
    INSERT INTO semesters (user_id, name, term_order, is_completed)
    VALUES (?, 'Level 1, Term 2', 2, 1)
  `, [student2Id]);
  for (const c of s2Courses) {
    const { grade, grade_point } = calculateGrade(c.marks + 1);
    await pool.query(`
      INSERT INTO courses (semester_id, user_id, code, title, credits, marks, grade, grade_point, attendance_held, attendance_attended, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [s2Sem2.insertId, student2Id, c.code, c.title, c.credits, c.marks + 1, grade, grade_point, c.held, c.attended, c.diff]);
  }

  const [s2Sem3] = await pool.query(`
    INSERT INTO semesters (user_id, name, term_order, is_completed)
    VALUES (?, 'Level 2, Term 1', 3, 0)
  `, [student2Id]);
  for (const c of s3Courses) {
    await pool.query(`
      INSERT INTO courses (semester_id, user_id, code, title, credits, marks, grade, grade_point, attendance_held, attendance_attended, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?)
    `, [s2Sem3.insertId, student2Id, c.code, c.title, c.credits, c.marks, c.held, c.attended, c.diff]);
  }

  console.log('[DB] Seeding completed successfully!');
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDB() first.');
  }
  return pool;
}

module.exports = {
  initDB,
  getPool,
  calculateGrade,
};
