import { COURSES, USER, ACTIVITY } from '../data';

export default function Progress() {
  const enrolled = COURSES.filter(c => c.enrolled);
  const avgProgress = enrolled.length
    ? Math.round(enrolled.reduce((s, c) => s + c.progress, 0) / enrolled.length)
    : 0;
  const totalMinutes = ACTIVITY.reduce((s, a) => s + a.minutes, 0);
  const maxActivity = Math.max(...ACTIVITY.map(a => a.minutes));

  return (
    <div className="progress-page">

      {/* Overview */}
      <div className="progress-overview">
        <div className="overview-card big">
          <div className="overview-ring-wrap">
            <svg viewBox="0 0 120 120" className="overview-ring">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8"/>
              <circle
                cx="60" cy="60" r="50" fill="none" stroke="var(--text-1)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50 * avgProgress / 100} ${2 * Math.PI * 50}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="overview-ring-text">
              <div className="overview-pct">{avgProgress}%</div>
              <div className="overview-pct-label">o'rtacha</div>
            </div>
          </div>
          <div className="overview-info">
            <div className="overview-title">Umumiy progress</div>
            <div className="overview-sub">{enrolled.length} ta kurs bo'yicha</div>
          </div>
        </div>

        {[
          { label: "Bu hafta", value: `${Math.round(totalMinutes / 60)}h`, icon: "⏱" },
          { label: "Sertiflkat", value: USER.certificates, icon: "🎓" },
          { label: "Ball", value: USER.points.toLocaleString(), icon: "⭐" },
        ].map(item => (
          <div key={item.label} className="overview-card sm">
            <div className="ov-icon">{item.icon}</div>
            <div className="ov-value">{item.value}</div>
            <div className="ov-label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Activity chart */}
      <div className="progress-section">
        <h3 className="progress-section-title">Haftalik faollik</h3>
        <div className="activity-chart-big">
          {ACTIVITY.map(a => {
            const pct = maxActivity > 0 ? (a.minutes / maxActivity) * 100 : 0;
            return (
              <div key={a.day} className="act-col">
                <div className="act-val">{a.minutes > 0 ? `${a.minutes}m` : ''}</div>
                <div className="act-track">
                  <div className="act-fill" style={{ height: `${pct}%` }} />
                </div>
                <div className="act-day">{a.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-course progress */}
      <div className="progress-section">
        <h3 className="progress-section-title">Kurslar bo'yicha</h3>
        <div className="course-progress-list">
          {enrolled.map(course => (
            <div key={course.id} className="cp-row">
              <div className="cp-emoji" style={{ background: course.color }}>{course.emoji}</div>
              <div className="cp-body">
                <div className="cp-title">{course.title}</div>
                <div className="cp-meta">{course.instructor} · {course.duration}</div>
                <div className="cp-bar-row">
                  <div className="cp-bar">
                    <div className="cp-fill" style={{ width: `${course.progress}%` }} />
                  </div>
                  <span className="cp-pct">{course.progress}%</span>
                </div>
              </div>
              <div className="cp-status">
                {course.progress === 100
                  ? <span className="status-done">✓ Tugadi</span>
                  : course.progress > 0
                  ? <span className="status-active">Jarayonda</span>
                  : <span className="status-idle">Boshlanmagan</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
