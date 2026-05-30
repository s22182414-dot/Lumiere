import { useState } from 'react';
import { COURSES, CATEGORIES } from '../data';
import CourseCard from '../components/CourseCard';

export default function Catalog() {
  const [activeCat, setActiveCat] = useState('all');
  
  const filteredCourses = activeCat === 'all' 
    ? COURSES 
    : COURSES.filter(c => c.category === activeCat);

  return (
    <div className="catalog-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '24px' }}>Barcha Kurslar</h1>
      </div>

      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '99px',
              border: `1px solid ${activeCat === cat.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
              background: activeCat === cat.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
              color: activeCat === cat.id ? 'var(--primary)' : 'var(--text-2)',
              fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            <span>{cat.emoji}</span> {cat.label}
          </button>
        ))}
      </div>

      <div className="courses-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {filteredCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
