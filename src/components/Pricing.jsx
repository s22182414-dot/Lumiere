import { useState } from 'react';

const PLANS = [
  {
    id: 'free',
    name: 'Bepul',
    monthlyPrice: 0,
    features: [
      { text: '10 ta bepul kurs', ok: true },
      { text: 'Asosiy materiallar', ok: true },
      { text: 'Jamoa forumi', ok: true },
      { text: 'Sertifikat', ok: false },
      { text: 'Mentor yordami', ok: false },
      { text: 'Cheksiz kurslar', ok: false },
    ],
    btnLabel: 'Boshlash',
    btnStyle: 'btn-outline',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 149000,
    popular: true,
    features: [
      { text: 'Barcha kurslar', ok: true },
      { text: 'HD video darslar', ok: true },
      { text: 'Sertifikat', ok: true },
      { text: 'Mentor yordami', ok: true },
      { text: 'Loyiha topshiriqlari', ok: true },
      { text: '1-1 coaching', ok: false },
    ],
    btnLabel: 'Pro olish',
    btnStyle: 'btn-primary',
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: 349000,
    features: [
      { text: "Hamma narsani o'z ichiga oladi", ok: true },
      { text: '1-1 Coaching sessiyalari', ok: true },
      { text: 'Ish joylashtirish yordami', ok: true },
      { text: 'Maxsus loyihalar', ok: true },
      { text: 'VIP jamoa', ok: true },
      { text: 'Umrlik kirish', ok: true },
    ],
    btnLabel: 'Premium olish',
    btnStyle: 'btn-outline',
  },
];

export default function Pricing({ onSelectPlan }) {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (monthly) => {
    if (monthly === 0) return '0';
    const price = isYearly ? Math.round(monthly * 12 * 0.6 / 12) : monthly;
    return price.toLocaleString();
  };

  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Tariflar</div>
          <h2 className="section-title">Sizga Mos Tarif</h2>
          <p className="section-sub">Oylik yoki yillik to'lov — tejimli narxlar</p>
        </div>

        <div className="pricing-toggle">
          <span className="toggle-label" style={{ color: !isYearly ? 'var(--accent)' : 'var(--text-secondary)' }}>
            Oylik
          </span>
          <div
            className={`toggle-switch ${isYearly ? 'on' : ''}`}
            onClick={() => setIsYearly(v => !v)}
          >
            <div className="toggle-knob" />
          </div>
          <span className="toggle-label" style={{ color: isYearly ? 'var(--accent)' : 'var(--text-secondary)' }}>
            Yillik <span className="save-badge">40% tejang</span>
          </span>
        </div>

        <div className="pricing-grid">
          {PLANS.map(plan => (
            <div key={plan.id} className={`pricing-card ${plan.popular ? 'featured-plan' : ''}`}>
              {plan.popular && <div className="popular-badge">Mashhur</div>}
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">
                <span className="price-amount">{getPrice(plan.monthlyPrice)}</span>
                <span className="price-currency">so'm/oy</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map(f => (
                  <li key={f.text} className={f.ok ? 'feat-yes' : 'feat-no'}>
                    {f.ok ? '✓' : '✗'} {f.text}
                  </li>
                ))}
              </ul>
              <button
                className={`pricing-btn ${plan.btnStyle}`}
                onClick={() => onSelectPlan(plan.id, getPrice(plan.monthlyPrice))}
              >
                {plan.btnLabel}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
