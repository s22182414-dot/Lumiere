import { COURSES, USER, ACTIVITY, formatNum, formatPrice } from '../data';

function ActivityBar({ minutes, day, max }) {
  const pct = max > 0 ? (minutes / max) * 100 : 0;
  return (
    <div className="activity-col">
      <div className="activity-bar-wrap">
        <div className="activity-bar" style={{ height: `${pct}%` }} title={`${minutes} daqiqa`} />
      </div>
      <span className="activity-day">{day}</span>
    </div>
  );
}

export default function Dashboard({ onNavigate, onCourseClick }) {
  const enrolled = COURSES.filter(c => c.enrolled);
  const inProgress = enrolled.filter(c => c.progress > 0 && c.progress < 100);
  const maxActivity = Math.max(...ACTIVITY.map(a => a.minutes));
  const totalMinutes = ACTIVITY.reduce((s, a) => s + a.minutes, 0);

  return (
    <div className="dashboard-page">

      {/* Welcome */}
      <div className="dash-welcome">
        <div>
          <h2 className="dash-welcome-title">Xush kelibsiz, {USER.name.split(' ')[0]} 👋</h2>
          <p className="dash-welcome-sub">Bugun ham o'rganishni davom ettiring.</p>
        </div>
        <div className="dash-streak">
          <span className="streak-fire">🔥</span>
          <span className="streak-num">{USER.streak}</span>
          <span className="streak-label">kun ketma-ket</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {[
          { label: "Umumiy soat", value: `${USER.totalHours}h`, icon: "⏱" },
          { label: "Sertifikat", value: USER.certificates, icon: "🎓" },
          { label: "Ball", value: USER.points.toLocaleString(), icon: "⭐" },
          { label: "Kurslar", value: enrolled.length, icon: "📚" },
        ].map(stat => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-card-icon">{stat.icon}</div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* In Progress */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3 className="dash-section-title">Davom etayotgan kurslar</h3>
            <button className="link-btn" onClick={() => onNavigate('my-courses')}>Barchasi →</button>
          </div>
          <div className="progress-courses">
            {inProgress.map(course => (
              <div
                key={course.id}
                className="progress-course-card"
                onClick={() => onCourseClick(course)}
              >
                <div className="pcc-emoji" style={{ background: course.color }}>{course.emoji}</div>
                <div className="pcc-body">
                  <div className="pcc-title">{course.title}</div>
                  <div className="pcc-instructor">{course.instructor}</div>
                  <div className="pcc-bar-wrap">
                    <div className="pcc-bar">
                      <div className="pcc-fill" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="pcc-pct">{course.progress}%</span>
                  </div>
                </div>
                <button className="pcc-btn">▶</button>
              </div>
            ))}
            {inProgress.length === 0 && (
              <div className="empty-state">
                <p>Hozircha faol kurs yo'q.</p>
                <button className="link-btn" onClick={() => onNavigate('courses')}>Kurslarni ko'rish →</button>
              </div>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="dash-section">
          <div className="dash-section-header">
            <h3 className="dash-section-title">Haftalik faollik</h3>
            <span className="dash-section-meta">{Math.round(totalMinutes / 60)}h bu hafta</span>
          </div>
          <div className="activity-chart">
            {ACTIVITY.map(a => (
              <ActivityBar key={a.day} {...a} max={maxActivity} />
            ))}
          </div>
        </div>
      </div>

      {/* Recommended */}
      <div className="dash-section" style={{ marginTop: 0 }}>
        <div className="dash-section-header">
          <h3 className="dash-section-title">Tavsiya etiladi</h3>
          <button className="link-btn" onClick={() => onNavigate('courses')}>Barchasi →</button>
        </div>
        <div className="recommended-grid">
          {COURSES.filter(c => !c.enrolled).slice(0, 3).map(course => (
            <div
              key={course.id}
              className="rec-card"
              onClick={() => onCourseClick(course)}
            >
              <div className="rec-emoji" style={{ background: course.color }}>{course.emoji}</div>
              <div className="rec-title">{course.title}</div>
              <div className="rec-instructor">{course.instructor}</div>
              <div className="rec-footer">
                <span className="rec-price">{formatPrice(course.price)}</span>
                <span className="rec-rating">⭐ {course.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
