import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { formatPrice } from '../data';

export default function CourseCard({ course, onClick }) {
  return (
    <div className="course-card" onClick={() => onClick?.(course)}>
      <div className="card-thumb">
        <div className="card-thumb-bg" style={{ background: course.color }}>
          {course.emoji}
        </div>
        <div className="card-overlay" />
        {course.progress === 0 && <div className="card-badge-new">Yangi</div>}
        {course.price === 0 && <div className="card-badge-free">Bepul</div>}
      </div>

      <div className="card-body">
        <div className="card-meta">
          <div className="card-meta-item">
            <Clock size={14} className="card-meta-icon" /> {course.duration}
          </div>
          <div className="card-meta-item">
            <BookOpen size={14} className="card-meta-icon" /> {course.lessons} dars
          </div>
        </div>

        <h3 className="card-title">{course.title}</h3>

        <div className="card-footer">
          <span className="card-see-more">Batafsil ko'rish</span>
          <button className="card-arrow-btn">
            <ArrowRight size={20} className="arrow" />
          </button>
        </div>
      </div>
    </div>
  );
}
