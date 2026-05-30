import { COURSES } from '../data';
import CourseCard from '../components/CourseCard';

export default function MyCourses() {
  const enrolledCourses = COURSES.filter(c => c.enrolled);

  return (
    <div className="my-courses-page">
      <h1 className="section-title" style={{ fontSize: '24px', marginBottom: '32px' }}>
        Mening <span className="accent">Kurslarim</span>
      </h1>

      {enrolledCourses.length > 0 ? (
        <div className="courses-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {enrolledCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Sizda hali aktiv kurslar yo'q</h3>
          <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '24px' }}>Platformadagi kurslar bilan tanishib chiqing va o'qishni boshlang.</p>
        </div>
      )}
    </div>
  );
}
