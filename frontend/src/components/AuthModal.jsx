import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Hash, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Building2
} from 'lucide-react';
import UftbLogo from './UftbLogo';
import { api } from '../api';

export default function AuthModal({ onLoginSuccess, t, lang }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [university, setUniversity] = useState('University of Frontier Technology, Bangladesh (UFTB)');
  const [customUniversity, setCustomUniversity] = useState('');
  const [department, setDepartment] = useState('Cyber Security Engineering');
  const [levelTerm, setLevelTerm] = useState('Level 2, Term 1');
  const [targetCgpa, setTargetCgpa] = useState('3.80');
  const [role, setRole] = useState('STUDENT');

  // Forgot password OTP states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCodeSent, setOtpCodeSent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (authMode === 'register') {
        const finalUniversity = university === 'Other' ? (customUniversity.trim() || 'Custom University') : university;
        const res = await api.register({
          name,
          email,
          password,
          student_id: studentId,
          university: finalUniversity,
          department,
          level_term: levelTerm,
          target_cgpa: parseFloat(targetCgpa),
          role
        });
        localStorage.setItem('gradpath_token', res.token);
        onLoginSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        localStorage.setItem('gradpath_token', res.token);
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError(lang === 'bn' ? 'দয়া করে আপনার ইমেইল বা স্টুডেন্ট আইডি প্রদান করুন।' : 'Please enter your registered email or student ID.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.sendOtp(forgotEmail);
      setOtpSent(true);
      setOtpCodeSent(res.otp);
      setSuccessMsg(lang === 'bn' 
        ? `যাচাইকরণ কোড তৈরি হয়েছে! আপনার ৬ ডিজিটের কোড: ${res.otp}` 
        : `Verification code generated! Your 6-digit code is: ${res.otp}`);
    } catch (err) {
      setError(err.message || (lang === 'bn' ? 'কোড পাঠানো ব্যর্থ হয়েছে।' : 'Failed to send verification code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp || otp.trim().length !== 6) {
      setError(lang === 'bn' ? 'দয়া করে ৬ ডিজিটের ভেরিফিকেশন কোড লিখুন।' : 'Please enter a valid 6-digit verification code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(lang === 'bn' ? 'দুইটি পাসওয়ার্ড মিলছে না!' : 'New passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      setError(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        email: forgotEmail,
        otp: otp.trim(),
        new_password: newPassword
      });
      setSuccessMsg(res.message || (lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password reset successfully!'));
      setEmail(forgotEmail);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setOtpSent(false);
      setTimeout(() => {
        setAuthMode('login');
      }, 1500);
    } catch (err) {
      setError(err.message || (lang === 'bn' ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।' : 'Password reset failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Clean Header Card (No hardcoded university name) */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <UftbLogo className="w-16 h-16" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Grad<span className="text-emerald-600 dark:text-emerald-400">Path</span>
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {lang === 'bn' ? 'স্মার্ট সিজিপিএ প্ল্যানার ও একাডেমিক ট্র্যাকার' : 'Smart CGPA Planner & Academic Tracker'}
          </p>
        </div>

        {/* Auth Box */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800">
          
          {/* Tab Switcher (Sign In vs Register) */}
          {authMode !== 'forgot' ? (
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  authMode === 'login' 
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  authMode === 'register' 
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.register}
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backToLogin || 'Back to Sign In'}</span>
              </button>
              <span className="text-xs font-bold text-slate-400">
                {t.resetPassword || 'Reset Password'}
              </span>
            </div>
          )}

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Forgot Password Flow with OTP Verification */}
          {authMode === 'forgot' ? (
            <form onSubmit={otpSent ? handleResetPassword : handleSendOtp} className="space-y-4">
              <div className="text-center pb-1">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600 mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'যাচাইকরণ কোড (OTP) দিয়ে পাসওয়ার্ড রিসেট' : 'Verified Password Reset (OTP)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'bn' 
                    ? 'আপনার পরিচয় নিশ্চিত করতে ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হবে।' 
                    : 'A 6-digit verification code will be sent to verify your identity.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'নিবন্ধিত ইমেইল বা স্টুডেন্ট আইডি' : 'Registered Email or Student ID'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    disabled={otpSent}
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="2404031@uftb.ac.bd or student@gmail.com"
                    className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>{lang === 'bn' ? 'কোড পাঠানো হচ্ছে...' : 'Sending Code...'}</span>
                  ) : (
                    <span>{lang === 'bn' ? '📩 যাচাইকরণ কোড পাঠান' : '📩 Send Verification Code'}</span>
                  )}
                </button>
              ) : (
                <>
                  {otpCodeSent && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium space-y-1 text-center">
                      <div className="font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'bn' ? 'আপনার ৬ ডিজিটের যাচাইকরণ কোড:' : 'Your 6-Digit Verification Code:'}</span>
                      </div>
                      <div className="text-2xl font-black tracking-widest text-emerald-600 dark:text-emerald-400 font-mono py-1">
                        {otpCodeSent}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === 'bn' ? 'কোডটি নিচের বক্সে লিখুন এবং নতুন পাসওয়ার্ড সেট করুন।' : 'Enter this 6-digit code below to set your new password.'}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {lang === 'bn' ? '৬ ডিজিটের কোড (6-Digit OTP Code)' : '6-Digit Verification Code'}
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm tracking-widest font-mono text-center font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.newPassword || 'New Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.confirmNewPassword || 'Confirm New Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(''); }}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {lang === 'bn' ? 'পুনরায় পাঠান' : 'Resend Code'}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>{lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
                      ) : (
                        <span>{lang === 'bn' ? 'কোড যাচাই ও পরিবর্তন' : 'Verify & Set Password'}</span>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            /* Login & Register Form */
            <form onSubmit={handleAuth} className="space-y-4">
              
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.fullName}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Shakil Ahmed"
                        className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* University Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {lang === 'bn' ? 'বিশ্ববিদ্যালয় (Select University)' : 'University / Institution'}
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <select
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="University of Frontier Technology, Bangladesh (UFTB)">University of Frontier Technology, Bangladesh (UFTB)</option>
                        <option value="Bangladesh University of Engineering and Technology (BUET)">Bangladesh University of Engineering and Technology (BUET)</option>
                        <option value="University of Dhaka (DU)">University of Dhaka (DU)</option>
                        <option value="Rajshahi University of Engineering & Technology (RUET)">Rajshahi University of Engineering & Technology (RUET)</option>
                        <option value="Chittagong University of Engineering & Technology (CUET)">Chittagong University of Engineering & Technology (CUET)</option>
                        <option value="Khulna University of Engineering & Technology (KUET)">Khulna University of Engineering & Technology (KUET)</option>
                        <option value="Shahjalal University of Science and Technology (SUST)">Shahjalal University of Science and Technology (SUST)</option>
                        <option value="Other">Other University / অন্যান্য বিশ্ববিদ্যালয়</option>
                      </select>
                    </div>
                    {university === 'Other' && (
                      <input
                        type="text"
                        required
                        value={customUniversity}
                        onChange={(e) => setCustomUniversity(e.target.value)}
                        placeholder="Type your university name..."
                        className="w-full mt-2 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {role === 'ADMIN' ? (lang === 'bn' ? 'শিক্ষক / ফ্যাকাল্টি আইডি' : 'Teacher / Faculty ID') : t.studentId}
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder={role === 'ADMIN' ? 'EMP-CSE-102' : 'e.g. 2404031'}
                          className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t.accountType}
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      >
                        <option value="STUDENT">🎓 {lang === 'bn' ? 'শিক্ষার্থী (Student)' : 'Student'}</option>
                        <option value="ADMIN">👨‍🏫 {lang === 'bn' ? 'শিক্ষক / অ্যাডমিন (Teacher / Admin)' : 'Teacher / Admin'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {lang === 'bn' ? 'বিভাগ (Department)' : 'Department'}
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Computer Science & Engineering"
                        className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t.levelTerm}
                      </label>
                      <input
                        type="text"
                        value={levelTerm}
                        onChange={(e) => setLevelTerm(e.target.value)}
                        placeholder="Level 2, Term 1"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t.targetCgpa}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="2.00"
                        max="4.00"
                        value={targetCgpa}
                        onChange={(e) => setTargetCgpa(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {authMode === 'register' 
                    ? (lang === 'bn' ? 'বিশ্ববিদ্যালয় / প্রাতিষ্ঠানিক ইমেইল (Academic Email)' : 'University / Academic Email') 
                    : (t.email || 'Email Address / Student ID')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authMode === 'register' ? (university.includes('UFTB') ? '2404031@uftb.ac.bd' : 'student@university.edu') : '2404031 or student@gmail.com'}
                    className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.password}
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setAuthMode('forgot');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {t.forgotPassword || 'Forgot Password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>{lang === 'bn' ? 'অপেক্ষা করুন...' : 'Processing...'}</span>
                ) : (
                  <>
                    <span>{authMode === 'register' ? t.register : t.login}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
