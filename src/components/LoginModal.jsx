import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { generateStateToken, checkAuthSession, deleteAuthSession } from '../services/authService';

const BOT_USERNAME = 'lumiereparfumeshop_bot';

const LoginModal = ({ isOpen, onClose }) => {
  const [stateToken, setStateToken] = useState('');
  const [status, setStatus]         = useState('idle'); // idle | waiting | success | error
  const pollRef                     = useRef(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const token = generateStateToken();
      setStateToken(token);
      setStatus('idle');
    } else {
      document.body.style.overflow = 'unset';
      stopPolling();
    }
    return () => {
      document.body.style.overflow = 'unset';
      stopPolling();
    };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && isOpen) handleClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen]);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const handleClose = () => {
    stopPolling();
    onClose();
  };

  // Start polling Firestore after user clicks the button
  const handleTelegramLogin = () => {
    // Open Telegram deep link
    const deepLink = `https://t.me/${BOT_USERNAME}?start=${stateToken}`;
    window.open(deepLink, '_blank');
    setStatus('waiting');

    // Poll every 2s for up to 3 minutes
    let attempts = 0;
    const MAX_ATTEMPTS = 90; // 90 × 2s = 3 min

    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        stopPolling();
        setStatus('error');
        return;
      }
      try {
        const session = await checkAuthSession(stateToken);
        if (session) {
          stopPolling();
          // Save user to localStorage
          localStorage.setItem('user_logged_in', 'true');
          localStorage.setItem('user_name', session.firstName || '');
          localStorage.setItem('user_username', session.username || '');
          localStorage.setItem('user_telegram_id', session.telegramId || '');
          localStorage.setItem('user_photo', session.photoUrl || '');
          localStorage.setItem('user_phone', '');
          window.dispatchEvent(new Event('storage'));
          // Clean up session
          await deleteAuthSession(stateToken);
          setStatus('success');
          setTimeout(() => handleClose(), 1500);
        }
      } catch (err) {
        console.error('Polling xato:', err);
      }
    }, 2000);
  };

  // Try again — regenerate token
  const handleRetry = () => {
    stopPolling();
    const token = generateStateToken();
    setStateToken(token);
    setStatus('idle');
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999999, backdropFilter: 'blur(6px)',
        animation: 'lgFadeIn 0.2s ease-out'
      }}
    >
      <style>{`
        @keyframes lgFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes lgScale   { from { transform:scale(0.88) translateY(24px); opacity:0 } to { transform:scale(1) translateY(0); opacity:1 } }
        @keyframes lgSpin    { to { transform:rotate(360deg) } }
        @keyframes lgPulse   { 0%,100% { opacity:1 } 50% { opacity:0.45 } }
        @keyframes lgCheck   { from { transform:scale(0.5); opacity:0 } to { transform:scale(1); opacity:1 } }
        .tg-login-btn {
          display:flex; align-items:center; justify-content:center; gap:12px;
          width:100%; padding:1rem 1.5rem;
          background:linear-gradient(135deg,#FF3366,#FF6688);
          color:white; border:none; border-radius:14px;
          font-size:1.05rem; font-weight:700; cursor:pointer;
          box-shadow:0 6px 20px rgba(255, 51, 102, 0.35);
          transition:all 0.2s; letter-spacing:0.2px;
        }
        .tg-login-btn:hover:not(:disabled) {
          background:linear-gradient(135deg,#E62E5C,#FF5577);
          transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(255, 51, 102, 0.45);
        }
        .tg-login-btn:active { transform:translateY(0); }
        .tg-login-btn:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
        .lg-spinner {
          width:20px; height:20px; border-radius:50%;
          border:3px solid rgba(255,255,255,0.3);
          border-top-color:white;
          animation:lgSpin 0.8s linear infinite;
        }
        .lg-pulse { animation:lgPulse 1.6s ease-in-out infinite; }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90%', maxWidth: '400px',
          background: 'var(--color-surface)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px var(--color-border)',
          padding: '2.5rem 2rem 2rem',
          position: 'relative',
          animation: 'lgScale 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards'
        }}
      >
        {/* Close */}
        <button onClick={handleClose} style={{
          position:'absolute', top:'14px', right:'14px',
          background:'none', border:'none', color:'var(--color-text-muted)',
          cursor:'pointer', padding:'6px', borderRadius:'50%',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--color-bg)'; e.currentTarget.style.color='var(--color-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--color-text-muted)'; }}
        ><X size={20} /></button>

        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2.4rem', fontWeight:'800', color:'var(--color-primary)', letterSpacing:'-1.5px', fontFamily:'Outfit,sans-serif', lineHeight:1 }}>
            Lumiere
          </div>
          <div style={{ color:'var(--color-text-muted)', fontSize:'0.88rem', marginTop:'6px', fontWeight:'500' }}>
            Cosmetics & Parfumerie
          </div>
        </div>

        {/* ── IDLE state ── */}
        {status === 'idle' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <p style={{ textAlign:'center', color:'var(--color-text-muted)', fontSize:'0.9rem', margin:0, lineHeight:'1.6' }}>
              Tizimga kirish uchun Telegram akkauntingizdan foydalaning
            </p>

            <button className="tg-login-btn" onClick={handleTelegramLogin}>
              {/* Telegram SVG icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.483c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 14.4l-2.948-.924c-.64-.203-.655-.64.136-.948l11.527-4.444c.533-.194 1.002.131.587.164z"/>
              </svg>
              Telegram orqali kirish
            </button>

            <p style={{ textAlign:'center', fontSize:'0.75rem', color:'var(--color-text-muted)', margin:0 }}>
              Telegram akkauntingiz orqali xavfsiz kirish
            </p>
          </div>
        )}

        {/* ── WAITING state ── */}
        {status === 'waiting' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem', padding:'0.5rem 0' }}>
            {/* Telegram logo with pulse */}
            <div style={{ position:'relative', width:'72px', height:'72px' }}>
              <div style={{
                position:'absolute', inset:'-8px', borderRadius:'50%',
                background:'rgba(255,51,102,0.15)',
                animation:'lgPulse 1.6s ease-in-out infinite'
              }}/>
              <div style={{
                width:'72px', height:'72px', borderRadius:'50%',
                background:'linear-gradient(135deg,#FF3366,#FF6688)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 4px 16px rgba(255,51,102,0.4)'
              }}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.483c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 14.4l-2.948-.924c-.64-.203-.655-.64.136-.948l11.527-4.444c.533-.194 1.002.131.587.164z"/>
                </svg>
              </div>
            </div>

            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:'700', fontSize:'1rem', color:'var(--color-text)', marginBottom:'6px' }}>
                Telegram kutilmoqda…
              </div>
              <div style={{ color:'var(--color-text-muted)', fontSize:'0.85rem', lineHeight:'1.6' }}>
                Telegramda <strong>Start</strong> tugmasini bosing.<br/>
                Keyin bu yerga avtomatik kirish amalga oshadi.
              </div>
            </div>

            {/* Animated dots */}
            <div style={{ display:'flex', gap:'6px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:'8px', height:'8px', borderRadius:'50%',
                  background:'var(--color-primary)',
                  animation:`lgPulse 1.2s ease-in-out infinite`,
                  animationDelay:`${i * 0.2}s`
                }}/>
              ))}
            </div>

            <button onClick={handleRetry} style={{
              background:'none', border:'1px solid var(--color-border)',
              color:'var(--color-text-muted)', padding:'0.5rem 1.25rem',
              borderRadius:'20px', cursor:'pointer', fontSize:'0.82rem', fontWeight:'600'
            }}>
              Bekor qilish
            </button>
          </div>
        )}

        {/* ── SUCCESS state ── */}
        {status === 'success' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', padding:'0.5rem 0' }}>
            <div style={{
              width:'68px', height:'68px', borderRadius:'50%',
              background:'linear-gradient(135deg,#00d68f,#00a86b)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 20px rgba(0,214,143,0.35)',
              animation:'lgCheck 0.4s cubic-bezier(0.34,1.56,0.64,1)'
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:'800', fontSize:'1.1rem', color:'var(--color-text)', marginBottom:'4px' }}>
                Xush kelibsiz! 🎉
              </div>
              <div style={{ color:'var(--color-text-muted)', fontSize:'0.85rem' }}>
                Tizimga muvaffaqiyatli kirdingiz
              </div>
            </div>
          </div>
        )}

        {/* ── ERROR state ── */}
        {status === 'error' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem', padding:'0.5rem 0' }}>
            <div style={{ textAlign:'center', color:'var(--color-text-muted)', fontSize:'0.9rem', lineHeight:'1.6' }}>
              ⏰ Vaqt tugadi. Qaytadan urinib ko'ring.
            </div>
            <button className="tg-login-btn" onClick={handleRetry}>
              Qaytadan urinish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
