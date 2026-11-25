import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { api } from '../api';

export default function SafeBunkCalculator({ t, lang }) {
  const [minRatio, setMinRatio] = useState('75');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.getAttendanceReport(parseFloat(minRatio) / 100);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [minRatio]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.safeBunkTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.safeBunkDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Threshold Slider & Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-3xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Min. Attendance Req</span>
            <span className="text-xs font-extrabold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950">
              {minRatio}%
            </span>
          </div>
          <input
            type="range"
            min="60"
            max="85"
            step="5"
            value={minRatio}
            onChange={(e) => setMinRatio(e.target.value)}
            className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>60%</span>
            <span>75% (Standard Rule)</span>
            <span>85%</span>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-400 block mb-1">Safe Courses</span>
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {report?.summary?.safe_count || 0}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Sufficient attendance</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-slate-400 block mb-1">Warning (Margin &le; 1)</span>
          <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {report?.summary?.warning_count || 0}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Cannot miss next class</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-rose-600">
          <span className="text-xs font-bold text-slate-400 block mb-1">Debarred Critical Risk</span>
          <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {report?.summary?.critical_count || 0}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Below {minRatio}% cutoff</span>
        </div>

      </div>

      {/* Course Attendance List */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {lang === 'bn' ? 'কোর্স উপস্থিতি ও সেফ বাঙ্ক ক্যালকুলেশন' : 'Course Attendance & Safe Absences'}
        </h2>

        {report?.courses?.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No courses available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report?.courses?.map((c) => {
              const isSafe = c.status === 'SAFE';
              const isWarn = c.status === 'WARNING';
              const isCrit = c.status === 'CRITICAL';

              return (
                <div 
                  key={c.course_id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isCrit 
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40' 
                      : isWarn
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">{c.code}</span>
                        <span className="text-xs text-slate-500">• {c.semester_name}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{c.title}</h4>
                    </div>

                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isCrit 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                        : isWarn
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {c.percentage}% Attended
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Attended: <strong className="text-slate-800 dark:text-slate-200">{c.attended} / {c.held}</strong> (Missed {c.missed})
                    </span>

                    {isCrit ? (
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">
                        Need {c.classes_needed_to_recover} consecutive classes!
                      </span>
                    ) : (
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {c.safe_bunks_allowed} safe bunks allowed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
