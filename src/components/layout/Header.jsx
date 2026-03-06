// src/components/layout/Header.jsx
import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  attendance: 'Attendance',
  leave: 'Leave Management',
  payroll: 'Payroll',
  performance: 'Performance Reviews',
  roles: 'Roles & Permissions',
};

export default function Header({ currentPage, onMenuToggle, onNavigate }) {
  const { user } = useAuth();

  return (
    <header className="header">
      <button
        className="icon-btn header-menu-btn"
        onClick={onMenuToggle}
        aria-label="Toggle navigation"
        style={{ display: 'none' }}
      >
        <Icon name="menu" size={20} />
      </button>

      <div>
        <div className="header-title">{PAGE_TITLES[currentPage] ?? currentPage}</div>
      </div>

      <div className="header-spacer" />

      <div className="header-search">
        <Icon name="search" size={14} style={{ color: 'var(--ink-light)', flexShrink: 0 }} />
        <input
          placeholder="Search anything…"
          aria-label="Global search"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              window.__globalSearch = e.target.value.trim();
              onNavigate('employees');
              e.target.value = '';
            }
          }}
        />
      </div>

      <div className="header-actions">
        {/* <button className="icon-btn" aria-label="Notifications">
          <Icon name="bell" size={16} />
          <span className="notif-dot" />
        </button> */}
        <button className="icon-btn" aria-label="Settings" onClick={() => onNavigate('settings')}>
          <Icon name="settings" size={16} />
        </button>
        <Avatar firstName={user?.first_name} lastName={user?.last_name} />
      </div>
    </header>
  );
}
