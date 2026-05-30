import { USER } from '../data';

export default function Topbar({ title, subtitle, onSearch }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-sub">{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Qidirish..."
            className="topbar-search-input"
            onChange={e => onSearch?.(e.target.value)}
          />
        </div>
        <div className="topbar-notif">
          <span className="notif-icon">🔔</span>
          <span className="notif-badge">2</span>
        </div>
        <div className="topbar-avatar">{USER.avatar}</div>
      </div>
    </header>
  );
}
