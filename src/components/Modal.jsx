import { useState } from 'react';
import { getCatName, formatNum } from '../data';

function LoginForm({ onSwitch, onSuccess }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const handle = () => {
    if (!email) return;
    onSuccess('✅ Tizimga muvaffaqiyatli kirdingiz!');
  };
  return (
    <>
      <div className="modal-title">👋 Xush Kelibsiz!</div>
      <p className="modal-sub">Hisobingizga kiring va davom eting</p>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input type="email" className="form-input" placeholder="email@example.com"
          value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Parol</label>
        <input type="password" className="form-input" placeholder="Parolingiz"
          value={pass} onChange={e => setPass(e.target.value)} />
      </div>
      <button className="btn-primary form-btn btn-lg" onClick={handle}>Kirish</button>
      <div className="form-link">
        Hisobingiz yo'qmi?{' '}
        <a href="#" onClick={e => { e.preventDefault(); onSwitch('signup'); }}>Ro'yxatdan o'ting</a>
      </div>
    </>
  );
}

function SignupForm({ onSwitch, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const handle = () => {
    if (!name || !email) return;
    onSuccess(`🎉 Xush kelibsiz, ${name.split(' ')[0]}! Ro'yxatdan o'tdingiz.`);
  };
  return (
    <>
      <div className="modal-title">🚀 Hisob Yaratish</div>
      <p className="modal-sub">Bepul ro'yxatdan o'ting va o'rganishni boshlang!</p>
      <div className="form-group">
        <label className="form-label">Ism Familiya</label>
        <input type="text" className="form-input" placeholder="Masalan: Sardor Toshmatov"
          value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input type="email" className="form-input" placeholder="email@example.com"
          value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Parol</label>
        <input type="password" className="form-input" placeholder="Kamida 8 ta belgi"
          value={pass} onChange={e => setPass(e.target.value)} />
      </div>
      <button className="btn-primary form-btn btn-lg" onClick={handle}>Ro'yxatdan O'tish</button>
      <div className="form-link">
        Hisobingiz bormi?{' '}
        <a href="#" onClick={e => { e.preventDefault(); onSwitch('login'); }}>Kirish</a>
      </div>
    </>
  );
}

function EnrollForm({ course, onSuccess }) {
  const [card, setCard] = useState('');
  const [exp, setExp] = useState('');
  const [cvv, setCvv] = useState('');
  const formatCard = (v) => v.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, background: course.color, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 16px' }}>
          {course.emoji}
        </div>
        <div className="section-tag" style={{ marginBottom: 12 }}>{getCatName(course.category)}</div>
        <h2 className="modal-title">{course.title}</h2>
        <p className="modal-sub">Muallim: {course.instructor}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{course.duration}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Kurs davomiyligi</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{course.rating} ⭐</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatNum(course.reviews)} baho</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 32, fontWeight: 900, background: 'var(--accent-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {course.price} so'm
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 8 }}>{course.oldPrice}</span>
      </div>
      <div className="form-group">
        <label className="form-label">Karta raqami</label>
        <input type="text" className="form-input" placeholder="8600 0000 0000 0000"
          value={card} onChange={e => setCard(formatCard(e.target.value))} maxLength={19} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Muddat</label>
          <input type="text" className="form-input" placeholder="MM/YY"
            value={exp} onChange={e => setExp(e.target.value)} maxLength={5} />
        </div>
        <div className="form-group">
          <label className="form-label">CVV</label>
          <input type="text" className="form-input" placeholder="***"
            value={cvv} onChange={e => setCvv(e.target.value)} maxLength={3} />
        </div>
      </div>
      <button className="btn-primary form-btn btn-lg" onClick={() => onSuccess("✅ To'lov muvaffaqiyatli! Kursga xush kelibsiz 🎓")}>
        💳 To'lash
      </button>
    </>
  );
}

function PaymentForm({ planName, price, onSuccess }) {
  const [card, setCard] = useState('');
  const formatCard = (v) => v.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
  return (
    <>
      <div className="modal-title">💳 {planName} Tarif</div>
      <p className="modal-sub">Ajoyib tanlov! O'zingizga sarmoya qiling.</p>
      <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 900, background: 'var(--accent-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{price} so'm/oy</div>
      </div>
      <div className="form-group">
        <label className="form-label">Karta raqami</label>
        <input type="text" className="form-input" placeholder="8600 0000 0000 0000"
          value={card} onChange={e => setCard(formatCard(e.target.value))} maxLength={19} />
      </div>
      <button className="btn-primary form-btn btn-lg" onClick={() => onSuccess("✅ Obuna muvaffaqiyatli! Barcha kurslar ochildi 🎉")}>
        ✅ Tasdiqlash
      </button>
    </>
  );
}

export default function Modal({ modal, onClose, onToast }) {
  const [view, setView] = useState(modal?.type || 'login');

  const handleSuccess = (msg) => {
    onClose();
    onToast(msg);
  };

  if (!modal) return null;

  const renderContent = () => {
    const type = modal.type === 'login' || modal.type === 'signup' ? view : modal.type;
    switch (type) {
      case 'login':
        return <LoginForm onSwitch={setView} onSuccess={handleSuccess} />;
      case 'signup':
        return <SignupForm onSwitch={setView} onSuccess={handleSuccess} />;
      case 'enroll':
        return <EnrollForm course={modal.data} onSuccess={handleSuccess} />;
      case 'payment':
        return <PaymentForm planName={modal.data?.planName} price={modal.data?.price} onSuccess={handleSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">{renderContent()}</div>
      </div>
    </div>
  );
}
