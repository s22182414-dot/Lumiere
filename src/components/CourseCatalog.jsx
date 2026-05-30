import { useState, useMemo } from 'react';
import { COURSES, CATEGORIES, getCatName, formatNum, formatPrice } from '../data';

const LEVELS = ["Barchasi", "Boshlang'ich", "O'rta", "Yuqori"];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Mashhur' },
  { value: 'rating', label: 'Reyting' },
  { value: 'price-asc', label: 'Narx ↑' },
  { value: 'price-desc', label: 'Narx ↓' },
];

export default function CourseCatalog({ onCourseClick, onEnroll }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLevel, setActiveLevel] = useState('Barchasi');
  const [sortBy, setSortBy] = useState('popular');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = [...COURSES];
    if (activeCategory !== 'all') list = list.filter(c => c.category === activeCategory);
    if (activeLevel !== 'Barchasi') list = list.filter(c => c.level === activeLevel);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => b.students - a.students);
    return list;
  }, [activeCategory, activeLevel, sortBy, search]);

  return (
    <div className="catalog-page">

      {/* Filters */}
      <div className="catalog-filters">
        <div className="filter-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Kurs yoki o'qituvchi qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="filter-search-input"
          />
          {search && <button className="filter-clear" onClick={() => setSearch('')}>✕</button>}
        </div>

        <div className="filter-row">
          <div className="filter-group">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <div className="filter-right">
            <div className="filter-group">
              {LEVELS.map(l => (
                <button
                  key={l}
                  className={`filter-chip sm ${activeLevel === l ? 'active' : ''}`}
                  onClick={() => setActiveLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="catalog-meta">
        <span className="catalog-count">{filtered.length} ta kurs topildi</span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="catalog-grid">
          {filtered.map((course, i) => (
            <div
              key={course.id}
              className="course-card-v2"
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => onCourseClick(course)}
            >
              <div className="cc2-thumb" style={{ background: course.color }}>
                <span className="cc2-emoji">{course.emoji}</span>
                {course.enrolled && <span className="cc2-enrolled-badge">✓ Yozilgan</span>}
              </div>
              <div className="cc2-body">
                <div className="cc2-meta-top">
                  <span className="cc2-cat">{getCatName(course.category)}</span>
                  <span className="cc2-level">{course.level}</span>
                </div>
                <h3 className="cc2-title">{course.title}</h3>
                <p className="cc2-instructor">{course.instructor}</p>
                <div className="cc2-tags">
                  {course.tags.slice(0, 3).map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
                <div className="cc2-footer">
                  <div className="cc2-stats">
                    <span>⭐ {course.rating}</span>
                    <span>·</span>
                    <span>{formatNum(course.students)} o'quvchi</span>
                    <span>·</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="cc2-price-row">
                    <span className="cc2-price">{formatPrice(course.price)}</span>
                    <button
                      className={`cc2-btn ${course.enrolled ? 'enrolled' : ''}`}
                      onClick={e => { e.stopPropagation(); onEnroll(course); }}
                    >
                      {course.enrolled ? 'Davom etish' : "Yozilish"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="catalog-empty">
          <p className="empty-title">Hech narsa topilmadi</p>
          <p className="empty-sub">Boshqa kalit so'z yoki kategoriya sinab ko'ring</p>
          <button className="btn-outline" onClick={() => { setSearch(''); setActiveCategory('all'); setActiveLevel('Barchasi'); }}>
            Filtrlarni tozalash
          </button>
        </div>
      )}
    </div>
  );
}
