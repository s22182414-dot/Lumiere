import { useEffect } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: '500', transition: 'transform 0.2s' }} className="back-link">
          <ArrowLeft size={18} />
          Bosh sahifaga qaytish
        </Link>
      </div>

      <div style={{
        backgroundColor: 'var(--color-surface)',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <Shield size={36} color="var(--color-primary)" />
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Maxfiylik Siyosati</h1>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          Oxirgi yangilanish: 25-may, 2026-yil.
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>1. Umumiy qoidalar</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Lumiere Cosmetics (keyingi o'rinlarda "biz" yoki "Kompaniya") foydalanuvchilarning maxfiyligini hurmat qiladi va ularning shaxsiy ma'lumotlarini himoya qilish majburiyatini oladi. Mazkur Maxfiylik siyosati bizning veb-saytimizdan foydalanganingizda ma'lumotlaringiz qanday to'planishi, ishlatilishi va himoya qilinishini tushuntiradi.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>2. Biz to'playdigan ma'lumotlar</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Biz sizga sifatli xizmat ko'rsatish maqsadida quyidagi shaxsiy ma'lumotlarni to'plashimiz mumkin:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--color-text)', lineHeight: '1.8' }}>
            <li>Ismingiz va familiyangiz;</li>
            <li>Telefon raqamingiz va elektron pochta manzilingiz;</li>
            <li>Yetkazib berish manzili;</li>
            <li>Buyurtma tarixi va xarid afzalliklaringiz.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>3. Ma'lumotlardan foydalanish</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            To'plangan ma'lumotlar quyidagi maqsadlarda ishlatiladi:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', color: 'var(--color-text)', lineHeight: '1.8' }}>
            <li>Buyurtmalarni rasmiylashtirish va yetkazib berish;</li>
            <li>Mijozlarni qo'llab-quvvatlash va so'rovlarga javob berish;</li>
            <li>Yangi mahsulotlar, aksiyalar va maxsus takliflar haqida xabardor qilish (roziligingiz bilan);</li>
            <li>Veb-sayt faoliyatini tahlil qilish va xizmat sifatini oshirish.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>4. Ma'lumotlar xavfsizligi</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Biz shaxsiy ma'lumotlaringiz ruxsatsiz kirish, o'zgartirish yoki oshkor qilinishidan himoya qilish uchun zamonaviy tashkiliy va texnik xavfsizlik choralarini qo'llaymiz. Shaxsiy ma'lumotlaringiz hech qachon uchinchi shaxslarga tijorat maqsadlarida sotilmaydi yoki ijaraga berilmaydi.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>5. Aloqa</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Maxfiylik siyosatimiz bo'yicha savollaringiz bo'lsa, biz bilan bog'lanishingiz mumkin:<br />
            Elektron pochta: <strong>hello@lumiere.uz</strong><br />
            Telefon: <strong>+998 90 123 45 67</strong>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
