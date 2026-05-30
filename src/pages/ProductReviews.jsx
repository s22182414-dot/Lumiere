import { useParams, Link } from 'react-router-dom';
import { products } from '../data';
import { Star, ChevronLeft, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import { parseProductId, generateProductUrl } from '../utils/helpers';
import LoginModal from '../components/LoginModal';

const ProductReviews = () => {
  const { id } = useParams();
  const [dbReviews, setDbReviews] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('user_logged_in') === 'true');

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('user_logged_in') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    const tgId = localStorage.getItem('user_telegram_id') || 'offline';
    const name = localStorage.getItem('user_name') || 'Foydalanuvchi';
    const photo = localStorage.getItem('user_photo') || '';

    const reviewData = {
      telegramId: tgId,
      userName: name,
      userPhoto: photo,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      rating: newRating,
      comment: newComment
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (res.ok) {
        const savedReview = await res.json();
        setDbReviews(prev => [savedReview, ...prev]);
        setNewComment('');
        setNewRating(5);
        try {
          const saved = localStorage.getItem('user_reviews');
          const parsed = saved ? JSON.parse(saved) : [];
          localStorage.setItem('user_reviews', JSON.stringify([savedReview, ...parsed]));
        } catch (e) { }
      } else {
        alert("Sharh yuborishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error(err);
      const offlineReview = {
        _id: 'rev-' + Date.now(),
        telegramId: tgId,
        userName: name,
        userPhoto: photo,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        rating: newRating,
        comment: newComment,
        createdAt: new Date().toISOString()
      };
      setDbReviews(prev => [offlineReview, ...prev]);
      setNewComment('');
      setNewRating(5);
      try {
        const saved = localStorage.getItem('user_reviews');
        const parsed = saved ? JSON.parse(saved) : [];
        localStorage.setItem('user_reviews', JSON.stringify([offlineReview, ...parsed]));
      } catch (e) { }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const savedProducts = (() => {
    const saved = localStorage.getItem('seller_products');
    return saved ? JSON.parse(saved) : products;
  })();

  const numericId = parseProductId(id);
  let product = savedProducts.find(p => p.id === numericId);
  if (!product) {
    const baseId = ((numericId - 1) % savedProducts.length) + 1;
    product = savedProducts.find(p => p.id === baseId);
  }

  useEffect(() => {
    const fetchProductReviews = async () => {
      const loadOfflineFallback = () => {
        try {
          const savedReviews = localStorage.getItem('user_reviews');
          if (savedReviews) {
            const parsed = JSON.parse(savedReviews);
            const filtered = parsed.filter(r => Number(r.productId) === Number(product.id));
            setDbReviews(filtered);
          }
        } catch (e) {
          console.error("Offline local storage fallback error:", e);
        }
      };

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews?productId=${product.id}`);
        if (res.ok) {
          const data = await res.json();
          setDbReviews(data);
        } else {
          loadOfflineFallback();
        }
      } catch (err) {
        console.error("Error fetching reviews in reviews page:", err);
        loadOfflineFallback();
      }
    };

    const fetchOrdersCount = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/count?productId=${product.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrdersCount(data.count || 0);
        }
      } catch (err) {
        console.error("Error fetching orders count:", err);
      }
    };

    if (product) {
      fetchProductReviews();
      fetchOrdersCount();
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Mahsulot topilmadi</h2>
        <Link to="/" style={{ color: 'var(--color-primary)', marginTop: '1rem', display: 'inline-block' }}>Bosh sahifaga qaytish</Link>
      </div>
    );
  }

  // Real-time dynamic ratings strictly based on DB reviews
  const totalReviewsCount = dbReviews.length;

  const getDynamicRatings = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    dbReviews.forEach(rev => {
      const r = Math.round(rev.rating);
      if (counts[r] !== undefined) {
        counts[r] += 1;
      }
    });

    let sum = 0;
    let total = 0;
    [1, 2, 3, 4, 5].forEach(star => {
      sum += star * counts[star];
      total += counts[star];
    });

    const average = total > 0 ? (sum / total).toFixed(1) : "0.0";
    return average;
  };

  const averageRating = getDynamicRatings();

  // Pricing helper
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  };

  const discountPercent = 35; // Themed discount matching Uzum look
  const originalPrice = Math.round(product.price * (100 / (100 - discountPercent)));

  const handleReturn = (e) => {
    try {
      window.close();
    } catch (e) {
      // Fallback is handled by standard Link path
    }
  };



  return (
    <div className="reviews-page-wrapper" style={{ backgroundColor: '#fcfcfc', minHeight: '100vh', paddingBottom: '5rem' }}>
      <style>{`
        .reviews-page-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1f1f1f;
        }
        
        .reviews-header-container {
          background: #ffffff;
          border-bottom: 1px solid #eef0f2;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 1.25rem 0;
        }

        .reviews-header-layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          gap: 20px;
        }

        .header-left-block {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }

        .product-thumbnail-square {
          width: 72px;
          height: 72px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid #eef0f2;
          flex-shrink: 0;
        }

        .product-info-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .product-info-details h1 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1f1f1f;
          margin: 0;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .reviews-stats-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.88rem;
          color: #8b96a5;
        }

        .stats-stars {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .reviews-underline-count {
          color: #1f1f1f;
          text-decoration: underline;
          font-weight: 600;
          cursor: pointer;
        }

        .stats-divider {
          color: #cbd5e1;
        }

        .header-price-block {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }

        .reviews-current-price {
          font-size: 1.35rem;
          font-weight: 850;
          color: #FF3366; /* Themed Brand Pink */
        }

        .reviews-original-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
        }

        .original-price-strikethrough {
          color: #8b96a5;
          text-decoration: line-through;
        }

        .reviews-discount-badge {
          background-color: rgba(255, 51, 102, 0.08); /* Brand Pink tint */
          color: #FF3366;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 750;
          font-size: 0.78rem;
        }

        .header-action-block {
          flex-shrink: 0;
        }

        .btn-return-product {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FF3366; /* Brand Pink Outline */
          color: #FF3366;
          background: transparent;
          padding: 10px 24px;
          border-radius: 24px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-return-product:hover {
          background-color: rgba(255, 51, 102, 0.04);
          transform: translateY(-1px);
        }

        /* Review Photos Carousel */
        .photo-gallery-section {
          max-width: 1200px;
          margin: 24px auto 0;
          padding: 0 20px;
        }

        .gallery-scroll-container {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px 0 16px;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .gallery-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .gallery-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .gallery-item-image {
          width: 110px;
          height: 110px;
          border-radius: 14px;
          object-fit: cover;
          cursor: pointer;
          border: 1px solid #eef0f2;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .gallery-item-image:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.06);
          border-color: #FF3366;
        }

        /* Reviews List Container */
        .reviews-feed-section {
          max-width: 800px;
          margin: 32px auto 0;
          padding: 0 20px;
        }

        .feed-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #1f1f1f;
          margin-bottom: 24px;
          border-bottom: 2px solid #eef0f2;
          padding-bottom: 12px;
        }

        /* Photo Viewer Modal */
        .lightbox-modal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .lightbox-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: 80vh;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .btn-close-lightbox {
          position: absolute;
          top: -45px;
          right: 0;
          background: white;
          border: none;
          color: black;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-weight: bold;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .reviews-header-layout {
            flex-direction: column;
            align-items: stretch;
            padding: 12px;
            gap: 16px;
          }
          .header-price-block {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .btn-return-product {
            width: 100%;
          }
          .gallery-item-image {
            width: 85px;
            height: 85px;
          }
        }
      `}</style>

      {/* ── Header Row (Matching Uzum Screenshot) ── */}
      <header className="reviews-header-container">
        <div className="reviews-header-layout">
          
          {/* Left Block (Product summary) */}
          <div className="header-left-block">
            <img src={product.image} alt={product.name} className="product-thumbnail-square" />
            <div className="product-info-details">
              <h1>{product.name} sharhlari</h1>
              
              <div className="reviews-stats-row">
                {totalReviewsCount > 0 ? (
                  <>
                    <div className="stats-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < Math.round(averageRating) ? "#FFB800" : "none"}
                          stroke={i < Math.round(averageRating) ? "#FFB800" : "#cbd5e1"}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span style={{ color: '#FFB800', fontWeight: '700' }}>{averageRating}</span>
                    <span className="reviews-underline-count">({totalReviewsCount} sharh)</span>
                  </>
                ) : (
                  <span>Hali sharhlar yo'q</span>
                )}
                <span className="stats-divider">•</span>
                <span>{ordersCount} ta buyurtma</span>
              </div>
            </div>
          </div>

          {/* Price Block */}
          <div className="header-price-block">
            <div className="reviews-current-price">{formatPrice(product.price)}</div>
            <div className="reviews-original-price-row">
              <span className="original-price-strikethrough">{formatPrice(originalPrice)}</span>
              <span className="reviews-discount-badge">-{discountPercent}%</span>
            </div>
          </div>

          {/* Action Return Button */}
          <div className="header-action-block">
            <Link 
              to={generateProductUrl(product.id, product.name)} 
              onClick={handleReturn}
              className="btn-return-product"
            >
              Tovarga qaytish
            </Link>
          </div>

        </div>
      </header>

      {/* ── Main Dynamic Reviews Feed ── */}
      <section className="reviews-feed-section">
        <h2 className="feed-title">Xaridorlar sharhlari ({totalReviewsCount})</h2>

        <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Dynamic DB Reviews */}
          {dbReviews.map((rev) => (
            <div className="review-card" key={rev._id || rev.id} style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid #eef0f2',
              boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
            }}>
              <div className="reviewer-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {rev.userPhoto ? (
                  <img src={rev.userPhoto} alt={rev.userName} style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    objectFit: 'cover'
                  }} />
                ) : (
                  <div className="reviewer-avatar" style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B9D, #FF3366)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '1rem'
                  }}>
                    {(rev.userName || 'F')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="reviewer-name" style={{ fontWeight: '600', color: '#1f1f1f' }}>{rev.userName || 'Foydalanuvchi'}</div>
                  <div className="review-date" style={{ fontSize: '0.8rem', color: '#8b96a5' }}>
                    {new Date(rev.createdAt || Date.now()).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
              </div>

              <div className="stars-row small" style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < rev.rating ? "#FFB800" : "none"}
                    stroke={i < rev.rating ? "#FFB800" : "#cbd5e1"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              <p className="review-text" style={{ fontSize: '0.98rem', lineHeight: '1.6', color: '#333', margin: 0 }}>
                {rev.comment}
              </p>
            </div>
          ))}

          {dbReviews.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              border: '2px dashed #eef0f2',
              borderRadius: '16px',
              color: '#8b96a5',
              background: '#fff'
            }}>
              <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '500' }}>
                Ushbu mahsulotga hali sharhlar qoldirilmagan.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* Lightbox / Modal for full screen review images */}
      {activePhoto && (
        <div className="lightbox-modal" onClick={() => setActivePhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close-lightbox" onClick={() => setActivePhoto(null)}>×</button>
            <img src={activePhoto} alt="Review Fullscreen" className="lightbox-image" />
          </div>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default ProductReviews;
