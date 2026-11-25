import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, BookOpen, Trophy, AlertTriangle, RefreshCw, UserCheck, FileSpreadsheet, Search } from 'lucide-react';
import { api } from '../api';

export default function AdminPanel({ t, lang }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOverview();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const exportStudentsCSV = () => {
    if (!data?.students || data.students.length === 0) return;

    const headers = ['Student ID', 'Student Name', 'Department', 'Level & Term', 'Live CGPA', 'Target CGPA', 'Credits Completed'];
    const rows = data.students.map(s => [
      `"${s.student_id || ''}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      `"${s.level_term}"`,
      s.live_cgpa.toFixed(2),
      s.target_cgpa,
      s.live_credits
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = data?.students?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.student_id && s.student_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {t.adminTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {t.adminDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportStudentsCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{lang === 'bn' ? 'এক্সেল / CSV এক্সপোর্ট' : 'Export CSV Roster'}</span>
            </button>

            <button
              onClick={loadOverview}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-emerald-600">
          <span className="text-xs font-bold text-slate-500 block mb-1">{t.studentsEnrolled}</span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.metrics?.total_students || 0}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Academic Directory</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-sky-500">
          <span className="text-xs font-bold text-slate-500 block mb-1">Graded Course Records</span>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.metrics?.total_graded_courses || 0}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Recorded in MySQL database</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-indigo-600">
          <span className="text-xs font-bold text-slate-500 block mb-1">{t.deptAvgCgpa}</span>
          <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {data?.metrics?.department_avg_cgpa?.toFixed(2) || '0.00'}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Class average standing</span>
        </div>

        <div className="glass-card rounded-3xl p-5 border-l-4 border-l-rose-500">
          <span className="text-xs font-bold text-slate-500 block mb-1">{t.debarredAlerts}</span>
          <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {data?.metrics?.debarred_alert_count || 0}
          </span>
          <span className="text-xs text-slate-400 block mt-1">Attendance &lt; 75% threshold</span>
        </div>

      </div>

      {/* Students Directory */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'bn' ? 'শিক্ষার্থীদের তালিকা ও লাইভ সিজিপিএ' : 'Enrolled Students & Live CGPA Records'}</span>
          </h2>

          {/* Search Bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'bn' ? 'নাম বা আইডি দিয়ে খুঁজুন...' : 'Search by name or ID...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Level / Term</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-center">Live CGPA</th>
                <th className="py-2.5 px-3 text-center">Target</th>
                <th className="py-2.5 px-3 text-center">Credits Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-400">
                    {lang === 'bn' ? 'কোনো শিক্ষার্থী পাওয়া যায়নি' : 'No matching student found'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      #{s.student_id || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {s.level_term}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {s.department}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-extrabold text-sm px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {s.live_cgpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-sky-600 dark:text-sky-400">
                      {s.target_cgpa}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400 font-semibold">
                      {s.live_credits} / 140 cr
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
