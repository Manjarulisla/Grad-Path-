const API_BASE_URL = '/api';

function getHeaders() {
  const token = localStorage.getItem('gradpath_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {})
      }
    });

    const text = await res.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
    }

    if (!res.ok) {
      const msg = data.error || (res.status === 502 || res.status === 504 
        ? 'Backend API is currently offline. Please ensure the backend server is running.' 
        : `Server returned error (${res.status})`);
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error('Unable to connect to the backend server. Please check your connection or restart the server.');
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(userData) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async resetPassword(resetData) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(resetData)
    });
  },

  async sendOtp(email) {
    return request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async getMe() {
    return request('/auth/me');
  },

  async updateProfile(profileData) {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Semesters & Courses
  async getSemesters() {
    return request('/semesters');
  },

  async addSemester(semesterData) {
    return request('/semesters', {
      method: 'POST',
      body: JSON.stringify(semesterData)
    });
  },

  async deleteSemester(id) {
    return request(`/semesters/${id}`, {
      method: 'DELETE'
    });
  },

  async addCourse(courseData) {
    return request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  async updateCourse(id, courseData) {
    return request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  },

  async deleteCourse(id) {
    return request(`/courses/${id}`, {
      method: 'DELETE'
    });
  },

  // Calculation Engine
  async getCgpa() {
    return request('/engine/cgpa');
  },

  async predictTarget(targetData) {
    return request('/engine/target-predict', {
      method: 'POST',
      body: JSON.stringify(targetData)
    });
  },

  async runWhatIf(simulatedCourses) {
    return request('/engine/whatif', {
      method: 'POST',
      body: JSON.stringify({ simulated_courses: simulatedCourses })
    });
  },

  async getRetakePlanner() {
    return request('/engine/retake-planner');
  },

  async calculateFinalMarks(params) {
    return request('/engine/final-marks', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  async getAttendanceReport(minRatio = 0.75) {
    return request(`/engine/attendance?min_ratio=${minRatio}`);
  },

  // Study & Pomodoro
  async getStudySchedule() {
    return request('/study/schedule');
  },

  async createStudyTask(taskData) {
    return request('/study/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  },

  async updateStudyTask(id, taskData) {
    return request(`/study/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData)
    });
  },

  async deleteStudyTask(id) {
    return request(`/study/tasks/${id}`, {
      method: 'DELETE'
    });
  },

  async logPomodoroSession(sessionData) {
    return request('/study/pomodoro', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
  },

  async getPomodoroStats() {
    return request('/study/pomodoro/stats');
  },

  // Admin
  async getAdminOverview() {
    return request('/admin/overview');
  }
};
