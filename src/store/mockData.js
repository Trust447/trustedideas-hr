// ─────────────────────────────────────────────────────────────
// mockData.js — Single source of truth for all mock data
// Company: Zenith Forge Ltd, Lagos — fintech startup, 48 staff
// All Nigerian names · All amounts in Naira
// ─────────────────────────────────────────────────────────────

// ── Logged-in admin ───────────────────────────────────────────
export const MOCK_USER = {
  id: 'u1',
  email: 'adaeze.okonkwo@zenithforge.ng',
  first_name: 'Adaeze',
  last_name: 'Okonkwo',
  job_title: 'Head of People & Culture',
  company_name: 'Zenith Forge Ltd',
  roles: ['Admin'],
  permissions: [
    'view_employee','create_employee','edit_employee','delete_employee',
    'view_payroll','manage_payroll','approve_leave','manage_roles','view_reports',
  ],
};

// ── Departments ───────────────────────────────────────────────
export const MOCK_DEPARTMENTS = [
  { id:'d1', name:'Engineering',       manager_name:'Chukwuemeka Eze',   employee_count:14 },
  { id:'d2', name:'Product & Design',  manager_name:'Ngozi Adeyemi',     employee_count:8  },
  { id:'d3', name:'Sales & Marketing', manager_name:'Babatunde Fashola', employee_count:10 },
  { id:'d4', name:'Operations',        manager_name:'Yetunde Akinwale',  employee_count:9  },
  { id:'d5', name:'Finance',           manager_name:'Emeka Nwosu',       employee_count:7  },
];

// ── Raw employee list (processed into MOCK_EMPLOYEES below) ──
const _EMP = [
  // Engineering — d1
  { id:'e1',  fn:'Chukwuemeka', ln:'Eze',         pos:'VP Engineering',          dept:'d1', salary:850000,  status:'active',   hire:'2021-03-15', phone:'0801-234-5678' },
  { id:'e2',  fn:'Aisha',       ln:'Mohammed',     pos:'Senior Backend Engineer', dept:'d1', salary:620000,  status:'active',   hire:'2021-08-01', phone:'0802-345-6789' },
  { id:'e3',  fn:'Tunde',       ln:'Adebayo',      pos:'Frontend Engineer',       dept:'d1', salary:480000,  status:'active',   hire:'2022-01-10', phone:'0803-456-7890' },
  { id:'e4',  fn:'Chidinma',    ln:'Obi',          pos:'Mobile Engineer',         dept:'d1', salary:510000,  status:'active',   hire:'2022-04-05', phone:'0804-567-8901' },
  { id:'e5',  fn:'Seun',        ln:'Ogundimu',     pos:'DevOps Engineer',         dept:'d1', salary:570000,  status:'active',   hire:'2022-07-18', phone:'0805-678-9012' },
  { id:'e6',  fn:'Ifeanyi',     ln:'Nwachukwu',    pos:'Backend Engineer',        dept:'d1', salary:450000,  status:'active',   hire:'2022-09-01', phone:'0806-789-0123' },
  { id:'e7',  fn:'Funmilayo',   ln:'Adekunle',     pos:'QA Engineer',             dept:'d1', salary:400000,  status:'active',   hire:'2023-01-16', phone:'0807-890-1234' },
  { id:'e8',  fn:'Obinna',      ln:'Chukwu',       pos:'Frontend Engineer',       dept:'d1', salary:430000,  status:'active',   hire:'2023-03-07', phone:'0808-901-2345' },
  { id:'e9',  fn:'Kemi',        ln:'Balogun',      pos:'Data Engineer',           dept:'d1', salary:520000,  status:'active',   hire:'2023-06-19', phone:'0809-012-3456' },
  { id:'e10', fn:'Emeka',       ln:'Okafor',       pos:'Backend Engineer',        dept:'d1', salary:440000,  status:'active',   hire:'2023-09-04', phone:'0810-123-4567' },
  { id:'e11', fn:'Zainab',      ln:'Ibrahim',      pos:'Software Engineer',       dept:'d1', salary:420000,  status:'active',   hire:'2024-01-08', phone:'0811-234-5678' },
  { id:'e12', fn:'Damilola',    ln:'Olatunji',     pos:'Junior Engineer',         dept:'d1', salary:300000,  status:'active',   hire:'2024-03-11', phone:'0812-345-6789' },
  { id:'e13', fn:'Chike',       ln:'Nnaji',        pos:'Software Engineer',       dept:'d1', salary:390000,  status:'active',   hire:'2024-06-03', phone:'0813-456-7890' },
  { id:'e14', fn:'Amaka',       ln:'Ugwu',         pos:'Junior Engineer',         dept:'d1', salary:280000,  status:'inactive', hire:'2024-08-19', phone:'0814-567-8901' },
  // Product & Design — d2
  { id:'e15', fn:'Ngozi',       ln:'Adeyemi',      pos:'VP Product',              dept:'d2', salary:780000,  status:'active',   hire:'2021-05-20', phone:'0815-678-9012' },
  { id:'e16', fn:'Tobi',        ln:'Olawale',      pos:'Senior Product Manager',  dept:'d2', salary:600000,  status:'active',   hire:'2022-02-14', phone:'0816-789-0123' },
  { id:'e17', fn:'Blessing',    ln:'Anyanwu',      pos:'UI/UX Designer',          dept:'d2', salary:450000,  status:'active',   hire:'2022-05-09', phone:'0817-890-1234' },
  { id:'e18', fn:'Rotimi',      ln:'Adesanya',     pos:'Product Designer',        dept:'d2', salary:420000,  status:'active',   hire:'2022-08-22', phone:'0818-901-2345' },
  { id:'e19', fn:'Nneka',       ln:'Okeke',        pos:'UX Researcher',           dept:'d2', salary:400000,  status:'active',   hire:'2023-02-06', phone:'0819-012-3456' },
  { id:'e20', fn:'Adewale',     ln:'Bamidele',     pos:'Product Analyst',         dept:'d2', salary:380000,  status:'active',   hire:'2023-05-15', phone:'0820-123-4567' },
  { id:'e21', fn:'Precious',    ln:'Eze',          pos:'Junior Designer',         dept:'d2', salary:250000,  status:'active',   hire:'2023-10-01', phone:'0821-234-5678' },
  { id:'e22', fn:'Abdullahi',   ln:'Musa',         pos:'Junior Product Manager',  dept:'d2', salary:290000,  status:'active',   hire:'2024-02-12', phone:'0822-345-6789' },
  // Sales & Marketing — d3
  { id:'e23', fn:'Babatunde',   ln:'Fashola',      pos:'Sales Director',          dept:'d3', salary:720000,  status:'active',   hire:'2021-07-01', phone:'0823-456-7890' },
  { id:'e24', fn:'Chioma',      ln:'Nwosu',        pos:'Senior Sales Executive',  dept:'d3', salary:520000,  status:'active',   hire:'2022-01-17', phone:'0824-567-8901' },
  { id:'e25', fn:'Kayode',      ln:'Akinwumi',     pos:'Growth Manager',          dept:'d3', salary:490000,  status:'active',   hire:'2022-04-25', phone:'0825-678-9012' },
  { id:'e26', fn:'Fatima',      ln:'Aliyu',        pos:'Marketing Lead',          dept:'d3', salary:460000,  status:'active',   hire:'2022-07-11', phone:'0826-789-0123' },
  { id:'e27', fn:'Biodun',      ln:'Ogunleye',     pos:'Sales Executive',         dept:'d3', salary:380000,  status:'active',   hire:'2022-10-03', phone:'0827-890-1234' },
  { id:'e28', fn:'Uchechi',     ln:'Nweze',        pos:'Content Strategist',      dept:'d3', salary:350000,  status:'active',   hire:'2023-01-23', phone:'0828-901-2345' },
  { id:'e29', fn:'Hakeem',      ln:'Lawal',        pos:'Brand Designer',          dept:'d3', salary:340000,  status:'active',   hire:'2023-04-10', phone:'0829-012-3456' },
  { id:'e30', fn:'Yemi',        ln:'Oduola',       pos:'Sales Executive',         dept:'d3', salary:370000,  status:'active',   hire:'2023-07-29', phone:'0830-123-4567' },
  { id:'e31', fn:'Sandra',      ln:'Okoye',        pos:'Social Media Manager',    dept:'d3', salary:310000,  status:'active',   hire:'2023-11-06', phone:'0831-234-5678' },
  { id:'e32', fn:'Nnamdi',      ln:'Okwu',         pos:'Junior Sales Executive',  dept:'d3', salary:260000,  status:'inactive', hire:'2024-04-14', phone:'0832-345-6789' },
  // Operations — d4
  { id:'e33', fn:'Yetunde',     ln:'Akinwale',     pos:'COO',                     dept:'d4', salary:950000,  status:'active',   hire:'2020-11-01', phone:'0833-456-7890' },
  { id:'e34', fn:'Chidi',       ln:'Okonkwo',      pos:'Operations Manager',      dept:'d4', salary:580000,  status:'active',   hire:'2021-09-13', phone:'0834-567-8901' },
  { id:'e35', fn:'Bisi',        ln:'Adeyinka',     pos:'HR Coordinator',          dept:'d4', salary:350000,  status:'active',   hire:'2022-03-21', phone:'0835-678-9012' },
  { id:'e36', fn:'Musa',        ln:'Garba',        pos:'Office Manager',          dept:'d4', salary:320000,  status:'active',   hire:'2022-06-07', phone:'0836-789-0123' },
  { id:'e37', fn:'Ebere',       ln:'Nwofor',       pos:'Administrative Officer',  dept:'d4', salary:290000,  status:'active',   hire:'2022-09-19', phone:'0837-890-1234' },
  { id:'e38', fn:'Wale',        ln:'Adeniran',     pos:'Logistics Coordinator',   dept:'d4', salary:310000,  status:'active',   hire:'2023-02-14', phone:'0838-901-2345' },
  { id:'e39', fn:'Grace',       ln:'Obioma',       pos:'Executive Assistant',     dept:'d4', salary:300000,  status:'active',   hire:'2023-05-30', phone:'0839-012-3456' },
  { id:'e40', fn:'Usman',       ln:'Suleiman',     pos:'Operations Analyst',      dept:'d4', salary:340000,  status:'active',   hire:'2023-09-11', phone:'0840-123-4567' },
  { id:'e41', fn:'Ifeoma',      ln:'Ejike',        pos:'Admin Assistant',         dept:'d4', salary:240000,  status:'inactive', hire:'2024-01-22', phone:'0841-234-5678' },
  // Finance — d5
  { id:'e42', fn:'Emeka',       ln:'Nwosu',        pos:'CFO',                     dept:'d5', salary:1100000, status:'active',   hire:'2021-01-10', phone:'0842-345-6789' },
  { id:'e43', fn:'Folake',      ln:'Ojo',          pos:'Senior Accountant',       dept:'d5', salary:520000,  status:'active',   hire:'2021-10-05', phone:'0843-456-7890' },
  { id:'e44', fn:'Uche',        ln:'Dim',          pos:'Financial Analyst',       dept:'d5', salary:450000,  status:'active',   hire:'2022-04-18', phone:'0844-567-8901' },
  { id:'e45', fn:'Lara',        ln:'Bello',        pos:'Payroll Specialist',      dept:'d5', salary:400000,  status:'active',   hire:'2022-08-08', phone:'0845-678-9012' },
  { id:'e46', fn:'Tochukwu',    ln:'Ani',          pos:'Finance Coordinator',     dept:'d5', salary:360000,  status:'active',   hire:'2023-01-09', phone:'0846-789-0123' },
  { id:'e47', fn:'Halima',      ln:'Yakubu',       pos:'Accounts Officer',        dept:'d5', salary:320000,  status:'active',   hire:'2023-07-17', phone:'0847-890-1234' },
  { id:'e48', fn:'Peter',       ln:'Amadi',        pos:'Junior Accountant',       dept:'d5', salary:260000,  status:'inactive', hire:'2024-05-06', phone:'0848-901-2345' },
];

export const MOCK_EMPLOYEES = _EMP.map((e) => ({
  id:             e.id,
  first_name:     e.fn,
  last_name:      e.ln,
  email:          `${e.fn.toLowerCase()}.${e.ln.toLowerCase()}@zenithforge.ng`,
  position:       e.pos,
  department_id:  e.dept,
  department_name:MOCK_DEPARTMENTS.find((d) => d.id === e.dept)?.name ?? '',
  status:         e.status,
  hire_date:      e.hire,
  phone:          e.phone,
  salary:         e.salary,
}));

// ── Attendance ─────────────────────────────────────────────────
// AttendancePage table: employee_name, check_in (ISO), check_out (ISO|null),
//   hours_worked (string|null)
// AttendancePage + Dashboard summary: total_present, total_checked_out,
//   missing_checkouts, avg_hours
// NOTE: check_in / check_out must be full ISO strings so formatTime() works
const D = new Date().toISOString().split('T')[0]; // today YYYY-MM-DD
export const MOCK_ATTENDANCE = [
  { id:'a1',  employee_id:'e1',  employee_name:'Chukwuemeka Eze',    check_in:`${D}T07:52:00`, check_out:`${D}T17:40:00`, hours_worked:'9.8', date:D },
  { id:'a2',  employee_id:'e2',  employee_name:'Aisha Mohammed',     check_in:`${D}T08:05:00`, check_out:`${D}T17:55:00`, hours_worked:'9.8', date:D },
  { id:'a3',  employee_id:'e3',  employee_name:'Tunde Adebayo',      check_in:`${D}T08:30:00`, check_out:`${D}T17:30:00`, hours_worked:'9.0', date:D },
  { id:'a4',  employee_id:'e4',  employee_name:'Chidinma Obi',       check_in:`${D}T08:45:00`, check_out:`${D}T18:10:00`, hours_worked:'9.4', date:D },
  { id:'a5',  employee_id:'e5',  employee_name:'Seun Ogundimu',      check_in:`${D}T07:58:00`, check_out:`${D}T17:48:00`, hours_worked:'9.8', date:D },
  { id:'a6',  employee_id:'e6',  employee_name:'Ifeanyi Nwachukwu',  check_in:`${D}T09:12:00`, check_out:null,            hours_worked:null,  date:D },
  { id:'a7',  employee_id:'e7',  employee_name:'Funmilayo Adekunle', check_in:`${D}T08:50:00`, check_out:`${D}T17:50:00`, hours_worked:'9.0', date:D },
  { id:'a8',  employee_id:'e8',  employee_name:'Obinna Chukwu',      check_in:`${D}T08:20:00`, check_out:`${D}T17:15:00`, hours_worked:'8.9', date:D },
  { id:'a9',  employee_id:'e9',  employee_name:'Kemi Balogun',       check_in:`${D}T09:00:00`, check_out:null,            hours_worked:null,  date:D },
  { id:'a10', employee_id:'e10', employee_name:'Emeka Okafor',       check_in:`${D}T08:35:00`, check_out:`${D}T17:35:00`, hours_worked:'9.0', date:D },
  { id:'a11', employee_id:'e15', employee_name:'Ngozi Adeyemi',      check_in:`${D}T08:10:00`, check_out:`${D}T18:05:00`, hours_worked:'9.9', date:D },
  { id:'a12', employee_id:'e16', employee_name:'Tobi Olawale',       check_in:`${D}T09:05:00`, check_out:`${D}T18:00:00`, hours_worked:'8.9', date:D },
  { id:'a13', employee_id:'e17', employee_name:'Blessing Anyanwu',   check_in:`${D}T08:40:00`, check_out:null,            hours_worked:null,  date:D },
  { id:'a14', employee_id:'e23', employee_name:'Babatunde Fashola',  check_in:`${D}T08:00:00`, check_out:`${D}T17:00:00`, hours_worked:'9.0', date:D },
  { id:'a15', employee_id:'e24', employee_name:'Chioma Nwosu',       check_in:`${D}T09:20:00`, check_out:`${D}T18:20:00`, hours_worked:'9.0', date:D },
  { id:'a16', employee_id:'e25', employee_name:'Kayode Akinwumi',    check_in:`${D}T08:55:00`, check_out:`${D}T17:55:00`, hours_worked:'9.0', date:D },
  { id:'a17', employee_id:'e33', employee_name:'Yetunde Akinwale',   check_in:`${D}T07:45:00`, check_out:`${D}T17:30:00`, hours_worked:'9.8', date:D },
  { id:'a18', employee_id:'e34', employee_name:'Chidi Okonkwo',      check_in:`${D}T08:25:00`, check_out:`${D}T17:25:00`, hours_worked:'9.0', date:D },
  { id:'a19', employee_id:'e42', employee_name:'Emeka Nwosu',        check_in:`${D}T08:15:00`, check_out:`${D}T18:15:00`, hours_worked:'10.0',date:D },
  { id:'a20', employee_id:'e43', employee_name:'Folake Ojo',         check_in:`${D}T09:10:00`, check_out:null,            hours_worked:null,  date:D },
  { id:'a21', employee_id:'e44', employee_name:'Uche Dim',           check_in:`${D}T08:50:00`, check_out:`${D}T17:45:00`, hours_worked:'8.9', date:D },
  { id:'a22', employee_id:'e35', employee_name:'Bisi Adeyinka',      check_in:`${D}T09:00:00`, check_out:`${D}T17:00:00`, hours_worked:'8.0', date:D },
  { id:'a23', employee_id:'e26', employee_name:'Fatima Aliyu',       check_in:`${D}T08:45:00`, check_out:`${D}T17:40:00`, hours_worked:'8.9', date:D },
  { id:'a24', employee_id:'e27', employee_name:'Biodun Ogunleye',    check_in:`${D}T09:30:00`, check_out:null,            hours_worked:null,  date:D },
  { id:'a25', employee_id:'e36', employee_name:'Musa Garba',         check_in:`${D}T08:00:00`, check_out:`${D}T17:00:00`, hours_worked:'9.0', date:D },
  { id:'a26', employee_id:'e37', employee_name:'Ebere Nwofor',       check_in:`${D}T08:55:00`, check_out:`${D}T17:50:00`, hours_worked:'8.9', date:D },
  { id:'a27', employee_id:'e45', employee_name:'Lara Bello',         check_in:`${D}T09:05:00`, check_out:`${D}T18:00:00`, hours_worked:'8.9', date:D },
  { id:'a28', employee_id:'e28', employee_name:'Uchechi Nweze',      check_in:`${D}T08:30:00`, check_out:`${D}T17:25:00`, hours_worked:'8.9', date:D },
  { id:'a29', employee_id:'e18', employee_name:'Rotimi Adesanya',    check_in:`${D}T09:15:00`, check_out:`${D}T18:10:00`, hours_worked:'8.9', date:D },
  { id:'a30', employee_id:'e19', employee_name:'Nneka Okeke',        check_in:`${D}T08:40:00`, check_out:null,            hours_worked:null,  date:D },
  { id:'a31', employee_id:'e29', employee_name:'Hakeem Lawal',       check_in:`${D}T09:00:00`, check_out:`${D}T17:55:00`, hours_worked:'8.9', date:D },
  { id:'a32', employee_id:'e30', employee_name:'Yemi Oduola',        check_in:`${D}T08:20:00`, check_out:`${D}T17:20:00`, hours_worked:'9.0', date:D },
  { id:'a33', employee_id:'e38', employee_name:'Wale Adeniran',      check_in:`${D}T08:10:00`, check_out:`${D}T17:05:00`, hours_worked:'8.9', date:D },
  { id:'a34', employee_id:'e46', employee_name:'Tochukwu Ani',       check_in:`${D}T09:25:00`, check_out:`${D}T18:20:00`, hours_worked:'8.9', date:D },
  { id:'a35', employee_id:'e11', employee_name:'Zainab Ibrahim',     check_in:`${D}T08:55:00`, check_out:`${D}T17:50:00`, hours_worked:'8.9', date:D },
  { id:'a36', employee_id:'e12', employee_name:'Damilola Olatunji',  check_in:`${D}T09:10:00`, check_out:null,            hours_worked:null,  date:D },
  { id:'a37', employee_id:'e20', employee_name:'Adewale Bamidele',   check_in:`${D}T08:30:00`, check_out:`${D}T17:30:00`, hours_worked:'9.0', date:D },
  { id:'a38', employee_id:'e39', employee_name:'Grace Obioma',       check_in:`${D}T08:00:00`, check_out:`${D}T17:00:00`, hours_worked:'9.0', date:D },
  { id:'a39', employee_id:'e47', employee_name:'Halima Yakubu',      check_in:`${D}T09:00:00`, check_out:`${D}T17:55:00`, hours_worked:'8.9', date:D },
  { id:'a40', employee_id:'e13', employee_name:'Chike Nnaji',        check_in:`${D}T08:45:00`, check_out:`${D}T17:40:00`, hours_worked:'8.9', date:D },
];
// Summary: 40 present, 33 checked out, 7 still in office (check_out null)

// ── Leave ─────────────────────────────────────────────────────
// LeavePage + Dashboard: id, employee_id, employee_name, start_date, end_date,
//   status ('pending'|'approved'|'rejected'), reason, days_requested
export const MOCK_LEAVE = [
  { id:'l1',  employee_id:'e3',  employee_name:'Tunde Adebayo',      start_date:'2025-07-21', end_date:'2025-07-25', status:'pending',  reason:'Annual Leave',               days_requested:5 },
  { id:'l2',  employee_id:'e9',  employee_name:'Kemi Balogun',       start_date:'2025-07-28', end_date:'2025-07-29', status:'pending',  reason:'Medical Appointment',        days_requested:2 },
  { id:'l3',  employee_id:'e20', employee_name:'Adewale Bamidele',   start_date:'2025-08-04', end_date:'2025-08-08', status:'pending',  reason:'Annual Leave',               days_requested:5 },
  { id:'l4',  employee_id:'e31', employee_name:'Sandra Okoye',       start_date:'2025-07-14', end_date:'2025-07-14', status:'pending',  reason:'Personal Emergency',         days_requested:1 },
  { id:'l5',  employee_id:'e15', employee_name:'Ngozi Adeyemi',      start_date:'2025-08-18', end_date:'2025-08-22', status:'pending',  reason:'Annual Leave',               days_requested:5 },
  { id:'l6',  employee_id:'e24', employee_name:'Chioma Nwosu',       start_date:'2025-08-11', end_date:'2025-08-15', status:'pending',  reason:'Annual Leave',               days_requested:5 },
  { id:'l7',  employee_id:'e45', employee_name:'Lara Bello',         start_date:'2025-07-07', end_date:'2025-07-11', status:'approved', reason:'Annual Leave',               days_requested:5 },
  { id:'l8',  employee_id:'e17', employee_name:'Blessing Anyanwu',   start_date:'2025-07-01', end_date:'2025-07-03', status:'approved', reason:'Family Event',               days_requested:3 },
  { id:'l9',  employee_id:'e35', employee_name:'Bisi Adeyinka',      start_date:'2025-06-23', end_date:'2025-06-27', status:'approved', reason:'Annual Leave',               days_requested:5 },
  { id:'l10', employee_id:'e25', employee_name:'Kayode Akinwumi',    start_date:'2025-06-16', end_date:'2025-06-16', status:'approved', reason:'Medical Appointment',        days_requested:1 },
  { id:'l11', employee_id:'e40', employee_name:'Usman Suleiman',     start_date:'2025-07-21', end_date:'2025-07-22', status:'approved', reason:'Traditional Ceremony',       days_requested:2 },
  { id:'l12', employee_id:'e47', employee_name:'Halima Yakubu',      start_date:'2025-06-30', end_date:'2025-06-30', status:'approved', reason:'Eid Celebration',            days_requested:1 },
  { id:'l13', employee_id:'e7',  employee_name:'Funmilayo Adekunle', start_date:'2025-05-26', end_date:'2025-05-30', status:'approved', reason:'Annual Leave',               days_requested:5 },
  { id:'l14', employee_id:'e12', employee_name:'Damilola Olatunji',  start_date:'2025-06-09', end_date:'2025-06-10', status:'rejected', reason:'Insufficient leave balance',  days_requested:2 },
  { id:'l15', employee_id:'e44', employee_name:'Uche Dim',           start_date:'2025-05-19', end_date:'2025-05-20', status:'rejected', reason:'Short notice — not approved', days_requested:2 },
];

// ── Payroll ───────────────────────────────────────────────────
// PayrollPage table: employee_name, salary, bonus, deductions, net_pay, status
// PayrollPage summary: total_net_pay, total_salary, total_bonus,
//                      total_deductions, employee_count
const _BONUSES = {
  e1:85000, e2:40000, e5:60000, e8:35000, e9:55000,
  e15:80000, e16:60000, e17:45000,
  e23:75000, e24:50000, e25:50000,
  e33:100000, e34:60000,
  e42:120000, e43:55000,
};

export const MOCK_PAYROLL = _EMP
  .filter((e) => e.status === 'active')
  .map((e) => {
    const bonus      = _BONUSES[e.id] ?? 0;
    const gross      = e.salary + bonus;
    const deductions = Math.round(gross * 0.075); // PAYE + pension
    const net_pay    = gross - deductions;
    return {
      id:            `p${e.id}`,
      employee_id:    e.id,
      employee_name: `${e.fn} ${e.ln}`,
      salary:         e.salary,
      bonus,
      deductions,
      net_pay,
      payment_date:  '2025-07-31',
      status:        'processed',
    };
  });

// ── Performance ───────────────────────────────────────────────
// PerformancePage table: employee_name, reviewer_name, rating (1–5),
//   notes, review_date
export const MOCK_PERFORMANCE = [
  { id:'r1',  employee_id:'e1',  employee_name:'Chukwuemeka Eze',    reviewer_name:'Yetunde Akinwale',  rating:5, review_date:'2025-06-30', notes:'Exceptional leadership on the core banking API migration. Delivered 3 weeks ahead of schedule.' },
  { id:'r2',  employee_id:'e2',  employee_name:'Aisha Mohammed',     reviewer_name:'Chukwuemeka Eze',   rating:5, review_date:'2025-06-30', notes:'Payment gateway rework reduced transaction failures by 40%. Consistently excellent output.' },
  { id:'r3',  employee_id:'e15', employee_name:'Ngozi Adeyemi',      reviewer_name:'Yetunde Akinwale',  rating:5, review_date:'2025-06-28', notes:'Outstanding product instincts. Roadmap quality has improved team velocity across all squads.' },
  { id:'r4',  employee_id:'e33', employee_name:'Yetunde Akinwale',   reviewer_name:'Emeka Nwosu',       rating:5, review_date:'2025-06-28', notes:'Cost efficiency improved 18% year-on-year. Operational excellence is her hallmark.' },
  { id:'r5',  employee_id:'e42', employee_name:'Emeka Nwosu',        reviewer_name:'Yetunde Akinwale',  rating:5, review_date:'2025-06-27', notes:'Series A fundraise closed. Financial controls are the tightest in the company\'s history.' },
  { id:'r6',  employee_id:'e5',  employee_name:'Seun Ogundimu',      reviewer_name:'Chukwuemeka Eze',   rating:4, review_date:'2025-06-26', notes:'CI/CD overhaul cut deployment time by 60%. Great ownership of infrastructure reliability.' },
  { id:'r7',  employee_id:'e9',  employee_name:'Kemi Balogun',       reviewer_name:'Chukwuemeka Eze',   rating:4, review_date:'2025-06-25', notes:'Data pipelines are well-architected. Good collaboration with product on analytics features.' },
  { id:'r8',  employee_id:'e23', employee_name:'Babatunde Fashola',  reviewer_name:'Yetunde Akinwale',  rating:4, review_date:'2025-06-25', notes:'Q2 revenue target exceeded by 22%. Team morale is high and pipeline is very healthy.' },
  { id:'r9',  employee_id:'e25', employee_name:'Kayode Akinwumi',    reviewer_name:'Babatunde Fashola', rating:4, review_date:'2025-06-24', notes:'Growth experiments outperformed targets. Paid acquisition work has reduced CAC significantly.' },
  { id:'r10', employee_id:'e16', employee_name:'Tobi Olawale',       reviewer_name:'Ngozi Adeyemi',     rating:4, review_date:'2025-06-24', notes:'Good stakeholder management. Feature specs are clear and well-researched before handoff.' },
  { id:'r11', employee_id:'e43', employee_name:'Folake Ojo',         reviewer_name:'Emeka Nwosu',       rating:4, review_date:'2025-06-23', notes:'Solid work on audit preparation. Always thorough, reliable and meets every deadline.' },
  { id:'r12', employee_id:'e17', employee_name:'Blessing Anyanwu',   reviewer_name:'Ngozi Adeyemi',     rating:4, review_date:'2025-06-22', notes:'App redesign received very positive user feedback. Strong visual direction throughout.' },
  { id:'r13', employee_id:'e35', employee_name:'Bisi Adeyinka',      reviewer_name:'Yetunde Akinwale',  rating:4, review_date:'2025-06-21', notes:'HR processes are much smoother. Employees consistently rate their experience highly.' },
  { id:'r14', employee_id:'e24', employee_name:'Chioma Nwosu',       reviewer_name:'Babatunde Fashola', rating:4, review_date:'2025-06-20', notes:'Consistently hits targets. One of the top closers on the sales team this quarter.' },
  { id:'r15', employee_id:'e3',  employee_name:'Tunde Adebayo',      reviewer_name:'Chukwuemeka Eze',   rating:3, review_date:'2025-06-19', notes:'Meeting expectations. Could improve code review participation and documentation quality.' },
  { id:'r16', employee_id:'e34', employee_name:'Chidi Okonkwo',      reviewer_name:'Yetunde Akinwale',  rating:3, review_date:'2025-06-18', notes:'Reliable and steady. Would benefit from taking more initiative on process improvements.' },
  { id:'r17', employee_id:'e44', employee_name:'Uche Dim',           reviewer_name:'Emeka Nwosu',       rating:3, review_date:'2025-06-17', notes:'Good technical skills. Needs to improve communication of insights to non-finance teams.' },
  { id:'r18', employee_id:'e7',  employee_name:'Funmilayo Adekunle', reviewer_name:'Chukwuemeka Eze',   rating:3, review_date:'2025-06-16', notes:'Test coverage has improved this quarter. Continue growing independence in bug triage.' },
  { id:'r19', employee_id:'e28', employee_name:'Uchechi Nweze',      reviewer_name:'Babatunde Fashola', rating:3, review_date:'2025-06-15', notes:'Content quality is good but publishing consistency and SEO practice needs improvement.' },
  { id:'r20', employee_id:'e12', employee_name:'Damilola Olatunji',  reviewer_name:'Chukwuemeka Eze',   rating:2, review_date:'2025-06-14', notes:'Struggling with sprint deadlines. Needs more structured mentorship and clearer goals.' },
];

// ── Roles ─────────────────────────────────────────────────────
export const MOCK_ROLES = [
  { id:'rol1', name:'Admin',        description:'Full platform access — CEO, CTO, Head of People', permissions:['create_employee','edit_employee','view_employee','delete_employee','view_payroll','manage_payroll','approve_leave','manage_roles','view_reports'] },
  { id:'rol2', name:'HR Manager',   description:'Manage employees, approve leave, view reports',   permissions:['create_employee','edit_employee','view_employee','approve_leave','view_reports'] },
  { id:'rol3', name:'Finance Lead', description:'Access payroll, reports and financial data',      permissions:['view_payroll','manage_payroll','view_reports'] },
  { id:'rol4', name:'Employee',     description:'View own profile and submit leave requests',      permissions:['view_employee'] },
];

export const ALL_PERMISSIONS = [
  'create_employee','edit_employee','view_employee','delete_employee',
  'view_payroll','manage_payroll','approve_leave','manage_roles','view_reports',
];

// ── Activity feed ─────────────────────────────────────────────
export const MOCK_ACTIVITY = [
  { text:'July payroll processed — 44 employees, ₦18,430,000 total',      time:'2 hours ago',  color:'var(--green)'  },
  { text:'Tunde Adebayo submitted a 5-day annual leave request',           time:'4 hours ago',  color:'var(--amber)'  },
  { text:'Kemi Balogun and 2 others joined Engineering this week',         time:'Yesterday',    color:'var(--blue)'   },
  { text:'Q2 performance reviews completed — average rating 3.9 ★',       time:'2 days ago',   color:'var(--accent)' },
  { text:'Blessing Anyanwu leave approved — Product team notified',        time:'3 days ago',   color:'var(--green)'  },
  { text:'Chukwuemeka Eze rated Exceptional in Q2 performance review',     time:'4 days ago',   color:'var(--accent)' },
];

// ── Pre-computed summary values ───────────────────────────────
// These are consumed directly by api.js summary endpoints so the
// maths is done once here, not scattered across the codebase.
const _co  = MOCK_ATTENDANCE.filter((a) => a.check_out !== null);
const _si  = MOCK_ATTENDANCE.filter((a) => a.check_out === null);
const _hw  = _co.map((a) => parseFloat(a.hours_worked)).filter(Boolean);

export const ATTENDANCE_SUMMARY = {
  total_present:     MOCK_ATTENDANCE.length,          // 40
  total_checked_out: _co.length,                      // 33
  missing_checkouts: _si.length,                      // 7
  on_leave:          3,                               // approved + active today
  avg_hours:         _hw.length
    ? (_hw.reduce((s,h) => s+h, 0) / _hw.length).toFixed(1)
    : '9.0',
};

export const PAYROLL_SUMMARY = {
  total_net_pay:    MOCK_PAYROLL.reduce((s,p) => s + p.net_pay,    0),
  total_salary:     MOCK_PAYROLL.reduce((s,p) => s + p.salary,     0),
  total_bonus:      MOCK_PAYROLL.reduce((s,p) => s + p.bonus,      0),
  total_deductions: MOCK_PAYROLL.reduce((s,p) => s + p.deductions, 0),
  employee_count:   MOCK_PAYROLL.length,
};
