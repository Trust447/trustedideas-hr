// src/services/api.js
// VITE_USE_MOCK=true  → returns mock data, zero network calls
// VITE_USE_MOCK=false → calls real backend at VITE_API_URL

import {
  MOCK_USER, MOCK_EMPLOYEES, MOCK_DEPARTMENTS,
  MOCK_ATTENDANCE, ATTENDANCE_SUMMARY,
  MOCK_LEAVE, MOCK_PAYROLL, PAYROLL_SUMMARY,
  MOCK_PERFORMANCE, MOCK_ROLES, ALL_PERMISSIONS,
  MOCK_ACTIVITY,
} from '../store/mockData.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const BASE     = import.meta.env.VITE_API_URL  || 'http://localhost:3000';

// Realistic loading delay so skeleton states show briefly
const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

// Standard response envelope
const ok = (data) => ({ data });

// Paginate an array and return { data, meta }
const paginate = (arr, params = {}) => {
  const page     = Math.max(1, parseInt(params.page     ?? 1,  10));
  const per_page = Math.max(1, parseInt(params.per_page ?? 20, 10));
  const start    = (page - 1) * per_page;
  return {
    data: arr.slice(start, start + per_page),
    meta: {
      total:       arr.length,
      page,
      per_page,
      total_pages: Math.max(1, Math.ceil(arr.length / per_page)),
    },
  };
};

// ── Real-API helpers ──────────────────────────────────────────
async function request(method, path, body) {
  const token = localStorage.getItem('access_token');
  const res   = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}
const _get = (p)    => request('GET',    p);
const _post= (p, b) => request('POST',   p, b);
const _put = (p, b) => request('PUT',    p, b);
const _del = (p)    => request('DELETE', p);
const qs   = (p={}) => {
  const clean = Object.fromEntries(
    Object.entries(p).filter(([,v]) => v != null && String(v) !== 'undefined')
  );
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
};

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email, password) => {
    if (USE_MOCK) {
      await delay(600);
      // Accept any credentials in mock mode
      return ok({ access_token:'mock', refresh_token:'mock', user: MOCK_USER });
    }
    return _post('/auth/login', { email, password });
  },
  logout:         () => USE_MOCK ? delay(200)   : _post('/auth/logout'),
  changePassword: (cur, next) => USE_MOCK
    ? (async () => { await delay(500); return ok({}); })()
    : _post('/auth/change-password', { current_password:cur, new_password:next }),
  updateProfile: (data) => USE_MOCK
    ? (async () => { await delay(400); return ok(data); })()
    : _put('/auth/profile', data),
};

// ─────────────────────────────────────────────────────────────
// EMPLOYEES
// ─────────────────────────────────────────────────────────────
export const employeesApi = {
  list: async (params = {}) => {
    if (USE_MOCK) {
      await delay();
      let list = [...MOCK_EMPLOYEES];

      // Search across name, position, email, department
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter((e) =>
          `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.department_name.toLowerCase().includes(q)
        );
      }

      // Filter by department
      if (params.department_id) {
        list = list.filter((e) => e.department_id === params.department_id);
      }

      // Filter by status (active / inactive)
      if (params.status && params.status !== 'undefined') {
        list = list.filter((e) => e.status === params.status);
      }

      return paginate(list, params);
    }
    return _get(`/employees${qs(params)}`);
  },

  get: async (id) => {
    if (USE_MOCK) {
      await delay();
      return ok(MOCK_EMPLOYEES.find((e) => e.id === id) ?? null);
    }
    return _get(`/employees/${id}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      await delay(500);
      const dept = MOCK_DEPARTMENTS.find((d) => d.id === data.department_id);
      return ok({ ...data, id:`e_${Date.now()}`, status:'active', department_name: dept?.name ?? '' });
    }
    return _post('/employees', data);
  },

  update: async (id, data) => {
    if (USE_MOCK) {
      await delay(500);
      const dept = MOCK_DEPARTMENTS.find((d) => d.id === data.department_id);
      return ok({ ...data, id, department_name: dept?.name ?? '' });
    }
    return _put(`/employees/${id}`, data);
  },

  delete: async (id) => {
    if (USE_MOCK) { await delay(400); return ok({ id }); }
    return _del(`/employees/${id}`);
  },
};

// ─────────────────────────────────────────────────────────────
// DEPARTMENTS
// ─────────────────────────────────────────────────────────────
export const departmentsApi = {
  list: async () => {
    if (USE_MOCK) { await delay(); return ok(MOCK_DEPARTMENTS); }
    return _get('/departments');
  },
};

// ─────────────────────────────────────────────────────────────
// ATTENDANCE
// AttendancePage + Dashboard both call attendanceApi.summary.
// The page expects: { total_present, total_checked_out, missing_checkouts, avg_hours }
// The table expects records with: employee_name, check_in, check_out, hours_worked
// ─────────────────────────────────────────────────────────────
export const attendanceApi = {
  summary: async () => {
    if (USE_MOCK) {
      await delay();
      // Return exactly the fields AttendancePage and DashboardPage read
      return ok({ ...ATTENDANCE_SUMMARY });
    }
    return _get('/attendance/summary');
  },

  list: async (params = {}) => {
    if (USE_MOCK) {
      await delay();
      // All dates show today's data in mock mode
      return paginate(MOCK_ATTENDANCE, params);
    }
    return _get(`/attendance${qs(params)}`);
  },

  checkIn: async (data) => {
    if (USE_MOCK) {
      await delay(400);
      return ok({ id:`a_${Date.now()}`, ...data, check_in:new Date().toISOString(), check_out:null, hours_worked:null });
    }
    return _post('/attendance/check-in', data);
  },

  checkOut: async (id) => {
    if (USE_MOCK) { await delay(400); return ok({ id, check_out:new Date().toISOString() }); }
    return _put(`/attendance/${id}/check-out`);
  },
};

// ─────────────────────────────────────────────────────────────
// LEAVE
// LeavePage + Dashboard reads: employee_name, start_date, end_date,
//   status, reason, days_requested
// ─────────────────────────────────────────────────────────────
export const leaveApi = {
  list: async (params = {}) => {
    if (USE_MOCK) {
      await delay();
      let list = [...MOCK_LEAVE];
      if (params.status && params.status !== 'undefined') {
        list = list.filter((l) => l.status === params.status);
      }
      return paginate(list, params);
    }
    return _get(`/leave${qs(params)}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      await delay(500);
      const emp  = MOCK_EMPLOYEES.find((e) => e.id === data.employee_id);
      const ms   = new Date(data.end_date) - new Date(data.start_date);
      const days = Math.max(1, Math.round(ms / 86400000) + 1);
      return ok({
        ...data,
        id:             `l_${Date.now()}`,
        status:         'pending',
        employee_name:  emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
        days_requested: days,
      });
    }
    return _post('/leave', data);
  },

  process: async (id, status) => {
    if (USE_MOCK) { await delay(400); return ok({ id, status }); }
    return _put(`/leave/${id}/process`, { status });
  },
};

// ─────────────────────────────────────────────────────────────
// PAYROLL
// PayrollPage table reads: employee_name, salary, bonus, deductions, net_pay, status
// PayrollPage summary reads: total_net_pay, total_salary, total_bonus,
//   total_deductions, employee_count
// ─────────────────────────────────────────────────────────────
export const payrollApi = {
  list: async (params = {}) => {
    if (USE_MOCK) { await delay(); return paginate(MOCK_PAYROLL, params); }
    return _get(`/payroll${qs(params)}`);
  },

  summary: async () => {
    if (USE_MOCK) {
      await delay();
      return ok({ ...PAYROLL_SUMMARY });
    }
    return _get('/payroll/summary');
  },

  run: async () => {
    if (USE_MOCK) { await delay(1400); return ok({ job_id:`job_${Date.now()}`, status:'processing' }); }
    return _post('/payroll/run', {});
  },
};

// ─────────────────────────────────────────────────────────────
// PERFORMANCE
// Table reads: employee_name, reviewer_name, rating, notes, review_date
// ─────────────────────────────────────────────────────────────
export const performanceApi = {
  list: async (params = {}) => {
    if (USE_MOCK) { await delay(); return paginate(MOCK_PERFORMANCE, params); }
    return _get(`/performance${qs(params)}`);
  },

  create: async (data) => {
    if (USE_MOCK) {
      await delay(500);
      const emp = MOCK_EMPLOYEES.find((e) => e.id === data.employee_id);
      return ok({
        ...data,
        id:            `r_${Date.now()}`,
        employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown',
        reviewer_name: `${MOCK_USER.first_name} ${MOCK_USER.last_name}`,
      });
    }
    return _post('/performance', data);
  },
};

// ─────────────────────────────────────────────────────────────
// ROLES
// ─────────────────────────────────────────────────────────────
export const rolesApi = {
  list:        async () => { if (USE_MOCK) { await delay(); return ok(MOCK_ROLES); }          return _get('/roles'); },
  permissions: async () => { if (USE_MOCK) { await delay(); return ok(ALL_PERMISSIONS); }    return _get('/roles/permissions'); },
  create: async (data) => {
    if (USE_MOCK) { await delay(500); return ok({ ...data, id:`rol_${Date.now()}` }); }
    return _post('/roles', data);
  },
  delete: async (id) => {
    if (USE_MOCK) { await delay(400); return ok({ id }); }
    return _del(`/roles/${id}`);
  },
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD ACTIVITY
// ─────────────────────────────────────────────────────────────
export const dashboardApi = {
  activity: async () => {
    if (USE_MOCK) { await delay(); return ok(MOCK_ACTIVITY); }
    return _get('/dashboard/activity');
  },
};
