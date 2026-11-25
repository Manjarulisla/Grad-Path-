import React, { useState } from 'react';
import { Sparkles, Brain, Bot, Send, ArrowRight, Lightbulb, BookOpen, AlertCircle, Target, CheckCircle } from 'lucide-react';

export default function AiAdvisor({ cgpaData, t, lang }) {
  const [selectedPrompt, setSelectedPrompt] = useState('cgpa_recovery');
  const [customQuery, setCustomQuery] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      title: '🎓 Welcome to GradPath AI Academic Advisor!',
      content: lang === 'bn' 
        ? 'আমি আপনার ব্যক্তিগত একাডেমিক এবং সিজিপিএ উপদেষ্টা। আপনি ২.৯৮ থেকে ৩.৮০+ সিজিপিএ অর্জনের গাণিতিক কৌশল, রিটেক পরিকল্পনা, কিংবা পড়ার রুটিন সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।'
        : 'I am your personal Academic Advisor & CGPA Optimization Strategist. You can ask me how to jump from 2.98 to 3.80+ CGPA, identify optimal retake courses, or craft a 14-week study plan.'
    }
  ]);

  const presetResponses = {
    cgpa_recovery: {
      title: lang === 'bn' ? '🚀 ২.৯৮ থেকে ৩.৮০+ সিজিপিএ তোলার সম্পূর্ণ রোডম্যাপ' : '🚀 Mathematical Roadmap: Jump from 2.98 to 3.80+ CGPA',
      content: lang === 'bn' ? `
### 📊 বাস্তব অবস্থা ও গাণিতিক বিশ্লেষণ:
* **বর্তমান CGPA:** ২.৯৮ (ধরি ৩৬ ক্রেডিট সম্পন্ন)
* **টার্গেট CGPA:** ৩.৮০ - ৩.৯৭
* **বাস্তব সত্য:** যদি বাকি ১০৪ ক্রেডিটে আপনি টানা ৪.০০ (সবগুলোতে A+) পান, তাও রিটেক ছাড়া সরাসরি ৩.৯৭ এ পৌঁছানো গাণিতিকভাবে অসম্ভব (সর্বোচ্চ সম্ভব ~৩.৭৪)।
* **সমাধান (The Golden Rule):** আপনাকে অবশ্যই পূর্বের **কম গ্রেড পাওয়া বিষয়গুলোতে রিটেক (Retake)** দিতে হবে।

---

### 🔑 ৪ ধাপের রিকভারি অ্যাকশন প্ল্যান:

1. **১ম ধাপ: রিটেক প্রায়োরিটি (High Impact Retakes):**
   * যেসব বিষয়ে আপনি **C (2.25)**, **D (2.00)** বা **F (0.00)** পেয়েছিলেন, সেগুলোর মধ্য থেকে ৩ বা ৪ ক্রেডিটের দুটি বিষয় রিটেক দিন।
   * একটি ৩ ক্রেডিটের কোর্সে ২.০০ থেকে ৪.০০ পেলে আপনার সামগ্রিক CGPA এক ধাক্কায় **+০.০৭ থেকে +০.১০** বেড়ে যাবে!

2. **২য় ধাপ: রানিং সেমিস্টারের গোল (Term 3 & 4):**
   * চলমান প্রতিটি সেমিস্টারে ন্যূনতম **৩.৮৫+ SGPA** লক্ষ্য নির্ধারণ করুন।
   * ৫টি কোর্সের মধ্যে ৩টিতে A+ এবং ২টিতে A নিশ্চিত করতে হবে।

3. **৩য় ধাপ: ইনকোর্স ও কুইজ মার্কস রক্ষা (Continuous Assessment):**
   * ইনকোর্স পরীক্ষায় (৪০ নম্বর) আগে থেকেই সর্বোচ্চ নম্বর নিশ্চিত করুন (৩৫+ তোলার চেষ্টা করুন)। এতে ফাইনালে মাত্র ৪৫ পেলেই নিশ্চিত A+ চলে আসবে।

4. **৪র্থ ধাপ: পোমোডোরো ও সেফ-বাঙ্ক ব্যালেন্স:**
   * দৈনিক ৩টি ২৫-মিনিট পোমোডোরো সেশন দিন। ক্লাসের উপস্থিতি কখনোই ৭৫%-এর নিচে নামতে দেবেন না।
      ` : `
### 📊 Mathematical Feasibility Analysis:
* **Current CGPA:** 2.98 (~36 completed credits)
* **Target CGPA:** 3.80 - 3.97
* **Mathematical Reality:** Without retaking prior courses, scoring 4.00 in all remaining 104 credits caps your maximum possible CGPA at **~3.74**.
* **The Solution (The Golden Rule):** Retaking low-grade prerequisite courses (C, D, F) is mathematically mandatory to reach 3.80+.

---

### 🔑 4-Step Academic Recovery Strategy:

1. **Step 1: Strategic Retakes (Maximum Boost per Credit):**
   * Identify previous courses where you scored C (2.25) or D (2.00).
   * Retaking two 3.0-credit courses and upgrading from D (2.00) to A+ (4.00) directly adds **+0.12** to your cumulative CGPA!

2. **Step 2: Term SGPA Target (Upcoming Terms):**
   * Target an SGPA of **3.85 - 3.95** in upcoming terms. Out of 5 courses, aim for 3 A+'s and 2 A's.

3. **Step 3: Secure Continuous Assessment (40 Marks):**
   * Target 35+ out of 40 in attendance, assignments, and class tests. That leaves needing only 45/60 in finals for an A+.

4. **Step 4: Consistent Focus Tracking:**
   * Use the GradPath Pomodoro timer for 75 minutes of uninterrupted deep work every evening.
      `
    },
    retake_guide: {
      title: lang === 'bn' ? '🔄 কোন বিষয়গুলো আগে রিটেক দেওয়া উচিত?' : '🔄 Which Courses Should You Retake First?',
      content: lang === 'bn' ? `
### 🎯 রিটেক বাছাই করার বৈজ্ঞানিক নিয়ম:
1. **সর্বোচ্চ ক্রেডিট বিশিষ্ট কোর্স:** ২ ক্রেডিট কোর্সের চেয়ে **৩ বা ৪ ক্রেডিটের** বিষয়ে রিটেক দিলে CGPA দ্বিগুণ বাড়ে।
2. **গ্রেড গ্যাপ ($$\Delta GP$$) নিয়ম:**
   * F (0.00) ➔ A+ (4.00) : লাভ **+৪.০০ পয়েন্ট**
   * D (2.00) ➔ A+ (4.00) : লাভ **+২.০০ পয়েন্ট**
   * B (3.00) ➔ A+ (4.00) : লাভ মাত্র **+১.০০ পয়েন্ট**
3. **পরামর্শ:** C বা D পাওয়া বিষয় আগে রিটেক দিন, B পাওয়া বিষয় রিটেক দিয়ে সময় নষ্ট করবেন না।
      ` : `
### 🎯 Scientific Retake Prioritization:
1. **High Credit Multiplier:** Prioritize 3.0 and 4.0 credit core courses over 1.5 credit labs.
2. **Maximum Grade Gap ($$\Delta GP$$):**
   * Upgrading F (0.00) ➔ A+ (4.00) gives **+4.00 points per credit**.
   * Upgrading D (2.00) ➔ A+ (4.00) gives **+2.00 points per credit**.
   * Upgrading B (3.00) ➔ A+ (4.00) gives only **+1.00 point per credit**.
3. **Recommendation:** Focus exclusively on courses with grades below 2.50 (C/D/F).
      `
    },
    course_strategy: {
      title: lang === 'bn' ? '💻 কোর কোর্স ও ল্যাবে A+ (৮০%+) পাওয়ার কৌশল' : '💻 Blueprint to Secure A+ in Core Courses & Labs',
      content: lang === 'bn' ? `
### 🏆 কোর কোর্স ও সেশনালে সর্বোচ্চ গ্রেড পাওয়ার উপায়:
1. **প্রজেক্ট আর্কিটেকচার:** Clean Architecture অনুসরণ করুন এবং মডার্ন টেকনোলজি স্ট্যাক ব্যবহার করুন।
2. **ল্যাব রিপোর্ট ও ভাইভা:** কোডের প্রতি লাইনের ব্যাখ্যা জানা থাকা দরকার এবং নিয়মিত ল্যাব প্র্যাকটিস করুন।
3. **ধারাবাহিক অনুশীলন:** ক্লাসের টপিকগুলো নিয়মিত রিভিশন দিন এবং উইকলি প্রবলেম সলভ করুন।
4. **প্রেজেন্টেশন ও ডকুমেন্টেশন:** শিক্ষকদের সামনে শুধু কোড নয়, সিস্টেম আর্কিটেকচার ও লাইভ ডেমো দিয়ে দক্ষতা প্রমাণ করুন।
      ` : `
### 🏆 Blueprint to Score A+ (80%+) in Core Engineering Courses:
1. **Modern Architecture:** Focus on clean code, structured design patterns, and robust implementation.
2. **Viva Readiness:** Deeply understand fundamental concepts, data structures, algorithms, and system architecture.
3. **Continuous Practice:** Complete all laboratory tasks on schedule and test boundary cases.
4. **Effective Presentation:** Prepare well-structured project documentation and live interactive demonstrations.
      `
    }
  };

  const handleSelectPreset = (key) => {
    setSelectedPrompt(key);
    const preset = presetResponses[key];
    setChatLog(prev => [
      ...prev,
      { sender: 'user', content: preset.title },
      { sender: 'ai', title: preset.title, content: preset.content }
    ]);
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    const query = customQuery.trim();
    setChatLog(prev => [
      ...prev,
      { sender: 'user', content: query },
      {
        sender: 'ai',
        title: '🤖 Academic Advisory Insight',
        content: lang === 'bn'
          ? `আপনার প্রশ্ন: "${query}" এর প্রেক্ষিতে পরামর্শ হলো: ধারাবাহিক ক্লাসে উপস্থিতি নিশ্চিত করুন (ন্যূনতম ৮০%), প্রজেক্টের ল্যাব ওয়ার্ক শেষ করুন এবং ফাইনালের আগের ২ সপ্তাহে বিগত বছরের প্রশ্নগুলো রিভিশন দিন। প্রয়োজনে GradPath-এর "Final Marks Calculator" ব্যবহার করে লক্ষ্যমাত্রা নির্ধারণ করুন।`
          : `In response to "${query}": Maintain consistent class attendance (>80%), complete all weekly lab deliverables early, and dedicate the last 2 weeks before finals to past-paper solving and viva rehearsals.`
      }
    ]);
    setCustomQuery('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'স্মার্ট এআই একাডেমিক উপদেষ্টা ও সিজিপিএ রিকভারি গাইড' : 'Smart AI Academic Advisor & CGPA Recovery Guide'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {lang === 'bn' 
                ? 'সিজিপিএ বৃদ্ধি এবং একাডেমিক উন্নতির জন্য বিশেষজ্ঞ গাণিতিক কৌশল ও পরামর্শ।' 
                : 'Interactive AI consultant trained on standard 4.00 grading scale, retake optimization, and academic roadmaps.'}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Topics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => handleSelectPreset('cgpa_recovery')}
          className="glass-card p-4 rounded-2xl text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
        >
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
            {lang === 'bn' ? 'গাণিতিক রোডম্যাপ' : 'Strategy 1'}
          </span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
            {lang === 'bn' ? '২.৯৮ থেকে ৩.৮০+ তোলার কৌশল' : 'Jump from 2.98 to 3.80+ CGPA'}
          </span>
        </button>

        <button
          onClick={() => handleSelectPreset('retake_guide')}
          className="glass-card p-4 rounded-2xl text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
        >
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-1">
            {lang === 'bn' ? 'রিটেক অপ্টিমাইজেশন' : 'Strategy 2'}
          </span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
            {lang === 'bn' ? 'কোন বিষয়গুলো আগে রিটেক দেব?' : 'Prioritize High-Boost Retakes'}
          </span>
        </button>

        <button
          onClick={() => handleSelectPreset('course_strategy')}
          className="glass-card p-4 rounded-2xl text-left hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
        >
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
            {lang === 'bn' ? 'কোর্স ব্লুপ্রিন্ট' : 'Strategy 3'}
          </span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
            {lang === 'bn' ? 'কোর কোর্সে A+ নিশ্চিত করার নিয়ম' : 'How to get A+ in Core Courses'}
          </span>
        </button>
      </div>

      {/* Chat Thread Container */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {chatLog.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-3xl p-5 rounded-3xl ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-sm'
              }`}>
                {msg.title && (
                  <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-400 mb-2">
                    {msg.title}
                  </h3>
                )}
                <div className="text-xs leading-relaxed whitespace-pre-line font-sans">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendCustom} className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'একাডেমিক উন্নতি বা সিজিপিএ সম্পর্কে যেকোনো প্রশ্ন লিখুন...' : 'Ask your academic question...'}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
