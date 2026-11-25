import React, { useState, useEffect } from 'react';
import { RotateCcw, TrendingUp, AlertCircle, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function RetakePlanner({ t, lang }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRetakes() {
      try {
        const res = await api.getRetakePlanner();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRetakes();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center text-slate-500">
        <RotateCcw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
        <p className="text-sm font-semibold">{lang === 'bn' ? 'রিটেক ডাটা লোড হচ্ছে...' : 'Loading retake analysis...'}</p>
      </div>
    );
  }

  const candidates = data?.retake_candidates || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.retakeTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.retakeDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Retake Summary Metric */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-slate-400">
          <span className="text-xs font-bold text-slate-400 block mb-1">Current CGPA</span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.current_cgpa?.toFixed(2) || '0.00'}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Across {data?.total_credits} credits</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-slate-400 block mb-1">Eligible Retake Courses</span>
          <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {candidates.length}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Courses with grade &le; B+ (3.25)</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-400 block mb-1">Max Combined CGPA Boost</span>
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            +{candidates.reduce((acc, c) => acc + c.potential_boost_to_aplus, 0).toFixed(2)}
          </span>
          <span className="text-xs text-slate-400 block mt-1">If all candidates retaken to A+</span>
        </div>
      </div>

      {/* Ranked Retake Candidates List */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'bn' ? 'সর্বোচ্চ সিজিপিএ বৃদ্ধির ভিত্তিতে কোর্স র‍্যাঙ্কিং' : 'Ranked by Maximum CGPA Payoff'}</span>
        </h2>

        {candidates.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold">
              {lang === 'bn' ? 'অসাধারণ! আপনার কোনো কোর্সে কম গ্রেড নেই।' : 'Excellent! You have no eligible low-grade courses to retake.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((c, index) => (
              <div 
                key={c.course_id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center font-extrabold text-amber-800 dark:text-amber-300 text-xs">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{c.code}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">• {c.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{c.semester_name}</span>
                      <span>•</span>
                      <span>{c.credits} Credits</span>
                      <span>•</span>
                      <span>Current: <strong className="text-amber-600">{c.current_grade} ({c.current_grade_point.toFixed(2)})</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:text-right">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Gain if retaken to A+</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{c.potential_boost_to_aplus.toFixed(3)} CGPA
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      New Total: {c.projected_cgpa_if_aplus.toFixed(2)}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    c.recommendation === 'High Priority Retake'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {c.recommendation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
