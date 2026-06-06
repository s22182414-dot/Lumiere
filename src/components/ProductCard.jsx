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

  // Rasmlar
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image];

  // Joriy ko'rsatiladigan rasm indeksi (0-based, oddiy — klon yo'q)
  const [activeIndex, setActiveIndex] = useState(0);
  const isHovered = useRef(false);
  const autoTimer = useRef(null);
  const AUTO_INTERVAL = 2500;

  // Auto-play: hover bo'lmaganda ishlaydi
  useEffect(() => {
    if (images.length <= 1) return;
    const start = () => {
      autoTimer.current = setInterval(() => {
        if (!isHovered.current) {
          setActiveIndex(prev => (prev + 1) % images.length);
        }
      }, AUTO_INTERVAL);
    };
    start();
    return () => clearInterval(autoTimer.current);
  }, [images.length]);

  // Desktop: sichqon qaysi zonada bo'lsa — o'sha rasm
  const handleMouseMove = (e) => {
    if (images.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const zone = Math.floor((x / rect.width) * images.length);
    const clamped = Math.max(0, Math.min(images.length - 1, zone));
    setActiveIndex(clamped);
  };

  const handleMouseEnter = () => {
    isHovered.current = true;
  };

  const handleMouseLeave = () => {
    isHovered.current = false;
    // Hover tugaganda birinchi rasmga qaytish
    setActiveIndex(0);
  };

  // Mobil: swipe bilan almashtirish
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const isSwiping = useRef(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    isSwiping.current = false;
    isHovered.current = true; // auto-play ni to'xtatish
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchStartX.current - touchEndX.current) > 8) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) {
      isHovered.current = false;
      return;
    }
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setActiveIndex(prev => (prev + 1) % images.length);
      } else {
        setActiveIndex(prev => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => {
      isSwiping.current = false;
      isHovered.current = false;
    }, 1500);
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
        {/* Rasm bloki */}
        <div
          className="product-image-container"
          style={{ position: 'relative', overflow: 'hidden', cursor: 'default' }}
          onMouseMove={images.length > 1 ? handleMouseMove : undefined}
          onMouseEnter={images.length > 1 ? handleMouseEnter : undefined}
          onMouseLeave={images.length > 1 ? handleMouseLeave : undefined}
          onTouchStart={images.length > 1 ? handleTouchStart : undefined}
          onTouchMove={images.length > 1 ? handleTouchMove : undefined}
          onTouchEnd={images.length > 1 ? handleTouchEnd : undefined}
        >
          {/* Rasmlar — CSS opacity bilan almashadi, tez va silliq */}
          {images.map((imgSrc, idx) => (
            <img
              key={idx}
              src={imgSrc}
              alt={product.name}
              className="product-image"
              loading="lazy"
              draggable={false}
              style={{
                position: idx === 0 ? 'relative' : 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: activeIndex === idx ? 1 : 0,
                transition: 'opacity 0.25s ease',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          ))}

          {/* Zona ko'rsatkichlari (nuqtachalar o'rniga chiziqlar) */}
          {images.length > 1 && (
            <div className="card-carousel-dots">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`card-carousel-dot ${activeIndex === idx ? 'active' : ''}`}
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
