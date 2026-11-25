import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Trash2, ArrowRight, RotateCcw, TrendingUp, Info } from 'lucide-react';
import { api } from '../api';

const GRADE_OPTIONS = [
  { label: 'A+ (4.00) - 80%+', value: 4.00 },
  { label: 'A (3.75) - 75-79%', value: 3.75 },
  { label: 'A- (3.50) - 70-74%', value: 3.50 },
  { label: 'B+ (3.25) - 65-69%', value: 3.25 },
  { label: 'B (3.00) - 60-64%', value: 3.00 },
  { label: 'B- (2.75) - 55-59%', value: 2.75 },
  { label: 'C+ (2.50) - 50-54%', value: 2.50 },
  { label: 'C (2.25) - 45-49%', value: 2.25 },
  { label: 'D (2.00) - 40-44%', value: 2.00 },
  { label: 'F (0.00) - Below 40%', value: 0.00 },
];

export default function WhatIfSimulator({ cgpaData, t, lang }) {
  const [courses, setCourses] = useState([
    { id: 1, code: 'CSE221', title: 'Operating Systems & Security', credits: 3.0, grade_point: 4.00 },
    { id: 2, code: 'CSE222', title: 'Operating Systems Sessional', credits: 1.5, grade_point: 4.00 },
    { id: 3, code: 'CSE223', title: 'Database Management Systems', credits: 3.0, grade_point: 3.75 },
    { id: 4, code: 'CSE224', title: 'Database Systems Sessional', credits: 1.5, grade_point: 3.75 },
    { id: 5, code: 'MATH225', title: 'Numerical Analysis & Computation', credits: 3.0, grade_point: 3.50 }
  ]);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await api.runWhatIf(courses);
      setSimResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [courses]);

  const addHypotheticalCourse = () => {
    const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    setCourses([...courses, {
      id: newId,
      code: `COURSE${newId}`,
      title: 'Elective Course',
      credits: 3.0,
      grade_point: 4.00
    }]);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourseField = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {t.whatifTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.whatifDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Live Simulation Projection Cards */}
      {simResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="glass-card rounded-3xl p-5 border-l-4 border-l-slate-400">
            <span className="text-xs font-bold text-slate-400 block mb-1">Current Baseline CGPA</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {simResult.current_cgpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Based on recorded history</span>
          </div>

          <div className={`glass-card rounded-3xl p-5 border-l-4 ${
            simResult.is_positive ? 'border-l-emerald-600' : 'border-l-rose-600'
          }`}>
            <span className="text-xs font-bold text-slate-400 block mb-1">Projected New CGPA</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold ${
                simResult.is_positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {simResult.projected_cgpa.toFixed(2)}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                simResult.is_positive 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {simResult.cgpa_delta >= 0 ? `+${simResult.cgpa_delta.toFixed(2)}` : simResult.cgpa_delta.toFixed(2)}
              </span>
            </div>
            <span className="text-xs text-slate-400 block mt-1">
              Simulated Term SGPA: <strong className="text-slate-700 dark:text-slate-200">{simResult.simulated_term_sgpa.toFixed(2)}</strong>
            </span>
          </div>

          <div className="glass-card rounded-3xl p-5 border-l-4 border-l-sky-500">
            <span className="text-xs font-bold text-slate-400 block mb-1">Credits Evaluated</span>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {simResult.total_credits_after.toFixed(1)} cr
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              {courses.length} hypothetical courses tested
            </span>
          </div>

        </div>
      )}

      {/* Hypothetical Courses Table */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {lang === 'bn' ? 'অনুমানমূলক কোর্স তালিকা' : 'Simulated Courses List'}
          </h2>

          <button
            onClick={addHypotheticalCourse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'কোর্স যোগ করুন' : 'Add Hypothetical Course'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3 w-28">Credits</th>
                <th className="py-2.5 px-3 w-56">Expected Grade</th>
                <th className="py-2.5 px-3 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={c.code}
                      onChange={(e) => updateCourseField(c.id, 'code', e.target.value)}
                      className="w-24 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={c.title}
                      onChange={(e) => updateCourseField(c.id, 'title', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="6.0"
                      value={c.credits}
                      onChange={(e) => updateCourseField(c.id, 'credits', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-center"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={c.grade_point}
                      onChange={(e) => updateCourseField(c.id, 'grade_point', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                    >
                      {GRADE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => removeCourse(c.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
