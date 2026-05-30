import { USER, ACTIVITY, COURSES } from '../data';
import CourseCard from '../components/CourseCard';
import { Flame, Trophy, Clock, Target } from 'lucide-react';

export default function Dashboard() {
  const activeCourse = COURSES[0]; // Davom etayotgan kurs

  return (
    <div className="dashboard-page">
      <h1 className="section-title" style={{ fontSize: '24px', marginBottom: '24px' }}>
        Xush kelibsiz, <span className="accent">{USER.name.split(' ')[0]}</span> 👋
      </h1>

      {/* DASHBOARD STATS */}
      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{USER.streak} kun</div>
            <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>Ketma-ketlik</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{USER.points}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>Ballar</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{USER.totalHours} soat</div>
            <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>O'rganildi</div>
          </div>
        </div>

        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234,179,8,0.1)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={24} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{USER.certificates} ta</div>
            <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>Sertifikatlar</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Davom etayotgan kurs</h2>
      <div style={{ maxWidth: '400px' }}>
        <CourseCard course={activeCourse} />
      </div>
    </div>
  );
}
