import { CATEGORIES } from '../data';

export default function Categories({ activeCategory, onSelect }) {
  return (
    <section className="categories-section" id="categories">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Kategoriyalar</div>
          <h2 className="section-title">Qaysi Sohani O'rganmoqchisiz?</h2>
          <p className="section-sub">O'zingizga mos yo'nalishni tanlang</p>
        </div>
        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`cat-card ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => onSelect(cat.id)}
            >
              <div className="cat-icon">{cat.emoji}</div>
              <div className="cat-name">{cat.label}</div>
              <div className="cat-count">{cat.count} kurs</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
