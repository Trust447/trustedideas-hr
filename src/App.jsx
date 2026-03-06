// src/App.jsx
// Adds: OnboardingWizard (shown when user.onboarding_complete is false)
//       ReportsPage (new sidebar nav item)

import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { ToastProvider } from './hooks/useToast.jsx';
import { ErrorBoundary } from './components/ui/ErrorDisplay.jsx';
import AppShell from './components/layout/AppShell.jsx';
import OnboardingWizard from './pages/onboarding/OnboardingWizard.jsx';
import LoginPage        from './pages/auth/LoginPage.jsx';
import DashboardPage    from './pages/dashboard/DashboardPage.jsx';
import EmployeesPage    from './pages/employees/EmployeesPage.jsx';
import AttendancePage   from './pages/attendance/AttendancePage.jsx';
import LeavePage        from './pages/leave/LeavePage.jsx';
import PayrollPage      from './pages/payroll/PayrollPage.jsx';
import PerformancePage  from './pages/performance/PerformancePage.jsx';
import RolesPage        from './pages/roles/RolesPage.jsx';
import ReportsPage      from './pages/reports/ReportsPage.jsx';
import SettingsPage from './pages/settings/SettingsPage.jsx';

const PAGES = {
  dashboard:   DashboardPage,
  employees:   EmployeesPage,
  attendance:  AttendancePage,
  leave:       LeavePage,
  payroll:     PayrollPage,
  performance: PerformancePage,
  roles:       RolesPage,
  reports:     ReportsPage,
  settings:    SettingsPage,
};

function AuthedApp() {
  const { user, completeOnboarding } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (!user) return <LoginPage />;

  // Show wizard if tenant hasn't completed onboarding
  // (In mock mode onboarding_complete is always true — wizard only appears
  //  for real new tenants or when VITE_FORCE_ONBOARDING=true)
  const forceOnboarding = import.meta.env.VITE_FORCE_ONBOARDING === 'true';
  if (forceOnboarding || user.onboarding_complete === false) {
    return (
      <OnboardingWizard
        onComplete={() => {
          completeOnboarding?.();
          setPage('dashboard');
        }}
      />
    );
  }

  const PageComponent = PAGES[page] ?? DashboardPage;

  return (
    <AppShell currentPage={page} onNavigate={setPage}>
      <ErrorBoundary key={page}>
        <PageComponent />
      </ErrorBoundary>
    </AppShell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AuthedApp />
      </AuthProvider>
    </ToastProvider>
  );
}
