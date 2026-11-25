import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function FinalMarksCalculator({ t, lang }) {
  const [continuousMarks, setContinuousMarks] = useState('34');
  const [continuousTotal, setContinuousTotal] = useState('40');
  const [finalTotal, setFinalTotal] = useState('60');
  const [targetGrade, setTargetGrade] = useState('A+');
  const [result, setResult] = useState(null);

  const calculate = async () => {
    try {
      const data = await api.calculateFinalMarks({
        continuous_marks: parseFloat(continuousMarks) || 0,
        continuous_total: parseFloat(continuousTotal) || 40,
        final_total: parseFloat(finalTotal) || 60,
        target_grade: targetGrade
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    calculate();
  }, [continuousMarks, continuousTotal, finalTotal, targetGrade]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.finalTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.finalDesc}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {lang === 'bn' ? 'নম্বর ও টার্গেট ইনপুট' : 'Assessment Input'}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'ধারাবাহিক মূল্যায়নে প্রাপ্ত নম্বর' : 'Continuous Marks Earned'}
            </label>
            <input
              type="number"
              step="0.5"
              value={continuousMarks}
              onChange={(e) => setContinuousMarks(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Continuous Total
              </label>
              <input
                type="number"
                value={continuousTotal}
                onChange={(e) => setContinuousTotal(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Final Exam Total
              </label>
              <input
                type="number"
                value={finalTotal}
                onChange={(e) => setFinalTotal(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'কাঙ্ক্ষিত টার্গেট গ্রেড' : 'Desired Target Grade'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['A+', 'A', 'A-', 'B+', 'B', 'B-'].map(grd => (
                <button
                  key={grd}
                  type="button"
                  onClick={() => setTargetGrade(grd)}
                  className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                    targetGrade === grd
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {grd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-2 space-y-6">
          {result && (
            <div className={`glass-card rounded-3xl p-6 sm:p-8 border-l-4 ${
              result.achievable ? 'border-l-emerald-600' : 'border-l-rose-600'
            }`}>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-4 ${
                result.achievable 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {result.achievable ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {result.achievable ? 'Achievable Target' : 'Exceeds Exam Max Marks'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-2">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {lang === 'bn' ? 'ফাইনালে প্রয়োজনীয় নম্বর' : 'Marks Needed in Final Exam'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-4xl sm:text-5xl font-black ${
                      result.achievable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {result.marks_needed_in_final}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ {result.max_final}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    {lang === 'bn' ? 'প্রয়োজনীয় পার্সেন্টেজ' : 'Final Exam Accuracy Required'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                      {result.percentage_needed}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {result.feedback}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
