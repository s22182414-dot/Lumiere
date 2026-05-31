import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  DollarSign, 
  AlertCircle, 
  ArrowLeft,
  Search,
  Check,
  X,
  Activity,
  Power,
  Terminal,
  Trash2,
  AlertTriangle,
  Key
} from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState([]);

  // Password Protection
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('admin_authorized') === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [pwError, setPwError] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isVerifying) return;
    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin', password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthorized(true);
        sessionStorage.setItem('admin_authorized', 'true');
      } else {
        setError(data.error || "Kiritilgan parol noto'g'ri!");
      }
    } catch (err) {
      console.error(err);
      setError("API serverga ulanishda xatolik yuz berdi!");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (isChangingPw) return;
    setPwError('');

    if (!newPw || newPw.length < 4) {
      setPwError("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    if (newPw !== confirmNewPw) {
      setPwError("Yangi parollar bir-biriga mos kelmadi!");
      return;
    }

    setIsChangingPw(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin', currentPassword: currentPw, newPassword: newPw })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Parol muvaffaqiyatli o'zgartirildi!");
        setShowPasswordModal(false);
        // Reset fields
        setCurrentPw('');
        setNewPw('');
        setConfirmNewPw('');
        setPwError('');
      } else {
        setPwError(data.error || "Joriy parol noto'g'ri!");
      }
    } catch (err) {
      console.error(err);
      setPwError("API serverga ulanishda xatolik yuz berdi!");
    } finally {
      setIsChangingPw(false);
    }
  };

  // Stats
  const totalSales = 48250000;
  const activeSessions = 34;

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Load or initialize system errors
    const savedErrors = localStorage.getItem('system_errors');
    if (savedErrors) {
      setErrors(JSON.parse(savedErrors));
    } else {
      const mockErrors = [
        { id: 1, time: "05:40:12, 26.05.2026", msg: "TypeError: Cannot read properties of undefined (reading 'price')", source: "ProductDetails.jsx:42", level: "Kritik", status: "Hal qilinmagan" },
        { id: 2, time: "05:15:34, 26.05.2026", msg: "Failed to load resource: net::ERR_CONNECTION_REFUSED (Unsplash API)", source: "ProductCard.jsx:29", level: "Ogohlantirish", status: "Hal qilindi" },
        { id: 3, time: "23:44:02, 25.05.2026", msg: "SyntaxError: Unexpected token '<', '<!DOCTYPE '... is not valid JSON", source: "helpers.js:12", level: "Kritik", status: "Hal qilinmagan" },
        { id: 4, time: "20:58:03, 25.05.2026", msg: "Warning: No routes matched location '/product/3/reviews'", source: "react-router-dom", level: "Info", status: "Hal qilindi" }
      ];
      setErrors(mockErrors);
      localStorage.setItem('system_errors', JSON.stringify(mockErrors));
    }

    // Capture global JavaScript runtime errors in real time
    const handleGlobalError = (event) => {
      const filename = event.filename ? event.filename.split('/').pop() : 'Noma\'lum';
      const newError = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('uz-UZ') + ", " + new Date().toLocaleDateString('uz-UZ'),
        msg: event.message || "Noma'lum runtime xatolik yuz berdi.",
        source: `${filename}:${event.lineno || '?'}:${event.colno || '?'}`,
        level: "Kritik",
        status: "Hal qilinmagan"
      };

      setErrors(prev => {
        const updated = [newError, ...prev];
        localStorage.setItem('system_errors', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  // Trigger test error dynamically
  const triggerTestError = () => {
    const errorText = [
      "ReferenceError: cartCount is not defined in Navbar.jsx",
      "NetworkError: Failed to fetch http://localhost:5173/api/products from local server",
      "DOMException: Failed to execute 'querySelectorAll' on 'Document'",
      "RangeError: Maximum call stack size exceeded in helpers.js"
    ][Math.floor(Math.random() * 4)];

    const newError = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('uz-UZ') + ", " + new Date().toLocaleDateString('uz-UZ'),
      msg: errorText,
      source: "App.jsx:" + Math.floor(Math.random() * 120 + 10),
      level: Math.random() > 0.5 ? "Kritik" : "Ogohlantirish",
      status: "Hal qilinmagan"
    };

    setErrors(prev => {
      const updated = [newError, ...prev];
      localStorage.setItem('system_errors', JSON.stringify(updated));
      return updated;
    });
  };

  // Resolve Error Handler
  const resolveError = (id) => {
    const updated = errors.map(err => {
      if (err.id === id) {
        return { ...err, status: err.status === 'Hal qilindi' ? 'Hal qilinmagan' : 'Hal qilindi' };
      }
      return err;
    });
    setErrors(updated);
    localStorage.setItem('system_errors', JSON.stringify(updated));
  };

  // Delete Error Handler
  const deleteError = (id) => {
    const updated = errors.filter(err => err.id !== id);
    setErrors(updated);
    localStorage.setItem('system_errors', JSON.stringify(updated));
  };

  // Clear All Errors
  const clearAllErrors = () => {
    setErrors([]);
    localStorage.setItem('system_errors', JSON.stringify([]));
  };

  // Filter errors by search query
  const filteredErrors = errors.filter(err => 
    err.msg.toLowerCase().includes(searchQuery.toLowerCase()) ||
    err.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
    err.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        padding: '2rem 1rem'
      }}>
        <style>{`
          .pw-card {
            background: var(--color-surface);
            border-radius: 24px;
            border: 1px solid var(--color-border);
            box-shadow: var(--shadow-sm);
            padding: 3rem 2.5rem;
            width: 100%;
            max-width: 400px;
            text-align: center;
            animation: pwFadeIn 0.4s ease-out;
          }
          @keyframes pwFadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .pw-input {
            width: 100%;
            padding: 0.85rem 1rem;
            border: 1.5px solid var(--color-border);
            border-radius: 12px;
            font-size: 0.95rem;
            outline: none;
            text-align: center;
            background-color: #fafbfc;
            color: var(--color-text);
            transition: all 0.2s ease;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .pw-input:focus {
            border-color: var(--color-primary);
            background-color: var(--color-surface);
            box-shadow: 0 0 0 4px rgba(255, 51, 102, 0.08);
          }
          .pw-submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #FF3366, #ff5c8a);
            color: white;
            border: none;
            padding: 0.9rem;
            border-radius: 24px;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(255, 51, 102, 0.2);
            transition: all 0.2s ease;
          }
          .pw-submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(255, 51, 102, 0.3);
          }
          .pw-back-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--color-text-muted);
            font-weight: 600;
            font-size: 0.88rem;
            text-decoration: none;
            margin-top: 1.5rem;
            transition: all 0.2s ease;
          }
          .pw-back-btn:hover {
            color: var(--color-text);
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
          @media (max-width: 480px) {
            .pw-card {
              padding: 2rem 1.25rem !important;
            }
          }
        `}</style>
        <div className="pw-card">
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 51, 102, 0.06)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Shield size={28} />
          </div>
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '6px', color: 'var(--color-text)' }}>
            Admin paneliga kirish
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
            Ushbu bo'lim himoyalangan. Iltimos, davom etish uchun parolni kiriting.
          </p>

          <form onSubmit={handlePasswordSubmit}>
            <input 
              type="password" 
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="pw-input"
              autoFocus
            />
            {error && (
              <div style={{
                color: '#e53e3e',
                fontSize: '0.82rem',
                fontWeight: '700',
                marginBottom: '1rem',
                animation: 'shake 0.3s ease'
              }}>
                ❌ {error}
              </div>
            )}
            <button type="submit" className="pw-submit-btn" disabled={isVerifying}>
              {isVerifying ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </button>
          </form>

          <Link to="/" className="pw-back-btn">
            <ArrowLeft size={16} /> Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: 'calc(100vh - 100px)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: '600' }} className="back-link">
          <ArrowLeft size={18} />
          Bosh sahifaga qaytish
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(255, 51, 102, 0.1)', color: 'var(--color-primary)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
          <Shield size={16} />
          TIZIM ADMINI
        </div>
      </div>

      <div className="seller-admin-grid">
        
        {/* SIDEBAR */}
        <aside style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '1.5rem 1rem',
          height: 'fit-content',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Admin profile */}
          <div style={{ textAlign: 'center', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(26, 26, 26, 0.05)',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: '0 auto 0.75rem auto',
              border: '2px dashed var(--color-primary)'
            }}>
              AD
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Super Admin</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Boshqaruv & Crash Monitor</span>
          </div>

          {/* Sidebar Nav Items */}
          <div className="seller-admin-sidebar-nav">
            <button 
              onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: activeTab === 'overview' ? 'white' : 'var(--color-text)',
                backgroundColor: activeTab === 'overview' ? 'var(--color-primary)' : 'transparent',
                fontWeight: '600',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Activity size={20} />
              Tizim tahlili
            </button>

            <button 
              onClick={() => { setActiveTab('errors'); setSearchQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: activeTab === 'errors' ? 'white' : 'var(--color-text)',
                backgroundColor: activeTab === 'errors' ? 'var(--color-primary)' : 'transparent',
                fontWeight: '600',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Terminal size={20} />
              Xatoliklar jurnali ({errors.filter(e => e.status === 'Hal qilinmagan').length})
            </button>

            <button 
              onClick={() => {
                setPwError('');
                setCurrentPw('');
                setNewPw('');
                setConfirmNewPw('');
                setShowPasswordModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                backgroundColor: 'transparent',
                border: '1px dashed var(--color-border)',
                fontWeight: '600',
                transition: 'all 0.2s',
                textAlign: 'left',
                marginTop: '1.5rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 51, 102, 0.05)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <Key size={20} />
              Parolni o'zgartirish
            </button>

          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          minHeight: '520px'
        }}>
          
          {/* TAB 1: SYSTEM OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Tizim Tahlili va Monitoringi</h2>
              
              {/* Stat Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {/* Stat 1 */}
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>Platforma aylanmasi</span>
                    <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(0, 176, 72, 0.1)', color: '#00B048' }}><DollarSign size={18} /></div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px 0' }}>{formatPrice(totalSales)}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#00B048', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} /> +18.7% bu oy</span>
                </div>
                {/* Stat 2 */}
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>Kritik xatoliklar</span>
                    <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(214, 28, 78, 0.1)', color: '#D61C4E' }}><AlertTriangle size={18} /></div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px 0' }}>
                    {errors.filter(e => e.status === 'Hal qilinmagan' && e.level === 'Kritik').length} ta
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Hal qilinishi kutilmoqda</span>
                </div>
                {/* Stat 3 */}
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>Faol sessiyalar</span>
                    <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(112, 0, 255, 0.1)', color: '#7000FF' }}><Activity size={18} /></div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px 0' }}>{activeSessions} ta</h3>
                  <span style={{ fontSize: '0.75rem', color: '#00B048' }}>● Tizim onlayn rejimda</span>
                </div>
              </div>

              {/* Maintenance Mode Widget */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.5rem',
                backgroundColor: maintenanceMode ? '#FFF2F2' : '#F6FBF8',
                border: maintenanceMode ? '1px solid #FFD2D9' : '1px solid #C3F3DB',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <AlertCircle size={24} color={maintenanceMode ? '#D61C4E' : '#00B048'} />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 2px 0' }}>Profilaktika rejimi (Maintenance)</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      {maintenanceMode ? "Hozirda tizim barcha foydalanuvchilar uchun yopiq, faqat adminlar kira oladi." : "Tizim normal rejimda ishlamoqda. Sayt hammaga ochiq."}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.2rem',
                    backgroundColor: maintenanceMode ? '#D61C4E' : 'var(--color-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Power size={16} />
                  {maintenanceMode ? "O'chirish" : "Yoqish"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM CRASH AND ERRORS MONITOR */}
          {activeTab === 'errors' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px 0' }}>Tizim Xatoliklari Jurnali</h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Saytda yuz bergan JavaScript runtime va tarmoq xatoliklarini real vaqtda kuzatish</p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {/* Test Error Button */}
                  <button 
                    onClick={triggerTestError}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      color: 'var(--color-text)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  >
                    <AlertTriangle size={14} color="var(--color-primary)" />
                    Sinov xatosi yaratish
                  </button>

                  {/* Clear All */}
                  <button 
                    onClick={clearAllErrors}
                    disabled={errors.length === 0}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#FFECEF',
                      border: '1px solid #FFD2D9',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      color: '#D61C4E',
                      cursor: errors.length === 0 ? 'not-allowed' : 'pointer',
                      opacity: errors.length === 0 ? 0.6 : 1
                    }}
                  >
                    <Trash2 size={14} />
                    Tozalash
                  </button>
                </div>
              </div>

              {/* Filtering Search Box */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1.25rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Xatolik nomi, fayl yoki darajasi bo'yicha filtrlash..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.65rem 0.65rem 2.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)'
                  }}
                />
              </div>

              {/* Errors List */}
              {filteredErrors.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredErrors.map((err) => (
                    <div key={err.id} className="admin-error-card" style={{
                      backgroundColor: err.status === 'Hal qilindi' ? '#FBFDFB' : '#FFFDFD',
                      transition: 'all 0.2s',
                      borderColor: err.status === 'Hal qilindi' ? '#C3F3DB' : err.level === 'Kritik' ? '#FFD2D9' : '#FFF9EC'
                    }}>
                      <div>
                        {/* Title and Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            backgroundColor: err.status === 'Hal qilindi' ? '#E6F9F0' : err.level === 'Kritik' ? '#FFECEF' : '#FFF9EC',
                            color: err.status === 'Hal qilindi' ? '#00B048' : err.level === 'Kritik' ? '#D61C4E' : '#FFB800'
                          }}>
                            {err.status === 'Hal qilindi' ? "HAL QILINDI" : err.level.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{err.time}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Manba: <code style={{ backgroundColor: 'var(--color-bg)', padding: '2px 4px', borderRadius: '4px' }}>{err.source}</code></span>
                        </div>
                        
                        {/* Error Message */}
                        <p style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: err.status === 'Hal qilindi' ? 'var(--color-text-muted)' : '#1a1a1a',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all'
                        }}>
                          {err.msg}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => resolveError(err.id)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            backgroundColor: 'white',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            color: err.status === 'Hal qilindi' ? 'var(--color-text-muted)' : '#00B048',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={14} />
                          {err.status === 'Hal qilindi' ? "Qaytarish" : "Hal qilindi"}
                        </button>
                        <button 
                          onClick={() => deleteError(err.id)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            border: '1px solid #FFD2D9',
                            color: '#D61C4E',
                            backgroundColor: '#FFECEF',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)'
                }}>
                  <Check size={36} color="#00B048" style={{ marginBottom: '0.75rem' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-text)', margin: '0 0 4px 0' }}>Xatoliklar topilmadi!</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Barcha xatoliklar hal qilindi yoki jurnal toza.</p>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setShowPasswordModal(false)}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            padding: '2.5rem 2rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowPasswordModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 51, 102, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Key size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--color-text)' }}>
                Parolni o'zgartirish
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Tizim xavfsizligini ta'minlash uchun parolni yangilang.
              </p>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Joriy parol
                </label>
                <input 
                  type="password"
                  value={currentPw}
                  onChange={(e) => { setCurrentPw(e.target.value); setPwError(''); }}
                  placeholder="Amaldagi parolni kiriting"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Yangi parol
                </label>
                <input 
                  type="password"
                  value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setPwError(''); }}
                  placeholder="Yangi parol (kamida 4 ta belgi)"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Yangi parolni tasdiqlang
                </label>
                <input 
                  type="password"
                  value={confirmNewPw}
                  onChange={(e) => { setConfirmNewPw(e.target.value); setPwError(''); }}
                  placeholder="Yangi parolni qaytadan kiriting"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  required
                />
              </div>

              {pwError && (
                <div style={{
                  color: '#e53e3e',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  padding: '6px 10px',
                  backgroundColor: '#FFF5F5',
                  border: '1px solid #FED7D7',
                  borderRadius: '8px',
                  animation: 'shake 0.3s ease'
                }}>
                  ⚠️ {pwError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '24px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'white',
                    color: 'var(--color-text)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={isChangingPw}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '24px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FF3366, #ff5c8a)',
                    color: 'white',
                    fontWeight: '700',
                    cursor: isChangingPw ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 51, 102, 0.2)',
                    transition: 'all 0.2s',
                    opacity: isChangingPw ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => { if (!isChangingPw) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { if (!isChangingPw) e.currentTarget.style.transform = 'none'; }}
                >
                  {isChangingPw ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
