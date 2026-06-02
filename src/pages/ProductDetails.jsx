import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { products } from '../data';
import { Star, ChevronRight, Check, Heart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { parseProductId, generateProductUrl } from '../utils/helpers';
import LoginModal from '../components/LoginModal';

const ProductDetails = () => {
  const { id } = useParams(); // 'id' will now contain the whole slug string
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  
  // Group all state hooks at the very top
  const [isAdded, setIsAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [dbReviews, setDbReviews] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('user_logged_in') === 'true');

  const similarCarouselRef = useRef(null);

  const savedProducts = (() => {
    const saved = localStorage.getItem('seller_products');
    return saved ? JSON.parse(saved) : products;
  })();

  const numericId = parseProductId(id);
  const product = savedProducts.find(p => Number(p.id) === Number(numericId));

  // Group all side-effects hooks
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('user_logged_in') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!product) return;

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
        console.error("Error fetching product reviews:", err);
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

    fetchProductReviews();
    fetchOrdersCount();
    setActiveImageIndex(0); // Reset image index on product change
    window.scrollTo(0, 0); // Scroll to top on product change
  }, [product?.id]);

  // Conditional early return block placed AFTER all hooks
  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Mahsulot topilmadi</h2>
        <Link to="/" style={{ color: 'var(--color-primary)', marginTop: '1rem', display: 'inline-block' }}>Bosh sahifaga qaytish</Link>
      </div>
    );
  }

  // Render-time logic and callbacks (guaranteed to have `product` defined here)
  const cartItem = cart.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const scrollSimilar = (direction) => {
    if (similarCarouselRef.current) {
      const scrollAmount = 240 * 3; // Scroll 3 cards at a time
      similarCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const carouselProducts = [];
  if (savedProducts && savedProducts.length > 0) {
    for (let i = 0; i < 15; i++) {
      const originalProduct = savedProducts[i % savedProducts.length];
      carouselProducts.push(originalProduct);
    }
  }

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  };

  // Real-time dynamic rating & review calculations strictly based on DB!
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

    const percents = {};
    [5, 4, 3, 2, 1].forEach(star => {
      percents[star] = total > 0 ? Math.round((counts[star] / total) * 100) : 0;
    });

    return { average, percents };
  };

  const { average: averageRating, percents: starPercents } = getDynamicRatings();

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

  const handleAdd = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };


  
  const galleryImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };
  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="container product-details-page">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">Bosh sahifa</Link>
        <ChevronRight size={14} />
        <Link to="/shop">Katalog</Link>
        <ChevronRight size={14} />
        <span>{product.category}</span>
      </div>

      {/* NEW: Top Header section (Title, Ratings, Badges) */}
      <div className="product-top-header">
        <h1 className="product-title-main">{product.name}</h1>
        <div className="product-stats-row">
          <div className="rating-badge-new">
            {totalReviewsCount > 0 ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.round(averageRating) ? "#FFB800" : "none"}
                    stroke={i < Math.round(averageRating) ? "#FFB800" : "#cbd5e1"}
                    strokeWidth={1.5}
                  />
                ))}
                <span className="rating-score">{averageRating}</span>
                <span className="reviews-text">({totalReviewsCount} sharh)</span>
              </>
            ) : (
              <span className="reviews-text">Hali sharhlar yo'q</span>
            )}
          </div>
          <span className="dot-divider">•</span>
          <span className="orders-count-new">{ordersCount} ta buyurtma</span>
        </div>
      </div>

      <div className="product-details-content uzum-layout">
        {/* Gallery (Left Col) */}
        <div className="product-gallery-vertical">
          {galleryImages.length > 1 && (
            <div className="thumbnail-vertical-list">
              {galleryImages.map((imgUrl, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail-vert ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={imgUrl} alt="thumb" />
                </div>
              ))}
            </div>
          )}
          <div className="main-images-wrapper" style={{position: 'relative', display: 'flex', gap: '15px'}}>
            {galleryImages.length > 1 && (
              <button className="carousel-arrow left-arrow" onClick={handlePrevImage}>
                <ChevronRight size={24} style={{transform: 'rotate(180deg)'}} />
              </button>
            )}

            <div className="main-image-container">
              <img src={galleryImages[activeImageIndex]} alt={product.name} className="main-image" />
            </div>
            
            {/* Show second image if available for the 2-image look */}
            {galleryImages.length > 1 && (
              <div className="main-image-container desktop-only">
                <img src={galleryImages[(activeImageIndex + 1) % galleryImages.length]} alt={product.name} className="main-image" />
              </div>
            )}

            {galleryImages.length > 1 && (
              <button className="carousel-arrow right-arrow" onClick={handleNextImage}>
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Sticky Sidebar (Right Col) */}
        <div className="product-sidebar-uzum">
          <div className="sticky-cart-panel-uzum">
            <div className="price-section-uzum">
              <div className="current-price-huge">{formatPrice(product.price)}</div>
            </div>

            {quantityInCart > 0 ? (
              <div className="cart-quantity-selector-uzum">
                <button 
                  className="qty-btn-uzum" 
                  onClick={() => {
                    if (quantityInCart === 1) {
                      removeFromCart(product.id);
                    } else {
                      updateQuantity(product.id, quantityInCart - 1);
                    }
                  }}
                >
                  -
                </button>
                <span className="qty-value-uzum">{quantityInCart} ta</span>
                <button 
                  className="qty-btn-uzum" 
                  onClick={() => {
                    updateQuantity(product.id, quantityInCart + 1);
                  }}
                >
                  +
                </button>
              </div>
            ) : (
              <button 
                className={`btn-add-to-cart-uzum ${isAdded ? 'added' : ''}`}
                onClick={handleAdd}
              >
                {isAdded ? (
                  <><Check size={20} /> Savatda</>
                ) : (
                  <div className="btn-cart-content">
                    <span className="btn-cart-title" style={{fontSize: '1.1rem'}}>Savatga qo'shish</span>
                  </div>
                )}
              </button>
            )}


          </div>


        </div>
      </div>



      {/* Bottom Layout - Uzum Style */}
      <div className="product-bottom-sections">

        {/* Characteristics */}
        <section className="product-section">
          <h2 className="section-title">Mahsulot xususiyatlari</h2>
          <div className="characteristics-table">
            <div className="char-row">
              <span className="char-label">Ishlab chiqaruvchi mamlakat</span>
              <span className="char-value">{product.manufacturer || "Janubiy Koreya"}</span>
            </div>
            <div className="char-row">
              <span className="char-label">Kafolat muddati</span>
              <span className="char-value">{product.warranty || "12 oy"}</span>
            </div>
            <div className="char-row">
              <span className="char-label">Og'irligi / Hajmi</span>
              <span className="char-value">{product.weightVolume || "50 ml"}</span>
            </div>
            <div className="char-row">
              <span className="char-label">Teri turi</span>
              <span className="char-value">{product.skinType || "Barcha turdagi terilar uchun"}</span>
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews-section" className="product-section">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
            <h2 className="section-title" style={{marginBottom: 0}}>Mijozlar sharhlari <span style={{color: 'var(--color-text-muted)', fontSize: '1.1rem', fontWeight: 500}}>({totalReviewsCount})</span></h2>
          </div>
          
          <div className="reviews-container">
            {totalReviewsCount > 0 ? (
              <div className="reviews-summary-block">
                {/* Left: Big Rating */}
                <div className="summary-rating">
                  <span className="big-rating">{averageRating}</span>
                  <div className="stars-row">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        fill={i < Math.round(averageRating) ? "#FFB800" : "none"}
                        stroke={i < Math.round(averageRating) ? "#FFB800" : "#cbd5e1"}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="total-reviews">{totalReviewsCount} ta baho</span>
                </div>
                
                {/* Right: Progress bars */}
                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const percent = starPercents[star] || 0;
                    return (
                      <div className="rating-bar-row" key={star}>
                        <span className="star-label">{star} <Star size={12} fill="#FFB800" color="#FFB800" /></span>
                        <div className="bar-bg">
                          <div className="bar-fill" style={{width: `${percent}%`}}></div>
                        </div>
                        <span className="percent-label">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: '16px', marginBottom: '2rem' }}>
                Ushbu mahsulotga hali baho berilmagan.
              </div>
            )}

            <div className="reviews-list">
              {/* MongoDB Real Reviews */}
              {dbReviews.length > 0 ? (
                dbReviews.map((rev) => (
                  <div className="review-card" key={rev._id || rev.id} style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className="reviewer-info">
                      {rev.userPhoto ? (
                        <img src={rev.userPhoto} alt={rev.userName} style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          objectFit: 'cover', marginRight: '12px'
                        }} />
                      ) : (
                        <div className="reviewer-avatar" style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '700', fontSize: '0.9rem'
                        }}>
                          {(rev.userName || 'F')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="reviewer-name">{rev.userName || 'Foydalanuvchi'}</div>
                        <div className="review-date">{new Date(rev.createdAt || Date.now()).toLocaleDateString('uz-UZ')}</div>
                      </div>
                    </div>
                    <div className="stars-row small">
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
                    <p className="review-text">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '16px' }}>
                  Ushbu mahsulotga hali sharhlar qoldirilmagan.
                </div>
              )}
            </div>
            
            <Link 
              to={`${generateProductUrl(product.id, product.name)}/reviews`} 
              target="_blank"
              className="btn-view-all-reviews"
              style={{ 
                display: 'block', 
                width: '100%', 
                textDecoration: 'none',
                textAlign: 'center',
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Hamma sharhlarni koʻrish
            </Link>
          </div>
        </section>
      </div>

      {/* Similar Products Carousel */}
      <section className="product-section similar-products">
        <h2 className="section-title">Shuningdek, xarid qilishadi</h2>
        <div className="similar-carousel-wrapper" style={{ position: 'relative' }}>
          <button className="carousel-arrow left-arrow similar-arrow" onClick={() => scrollSimilar('left')}>
            <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
          
          <div className="similar-carousel-track" ref={similarCarouselRef}>
            {carouselProducts.map((p, idx) => (
              <div key={`${p.id}-${idx}`} className="similar-carousel-item">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <button className="carousel-arrow right-arrow similar-arrow" onClick={() => scrollSimilar('right')}>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default ProductDetails;
