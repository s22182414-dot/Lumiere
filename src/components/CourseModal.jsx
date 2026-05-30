import { getCatName, formatPrice, formatNum } from '../data';

export default function CourseModal({ course, onClose, onEnroll }) {
  if (!course) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="course-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="cm-header" style={{ background: course.color }}>
          <span className="cm-emoji">{course.emoji}</span>
        </div>

        <div className="cm-body">
          <div className="cm-meta-top">
            <span className="cm-cat">{getCatName(course.category)}</span>
            <span className="cm-level">{course.level}</span>
          </div>

          <h2 className="cm-title">{course.title}</h2>
          <p className="cm-instructor">👤 {course.instructor}</p>
          <p className="cm-description">{course.description}</p>

          {/* Tags */}
          <div className="cm-tags">
            {course.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>

          {/* Stats grid */}
          <div className="cm-stats">
            {[
              { label: "Reyting", value: `⭐ ${course.rating}` },
              { label: "O'quvchilar", value: formatNum(course.students) },
              { label: "Davomiyligi", value: course.duration },
              { label: "Darslar", value: course.lessons },
            ].map(s => (
              <div key={s.label} className="cm-stat">
                <div className="cm-stat-val">{s.value}</div>
                <div className="cm-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar if enrolled */}
          {course.enrolled && course.progress > 0 && (
            <div className="cm-progress">
              <div className="cm-progress-label">
                <span>Jarayon</span><span>{course.progress}%</span>
              </div>
              <div className="cm-progress-bar">
                <div className="cm-progress-fill" style={{ width: `${course.progress}%` }} />
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="cm-footer">
            <div className="cm-price">{formatPrice(course.price)}</div>
            <button
              className={`btn-primary btn-lg ${course.enrolled ? 'enrolled-btn' : ''}`}
              onClick={() => { onEnroll(course); onClose(); }}
            >
              {course.enrolled
                ? course.progress > 0 ? '▶ Davom etish' : '▶ Boshlash'
                : "Yozilish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
