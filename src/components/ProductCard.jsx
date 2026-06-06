import { useCart } from '../context/CartContext';
import { ShoppingBag, Star, Minus, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { generateProductUrl } from '../utils/helpers';

const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartItem = cart?.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const [isAdded, setIsAdded] = useState(false);
  const [dbReviews, setDbReviews] = useState([]);

  // Mini-karusel uchun
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image];

  // Infinite loop uchun klon slaydlar
  const slides = images.length > 1
    ? [images[images.length - 1], ...images, images[0]]
    : images;

  const [trackIndex, setTrackIndex] = useState(1);
  const [animated, setAnimated] = useState(true);
  const isTransitioning = useRef(false);
  const trackRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const userInteractedAt = useRef(null);
  const AUTO_INTERVAL = 2500; // 2.5 soniyada bir almashinadi
  const PAUSE_AFTER_SWIPE = 5000; // swiped dan keyin 5s kutadi

  const realIndex = images.length > 1
    ? (trackIndex === 0
        ? images.length - 1
        : trackIndex === images.length + 1
        ? 0
        : trackIndex - 1)
    : 0;

  // Touch/swipe
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const isSwiping = useRef(false);

  // Animatsiya tugaganda klondan haqiqiyga sakrash
  useEffect(() => {
    if (!animated || images.length <= 1) return;
    const handleTransitionEnd = () => {
      if (trackIndex === 0) {
        setAnimated(false);
        setTrackIndex(images.length);
      } else if (trackIndex === images.length + 1) {
        setAnimated(false);
        setTrackIndex(1);
      }
      isTransitioning.current = false;
    };
    const track = trackRef.current;
    if (track) {
      track.addEventListener('transitionend', handleTransitionEnd);
      return () => track.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [trackIndex, animated, images.length]);

  useEffect(() => {
    if (!animated) {
      const t = setTimeout(() => setAnimated(true), 20);
      return () => clearTimeout(t);
    }
  }, [animated]);

  // Auto-play: hover bo'lganda yoki swipe qilinganda to'xtaydi
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      if (isHovered) return;
      const sinceSwipe = Date.now() - (userInteractedAt.current || 0);
      if (sinceSwipe < PAUSE_AFTER_SWIPE) return;
      if (isTransitioning.current) return;
      isTransitioning.current = true;
      setAnimated(true);
      setTrackIndex(prev => prev + 1);
    }, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  const goNext = () => {
    if (isTransitioning.current || images.length <= 1) return;
    isTransitioning.current = true;
    userInteractedAt.current = Date.now();
    setAnimated(true);
    setTrackIndex(prev => prev + 1);
  };

  const goPrev = () => {
    if (isTransitioning.current || images.length <= 1) return;
    isTransitioning.current = true;
    userInteractedAt.current = Date.now();
    setAnimated(true);
    setTrackIndex(prev => prev - 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    isSwiping.current = false;
    userInteractedAt.current = Date.now();
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchStartX.current - touchEndX.current) > 8) {
      isSwiping.current = true;
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
    userInteractedAt.current = Date.now();
    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => { isSwiping.current = false; }, 200);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      const loadOfflineFallback = () => {
        try {
          const savedReviews = localStorage.getItem('user_reviews');
          if (savedReviews) {
            const parsed = JSON.parse(savedReviews);
            const filtered = parsed.filter(r => Number(r.productId) === Number(product.id));
            setDbReviews(filtered);
          }
        } catch (e) {}
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
        loadOfflineFallback();
      }
    };
    fetchReviews();
  }, [product.id]);

  const totalReviewsCount = dbReviews.length;
  const averageRating = totalReviewsCount > 0
    ? (dbReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : "0.0";

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    const cardEl = e.currentTarget.closest('.product-card');
    const imageEl = cardEl ? cardEl.querySelector('.product-image') : null;
    const cartIcon = document.getElementById('nav-cart-icon');

    if (imageEl && cartIcon) {
      const startRect = imageEl.getBoundingClientRect();
      const endRect = cartIcon.getBoundingClientRect();
      const flyer = document.createElement('img');
      flyer.src = product.image;
      flyer.style.position = 'fixed';
      flyer.style.left = `${startRect.left}px`;
      flyer.style.top = `${startRect.top}px`;
      flyer.style.width = `${startRect.width}px`;
      flyer.style.height = `${startRect.height}px`;
      flyer.style.borderRadius = '12px';
      flyer.style.zIndex = '999999';
      flyer.style.pointerEvents = 'none';
      flyer.style.boxShadow = '0 8px 24px rgba(255, 51, 102, 0.4)';
      flyer.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
      document.body.appendChild(flyer);
      requestAnimationFrame(() => {
        flyer.style.left = `${endRect.left + endRect.width / 2 - 15}px`;
        flyer.style.top = `${endRect.top + endRect.height / 2 - 15}px`;
        flyer.style.width = '30px';
        flyer.style.height = '30px';
        flyer.style.opacity = '0.2';
        flyer.style.borderRadius = '50%';
        flyer.style.transform = 'scale(0.1) rotate(540deg)';
      });
      setTimeout(() => {
        flyer.remove();
        cartIcon.classList.add('bump-cart');
        setTimeout(() => cartIcon.classList.remove('bump-cart'), 500);
      }, 800);
    }
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  };

  return (
    <div className="product-card">
      <Link
        to={generateProductUrl(product.id, product.name)}
        className="product-card-link"
        style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'inherit', textDecoration: 'none' }}
      >
        {/* Mini karusel */}
        <div
          className="product-image-container"
          style={{ position: 'relative', overflow: 'hidden' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={images.length > 1 ? handleTouchStart : undefined}
          onTouchMove={images.length > 1 ? handleTouchMove : undefined}
          onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
        >
          {/* Track */}
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              transform: `translateX(-${trackIndex * 100}%)`,
              transition: animated ? 'transform 0.4s ease-in-out' : 'none',
            }}
          >
            {slides.map((imgSrc, idx) => (
              <img
                key={idx}
                src={imgSrc}
                alt={product.name}
                className="product-image"
                loading="lazy"
                style={{ minWidth: '100%', height: '100%', objectFit: 'cover', flexShrink: 0 }}
              />
            ))}
          </div>

          {/* Nuqtachalar — faqat bir nechta rasm bo'lsa */}
          {images.length > 1 && (
            <div className="card-carousel-dots">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`card-carousel-dot ${realIndex === idx ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>

          <div className="product-rating">
            <Star size={12} className="star-icon" />
            <span>{averageRating} ({totalReviewsCount} baho)</span>
          </div>

          <div className="product-price-row" style={{ marginTop: 'auto', marginBottom: '8px' }}>
            <div className="price-col">
              <span className="current-price">{formatPrice(product.price)}</span>
            </div>
          </div>

          {quantityInCart > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div
                className="product-quantity-selector"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <button
                  className="product-quantity-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (quantityInCart === 1) removeFromCart(product.id);
                    else updateQuantity(product.id, quantityInCart - 1);
                  }}
                >
                  <Minus size={16} strokeWidth={2.5} />
                </button>
                <span style={{ userSelect: 'none' }}>{quantityInCart}</span>
                <button
                  className="product-quantity-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(product.id, quantityInCart + 1);
                  }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>

              <Link
                to="/cart"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', padding: '6px 12px',
                  backgroundColor: 'var(--color-primary)', color: 'white',
                  borderRadius: 'var(--radius-md)', textDecoration: 'none',
                  fontSize: '0.8rem', fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(255, 51, 102, 0.15)',
                  transition: 'all 0.2s', boxSizing: 'border-box'
                }}
              >
                Savatga o'tish
              </Link>
            </div>
          ) : (
            <button className="add-to-cart-btn-full" onClick={handleAdd}>
              <ShoppingBag size={18} strokeWidth={2} />
              <span>Savatga</span>
            </button>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
