import { useCart } from '../context/CartContext';
import { ShoppingBag, Star, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateProductUrl } from '../utils/helpers';

const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartItem = cart?.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const [isAdded, setIsAdded] = useState(false);
  const [dbReviews, setDbReviews] = useState([]);

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
    
    // Add to cart in global context
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    // Dynamic premium fly-to-cart animation
    const cardEl = e.currentTarget.closest('.product-card');
    const imageEl = cardEl ? cardEl.querySelector('.product-image') : null;
    const cartIcon = document.getElementById('nav-cart-icon');

    if (imageEl && cartIcon) {
      const startRect = imageEl.getBoundingClientRect();
      const endRect = cartIcon.getBoundingClientRect();

      // Create flyer clone element
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

      // Start the physics-based curved movement frame
      requestAnimationFrame(() => {
        flyer.style.left = `${endRect.left + endRect.width / 2 - 15}px`;
        flyer.style.top = `${endRect.top + endRect.height / 2 - 15}px`;
        flyer.style.width = '30px';
        flyer.style.height = '30px';
        flyer.style.opacity = '0.2';
        flyer.style.borderRadius = '50%';
        flyer.style.transform = 'scale(0.1) rotate(540deg)';
      });

      // Remove flyer on completion and trigger elastic navbar badge bounce
      setTimeout(() => {
        flyer.remove();
        
        cartIcon.classList.add('bump-cart');
        setTimeout(() => {
          cartIcon.classList.remove('bump-cart');
        }, 500);
      }, 800);
    }
  };

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  };

  return (
    <div className="product-card">
      <Link to={generateProductUrl(product.id, product.name)} className="product-card-link" style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'inherit', textDecoration: 'none' }}>
        <div className="product-image-container">
          <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
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
            <div 
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '700',
                overflow: 'hidden',
                marginTop: 'auto',
                boxShadow: '0 4px 12px rgba(255, 51, 102, 0.15)'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (quantityInCart === 1) {
                    removeFromCart(product.id);
                  } else {
                    updateQuantity(product.id, quantityInCart - 1);
                  }
                }}
                style={{
                  width: '40px',
                  height: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Minus size={16} strokeWidth={2.5} />
              </button>
              
              <span style={{ userSelect: 'none' }}>{quantityInCart}</span>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(product.id, quantityInCart + 1);
                }}
                style={{
                  width: '40px',
                  height: '100%',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button 
              className="add-to-cart-btn-full" 
              onClick={handleAdd}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(255, 51, 102, 0.15)',
                marginTop: 'auto'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
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
