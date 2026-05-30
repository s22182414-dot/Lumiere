export default function Stats() {
  const stats = [
    { value: '50,000+', label: "O'quvchilar" },
    { value: '200+', label: 'Video darslar' },
    { value: '50+', label: 'Loyihalar' },
    { value: '98%', label: 'Ijobiy fikrlar' },
  ];

  return (
    <div className="stats-bar">
      {stats.map(s => (
        <div key={s.label} className="stat-item">
          <span className="stat-val">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
