// src/services/reportsApi.js
// All reporting endpoints. Each returns structured data ready for charts + PDF.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function get(path) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

const qs = (params) => {
  const p = Object.fromEntries(Object.entries(params).filter(([, v]) => v != null));
  return new URLSearchParams(p).toString();
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const reportsApi = {
  headcount: async (p) => { if (USE_MOCK) { await delay(); return { data: MOCK_REPORTS.headcount }; } return get(`/reports/headcount?${qs(p)}`); },
  attendance: async (p) => { if (USE_MOCK) { await delay(); return { data: MOCK_REPORTS.attendance }; } return get(`/reports/attendance?${qs(p)}`); },
  leave: async (p) => { if (USE_MOCK) { await delay(); return { data: MOCK_REPORTS.leave }; } return get(`/reports/leave?${qs(p)}`); },
  payroll: async (p) => { if (USE_MOCK) { await delay(); return { data: MOCK_REPORTS.payroll }; } return get(`/reports/payroll?${qs(p)}`); },
  performance: async (p) => { if (USE_MOCK) { await delay(); return { data: MOCK_REPORTS.performance }; } return get(`/reports/performance?${qs(p)}`); },
};

// ── Mock data (used when VITE_USE_MOCK=true) ──────────────────────────

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DEPTS = ['Engineering', 'Design', 'Marketing', 'Operations', 'Finance'];

export const MOCK_REPORTS = {
  headcount: {
    summary: { total: 142, active: 138, inactive: 4, new_hires_30d: 7, departures_30d: 2, growth_pct: 5.2 },
    by_department: DEPTS.map((name, i) => ({
      name, count: [45, 18, 22, 31, 26][i],
      pct: [32, 13, 15, 22, 18][i],
      new_hires: rand(0, 3),
    })),
    by_status: [
      { status: 'active', count: 138 },
      { status: 'inactive', count: 4 },
    ],
    trend: MONTHS.map((month, i) => ({
      month, total: 110 + i * 3 + rand(-1, 2),
    })),
  },

  attendance: {
    summary: { avg_attendance_pct: 84, avg_hours_per_day: 7.6, total_check_ins: 2840, total_absences: 312 },
    trend: MONTHS.map((month, i) => ({
      month,
      present: rand(110, 130),
      absent: rand(10, 30),
      late: rand(5, 15),
      avg_hours: (7 + Math.random()).toFixed(1),
    })),
    by_department: DEPTS.map((name) => ({
      name,
      avg_pct: rand(75, 95),
      avg_hours: (7 + Math.random()).toFixed(1),
    })),
    by_day_of_week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => ({
      day, avg_present: rand(100, 130),
    })),
  },

  leave: {
    summary: { total_requests: 87, approved: 62, rejected: 11, pending: 14, total_days_taken: 284 },
    by_department: DEPTS.map((name, i) => ({
      name,
      total: rand(8, 25),
      approved: rand(5, 20),
      rejected: rand(1, 5),
      avg_days: rand(2, 6),
    })),
    by_type: [
      { type: 'Annual Leave', count: 42, days: 168 },
      { type: 'Sick Leave', count: 21, days: 52 },
      { type: 'Personal', count: 14, days: 38 },
      { type: 'Medical', count: 6, days: 18 },
      { type: 'Other', count: 4, days: 8 },
    ],
    trend: MONTHS.map((month) => ({
      month, requests: rand(4, 12), days: rand(10, 40),
    })),
  },

  payroll: {
    summary: {
      total_gross: 18430000,
      total_net: 17048000,
      total_deductions: 1382000,
      total_bonuses: 975000,
      avg_salary: 418000,
      headcount: 44,
    },
    by_department: DEPTS.map((name, i) => ({
      name,
      total_gross: [920000, 380000, 440000, 620000, 480000][i],
      headcount: [45, 18, 22, 31, 26][i],
      avg_salary: [20444, 21111, 20000, 20000, 18461][i],
    })),
    trend: MONTHS.map((month, i) => ({
      month,
      gross: 240000 + i * 3000 + rand(-5000, 5000),
      net: 200000 + i * 2500 + rand(-4000, 4000),
      bonuses: rand(5000, 20000),
    })),
    salary_bands: [
      { band: '₦0–100k', count: 12 },
      { band: '₦100–300k', count: 38 },
      { band: '₦300–500k', count: 51 },
      { band: '₦500k–1M', count: 28 },
      { band: '₦1M+', count: 13 },
    ],
  },

  performance: {
    summary: { avg_rating: 4.1, reviews_completed: 134, top_performers: 48, needs_attention: 18, completion_pct: 94 },
    distribution: [
      { rating: 5, count: 28, label: 'Exceptional' },
      { rating: 4, count: 62, label: 'Strong' },
      { rating: 3, count: 26, label: 'Meeting' },
      { rating: 2, count: 12, label: 'Developing' },
      { rating: 1, count: 6, label: 'Needs Support' },
    ],
    by_department: DEPTS.map((name) => ({
      name,
      avg_rating: (3.5 + Math.random()).toFixed(1),
      reviewed: rand(10, 40),
      top_pct: rand(25, 55),
    })),
    trend: MONTHS.slice(0, 4).map((month) => ({
      month, avg_rating: (3.8 + Math.random() * 0.5).toFixed(2),
    })),
  },
};
