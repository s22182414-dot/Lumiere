import { useState } from 'react';
import { COURSES } from '../data';
import CourseCard from './CourseCard';

export default function Courses({ activeCategory, onEnroll, onCourseClick }) {
  const [visible, setVisible] = useState(6);

  const filtered = activeCategory === 'all'
    ? COURSES
    : COURSES.filter(c => c.category === activeCategory);

  const shown = filtered.slice(0, visible);

  return (
    <section className="courses-section" id="courses">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Kurslar</div>
          <h2 className="section-title">Mashhur Kurslar</h2>
          <p className="section-sub">O'quvchilar tomonidan eng ko'p tanlangan kurslar</p>
        </div>

        <div className="courses-grid">
          {shown.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              onEnroll={onEnroll}
              onClick={onCourseClick}
            />
          ))}
        </div>

        {filtered.length > visible && (
          <div className="load-more-wrapper">
            <button className="btn-outline" onClick={() => setVisible(v => v + 3)}>
              Ko'proq kurslar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
