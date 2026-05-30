import { useState, useEffect } from 'react';
import { TESTIMONIALS } from '../data';

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive(a => (a + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Fikrlar</div>
          <h2 className="section-title">O'quvchilar Nima Deydi?</h2>
          <p className="section-sub">Bizning hamjamiyatimizdan real fikrlar</p>
        </div>

        <div className="testimonials-track">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`testimonial-card ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            >
              <div className="test-quote">"{t.quote}"</div>
              <div className="test-author">
                <div className="test-avatar">{t.letter}</div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                  <div className="test-stars">{'★'.repeat(t.stars)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonial-dots">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
