import { INSTRUCTORS } from '../data';

export default function Instructors() {
  return (
    <section className="instructors-section" id="instructors">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Jamoa</div>
          <h2 className="section-title">Professional O'qituvchilar</h2>
          <p className="section-sub">Sohaning eng yaxshi mutaxassislaridan o'rganing</p>
        </div>
        <div className="instructors-grid">
          {INSTRUCTORS.map(inst => (
            <div className="instructor-card" key={inst.name}>
              <div className="inst-avatar">{inst.emoji}</div>
              <div className="inst-name">{inst.name}</div>
              <div className="inst-title">{inst.title}</div>
              <div className="inst-stats">
                <div className="inst-stat">
                  <span className="inst-stat-num">{inst.courses}</span>
                  <span className="inst-stat-label">Kurslar</span>
                </div>
                <div className="inst-stat">
                  <span className="inst-stat-num">{inst.students}</span>
                  <span className="inst-stat-label">O'quvchilar</span>
                </div>
                <div className="inst-stat">
                  <span className="inst-stat-num">{inst.rating}⭐</span>
                  <span className="inst-stat-label">Reyting</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
