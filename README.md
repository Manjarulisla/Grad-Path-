# 🎓 GradPath: Smart CGPA Planner & Academic Tracker

**University of Frontier Technology, Bangladesh (UFTB)**  
**Department of Cyber Security Engineering**  
**Course Name:** Android and Web Application Development Sessional (PROG212)  
**Faculty Instructor & Supervisor:** Md. Abdullah, Lecturer, Dept. of Cyber Security Engineering  

---

## 👥 Project Team Members
| Student Name | Student ID | Email | Level / Term | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Md. Mobinur Mustofa Kawsar** | 2404031 | 2404031@uftb.ac.bd | Level 2, Term 1 | Project Lead & Developer |
| **Md. Manjarul Islam Tamim** | 2404026 | 2404026@uftb.ac.bd | Level 2, Term 1 | Co-Developer & Analyst |

---

## 🚀 How to Run the Project (টিমমেটের জন্য নির্দেশিকা)

টিমমেট বা যেকোনো সহযোগী এই প্রজেক্টটি দুইটি উপায়ে চালাতে পারবেন:

### 🌟 পদ্ধতি ১: সরাসরি অনলাইন লিংকের মাধ্যমে (কোনো কিছু ইন্সটল করা ছাড়া)
যদি হোস্ট পিসিতে প্রজেক্টটি চালু থাকে, তাহলে যেকোনো ফোন বা ল্যাপটপের ব্রাউজার দিয়ে সরাসরি নিচের লিংকে যান:
👉 **[https://8c10d01bca7418.app.lhr.life](https://8c10d01bca7418.app.lhr.life)**
* লগইন করুন **Tamim** এর আইডি `2404026` অথবা ইমেইল `2404026@uftb.ac.bd` এবং পাসওয়ার্ড `Student@12345` দিয়ে।

---

### 💻 পদ্ধতি ২: গিটহাব থেকে ক্লোন করে নিজের পিসিতে চালানো (Local Run)

#### ধাপ ১: গিটহাব থেকে প্রজেক্ট ডাউনলোড বা ক্লোন করুন
```bash
git clone https://github.com/2404031-cyber/GradPath.git
```
*(অথবা গিটহাব রিপোজিটরির **Code ➔ Download ZIP** বাটনে ক্লিক করে ফাইলটি Extract করুন)*

#### ধাপ ২: XAMPP ওপেন করে MySQL Start করুন
* আপনার পিসিতে **XAMPP Control Panel** ওপেন করুন।
* **MySQL** মডিউলের পাশে **Start** বাটনে ক্লিক করুন (Port: 3306)।

#### ধাপ ৩: One-Click Setup & Launch (এক ক্লিকে চালু)
* প্রজেক্ট ফোল্ডারে থাকা **`setup_and_run.bat`** ফাইলে ডাবল-ক্লিক করুন।
* এটি স্বয়ংক্রিয়ভাবে:
  1. ব্যাকএন্ড ও ফ্রন্টএন্ডের সমস্ত লাইব্রেরি (`npm install`) ইন্সটল করবে।
  2. ডাটাবেজ `gradpath_db` তৈরি করে টেবিল ও কারিকুলাম ডেটা লোড করবে।
  3. ব্যাকএন্ড এপিআই (Port 5000) ও ফ্রন্টএন্ড সার্ভার (Port 5173) চালু করবে।
  4. আপনার ব্রাউজারে স্বয়ংক্রিয়ভাবে [http://localhost:5173](http://localhost:5173) ওপেন করবে!

---

### 🛠️ ম্যানুয়াল কমান্ড (যদি টার্মিনাল ব্যবহার করতে চান):

**১. Backend চালু করতে:**
```bash
cd backend
npm install
node server.js
```

**২. Frontend চালু করতে:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 লগইন তথ্য (Login Credentials)

| Role | Name | Email / ID | Default Password |
| :--- | :--- | :--- | :--- |
| **Student (Teammate)** | Md. Manjarul Islam Tamim | `2404026` অথবা `2404026@uftb.ac.bd` | `Student@12345` |
| **Student (Lead)** | Md. Mobinur Mustofa Kawsar | `2404031` অথবা `2404031@uftb.ac.bd` | `KawsarPassword@123` |
| **Instructor & Admin** | Md. Abdullah | `mdabdullah0001@uftb.ac.bd` | `Admin@12345` |

*(পাসওয়ার্ড রিসেটের জন্য **Forgot Password** অপশনে গিয়ে ৬ ডিজিটের ভেরিফিকেশন কোডের মাধ্যমে নতুন পাসওয়ার্ড দেওয়া যাবে)*

---

## 🌟 প্রধান ফিচারসমূহ (Core Features)

1. **Bangladeshi 4.00 CGPA & SGPA Engine:**
   * সঠিক ক্রেডিট-ওয়েটেড সিজিপিএ ফর্মুলা:
     $$\text{CGPA} = \frac{\sum (\text{Credits} \times \text{Grade Point})}{\sum \text{Credits}}$$
   * অফিসিয়াল সিলেবাস অনুযায়ী সব কোর্স (CySE 111-117, CSE 201-204, PROG 211-212 ইত্যাদি) প্রি-লোডেড।

2. **CGPA Target Predictor:**
   * বর্তমান সিজিপিএ থেকে কাঙ্ক্ষিত সিজিপিএ অর্জনের গাণিতিক প্রেডিকশন:
     $$\text{ReqGPA} = \frac{\text{Target} \times (C_d + C_n) - (\text{CGPA} \times C_d)}{C_n}$$

3. **Official PDF Transcript Generator:**
   * এক ক্লিকে অফিশিয়াল ক্রেডিট অডিট ও সিজিপিএ ট্রান্সক্রিপ্ট ডাউনলোড।

4. **Safe-Bunk & 75% Attendance Tracker:**
   * ক্লাসের উপস্থিতির ওপর ভিত্তি করে কতটি ক্লাস নিরাপদে মিস দেওয়া যাবে তার লাইভ অ্যালার্ট।

5. **AI Academic Advisor & Pomodoro Study Timer:**
   * সিজিপিএ রিকভারি রোডম্যাপ ও পড়ার টাইমার।

6. **Admin Faculty Portal:**
   * শিক্ষকদের জন্য সকল শিক্ষার্থীর অগ্রগতি পর্যবেক্ষণ ও CSV রোস্টার ডাউনলোড সুবিধা।
