// src/components/layout/AppShell.jsx
import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import { MOCK_LEAVE } from '../../store/mockData.js';

export default function AppShell({ currentPage, onNavigate, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const badges = {
    pendingLeave: MOCK_LEAVE.filter((l) => l.status === 'pending').length,
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}

      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => { onNavigate(page); closeSidebar(); }}
        badges={badges}
        isOpen={sidebarOpen}
      />

      <div className="main-content">
        <Header
          currentPage={currentPage}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
