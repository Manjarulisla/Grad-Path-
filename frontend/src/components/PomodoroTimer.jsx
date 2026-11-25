import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Volume2, CheckCircle2, Flame, Award, Coffee } from 'lucide-react';
import { api } from '../api';

const MODES = {
  study: { name: 'Deep Study', minutes: 25, color: 'emerald' },
  short_break: { name: 'Short Break', minutes: 5, color: 'sky' },
  long_break: { name: 'Long Break', minutes: 15, color: 'indigo' },
};

export default function PomodoroTimer({ t, lang }) {
  const [mode, setMode] = useState('study');
  const [timeLeft, setTimeLeft] = useState(MODES.study.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [topic, setTopic] = useState('Course Revision & Problem Solving');
  const [stats, setStats] = useState(null);
  const timerRef = useRef(null);

  // Play audio chime using Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const loadStats = async () => {
    try {
      const data = await api.getPomodoroStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      playChime();
      
      // Log session to backend
      if (mode === 'study') {
        api.logPomodoroSession({
          session_type: 'study',
          duration_minutes: MODES[mode].minutes,
          topic: topic || 'Focused Study'
        }).then(() => loadStats());
      }

      // Notification
      if (Notification.permission === 'granted') {
        new Notification('GradPath Focus Timer', {
          body: `${MODES[mode].name} completed! Great job!`,
        });
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, mode]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const toggleTimer = () => {
    if (!isActive && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const totalSeconds = MODES[mode].minutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.pomodoroTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.pomodoroDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Pomodoro Clock Card */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center space-y-6">
          
          {/* Mode Switcher Buttons */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 w-full max-w-sm">
            {Object.keys(MODES).map((key) => {
              const active = mode === key;
              return (
                <button
                  key={key}
                  onClick={() => switchMode(key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    active 
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {MODES[key].name}
                </button>
              );
            })}
          </div>

          {/* Large Circular Countdown Display */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="110"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className={`transition-all duration-500 ${
                  mode === 'study' ? 'text-emerald-500' : 'text-sky-500'
                }`}
                fill="none"
              />
            </svg>

            {/* Time inside circle */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
                {MODES[mode].name}
              </span>
            </div>
          </div>

          {/* Topic Input */}
          <div className="w-full max-w-sm">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What are you focusing on?"
              className="w-full text-center px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-2xl text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
                isActive 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isActive ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={resetTimer}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Right: Stats & Streak */}
        <div className="space-y-4">
          
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>{lang === 'bn' ? 'আজকের ফোকাস রেকর্ড' : "Today's Study Streak"}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Today's Sessions</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats?.stats?.today_sessions || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Today's Focus Time</span>
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
                  {stats?.stats?.today_minutes || 0} min
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Lifetime Study Time:</span>
              <strong className="text-slate-800 dark:text-slate-200">{stats?.stats?.total_study_minutes || 0} minutes</strong>
            </div>
          </div>

          {/* Recent Focus Log */}
          <div className="glass-card rounded-3xl p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'bn' ? 'সাম্প্রতিক সেশন' : 'Recent Completed Sessions'}
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {stats?.recent_logs?.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{log.topic}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.completed_at).toLocaleDateString()}</span>
                  </div>
                  <span className="font-extrabold text-emerald-600">{log.duration_minutes}m</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
