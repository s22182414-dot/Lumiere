import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, ShoppingBag, User, ExternalLink,
  MessageSquare, Star, Check, Edit2, Trash2, ChevronRight, Package
} from 'lucide-react';
import { products } from '../data';
import { formatPhoneUz } from '../utils/helpers';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // Default Buyurtmalarim according to user request
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Info Edit states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedCity, setEditedCity] = useState('');
  const [editedAddress, setEditedAddress] = useState('');

  useEffect(() => {
    // Check login
    if (localStorage.getItem('user_logged_in') !== 'true') {
      navigate('/');
      return;
    }

    // Clean up any fake seed-1 review from local storage
    try {
      const savedReviews = localStorage.getItem('user_reviews');
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        const filtered = parsed.filter(r => r.id !== 'seed-1');
        localStorage.setItem('user_reviews', JSON.stringify(filtered));
      }
    } catch (e) { }

    const nameVal = localStorage.getItem('user_name') || 'Foydalanuvchi';
    const phoneVal = localStorage.getItem('user_phone') || '';
    const tgIdVal = localStorage.getItem('user_telegram_id') || '';
    const cityVal = localStorage.getItem('user_city') || 'Toshkent';
    const addressVal = localStorage.getItem('user_address') || '';
    
    setUserData({
      name:       nameVal,
      username:   localStorage.getItem('user_username')    || '',
      telegramId: tgIdVal,
      phone:      phoneVal,
      photo:      localStorage.getItem('user_photo')       || '',
      joinedAt:   localStorage.getItem('user_joined_at')   || new Date().toLocaleDateString('uz-UZ'),
      city:       cityVal,
      address:    addressVal,
    });

    setImgError(false);
    setEditedName(nameVal);
    setEditedPhone(phoneVal);
    setEditedCity(cityVal);
    setEditedAddress(addressVal);

    // Save join date once
    if (!localStorage.getItem('user_joined_at')) {
      localStorage.setItem('user_joined_at', new Date().toLocaleDateString('uz-UZ'));
    }

    if (tgIdVal) {
      fetchOrders(tgIdVal);
      fetchReviews(tgIdVal);
    }
  }, []);

  const fetchOrders = async (tgId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${tgId}`);
      if (res.ok) {
        const data = await res.json();
        const flattenedItems = [];
        data.forEach(order => {
          const orderDate = new Date(order.createdAt).toLocaleDateString('uz-UZ');
          order.items.forEach(item => {
            flattenedItems.push({
              ...item,
              orderNumber: order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase(),
              date: orderDate,
              status: order.status || 'Kutilmoqda'
            });
          });
        });
        setCartItems(flattenedItems);
      } else {
        loadOrdersFallback();
      }
    } catch (err) {
      console.error("Orders fetch API error, using localStorage fallback:", err);
      loadOrdersFallback();
    }
  };

  const loadOrdersFallback = () => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch { }
  };

  const fetchReviews = async (tgId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews?telegramId=${tgId}`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(r => ({
          ...r,
          date: new Date(r.createdAt || Date.now()).toLocaleDateString('uz-UZ')
        }));
        setReviews(formatted);
      } else {
        loadReviewsFallback();
      }
    } catch (err) {
      console.error("Reviews fetch API error, using localStorage fallback:", err);
      loadReviewsFallback();
    }
  };

  const loadReviewsFallback = () => {
    try {
      const savedReviews = localStorage.getItem('user_reviews');
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      } else {
        setReviews([]);
      }
    } catch { }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    ['user_logged_in','user_name','user_username','user_telegram_id','user_photo','user_phone','user_city','user_address'].forEach(
      k => localStorage.removeItem(k)
    );
    window.dispatchEvent(new Event('storage'));
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    if (!editedName.trim()) return;

    localStorage.setItem('user_name', editedName);
    localStorage.setItem('user_phone', editedPhone);
    localStorage.setItem('user_city', editedCity);
    localStorage.setItem('user_address', editedAddress);
    
    setUserData(prev => ({
      ...prev,
      name: editedName,
      phone: editedPhone,
      city: editedCity,
      address: editedAddress
    }));

    window.dispatchEvent(new Event('storage'));
    setIsEditingInfo(false);
    showToast("Ma'lumotlar muvaffaqiyatli saqlandi!");
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const reviewData = {
      telegramId: userData.telegramId,
      userName: userData.name,
      userPhoto: userData.photo || '',
      productId: selectedProductForReview.id,
      productName: selectedProductForReview.name,
      productImage: selectedProductForReview.image,
      rating: rating,
      comment: comment
    };

    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (res.ok) {
        const savedReview = await res.json();
        savedReview.date = new Date(savedReview.createdAt).toLocaleDateString('uz-UZ');
        
        setReviews([savedReview, ...reviews]);
        setSelectedProductForReview(null);
        setComment('');
        setRating(5);
        showToast("Sharhingiz muvaffaqiyatli qo'shildi!");
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Sharhni saqlashda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error("API error, using localStorage fallback:", err);
      const newReview = {
        id: 'rev-' + Date.now(),
        productId: selectedProductForReview.id,
        productName: selectedProductForReview.name,
        productImage: selectedProductForReview.image,
        rating: rating,
        comment: comment,
        date: new Date().toLocaleDateString('uz-UZ')
      };
      const updatedReviews = [newReview, ...reviews];
      localStorage.setItem('user_reviews', JSON.stringify(updatedReviews));
      setReviews(updatedReviews);
      setSelectedProductForReview(null);
      setComment('');
      setRating(5);
      showToast("Sharhingiz muvaffaqiyatli qo'shildi! (Offline)");
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Ushbu sharhni o'chirmoqchimisiz?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setReviews(reviews.filter(r => r._id !== id && r.id !== id));
          showToast("Sharh o'chirildi.");
        } else {
          alert("Sharhni o'chirishda xatolik yuz berdi.");
        }
      } catch (err) {
        console.error("API error deleting review, using localStorage fallback:", err);
        const updated = reviews.filter(r => r.id !== id && r._id !== id);
        localStorage.setItem('user_reviews', JSON.stringify(updated));
        setReviews(updated);
        showToast("Sharh o'chirildi. (Offline)");
      }
    }
  };

  // Initials avatar
  const initials = (userData.name || 'U').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  // Avatar gradient based on telegramId
  const gradients = [
    'linear-gradient(135deg,#FF6B9D,#FF3366)',
    'linear-gradient(135deg,#A78BFA,#7C3AED)',
    'linear-gradient(135deg,#34D399,#059669)',
    'linear-gradient(135deg,#60A5FA,#2563EB)',
    'linear-gradient(135deg,#FBBF24,#D97706)',
    'linear-gradient(135deg,#F87171,#DC2626)',
  ];
  const avatarGradient = gradients[(parseInt(userData.telegramId || '0') % gradients.length)] || gradients[0];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', paddingBottom: '5rem' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .profile-fade {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        
        .product-link-item {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          text-decoration: none;
          color: inherit;
          flex: 1;
          min-width: 0;
          cursor: pointer;
        }
        .product-link-item:hover .product-title-hover {
          color: var(--color-primary) !important;
        }
        .product-link-item img {
          transition: transform 0.2s, border-color 0.2s;
        }
        .product-link-item:hover img {
          transform: scale(1.03);
          border-color: var(--color-primary) !important;
        }
        
        .profile-layout {
          display: flex;
          gap: 1.75rem;
          max-width: 950px;
          margin: 2.5rem auto 0;
          padding: 0 1.25rem;
        }
        
        .profile-sidebar {
          width: 240px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        
        .profile-main-content {
          flex: 1;
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
          padding: 2rem;
          min-height: 520px;
          position: relative;
        }
        
        .sidebar-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .sidebar-menu {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-sm);
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          padding: 0.85rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        
        .menu-item:hover {
          background: #f4f5f7;
        }
        
        .menu-item.active {
          background: #eaecef; /* Light gray rounded background exactly from screenshot */
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .menu-label-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .purple-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: #7C3AED; /* Vibrant purple */
          box-shadow: 0 0 8px rgba(124, 58, 237, 0.6);
          margin-right: 4px;
          animation: pulse-purple 2.5s infinite;
        }
        
        @keyframes pulse-purple {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(124, 58, 237, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
        }
        
        .logout-sidebar-btn {
          width: 100%;
          padding: 0.9rem 1rem;
          background: none;
          border: 1px solid rgba(229, 62, 62, 0.2);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          color: #e53e3e;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        
        .logout-sidebar-btn:hover {
          background: #fff5f5;
          border-color: #e53e3e;
        }
        
        /* Form controls */
        .custom-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-bg);
          font-size: 0.95rem;
          color: var(--color-text);
          outline: none;
          transition: all 0.2s;
        }
        .custom-input:focus {
          border-color: var(--color-primary);
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 51, 102, 0.1);
        }
        
        /* Star animation */
        .star-btn {
          transition: transform 0.15s ease;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
        }
        .star-btn:hover {
          transform: scale(1.2);
        }
        
        /* Order and review cards */
        .item-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 1rem;
          background: white;
          transition: all 0.2s ease;
        }
        .item-card:hover {
          box-shadow: var(--shadow-md);
          border-color: #ddd;
        }
        
        /* Toast style */
        .toast-notify {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: #1a1a1a;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          animation: fadeIn 0.3s ease forwards;
        }

        @media (max-width: 768px) {
          .profile-layout {
            flex-direction: column;
            gap: 1.5rem;
            margin-top: 1.5rem;
          }
          .profile-sidebar {
            width: 100%;
          }
          .profile-main-content {
            padding: 1.5rem 1.25rem;
          }
        }
      `}</style>

      {/* ── Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a0f 0%, #2d0f1e 50%, #1a0a0f 100%)',
        padding: '2.5rem 1rem 4rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '950px', margin: '0 auto', padding: '0 1.25rem', position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: 'white', fontSize: '1rem', fontWeight: '500', opacity: 0.6, letterSpacing: '2px', textTransform: 'uppercase' }}>
            Shaxsiy Kabinet
          </h1>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="profile-layout">
        
        {/* ── Left Column (Sidebar) ── */}
        <div className="profile-sidebar profile-fade">
          
          {/* User card banner */}
          <div className="sidebar-card">
            <div style={{ position: 'relative' }}>
              {userData.photo && !imgError ? (
                <img 
                  src={userData.photo} 
                  alt={userData.name} 
                  onError={() => setImgError(true)}
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    border: '3px solid white'
                  }} 
                />
              ) : (
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: avatarGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.8rem', fontWeight: '800', color: 'white',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  border: '3px solid white'
                }}>
                  {initials}
                </div>
              )}
              <div style={{
                position: 'absolute', bottom: '1px', right: '1px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#229ED9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white'
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.483c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 14.4l-2.948-.924c-.64-.203-.655-.64.136-.948l11.527-4.444c.533-.194 1.002.131.587.164z"/>
                </svg>
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '2px' }}>
                {userData.name}
              </h2>
              {userData.username && (
                <a
                  href={`https://t.me/${userData.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#229ED9', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                >
                  @{userData.username}
                  <ExternalLink size={11} />
                </a>
              )}
              {userData.phone && (
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', fontWeight: '600', marginTop: '4px' }}>
                  {userData.phone}
                </div>
              )}
            </div>
          </div>

          {/* Menus List matching Screenshot */}
          <div className="sidebar-menu" style={{ width: '100%' }}>
            <button 
              className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => { setActiveTab('orders'); setSelectedProductForReview(null); }}
            >
              <div className="menu-label-group">
                <Package size={18} strokeWidth={activeTab === 'orders' ? 2.5 : 2} style={{ color: '#1a1a1a', opacity: activeTab === 'orders' ? 1 : 0.6 }} />
                <span>Buyurtmalarim</span>
              </div>
            </button>

            <button 
              className={`menu-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => { setActiveTab('reviews'); setSelectedProductForReview(null); }}
            >
              <div className="menu-label-group">
                <MessageSquare size={18} strokeWidth={activeTab === 'reviews' ? 2.5 : 2} style={{ color: '#1a1a1a', opacity: activeTab === 'reviews' ? 1 : 0.6 }} />
                <span>Sharhlar</span>
              </div>
            </button>

            <button 
              className={`menu-item ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => { setActiveTab('info'); setSelectedProductForReview(null); }}
            >
              <div className="menu-label-group">
                <User size={18} strokeWidth={activeTab === 'info' ? 2.5 : 2} style={{ color: '#1a1a1a', opacity: activeTab === 'info' ? 1 : 0.6 }} />
                <span>Ma'lumotlarim</span>
              </div>
            </button>
          </div>

          {/* Logout button */}
          <button onClick={handleLogout} className="logout-sidebar-btn">
            <LogOut size={18} />
            <span>Tizimdan chiqish</span>
          </button>

        </div>

        {/* ── Right Column (Content Area) ── */}
        <div className="profile-main-content profile-fade">
          
          {/* ───────────────── BUYURTMALARIM (ORDERS) TAB ───────────────── */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={20} style={{ color: 'var(--color-primary)' }} />
                  Buyurtmalarim ({cartItems.length})
                </h3>
              </div>

              {cartItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="item-card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <Link to={`/product/${item.id}`} className="product-link-item">
                        <img src={item.image} alt={item.name} style={{
                          width: '70px', height: '70px', objectFit: 'cover',
                          borderRadius: '8px', border: '1px solid var(--color-border)', flexShrink: 0
                        }} />
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="product-title-hover" style={{ fontWeight: '700', fontSize: '0.98rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.name}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            <span>Soni: <strong>{item.quantity} dona</strong></span>
                            <span>•</span>
                            <span>Narxi: <strong>{item.price.toLocaleString()} so'm</strong></span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              backgroundColor: item.status === 'Yetkazildi' ? '#E6F9F0' : item.status === 'Yo\'lda' ? '#EBF6FC' : '#FFF9EC',
                              color: item.status === 'Yetkazildi' ? '#00B048' : item.status === 'Yo\'lda' ? '#229ED9' : '#FFB800'
                            }}>
                              {item.status === 'Yetkazildi' ? (
                                <><Check size={12} strokeWidth={3} /> Yetkazildi</>
                              ) : item.status === 'Yo\'lda' ? (
                                <>Yo'lda</>
                              ) : (
                                <>Kutilmoqda</>
                              )}
                            </span>

                            {item.orderNumber && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                backgroundColor: '#F3F4F6',
                                color: '#374151',
                                border: '1px solid #E5E7EB'
                              }}>
                                #{item.orderNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 }}>
                        <div style={{ fontWeight: '800', color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                          {(item.price * item.quantity).toLocaleString()} so'm
                        </div>
                        {item.date && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                            📅 {item.date}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
                  <ShoppingBag size={48} style={{ opacity: 0.25, marginBottom: '1rem', color: 'var(--color-primary)' }} />
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-text)' }}>Sizda hali xaridlar mavjud emas</div>
                  <p style={{ fontSize: '0.88rem', marginTop: '6px', maxWidth: '300px', margin: '6px auto 0' }}>Lumiere do'konimizdan birinchi buyurtmani rasmiylashtiring!</p>
                  <button
                    onClick={() => navigate('/shop')}
                    style={{
                      marginTop: '1.5rem', padding: '0.75rem 2rem',
                      background: 'var(--color-primary)', color: 'white',
                      border: 'none', borderRadius: '24px',
                      fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255, 51, 102, 0.3)'
                    }}
                  >
                    Xarid qilish
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ───────────────── SHARHLAR (REVIEWS) TAB ───────────────── */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={20} style={{ color: 'var(--color-primary)' }} />
                  Sharhlarim ({reviews.length})
                </h3>
              </div>

              {/* ── Leave Review Form overlay/container ── */}
              {selectedProductForReview ? (
                <div style={{
                  background: 'white', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={selectedProductForReview.image} alt={selectedProductForReview.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mahsulotga sharh qoldirish</div>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-text)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {selectedProductForReview.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedProductForReview(null); setComment(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Bekor qilish
                    </button>
                  </div>

                  <form onSubmit={handleAddReview}>
                    {/* Star Rating Select */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '6px' }}>Mahsulotni baholang:</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = hoverRating ? star <= hoverRating : star <= rating;
                          return (
                            <button
                              key={star}
                              type="button"
                              className="star-btn"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                            >
                              <Star
                                size={32}
                                fill={isFilled ? "#FBBF24" : "none"}
                                stroke={isFilled ? "#FBBF24" : "#cbd5e1"}
                                strokeWidth={1.5}
                              />
                            </button>
                          );
                        })}
                        <span style={{ alignSelf: 'center', fontSize: '0.9rem', fontWeight: '700', color: '#FBBF24', marginLeft: '6px' }}>
                          {rating === 5 ? 'Ajoyib!' : rating === 4 ? 'Yaxshi' : rating === 3 ? 'Qoniqarli' : rating === 2 ? 'Yomon emas' : 'Juda yomon'}
                        </span>
                      </div>
                    </div>

                    {/* Text review comment */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label htmlFor="review-comment" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '6px' }}>Fikringizni yozing:</label>
                      <textarea
                        id="review-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ushbu mahsulot haqida nima deb o'ylaysiz? Uning sifati, qulayligi sizga ma'qul keldimi?"
                        rows={4}
                        required
                        className="custom-input"
                        style={{ fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'var(--color-primary)', color: 'white',
                        border: 'none', borderRadius: '24px',
                        fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(255, 51, 102, 0.25)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 16px rgba(255, 51, 102, 0.35)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 12px rgba(255, 51, 102, 0.25)'; }}
                    >
                      Sharhni yuborish
                    </button>
                  </form>
                </div>
              ) : (
                /* ── Yangi sharh qoldirish list ── */
                <div style={{ marginBottom: '2.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '4px' }}>Yangi sharh qoldirish</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>Siz sotib olgan mahsulotlardan birini tanlab sharh qoldirishingiz mumkin:</p>
                  
                  {(() => {
                    const candidateProducts = cartItems.length > 0 ? cartItems : products.slice(0, 3);
                    const uniqueProducts = [];
                    const seenIds = new Set();
                    candidateProducts.forEach(prod => {
                      const pid = prod.id || prod.productId;
                      if (pid && !seenIds.has(pid)) {
                        seenIds.add(pid);
                        uniqueProducts.push(prod);
                      }
                    });
                    const reviewableProducts = uniqueProducts.filter(
                      prod => !reviews.some(r => Number(r.productId) === Number(prod.id || prod.productId))
                    );

                    return reviewableProducts.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {reviewableProducts.map((prod, idx) => (
                          <div key={idx} className="item-card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                            <Link to={`/product/${prod.id || prod.productId}`} className="product-link-item">
                              <img src={prod.image} alt={prod.name} style={{
                                width: '60px', height: '60px', objectFit: 'cover',
                                borderRadius: '8px', border: '1px solid var(--color-border)', flexShrink: 0
                              }} />
                              
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="product-title-hover" style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {prod.name}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                  {prod.category || 'Kosmetika'}
                                </div>
                              </div>
                            </Link>

                            <button
                              onClick={() => setSelectedProductForReview(prod)}
                              style={{
                                background: 'none', border: '1px solid var(--color-primary)',
                                color: 'var(--color-primary)', padding: '5px 14px',
                                borderRadius: '16px', fontSize: '0.82rem', fontWeight: '700',
                                cursor: 'pointer', transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 51, 102, 0.05)' }}
                              onMouseLeave={(e) => { e.target.style.background = 'none' }}
                            >
                              Sharh yozish
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '12px', background: '#fafbfc' }}>
                        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '600' }}>Barcha xarid qilingan mahsulotlarga sharh qoldirdingiz! 🎉</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ── My Written Reviews List ── */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '1.25rem' }}>Mening yozgan sharhlarim ({reviews.length})</h4>
                
                {reviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map((rev) => (
                      <div key={rev._id || rev.id} className="item-card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                        <Link to={`/product/${rev.productId}`} className="product-link-item" style={{ alignItems: 'flex-start' }}>
                          <img src={rev.productImage} alt={rev.productName} style={{
                            width: '60px', height: '60px', objectFit: 'cover',
                            borderRadius: '8px', border: '1px solid var(--color-border)', flexShrink: 0, marginTop: '2px'
                          }} />
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                              <div className="product-title-hover" style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem' }}>
                                {rev.productName}
                              </div>
                              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                {rev.date}
                              </span>
                            </div>

                            {/* Stars */}
                            <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  fill={i < rev.rating ? "#FBBF24" : "none"}
                                  stroke={i < rev.rating ? "#FBBF24" : "#cbd5e1"}
                                  strokeWidth={1.5}
                                />
                              ))}
                            </div>

                            {/* Review comment text - Clean, un-nested */}
                            <div style={{ marginTop: '10px', fontSize: '0.92rem', lineHeight: '1.5', color: '#2d3748' }}>
                              {rev.comment}
                            </div>
                          </div>
                        </Link>

                        {/* Delete button on the far right */}
                        <button
                          onClick={() => handleDeleteReview(rev._id || rev.id)}
                          style={{
                            background: 'none', border: 'none', color: '#e53e3e',
                            cursor: 'pointer', padding: '4px', borderRadius: '4px', flexShrink: 0
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fff5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          title="Sharhni o'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                    <MessageSquare size={36} style={{ opacity: 0.25, marginBottom: '0.75rem', color: 'var(--color-primary)' }} />
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text)' }}>Siz hali sharhlar yozmagansiz</div>
                    <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Mahsulotlar haqida o'z fikringizni bildiring va boshqa xaridorlarga yordam bering!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────── MA'LUMOTLARIM (MY INFO) TAB ───────────────── */}
          {activeTab === 'info' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={20} style={{ color: 'var(--color-primary)' }} />
                  Shaxsiy Ma'lumotlarim
                </h3>
                
                {!isEditingInfo && (
                  <button
                    onClick={() => {
                      setEditedPhone(formatPhoneUz(userData.phone));
                      setEditedCity(userData.city || 'Toshkent');
                      setEditedAddress(userData.address || '');
                      setIsEditingInfo(true);
                    }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'none', border: '1px solid var(--color-border)',
                      borderRadius: '16px', padding: '5px 12px', fontSize: '0.82rem',
                      fontWeight: '700', color: 'var(--color-text)', cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                  >
                    <Edit2 size={13} />
                    Tahrirlash
                  </button>
                )}
              </div>

              {isEditingInfo ? (
                <form onSubmit={handleSaveInfo} style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
                  <div>
                    <label htmlFor="edit-name" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '6px' }}>Ism va familiya:</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      required
                      className="custom-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-phone" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '6px' }}>Telefon raqam:</label>
                    <input
                      id="edit-phone"
                      type="tel"
                      value={editedPhone}
                      onChange={(e) => setEditedPhone(formatPhoneUz(e.target.value))}
                      placeholder="+998 90 123 45 67"
                      className="custom-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-city" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '6px' }}>Shahar / Viloyat:</label>
                    <select
                      id="edit-city"
                      value={editedCity}
                      onChange={(e) => setEditedCity(e.target.value)}
                      className="custom-input"
                      style={{ 
                        width: '100%', 
                        height: '42px', 
                        padding: '0 12px', 
                        border: '1.5px solid var(--color-border)', 
                        borderRadius: '10px', 
                        backgroundColor: '#fafbfc', 
                        color: 'var(--color-text)', 
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Toshkent">Toshkent</option>
                      <option value="Samarqand">Samarqand</option>
                      <option value="Buxoro">Buxoro</option>
                      <option value="Farg'ona">Farg'ona</option>
                      <option value="Andijon">Andijon</option>
                      <option value="Namangan">Namangan</option>
                      <option value="Qarshi">Qarshi</option>
                      <option value="Nukus">Nukus</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-address" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-text)', marginBottom: '6px' }}>Yetkazib berish manzili:</label>
                    <input
                      id="edit-address"
                      type="text"
                      value={editedAddress}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      placeholder="Tuman, ko'cha, uy / xonadon manzili"
                      className="custom-input"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                    <button
                      type="submit"
                      style={{
                        padding: '0.7rem 1.75rem',
                        background: 'var(--color-primary)', color: 'white',
                        border: 'none', borderRadius: '20px',
                        fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(255, 51, 102, 0.25)'
                      }}
                    >
                      Saqlash
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedName(userData.name);
                        setEditedPhone(userData.phone);
                        setEditedCity(userData.city);
                        setEditedAddress(userData.address);
                        setIsEditingInfo(false);
                      }}
                      style={{
                        padding: '0.7rem 1.75rem',
                        background: '#f1f3f5', color: '#495057',
                        border: 'none', borderRadius: '20px',
                        fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer'
                      }}
                    >
                      Bekor qilish
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '600px' }}>
                  {[
                    { label: "Ism va familiya", value: userData.name },
                    { label: "Telefon raqami", value: userData.phone || "Kiritilmagan", isPhone: true },
                    { label: "Shahar / Viloyat", value: userData.city || "Toshkent" },
                    { label: "Yetkazib berish manzili", value: userData.address || "Kiritilmagan" },
                    userData.username && { label: "Telegram profil", value: `@${userData.username}`, isTelegramLink: true },
                    userData.telegramId && { label: "Telegram ID", value: `#${userData.telegramId}` },
                    { label: "Ro'yxatdan o'tgan sana", value: userData.joinedAt },
                  ].filter(Boolean).map((row, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.95rem 1rem', borderRadius: 'var(--radius-md)',
                      background: i % 2 === 0 ? '#fcfcfd' : 'transparent',
                      borderBottom: '1px solid var(--color-border)'
                    }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                        {row.label}
                      </span>
                      <span style={{
                        fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text)',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        {row.isTelegramLink ? (
                          <a
                            href={`https://t.me/${userData.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#229ED9', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {row.value}
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          row.value
                        )}
                      </span>
                    </div>
                  ))}
                  
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.95rem 1rem', borderBottom: '1px solid var(--color-border)'
                  }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Kirish usuli</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#229ED9', fontSize: '0.9rem' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="#229ED9">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.483c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 14.4l-2.948-.924c-.64-.203-.655-.64.136-.948l11.527-4.444c.533-.194 1.002.131.587.164z"/>
                      </svg>
                      Telegram Bot (avtomatik)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ── Success Toast Alert ── */}
      {showSuccessToast && (
        <div className="toast-notify">
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%', background: '#10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <Check size={12} strokeWidth={3} />
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{toastMessage}</span>
        </div>
      )}

      {/* ─── Premium Custom Confirm Modal for Logout ─── */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          animation: 'fadeInModalBackdrop 0.2s ease forwards'
        }} onClick={() => setShowLogoutConfirm(false)}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '2.25rem',
            width: '90%',
            maxWidth: '380px',
            textAlign: 'center',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e6e8eb',
            transform: 'scale(0.96)',
            animation: 'scaleInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fff0f3',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              fontSize: '1.75rem',
              fontWeight: 'bold'
            }}>
              ?
            </div>
            <h4 style={{
              fontSize: '1.15rem',
              fontWeight: '700',
              marginBottom: '0.75rem',
              color: '#1a1a1a',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              Chiqish
            </h4>
            <p style={{
              fontSize: '0.9rem',
              color: '#757575',
              lineHeight: '1.5',
              marginBottom: '1.75rem'
            }}>
              Tizimdan chiqishni xohlaysizmi?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '8px',
                  background: '#f4f4f5',
                  color: '#1a1a1a',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e4e4e7'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f4f4f5'}
              >
                Bekor qilish
              </button>
              <button 
                type="button" 
                onClick={confirmLogout}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '8px',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  boxShadow: '0 4px 12px rgba(255, 51, 102, 0.2)'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
