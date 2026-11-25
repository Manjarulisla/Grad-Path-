import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  GraduationCap, 
  Award, 
  Plus, 
  FileDown, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  BarChart3,
  Edit2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../api';

export default function Dashboard({ 
  user, 
  cgpaData, 
  semesters, 
  onRefresh, 
  onAddSemester, 
  onAddCourse, 
  onDeleteSemester, 
  onDeleteCourse,
  t, 
  lang 
}) {
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [isAddSemModal, setIsAddSemModal] = useState(false);
  const [isAddCourseModal, setIsAddCourseModal] = useState(false);
  const [isEditCourseModal, setIsEditCourseModal] = useState(false);
  const [selectedSemId, setSelectedSemId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form states for Add Semester
  const [newSemName, setNewSemName] = useState('');
  const [newSemOrder, setNewSemOrder] = useState('4');
  
  // Form states for Course
  const [cCode, setCCode] = useState('');
  const [cTitle, setCTitle] = useState('');
  const [cCredits, setCCredits] = useState('3.0');
  const [cMarks, setCMarks] = useState('');
  const [cAttendanceHeld, setCAttendanceHeld] = useState('30');
  const [cAttendanceAttended, setCAttendanceAttended] = useState('26');
  const [cDifficulty, setCDifficulty] = useState('3');

  const toggleExpand = (id) => {
    setExpandedSemesters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    if (!newSemName) return;
    await onAddSemester({ name: newSemName, term_order: parseInt(newSemOrder, 10), is_completed: 0 });
    setNewSemName('');
    setIsAddSemModal(false);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!selectedSemId || !cCode || !cTitle) return;
    await onAddCourse({
      semester_id: selectedSemId,
      code: cCode,
      title: cTitle,
      credits: parseFloat(cCredits),
      marks: cMarks !== '' ? parseFloat(cMarks) : null,
      attendance_held: parseInt(cAttendanceHeld, 10),
      attendance_attended: parseInt(cAttendanceAttended, 10),
      difficulty: parseInt(cDifficulty, 10)
    });
    setCCode('');
    setCTitle('');
    setCMarks('');
    setIsAddCourseModal(false);
  };

  const openEditCourse = (course) => {
    setEditingCourse(course);
    setCCode(course.code);
    setCTitle(course.title);
    setCCredits(course.credits.toString());
    setCMarks(course.marks !== null ? course.marks.toString() : '');
    setCAttendanceHeld(course.attendance_held.toString());
    setCAttendanceAttended(course.attendance_attended.toString());
    setCDifficulty(course.difficulty.toString());
    setIsEditCourseModal(true);
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      await api.updateCourse(editingCourse.id, {
        code: cCode,
        title: cTitle,
        credits: parseFloat(cCredits),
        marks: cMarks !== '' ? parseFloat(cMarks) : null,
        attendance_held: parseInt(cAttendanceHeld, 10),
        attendance_attended: parseInt(cAttendanceAttended, 10),
        difficulty: parseInt(cDifficulty, 10)
      });
      setIsEditCourseModal(false);
      setEditingCourse(null);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // Export Official PDF Academic Transcript
  const exportPDF = () => {
    try {
      const doc = new jsPDF();

      // 1. Official Seal / Header
      doc.setFontSize(15);
      doc.setTextColor(5, 150, 105); // Emerald-600
      doc.text("OFFICIAL ACADEMIC TRANSCRIPT & GRADE AUDIT", 14, 18);
      
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`Office of Academic Records • ${user.department || 'Department of Computer Science & Engineering'}`, 14, 25);
      doc.text("Cumulative Grade Point Average (CGPA) Audit Record", 14, 30);
      
      // Top border line
      doc.setDrawColor(5, 150, 105);
      doc.setLineWidth(0.8);
      doc.line(14, 34, 196, 34);

      // 2. Student Particulars Card
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`Student Name: ${user.name}`, 14, 41);
      doc.text(`Student ID: #${user.student_id || 'N/A'}`, 14, 46);
      doc.text(`Department: ${user.department || 'Computer Science & Engineering'}`, 14, 51);
      doc.text(`Level & Term: ${user.level_term}`, 14, 56);

      doc.text(`Cumulative CGPA: ${cgpaData?.cgpa?.toFixed(2) || '0.00'} / 4.00`, 125, 41);
      doc.text(`Target Graduation CGPA: ${cgpaData?.target_cgpa?.toFixed(2) || '3.80'}`, 125, 46);
      doc.text(`Completed Degree Credits: ${cgpaData?.completed_credits || '0.0'} / 140.0`, 125, 51);
      doc.text(`Standing: ${cgpaData?.standing || 'Good Standing'}`, 125, 56);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(14, 60, 196, 60);

      let startY = 66;

      // 3. Semesters and Courses Table
      semesters.forEach((sem) => {
        doc.setFontSize(10);
        doc.setTextColor(5, 150, 105);
        doc.text(`${sem.name}  |  SGPA: ${sem.sgpa !== null ? sem.sgpa.toFixed(2) : 'In Progress'}  |  Total Credits: ${sem.total_credits}`, 14, startY);

        const tableData = (sem.courses || []).map(c => [
          c.code,
          c.title,
          parseFloat(c.credits || 0).toFixed(1),
          c.marks !== null ? `${c.marks}` : 'In Progress',
          c.grade || '—',
          c.grade_point !== null ? parseFloat(c.grade_point).toFixed(2) : '—',
          `${c.attendance_attended || 0}/${c.attendance_held || 0} (${Math.round(((c.attendance_attended || 0) / (c.attendance_held || 1)) * 100)}%)`
        ]);

        autoTable(doc, {
          startY: startY + 3,
          head: [['Code', 'Course Title', 'Credit', 'Marks', 'Grade', 'GP', 'Attendance']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [5, 150, 105] },
          styles: { fontSize: 8 },
          margin: { left: 14, right: 14 }
        });

        startY = (doc.lastAutoTable?.finalY || startY) + 9;
        if (startY > 250) {
          doc.addPage();
          startY = 20;
        }
      });

      // 4. Grading System Note & Signature Block
      if (startY > 230) {
        doc.addPage();
        startY = 25;
      }

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Grading Scale: 80%+=4.00 (A+), 75-79%=3.75 (A), 70-74%=3.50 (A-), 65-69%=3.25 (B+), 60-64%=3.00 (B), <40%=0.00 (F)", 14, startY);

      startY += 18;
      doc.setDrawColor(148, 163, 184);
      doc.line(14, startY, 70, startY);
      doc.line(140, startY, 196, startY);

      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text("Dean / Head of Department", 14, startY + 5);
      doc.text("Controller of Examinations", 140, startY + 5);

      // Verification Footer
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Official Document ID: GRAD-${user.student_id || 'STU'}-${Date.now().toString().slice(-6)} • Issued: ${new Date().toLocaleDateString()}`, 14, 287);

      const filename = `Academic_Transcript_${user.student_id || 'Student'}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF generation error: ' + err.message);
    }
  };

  const currentCgpa = cgpaData?.cgpa || 0.0;
  const targetCgpa = cgpaData?.target_cgpa || 3.80;
  const isGoalReached = currentCgpa >= targetCgpa && currentCgpa > 0;

  // Grade breakdown count
  const allCourses = semesters.flatMap(s => s.courses || []);
  const gradeCounts = { 'A+': 0, 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'Others': 0 };
  allCourses.forEach(c => {
    if (c.grade === 'A+') gradeCounts['A+']++;
    else if (c.grade === 'A') gradeCounts['A']++;
    else if (c.grade === 'A-') gradeCounts['A-']++;
    else if (c.grade === 'B+') gradeCounts['B+']++;
    else if (c.grade === 'B') gradeCounts['B']++;
    else if (c.grade) gradeCounts['Others']++;
  });

  return (
    <div className="space-y-6">
      
      {/* Student Welcome & Top Actions Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-emerald-600">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {lang === 'bn' ? 'একাডেমিক ড্যাশবোর্ড' : 'Academic Dashboard'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'স্বাগতম' : 'Welcome'}, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {user.department} • <span className="font-semibold text-slate-700 dark:text-slate-300">{user.level_term}</span> {user.student_id && `• ID: #${user.student_id}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddSemModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.addSemester}</span>
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>{t.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Current CGPA */}
        <div className="glass-card-hover rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.currentCgpa}</span>
            <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {currentCgpa.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 4.00</span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2">
            {t.cgpaScale} (Standard 4.00 Scale)
          </p>
        </div>

        {/* Card 2: Target Goal */}
        <div className="glass-card-hover rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.targetGoal}</span>
            <div className="p-2 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-sky-600 dark:text-sky-400">
              {targetCgpa.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 4.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isGoalReached 
                ? (lang === 'bn' ? '🎉 টার্গেট অর্জিত!' : '🎉 Target Achieved!') 
                : `${(targetCgpa - currentCgpa).toFixed(2)} ${lang === 'bn' ? 'বাকি' : 'gap'}`}
            </span>
            {isGoalReached && (
              <button 
                onClick={triggerCelebration}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 underline"
              >
                {lang === 'bn' ? 'উৎসব' : 'Celebrate'}
              </button>
            )}
          </div>
        </div>

        {/* Card 3: Credits Completed */}
        <div className="glass-card-hover rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.creditsCompleted}</span>
            <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {cgpaData?.completed_credits?.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 140.0</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(cgpaData?.completion_percentage || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Academic Standing */}
        <div className="glass-card-hover rounded-3xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.academicStanding}</span>
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-1">
            <span className="inline-block text-sm font-extrabold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {cgpaData?.standing || 'Good Standing'}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2.5">
            Dept. Cyber Security Engineering
          </p>
        </div>

      </div>

      {/* Visual Analytics Section: SGPA Progression & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Term Progression Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'সেমিস্টারভিত্তিক SGPA বনাম CGPA অগ্রগতি' : 'Semester SGPA vs Cumulative CGPA Trend'}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Standard 4.00 Scale
            </span>
          </div>

          <div className="h-44 flex items-end gap-6 pt-6 px-4 border-b border-slate-200 dark:border-slate-800">
            {semesters.map((sem, idx) => {
              const sgpaVal = sem.sgpa !== null ? sem.sgpa : 0;
              const heightPct = Math.round((sgpaVal / 4.0) * 100);

              return (
                <div key={sem.id || idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">
                    {sem.sgpa !== null ? sem.sgpa.toFixed(2) : '—'}
                  </span>
                  <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-28 relative flex items-end justify-center overflow-hidden">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-700 group-hover:from-emerald-500 group-hover:to-teal-300"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 truncate max-w-[64px] text-center">
                    {sem.name.replace('Level ', 'L').replace('Term ', 'T')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Breakdown & Quality Gauge */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'গ্রেড বন্টন বিশ্লেষণ' : 'Course Grade Distribution'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">A+ (4.00)</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{gradeCounts['A+']}</span>
              <span className="text-[10px] text-slate-400 block">Courses</span>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-center">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 block">A (3.75)</span>
              <span className="text-2xl font-black text-sky-600 dark:text-sky-400">{gradeCounts['A']}</span>
              <span className="text-[10px] text-slate-400 block">Courses</span>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center">
              <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 block">A- (3.50)</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{gradeCounts['A-']}</span>
              <span className="text-[10px] text-slate-400 block">Courses</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">B+ / Below</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{gradeCounts['B+'] + gradeCounts['B'] + gradeCounts['Others']}</span>
              <span className="text-[10px] text-slate-400 block">Courses</span>
            </div>
          </div>
        </div>

      </div>

      {/* Semesters & Courses Accordion */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.semesters} ({semesters.length})
            </h2>
          </div>
        </div>

        {semesters.length === 0 ? (
          <div className="glass-card rounded-3xl p-8 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold">{lang === 'bn' ? 'কোনো সেমিস্টার যুক্ত করা হয়নি' : 'No semesters recorded yet.'}</p>
            <button
              onClick={() => setIsAddSemModal(true)}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800"
            >
              + {t.addSemester}
            </button>
          </div>
        ) : (
          semesters.map((sem) => {
            const isExpanded = expandedSemesters[sem.id] !== false; // default expanded
            return (
              <div 
                key={sem.id} 
                className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 transition-all"
              >
                {/* Semester Header Bar */}
                <div 
                  onClick={() => toggleExpand(sem.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                      #{sem.term_order}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        {sem.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {sem.course_count} {lang === 'bn' ? 'টি কোর্স' : 'courses'} • {sem.total_credits} {lang === 'bn' ? 'ক্রেডিট' : 'credits'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium block">SGPA</span>
                      <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {sem.sgpa !== null ? sem.sgpa.toFixed(2) : (lang === 'bn' ? 'চলমান' : 'In Progress')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSemId(sem.id);
                          setIsAddCourseModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 text-xs font-bold transition-colors"
                        title={t.addCourse}
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(lang === 'bn' ? 'সেমিস্টারটি মুছে ফেলতে চান?' : 'Delete this semester?')) {
                            onDeleteSemester(sem.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Delete Semester"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Courses Table */}
                {isExpanded && (
                  <div className="border-t border-slate-200/80 dark:border-slate-800 overflow-x-auto">
                    {sem.courses.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        {lang === 'bn' ? 'এই সেমিস্টারে কোনো কোর্স নেই।' : 'No courses in this semester yet.'}
                        <button
                          onClick={() => {
                            setSelectedSemId(sem.id);
                            setIsAddCourseModal(true);
                          }}
                          className="ml-2 font-bold text-emerald-600 underline"
                        >
                          + {t.addCourse}
                        </button>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-slate-500 font-semibold border-b border-slate-200/60 dark:border-slate-800/60">
                          <tr>
                            <th className="py-2.5 px-4">Code</th>
                            <th className="py-2.5 px-4">Course Title</th>
                            <th className="py-2.5 px-4 text-center">Credit</th>
                            <th className="py-2.5 px-4 text-center">Marks</th>
                            <th className="py-2.5 px-4 text-center">Grade</th>
                            <th className="py-2.5 px-4 text-center">Point</th>
                            <th className="py-2.5 px-4 text-center">Attendance</th>
                            <th className="py-2.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                          {sem.courses.map((course) => {
                            const attendancePct = course.attendance_held > 0 
                              ? Math.round((course.attendance_attended / course.attendance_held) * 100) 
                              : 100;
                            const isDebarred = attendancePct < 75;

                            return (
                              <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                  {course.code}
                                </td>
                                <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                                  {course.title}
                                </td>
                                <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                                  {course.credits}
                                </td>
                                <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                                  {course.marks !== null ? course.marks : '—'}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {course.grade ? (
                                    <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                      course.grade.startsWith('A') 
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : course.grade.startsWith('B')
                                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    }`}>
                                      {course.grade}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[11px]">In Progress</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                                  {course.grade_point !== null ? parseFloat(course.grade_point).toFixed(2) : '—'}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isDebarred 
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  }`}>
                                    {attendancePct}% ({course.attendance_attended}/{course.attendance_held})
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => openEditCourse(course)}
                                      className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                                      title="Edit Course"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => onDeleteCourse(course.id)}
                                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                      title="Delete Course"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Semester Modal */}
      {isAddSemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.addSemester}
            </h3>
            <form onSubmit={handleCreateSemester} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'সেমিস্টারের নাম' : 'Semester Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Level 2, Term 2"
                  value={newSemName}
                  onChange={(e) => setNewSemName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {lang === 'bn' ? 'টার্ম ক্রম' : 'Term Order Index'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newSemOrder}
                  onChange={(e) => setNewSemOrder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSemModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.addCourse}
            </h3>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CSE211"
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Data Structures"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Credits (e.g. 3.0, 1.5)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={cCredits}
                    onChange={(e) => setCCredits(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Marks (Leave empty if in progress)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    placeholder="e.g. 82"
                    value={cMarks}
                    onChange={(e) => setCMarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Held Classes
                  </label>
                  <input
                    type="number"
                    value={cAttendanceHeld}
                    onChange={(e) => setCAttendanceHeld(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Attended
                  </label>
                  <input
                    type="number"
                    value={cAttendanceAttended}
                    onChange={(e) => setCAttendanceAttended(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Difficulty (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={cDifficulty}
                    onChange={(e) => setCDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {isEditCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'কোর্স আপডেট করুন' : 'Edit Course Information'}
            </h3>
            <form onSubmit={handleUpdateCourse} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    required
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={cCredits}
                    onChange={(e) => setCCredits(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Marks (0-100)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={cMarks}
                    onChange={(e) => setCMarks(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Attended Classes
                  </label>
                  <input
                    type="number"
                    value={cAttendanceAttended}
                    onChange={(e) => setCAttendanceAttended(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Total Classes Held
                  </label>
                  <input
                    type="number"
                    value={cAttendanceHeld}
                    onChange={(e) => setCAttendanceHeld(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditCourseModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Update Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
