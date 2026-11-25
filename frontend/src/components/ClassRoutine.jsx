import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, AlertCircle, Plus, CheckCircle2, Timer, BookOpen } from 'lucide-react';

export default function ClassRoutine({ t, lang }) {
  const [activeDay, setActiveDay] = useState('Sunday');
  const [timeLeftMidterm, setTimeLeftMidterm] = useState({ days: 18, hours: 9, minutes: 24, seconds: 40 });
  const [timeLeftFinal, setTimeLeftFinal] = useState({ days: 54, hours: 14, minutes: 12, seconds: 15 });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftMidterm(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });

      setTimeLeftFinal(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  const schedule = {
    Sunday: [
      { time: '09:00 AM - 10:30 AM', code: 'CSE220', title: 'Software Engineering & Web Systems', instructor: 'Faculty Instructor', room: 'Lab 402', type: 'Lab' },
      { time: '10:45 AM - 12:15 PM', code: 'CSE213', title: 'Data Structures and Algorithms', instructor: 'Dr. Rafiqul Islam', room: 'Room 304', type: 'Theory' },
      { time: '01:30 PM - 03:00 PM', code: 'MATH211', title: 'Discrete Mathematics & Cryptography', instructor: 'Prof. Anisur Rahman', room: 'Room 205', type: 'Theory' },
    ],
    Monday: [
      { time: '09:30 AM - 12:30 PM', code: 'CSE220', title: 'Software Systems Lab (Project Work)', instructor: 'Faculty Instructor', room: 'Lab 402', type: 'Sessional' },
      { time: '01:45 PM - 03:15 PM', code: 'CSE215', title: 'Network Security Fundamentals', instructor: 'Ms. Nusrat Jahan', room: 'Room 301', type: 'Theory' },
    ],
    Tuesday: [
      { time: '09:00 AM - 10:30 AM', code: 'CSE213', title: 'Data Structures Lab', instructor: 'Dr. Rafiqul Islam', room: 'Lab 401', type: 'Lab' },
      { time: '11:00 AM - 12:30 PM', code: 'MATH211', title: 'Discrete Mathematics', instructor: 'Prof. Anisur Rahman', room: 'Room 205', type: 'Theory' },
    ],
    Wednesday: [
      { time: '10:00 AM - 11:30 AM', code: 'CSE215', title: 'Network Security Lab', instructor: 'Ms. Nusrat Jahan', room: 'Lab 305', type: 'Lab' },
      { time: '12:00 PM - 01:30 PM', code: 'CSE220', title: 'Web Frameworks & API Architecture', instructor: 'Faculty Instructor', room: 'Lab 402', type: 'Theory' },
    ],
    Thursday: [
      { time: '09:30 AM - 11:00 AM', code: 'CSE217', title: 'Database Management Systems', instructor: 'Md. Tanvir Hossain', room: 'Room 302', type: 'Theory' },
      { time: '11:30 AM - 01:00 PM', code: 'CSE218', title: 'DBMS Sessional & MySQL Lab', instructor: 'Md. Tanvir Hossain', room: 'Lab 401', type: 'Lab' },
    ]
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'একাডেমিক ক্লাস রুটিন ও পরীক্ষার কাউন্টডাউন' : 'Academic Class Routine & Exam Countdown Tracker'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {lang === 'bn' 
                ? 'সাপ্তাহিক ক্লাসের সময়সূচী, ল্যাব রুম এবং মিডটার্ম ও ফাইনাল পরীক্ষার লাইভ টাইমার।' 
                : 'Weekly Class Routine, Laboratory Sessions & Examination Countdown'}
            </p>
          </div>
        </div>
      </div>

      {/* Exam Countdown Clocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Midterm Timer */}
        <div className="glass-card rounded-3xl p-6 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Timer className="w-4 h-4" />
              {lang === 'bn' ? 'মিডটার্ম পরীক্ষা কাউন্টডাউন' : 'Midterm Examination'}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Core & Major Courses
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="block text-2xl font-black text-slate-900 dark:text-white">{timeLeftMidterm.days}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'দিন' : 'Days'}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="block text-2xl font-black text-slate-900 dark:text-white">{timeLeftMidterm.hours}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'ঘণ্টা' : 'Hours'}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="block text-2xl font-black text-slate-900 dark:text-white">{timeLeftMidterm.minutes}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'মিনিট' : 'Mins'}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="block text-2xl font-black text-amber-600 dark:text-amber-400">{timeLeftMidterm.seconds}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'সেকেন্ড' : 'Secs'}</span>
            </div>
          </div>
        </div>

        {/* Final Exam Timer */}
        <div className="glass-card rounded-3xl p-6 border-l-4 border-l-emerald-600 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Timer className="w-4 h-4" />
              {lang === 'bn' ? 'সেমিস্টার ফাইনাল পরীক্ষা' : 'Semester Final Examination'}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Level 2 Term 1 Finale
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="block text-2xl font-black text-slate-900 dark:text-white">{timeLeftFinal.days}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'দিন' : 'Days'}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="block text-2xl font-black text-slate-900 dark:text-white">{timeLeftFinal.hours}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'ঘণ্টা' : 'Hours'}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="block text-2xl font-black text-slate-900 dark:text-white">{timeLeftFinal.minutes}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'মিনিট' : 'Mins'}</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{timeLeftFinal.seconds}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'bn' ? 'সেকেন্ড' : 'Secs'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Routine Days Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeDay === day
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'glass-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Schedule Cards for Active Day */}
      <div className="space-y-3">
        {schedule[activeDay]?.map((item, idx) => (
          <div 
            key={idx}
            className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-sky-300 dark:hover:border-sky-800 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  {item.code}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {item.title}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.type === 'Lab' || item.type === 'Sessional'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {item.type}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  {item.time}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {item.instructor}
                </span>
                <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <MapPin className="w-3.5 h-3.5" />
                  {item.room}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3 h-3" />
                Active Class
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
