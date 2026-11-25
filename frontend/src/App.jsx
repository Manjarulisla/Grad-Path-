import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import TargetPredictor from './components/TargetPredictor';
import WhatIfSimulator from './components/WhatIfSimulator';
import RetakePlanner from './components/RetakePlanner';
import FinalMarksCalculator from './components/FinalMarksCalculator';
import SafeBunkCalculator from './components/SafeBunkCalculator';
import StudyPlanner from './components/StudyPlanner';
import PomodoroTimer from './components/PomodoroTimer';
import ClassRoutine from './components/ClassRoutine';
import AiAdvisor from './components/AiAdvisor';
import AdminPanel from './components/AdminPanel';
import { translations } from './locales/translations';
import { api } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('gradpath_theme') === 'dark';
  });
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('gradpath_lang') || 'en';
  });

  const [cgpaData, setCgpaData] = useState(null);
  const [semesters, setSemesters] = useState([]);

  const t = translations[lang] || translations.en;

  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gradpath_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gradpath_theme', 'light');
    }
  }, [isDark]);

  // Language preference effect
  useEffect(() => {
    localStorage.setItem('gradpath_lang', lang);
  }, [lang]);

  // Load user data on startup
  const loadUserData = async () => {
    const token = localStorage.getItem('gradpath_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const meRes = await api.getMe();
      setUser(meRes.user);

      if (meRes.user.role === 'STUDENT') {
        const [cgpaRes, semsRes] = await Promise.all([
          api.getCgpa(),
          api.getSemesters()
        ]);
        setCgpaData(cgpaRes);
        setSemesters(semsRes.semesters);
      } else {
        // Admin
        setCurrentTab('admin');
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      localStorage.removeItem('gradpath_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    loadUserData();
    if (loggedInUser.role === 'ADMIN') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gradpath_token');
    setUser(null);
    setCgpaData(null);
    setSemesters([]);
    setCurrentTab('dashboard');
  };

  // Semester & Course handlers
  const handleAddSemester = async (semData) => {
    try {
      await api.addSemester(semData);
      loadUserData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteSemester = async (id) => {
    try {
      await api.deleteSemester(id);
      loadUserData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAddCourse = async (courseData) => {
    try {
      await api.addCourse(courseData);
      loadUserData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await api.deleteCourse(id);
      loadUserData();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            GradPath • Initializing...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
        isDark={isDark}
        setIsDark={setIsDark}
        lang={lang}
        setLang={setLang}
        t={t}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!user ? (
          <AuthModal 
            onLoginSuccess={handleLoginSuccess} 
            t={t} 
            lang={lang} 
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                user={user}
                cgpaData={cgpaData}
                semesters={semesters}
                onRefresh={loadUserData}
                onAddSemester={handleAddSemester}
                onAddCourse={handleAddCourse}
                onDeleteSemester={handleDeleteSemester}
                onDeleteCourse={handleDeleteCourse}
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'target' && (
              <TargetPredictor
                cgpaData={cgpaData}
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'whatif' && (
              <WhatIfSimulator
                cgpaData={cgpaData}
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'retake' && (
              <RetakePlanner
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'final' && (
              <FinalMarksCalculator
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'attendance' && (
              <SafeBunkCalculator
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'routine' && (
              <ClassRoutine
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'advisor' && (
              <AiAdvisor
                cgpaData={cgpaData}
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'study' && (
              <StudyPlanner
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'pomodoro' && (
              <PomodoroTimer
                t={t}
                lang={lang}
              />
            )}

            {currentTab === 'admin' && (
              <AdminPanel
                t={t}
                lang={lang}
              />
            )}
          </>
        )}
      </main>

      {/* Academic Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <div className="font-bold text-slate-700 dark:text-slate-200">
            GradPath • Smart CGPA Planner & Academic Progress Tracker
          </div>
          <div className="text-[11px] text-slate-400">
            Automated Academic Analytics, Prediction & Decision Support System
          </div>
        </div>
      </footer>

    </div>
  );
}
