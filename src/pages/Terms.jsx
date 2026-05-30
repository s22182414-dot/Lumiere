import { useEffect } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
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
          <FileText size={36} color="var(--color-primary)" />
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>Foydalanish Shartlari</h1>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          Oxirgi yangilanish: 25-may, 2026-yil.
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>1. Shartlarni qabul qilish</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Lumiere veb-saytiga kirish va undan foydalanish orqali siz mazkur Foydalanish shartlariga to'liq rozilik bildirasiz. Agar siz ushbu shartlarga rozi bo'lmasangiz, iltimos, saytdan foydalanmang.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>2. Xizmat ko'rsatish shartlari</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Kompaniyamiz tabiiy go'zallik va parvarish kosmetika vositalarini chakana savdo yo'nalishida taqdim etadi. Biz mahsulot narxlari va tavsiflarini istalgan vaqtda ogohlantirishsiz o'zgartirish huquqini saqlab qolamiz. Saytdagi barcha ma'lumotlar faqat ma'lumot berish maqsadida taqdim etiladi.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>3. Buyurtma berish va to'lov</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Buyurtma berish uchun foydalanuvchilar o'zlari haqida to'g'ri va to'liq ma'lumot taqdim etishlari shart. Yetkazib berish shartlari, to'lov usullari va buyurtmani bekor qilish tartibi sotib olish jarayonida batafsil ko'rsatiladi. To'lovlar naqd pul, Click, Payme yoki bank kartalari orqali amalga oshirilishi mumkin.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>4. Intellektual mulk</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Ushbu saytdagi barcha kontent (logotip, matnlar, grafikalar, dizayn, dasturiy ta'minot, logotiplar va rasmlar) Lumiere Cosmetics mulki hisoblanadi va mualliflik huquqi to'g'risidagi qonun hujjatlari bilan himoyalanadi. Undan ruxsatsiz nusxa ko'chirish yoki foydalanish taqiqlanadi.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>5. Javobgarlikni cheklash</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            Biz saytdan foydalanish yoki undan foydalana olmaslik natijasida yuzaga keladigan bevosita yoki bilvosita zararlar uchun javobgarlikni o'z zimmamizga olmaymiz. Foydalanuvchilar kosmetika vositalarini ishlatishdan oldin ularning tarkibiy qismlarini tekshirib ko'rishlari tavsiya etiladi.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text)' }}>6. O'zgarishlar</h3>
          <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Kompaniya ushbu foydalanish shartlariga istalgan vaqtda o'zgartirish kiritish huquqiga ega. Shartlar yangilangandan keyin saytdan foydalanishda davom etishingiz o'zgarishlarni qabul qilganingizni anglatadi.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
