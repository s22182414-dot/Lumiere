import { COURSES, formatPrice, formatNum, getCatName } from '../data';

export default function MyCourses({ onCourseClick }) {
  const enrolled = COURSES.filter(c => c.enrolled);
  const completed = enrolled.filter(c => c.progress === 100);
  const inProgress = enrolled.filter(c => c.progress > 0 && c.progress < 100);
  const notStarted = enrolled.filter(c => c.progress === 0);

  const Section = ({ title, courses }) => {
    if (courses.length === 0) return null;
    return (
      <div className="my-section">
        <h3 className="my-section-title">{title} <span className="count-badge">{courses.length}</span></h3>
        <div className="my-courses-list">
          {courses.map(course => (
            <div key={course.id} className="my-course-row" onClick={() => onCourseClick(course)}>
              <div className="my-course-emoji" style={{ background: course.color }}>{course.emoji}</div>
              <div className="my-course-info">
                <div className="my-course-title">{course.title}</div>
                <div className="my-course-meta">
                  {course.instructor} · {course.duration} · {course.lessons} dars
                </div>
                {course.progress > 0 && (
                  <div className="my-progress-row">
                    <div className="my-bar">
                      <div className="my-bar-fill" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="my-pct">{course.progress}%</span>
                  </div>
                )}
              </div>
              <div className="my-course-actions">
                <div className="my-course-rating">⭐ {course.rating}</div>
                <button className="my-btn">
                  {course.progress === 100 ? 'Ko\'rish' : course.progress > 0 ? '▶ Davom' : 'Boshlash'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="my-courses-page">
      {/* Summary */}
      <div className="my-summary">
        <div className="my-sum-card">
          <span className="my-sum-val">{enrolled.length}</span>
          <span className="my-sum-label">Jami kurs</span>
        </div>
        <div className="my-sum-card">
          <span className="my-sum-val">{inProgress.length}</span>
          <span className="my-sum-label">Jarayonda</span>
        </div>
        <div className="my-sum-card">
          <span className="my-sum-val">{completed.length}</span>
          <span className="my-sum-label">Tugatilgan</span>
        </div>
      </div>

      <Section title="Jarayonda" courses={inProgress} />
      <Section title="Boshlanmagan" courses={notStarted} />
      <Section title="Tugatilgan" courses={completed} />

      {enrolled.length === 0 && (
        <div className="catalog-empty">
          <p className="empty-title">Hali hech qanday kursga yozilmagansiz</p>
          <p className="empty-sub">Kurslar katalogidan o'zingizga mos kursni tanlang</p>
        </div>
      )}
    </div>
  );
}
