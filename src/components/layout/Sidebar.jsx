// src/components/layout/Sidebar.jsx
// Adds Reports nav item (requires view_reports permission)

import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',          icon: 'dashboard',   perm: null              },
  { id: 'employees',   label: 'Employees',           icon: 'employees',   perm: null              },
  { id: 'attendance',  label: 'Attendance',          icon: 'attendance',  perm: null              },
  { id: 'leave',       label: 'Leave',               icon: 'leave',       perm: null,   badgeKey: 'pendingLeave' },
  { id: 'payroll',     label: 'Payroll',             icon: 'payroll',     perm: 'view_payroll'    },
  { id: 'performance', label: 'Performance',         icon: 'performance', perm: null              },
  { id: 'reports',     label: 'Reports',             icon: 'trending',    perm: 'view_reports'    },
  { id: 'roles',       label: 'Roles & Permissions', icon: 'roles',       perm: 'manage_roles'    },
];

export default function Sidebar({ currentPage, onNavigate, badges = {}, isOpen }) {
  const { user, logout, hasPermission } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.perm || hasPermission(item.perm)
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🏢</div>
          <div className="logo-text">
            Trusted Ideas HR
            <span>Human Resources</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {visibleItems.map((item) => {
          const badge = item.badgeKey ? badges[item.badgeKey] : null;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={currentPage === item.id ? 'page' : undefined}
            >
              <Icon name={item.icon} size={17} className="nav-icon" />
              {item.label}
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div className="user-card">
          <Avatar firstName={user?.first_name} lastName={user?.last_name} />
          <div className="user-info">
            <div className="user-name">{user?.first_name} {user?.last_name}</div>
            <div className="user-role">{user?.roles?.[0]}</div>
          </div>
          <button
            className="icon-btn"
            style={{ border: 'none', background: 'none', color: 'rgba(250,248,243,0.4)' }}
            onClick={logout}
            title="Sign out"
          >
            <Icon name="logout" size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
