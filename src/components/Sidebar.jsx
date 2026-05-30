import { useState } from 'react';
import { USER } from '../data';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'courses', label: 'Kurslar', icon: '◫' },
  { id: 'my-courses', label: "Mening kurslarim", icon: '✦' },
  { id: 'progress', label: 'Natijalar', icon: '◈' },
];

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Sozlamalar', icon: '◎' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-mark">E</div>
        {!collapsed && <span className="logo-name">EduFlow</span>}
      </div>

      {/* Toggle */}
      <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)} title="Yig'ish/Ochish">
        {collapsed ? '›' : '‹'}
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
            {activePage === item.id && !collapsed && <span className="nav-dot" />}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        {BOTTOM_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}

        {/* User */}
        <div className="sidebar-user">
          <div className="user-avatar">{USER.avatar}</div>
          {!collapsed && (
            <div className="user-info">
              <div className="user-name">{USER.name.split(' ')[0]}</div>
              <div className="user-badge">{USER.level}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
