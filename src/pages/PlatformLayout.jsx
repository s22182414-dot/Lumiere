import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Book, Bookmark, LogOut, Bell, Search, Menu, X } from 'lucide-react';
import { USER } from '../data';
import '../index.css'; // Just in case, though it's global in App

export default function PlatformLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const navItems = [
    { path: '/platform', icon: <Home size={18} />, label: 'Dashboard', exact: true },
    { path: '/platform/courses', icon: <Book size={18} />, label: 'Barcha Kurslar' },
    { path: '/platform/my-courses', icon: <Bookmark size={18} />, label: 'Mening Kurslarim' },
  ];

  return (
    <div className="platform-container">
      {/* SIDEBAR */}
      <aside className={`platform-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="nav-logo">
            <div className="nav-logo-mark">E</div>
            <div className="nav-logo-text">EduFlow</div>
          </div>
          <button className="sidebar-close-btn hidden-desktop" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link text-danger" onClick={handleLogout}>
            <LogOut size={18} /> Chiqish
          </button>
        </div>
      </aside>

      {/* OVERLAY for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN CONTENT */}
      <main className="platform-main">
        {/* TOPBAR */}
        <header className="platform-topbar">
          <div className="topbar-left">
            <button className="menu-btn hidden-desktop" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Kurslarni izlash..." className="search-input" />
            </div>
          </div>

          <div className="topbar-right">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <div className="user-profile">
              <div className="user-avatar">{USER.avatar}</div>
              <div className="user-info hidden-mobile">
                <div className="user-name">{USER.name}</div>
                <div className="user-level">{USER.level} Member</div>
              </div>
            </div>
          </div>
        </header>

        {/* OUTLET for child routes */}
        <div className="platform-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
