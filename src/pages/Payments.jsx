import React from 'react';

const Payments = () => {
  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--color-text)', letterSpacing: '-0.5px' }}>
        To'lov usullari
      </h1>
      
      <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
        Lumiere cosmetics do'konida siz xaridlaringizni o'zingizga qulay bo'lgan bir necha usullar orqali xavfsiz to'lashingiz mumkin. Biz eng ishonchli to'lov tizimlarini qo'llab-quvvatlaymiz.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Method 1: Click & Payme */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: '1.75rem', 
          borderRadius: '16px', 
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            💳 Onlayn to'lovlar (Click va Payme)
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
            UzCard yoki Humo bank kartalaringiz yordamida to'g'ridan-to'g'ri saytning o'zida yoki Click/Payme ilovalari orqali xavfsiz to'lovlarni amalga oshiring.
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            <li>Saytda karta raqami va amal qilish muddatini kiritib, SMS-kod orqali tasdiqlash mumkin.</li>
            <li>Barcha to'lovlar shifrlangan xavfsiz protokollar yordamida amalga oshiriladi.</li>
          </ul>
        </div>

        {/* Method 2: Naqd */}
        <div style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: '1.75rem', 
          borderRadius: '16px', 
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            💵 Naqd pul orqali (Kurerga topshirish)
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text)', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
            Agar siz onlayn to'lov qilishni xohlamasangiz, buyurtmani qabul qilib olayotganingizda kurerimizga naqd pul shaklida to'lashingiz mumkin.
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
            <li>Toshkent shahri va viloyat markazlarida amal qiladi.</li>
            <li>Iltimos, kurerlarimiz hisob-kitobni tezroq amalga oshirishi uchun to'lov miqdorini oldindan tayyorlab qo'yishingizni so'raymiz.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Payments;
