import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, CheckCircle, HelpCircle, ArrowUpRight, Sparkles, TrendingUp, Sliders, RotateCcw } from 'lucide-react';
import { api } from '../api';

export default function TargetPredictor({ cgpaData, t, lang }) {
  const [useCustomOverride, setUseCustomOverride] = useState(false);
  const [customCurrentCgpa, setCustomCurrentCgpa] = useState('2.98');
  const [customCompletedCredits, setCustomCompletedCredits] = useState('36');

  const [targetCgpa, setTargetCgpa] = useState(cgpaData?.target_cgpa || 3.80);
  const [remainingCredits, setRemainingCredits] = useState(
    Math.max(140 - (cgpaData?.completed_credits || 25), 15)
  );
  const [semsLeft, setSemsLeft] = useState(5);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPrediction = async () => {
    setLoading(true);
    try {
      const payload = {
        target_cgpa: parseFloat(targetCgpa),
        remaining_credits: parseFloat(remainingCredits),
        total_semesters_left: parseInt(semsLeft, 10)
      };

      if (useCustomOverride) {
        payload.custom_current_cgpa = parseFloat(customCurrentCgpa);
        payload.custom_completed_credits = parseFloat(customCompletedCredits);
      }

      const data = await api.predictTarget(payload);
      setPrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [targetCgpa, remainingCredits, semsLeft, useCustomOverride, customCurrentCgpa, customCompletedCredits]);

  const loadUserScenario298to397 = () => {
    setUseCustomOverride(true);
    setCustomCurrentCgpa('2.98');
    setCustomCompletedCredits('36');
    setTargetCgpa('3.97');
    setRemainingCredits('104');
    setSemsLeft(6);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {t.predictTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t.predictDesc}
              </p>
            </div>
          </div>

          {/* Quick Scenario Preset Button */}
          <button
            onClick={loadUserScenario298to397}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-opacity"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'bn' ? 'টেস্ট কেস: ২.৯৮ ➔ ৩.৯৭ টার্গেট' : 'Quick Scenario: 2.98 ➔ 3.97 Target'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Interactive Controls */}
        <div className="lg:col-span-1 glass-card rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {lang === 'bn' ? 'সিমুলেশন প্যারামিটার' : 'Simulation Parameters'}
            </h2>
            <button
              onClick={() => setUseCustomOverride(!useCustomOverride)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                useCustomOverride 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {useCustomOverride ? (lang === 'bn' ? 'কাস্টম মোড: চালু' : 'Custom Mode: ON') : (lang === 'bn' ? 'কাস্টম মোড' : 'Custom Mode')}
            </button>
          </div>

          {/* Custom vs Live Toggle Section */}
          {useCustomOverride ? (
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'কাস্টম হাইপোথিটিক্যাল মান' : 'Custom Hypothetical Values'}
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    {lang === 'bn' ? 'বর্তমান CGPA' : 'Current CGPA'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    max="4.00"
                    value={customCurrentCgpa}
                    onChange={(e) => setCustomCurrentCgpa(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    {lang === 'bn' ? 'সম্পন্ন ক্রেডিট' : 'Completed Cr'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="140"
                    value={customCompletedCredits}
                    onChange={(e) => setCustomCompletedCredits(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Current CGPA Reference from DB */
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t.currentCgpa} (Database)
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {cgpaData?.cgpa?.toFixed(2) || '0.00'} / 4.00
              </span>
            </div>
          )}

          {/* Target Slider & Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.targetGoal}
              </label>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60">
                {parseFloat(targetCgpa).toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="2.00"
              max="4.00"
              step="0.01"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(e.target.value)}
              className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>2.00 (Pass)</span>
              <span>3.00 (B)</span>
              <span>3.75 (A)</span>
              <span>4.00 (A+)</span>
            </div>
          </div>

          {/* Remaining Credits Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === 'bn' ? 'অবশিষ্ট ক্রেডিট' : 'Remaining Credits'}
              </label>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                {remainingCredits} cr
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="140"
              step="1"
              value={remainingCredits}
              onChange={(e) => setRemainingCredits(e.target.value)}
              className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Remaining Semesters */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'বাকি সেমিস্টারের সংখ্যা' : 'Upcoming Terms Remaining'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSemsLeft(num)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                    semsLeft === num
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {num} Terms
                </button>
              ))}
            </div>
          </div>

          {/* Math Formula Card */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Official Prediction Formula:</span>
            </div>
            <div className="font-mono text-[10px] text-slate-800 dark:text-slate-200 p-1 bg-white dark:bg-slate-900 rounded border border-emerald-200 dark:border-emerald-800">
              ReqGPA = [Target*(Cd + Cn) - (CGPA*Cd)] / Cn
            </div>
          </div>

        </div>

        {/* Right: Results & Roadmap */}
        <div className="lg:col-span-2 space-y-6">
          
          {prediction && (
            <>
              {/* Prediction Result Hero */}
              <div className={`glass-card rounded-3xl p-6 sm:p-8 border-l-4 transition-all ${
                prediction.feasible 
                  ? 'border-l-emerald-600 bg-gradient-to-br from-emerald-500/5 to-teal-500/5' 
                  : 'border-l-rose-600 bg-gradient-to-br from-rose-500/5 to-amber-500/5'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      prediction.feasible
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {prediction.feasible ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      {prediction.status}
                    </span>

                    <div className="mt-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                        {lang === 'bn' ? 'বাকি ক্রেডিটগুলোতে প্রয়োজনীয় গড় জিপিএ' : 'Required Average GPA in Remaining Credits'}
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-4xl sm:text-5xl font-black tracking-tight ${
                          prediction.feasible ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {prediction.required_gpa.toFixed(2)}
                        </span>
                        <span className="text-sm font-bold text-slate-400">/ 4.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                      {lang === 'bn' ? 'সর্বোচ্চ সম্ভাব্য CGPA' : 'Maximum Possible CGPA'}
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {prediction.max_possible_cgpa.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      (With Straight A+ in All {remainingCredits} Credits)
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  {prediction.message}
                </p>

                {/* Retake Advice Banner if Unreachable */}
                {!prediction.feasible && (
                  <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                    <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <p className="font-bold">
                        {lang === 'bn' ? 'কীভাবে এই লক্ষ্যমাত্রা অর্জন করবেন?' : 'Strategy to Bridge This Gap:'}
                      </p>
                      <p>
                        {lang === 'bn' 
                          ? 'বর্তমান ২.৯৮ সিজিপিএ থেকে সরাসরি ৩.৯৭ এ পৌঁছাতে হলে পূর্বের কম গ্রেড পাওয়া (C, D বা F) বিষয়গুলোতে রিটেক দিয়ে A+ তুলতে হবে। উপরের "রিটেক প্ল্যানার" ট্যাবে গিয়ে আপনার সম্ভাব্য উন্নতি পরীক্ষা করুন।'
                          : 'To bridge the gap from 2.98 towards 3.97, retaking prior courses with C or D grades to replace them with A/A+ is mandatory. Check the "Retake Planner" tab to test course replacements!'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Term by Term Roadmap */}
              {prediction.semester_plan && (
                <div className="glass-card rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {lang === 'bn' ? 'টার্ম ভিত্তিক প্রস্তাবিত লক্ষ্যমাত্রা' : 'Suggested Term-by-Term Roadmap'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {prediction.semester_plan.map((plan) => (
                      <div 
                        key={plan.semester_index}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {plan.name}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            ~{plan.estimated_credits} cr
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                            {plan.recommended_gpa.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400">target SGPA</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
