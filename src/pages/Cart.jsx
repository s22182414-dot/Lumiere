import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import LoginModal from '../components/LoginModal';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart, toggleSelect, toggleSelectAll } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  };

  const selectedItems = cart.filter(item => item.selected !== false);
  const getSelectedTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  const allSelected = cart.length > 0 && cart.every(item => item.selected !== false);
  
  const handleToggleSelectAll = () => {
    toggleSelectAll(!allSelected);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Iltimos, rasmiylashtirish uchun kamida bitta mahsulotni belgilang!");
      return;
    }
    // Check if user is logged in
    if (localStorage.getItem('user_logged_in') !== 'true') {
      setShowLoginModal(true);
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="page-cart container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <ShoppingBag size={64} style={{ color: 'var(--color-primary)', opacity: 0.3, marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Savatingiz hozircha bo'sh</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
          Lumiere kosmetika va parfyumeriya do'konimizdan eng sara mahsulotlarni savatingizga qo'shing.
        </p>
        <Link to="/" style={{ 
          display: 'inline-block',
          backgroundColor: 'var(--color-primary)', 
          color: 'white', 
          padding: '0.75rem 2.5rem', 
          borderRadius: '24px',
          fontWeight: '700',
          boxShadow: '0 4px 12px rgba(255, 51, 102, 0.3)'
        }}>Xarid qilishni boshlash</Link>
      </div>
    );
  }

  return (
    <div className="page-cart container">
      <style>{`
        .cart-product-link {
          transition: all 0.2s ease;
        }
        .cart-product-link img {
          transition: transform 0.2s, border-color 0.2s;
        }
        .cart-product-link:hover img {
          transform: scale(1.03);
          border-color: var(--color-primary) !important;
        }
        .cart-product-link:hover .cart-item-title {
          color: var(--color-primary) !important;
        }
      `}</style>

      <h1 className="cart-title">
        Savatingizda <span style={{ color: 'var(--color-primary)' }}>{cart.length} ta mahsulot</span>
      </h1>
      
      <div className="cart-grid">
        
        {/* Left Side (Cart Items List) */}
        <div className="cart-items-list">
          
          {/* Select All Bar */}
          <div className="cart-select-all-bar">
            <div 
              onClick={handleToggleSelectAll}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '5px',
                border: allSelected ? '2px solid var(--color-primary)' : '2px solid #cbd5e1',
                backgroundColor: allSelected ? 'var(--color-primary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              {allSelected && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span 
              onClick={handleToggleSelectAll}
              style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-text)', cursor: 'pointer', userSelect: 'none' }}
            >
              Barchasini belgilash
            </span>
          </div>

          {cart.map(item => (
            <div key={item.id} className="cart-item-row" style={{
              opacity: item.selected !== false ? 1 : 0.8
            }}>
              {/* Left/Main Column: Checkbox + Link */}
              <div className="cart-item-main-group">
                {/* Checkbox */}
                <div 
                  onClick={() => toggleSelect(item.id)}
                  className="cart-item-checkbox"
                  style={{
                    border: item.selected !== false ? '2px solid var(--color-primary)' : '2px solid #cbd5e1',
                    backgroundColor: item.selected !== false ? 'var(--color-primary)' : 'transparent'
                  }}
                >
                  {item.selected !== false && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>

                {/* Product link (Image + Title/Category) */}
                <Link to={`/product/${item.id}`} className="cart-product-link">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  
                  <div className="cart-item-info">
                    <h3 className="cart-item-title">{item.name}</h3>
                    <p className="cart-item-category">Kategoriya: {item.category || 'Kosmetika'}</p>
                  </div>
                </Link>
              </div>
              
              {/* Right/Bottom Actions Column: Quantity + Price/Delete */}
              <div className="cart-item-action-group">
                {/* Quantity selector */}
                <div className="cart-item-quantity">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="cart-quantity-btn">-</button>
                  <span className="cart-quantity-val">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="cart-quantity-btn">+</button>
                </div>

                {/* Price and Delete */}
                <div className="cart-item-actions">
                  <div className="cart-item-price">{formatPrice(item.price * item.quantity)}</div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="cart-item-delete"
                  >
                    <Trash2 size={15} /> O'chirish
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
 
        {/* Right Side (Order Checkout Panel) */}
        <div>
          <div className="cart-checkout-panel">
            <h2 className="cart-panel-title">Buyurtmangiz</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <span>Mahsulotlar ({selectedItems.length} xil):</span>
              <span style={{ fontWeight: '600' }}>{formatPrice(getSelectedTotal())}</span>
            </div>
            

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginBottom: '1.75rem', fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>
              <span>Jami:</span>
              <span>{formatPrice(getSelectedTotal())}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
              style={{
                width: '100%',
                backgroundColor: selectedItems.length === 0 ? '#cbd5e1' : 'var(--color-primary)',
                color: selectedItems.length === 0 ? '#94a3b8' : 'white',
                padding: '1rem',
                borderRadius: '24px',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
                border: 'none',
                boxShadow: selectedItems.length === 0 ? 'none' : '0 4px 14px rgba(255, 51, 102, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { if (selectedItems.length > 0) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none' }}
            >
              {selectedItems.length === 0 ? "Mahsulot tanlanmagan" : "Rasmiylashtirish"}
            </button>
          </div>
        </div>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Cart;
