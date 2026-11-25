import React, { useState, useEffect } from 'react';
import { CalendarClock, Plus, CheckCircle, Clock, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function StudyPlanner({ t, lang }) {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModal, setIsAddModal] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [daysLeft, setDaysLeft] = useState('7');
  const [allocatedHours, setAllocatedHours] = useState('4.0');
  const [notes, setNotes] = useState('');

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const data = await api.getStudySchedule();
      setScheduleData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title) return;
    try {
      await api.createStudyTask({
        title,
        days_left: parseInt(daysLeft, 10),
        allocated_hours: parseFloat(allocatedHours),
        notes
      });
      setTitle('');
      setNotes('');
      setIsAddModal(false);
      loadSchedule();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateStudyTask(task.id, { status: nextStatus });
      loadSchedule();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteStudyTask(id);
      loadSchedule();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {t.studyTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t.studyDesc}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'স্টাডি টাস্ক যোগ করুন' : 'Add Study Task'}</span>
          </button>
        </div>
      </div>

      {/* Priority Matrix Table */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {lang === 'bn' ? 'অগ্রাধিকার তালিকা (Priority Matrix)' : 'Intelligent Priority Schedule'}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Weekly Study Budget: <strong>{scheduleData?.weekly_budget_hours || 24} Hours</strong>
          </span>
        </div>

        {scheduleData?.tasks?.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No study tasks planned yet. Click "Add Study Task" above to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {scheduleData?.tasks?.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone 
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-60' 
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        isDone 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                    >
                      {isDone && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        {task.course_code && (
                          <span className="font-extrabold text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            {task.course_code}
                          </span>
                        )}
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </h4>
                      </div>

                      {task.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {task.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span>Due in: <strong className="text-slate-700 dark:text-slate-300">{task.days_left} days</strong></span>
                        <span>•</span>
                        <span>Priority Score: <strong className="text-indigo-600 dark:text-indigo-400">{task.computed_priority}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Recommended Allocation</span>
                      <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                        {task.recommended_weekly_hours} hrs / week
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Study Task
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Graph Algorithms Revision"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Days Remaining
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={daysLeft}
                    onChange={(e) => setDaysLeft(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Hours Planned
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={allocatedHours}
                    onChange={(e) => setAllocatedHours(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Notes / Focus Topics
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key concepts, lab files, lecture slides..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
