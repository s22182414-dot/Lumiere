import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Lumiere do'konidagi mahsulotlar original va xavfsizmi?",
      a: "Ha, albatta! Biz faqat sertifikatlangan, to'g'ridan-to'g'ri ishlab chiqaruvchilar va rasmiy distribyutorlardan keltirilgan 100% original kosmetika mahsulotlarini sotamiz. Barcha mahsulotlarimiz sifat nazoratidan va laboratoriya testlaridan o'tgan."
    },
    {
      q: "Buyurtmani qanday rasmiylashtirish mumkin?",
      a: "Saytda o'zingizga yoqqan mahsulotlarni savatga qo'shing, so'ngra 'Savat' sahifasiga o'tib, 'Sotib olish' tugmasini bosing. Ismingiz, telefon raqamingiz va manzilingizni to'ldirib, to'lov usulini tanlang. Buyurtmangiz muvaffaqiyatli qabul qilingandan so'ng, operatorlarimiz tez orada siz bilan bog'lanishadi."
    },
    {
      q: "Buyurtma berilgandan keyin yetkazib berish muddati qancha?",
      a: "Toshkent shahri bo'ylab buyurtmalar 24 soat ichida (Express) yetkazib beriladi. O'zbekistonning boshqa viloyat va hududlariga esa 1-3 ish kuni ichida BTS kuryerlik yoki pochta xizmatlari orqali yetkazib beriladi."
    },
    {
      q: "To'lovni qanday usullarda amalga oshirish mumkin?",
      a: "Siz buyurtma to'lovini saytning o'zida Click va Payme tizimlari orqali (UzCard/Humo) onlayn to'lashingiz yoki kurer buyurtmani eshigingizga olib kelganida naqd pul shaklida topshirishingiz mumkin."
    },
    {
      q: "Mahsulotni qaytarish yoki almashtirish shartlari qanday?",
      a: "Gigiyenik va kosmetika vositalari O'zbekiston Respublikasi iste'molchilar huquqlarini himoya qilish qonuniga muvofiq, agar mahsulotda zavod nuqsoni (brak) bo'lmasa, qaytarib olinmaydi yoki almashtirilmaydi. Agar sizga noto'g'ri yoki nuqsonli mahsulot kelgan bo'lsa, uni 24 soat ichida mutlaqo bepul almashtirib beramiz."
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--color-text)', letterSpacing: '-0.5px', textAlign: 'center' }}>
        Ko'p beriladigan savollar (FAQ)
      </h1>
      <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '3rem' }}>
        Sizni qiziqtirgan savollarga tezkor javoblar. Agar qo'shimcha savollaringiz bo'lsa, biz bilan bog'lanishingiz mumkin.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                boxShadow: isOpen ? '0 8px 24px rgba(0,0,0,0.04)' : 'none'
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  gap: '1rem'
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--color-text)' }}>
                  {faq.q}
                </span>
                <ChevronDown 
                  size={20} 
                  style={{
                    color: 'var(--color-text-muted)',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.3s ease'
                  }} 
                />
              </button>

              <div 
                style={{
                  maxHeight: isOpen ? '250px' : '0',
                  opacity: isOpen ? '1' : '0',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  backgroundColor: 'rgba(0,0,0,0.01)'
                }}
              >
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Faq;
