import React from 'react';

const Delivery = () => {
  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
        Yetkazib berish xizmati
      </h1>
      
      <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
        Lumiere do'konidan xarid qilganingiz uchun rahmat! Biz sizning buyurtmangizni tezkor va ishonchli tarzda O'zbekiston bo'ylab yetkazib beramiz.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Box 1: Toshkent shahri */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: '1.75rem', 
          borderRadius: '16px', 
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚡️ Toshkent shahri bo'ylab yetkazib berish
          </h3>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            <li><strong>Tezkor yetkazib berish (Express):</strong> 24 soat ichida (Buyurtma qabul qilingan vaqtdan boshlab).</li>
            <li><strong>Narxi:</strong> 25 000 so'm.</li>
            <li><strong>Yetkazib berish vaqti:</strong> Har kuni soat 09:00 dan 22:00 gacha. Kurerlarimiz kelishdan oldin siz bilan telefon orqali bog'lanishadi.</li>
          </ul>
        </div>

        {/* Box 2: Viloyatlar */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: '1.75rem', 
          borderRadius: '16px', 
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📦 Viloyatlar bo'ylab yetkazib berish
          </h3>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            <li><strong>Yetkazib berish muddati:</strong> 1-3 ish kuni davomida (BTS kuryerlik yoki pochta xizmatlari orqali).</li>
            <li><strong>Narxi:</strong> 35 000 so'm.</li>
            <li><strong>Qabul qilish:</strong> Buyurtmangiz hududingizdagi eng yaqin pochta bo'limiga yoki ko'rsatilgan manzilga kurer orqali topshiriladi.</li>
          </ul>
        </div>

        {/* Box 3: Qoidalar */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: '1.5rem', 
          borderRadius: '16px', 
          border: '1px dashed var(--color-border)',
          color: 'var(--color-text-muted)',
          fontSize: '0.88rem',
          lineHeight: '1.6'
        }}>
          <strong>⚠️ Muhim ma'lumot:</strong> Iltimos, buyurtma berish jarayonida telefon raqamingiz va manzilni to'liq kiriting. Kurerlarimiz bog'lana olmagan taqdirda, yetkazib berish muddati kechikishi mumkin.
        </div>

      </div>
    </div>
  );
};

export default Delivery;
