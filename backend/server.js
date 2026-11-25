const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const semesterRoutes = require('./routes/semesters.routes');
const courseRoutes = require('./routes/courses.routes');
const engineRoutes = require('./routes/engine.routes');
const studyRoutes = require('./routes/study.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'GradPath: Smart CGPA Planner & Academic Tracker API',
    institution: 'Academic Management System',
    department: 'Computer Science & Engineering',
    service: 'REST API Engine & CGPA Calculation Services',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/engine', engineRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 GradPath API is running on http://localhost:${PORT}`);
      console.log(`🏛️  GradPath Academic Management System`);
      console.log(`🛡️  REST API Engine & Authentication Service`);
      console.log(`💾 Database: MySQL (XAMPP 3306)`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal: Failed to initialize database or start server:', error);
    process.exit(1);
  }
}

startServer();
