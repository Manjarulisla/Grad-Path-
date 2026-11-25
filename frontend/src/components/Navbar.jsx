import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Sparkles, 
  RotateCcw, 
  Calculator, 
  ShieldCheck, 
  CalendarClock, 
  Timer, 
  ShieldAlert, 
  Moon, 
  Sun, 
  Languages, 
  LogOut, 
  Menu, 
  X,
  UserCheck,
  Calendar,
  Brain
} from 'lucide-react';
import UftbLogo from './UftbLogo';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onLogout, 
  isDark, 
  setIsDark, 
  lang, 
  setLang, 
  t 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'target', label: t.calculator, icon: Target },
    { id: 'whatif', label: t.whatif, icon: Sparkles },
    { id: 'retake', label: t.retake, icon: RotateCcw },
    { id: 'final', label: t.finalMarks, icon: Calculator },
    { id: 'attendance', label: t.attendance, icon: ShieldCheck },
    { id: 'routine', label: t.routine || 'Routine', icon: Calendar },
    { id: 'advisor', label: t.advisor || 'AI Advisor', icon: Brain },
    { id: 'study', label: t.studyPlanner, icon: CalendarClock },
    { id: 'pomodoro', label: t.pomodoro, icon: Timer },
  ];

  if (user && user.role === 'ADMIN') {
    navItems.push({ id: 'admin', label: t.adminPanel, icon: ShieldAlert, isAdmin: true });
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <UftbLogo showText={true} lang={lang} />
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    active
                      ? item.isAdmin 
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shadow-sm border border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm border border-emerald-200 dark:border-emerald-800'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? (item.isAdmin ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold border border-slate-200 dark:border-slate-800"
              title="Switch Language / ভাষা পরিবর্তন"
            >
              <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Pill */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      user.role === 'ADMIN'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}>
                      {user.role}
                    </span>
                    {user.student_id && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        #{user.student_id}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors border border-transparent hover:border-rose-200"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-2">
          {user && (
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.email} • {user.role}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs text-rose-600 font-semibold px-2 py-1 rounded bg-rose-50 dark:bg-rose-950"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.logout}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? item.isAdmin 
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
