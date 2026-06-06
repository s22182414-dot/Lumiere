import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, User, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { products } from '../data';
import { generateProductUrl } from '../utils/helpers';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);
  const searchBarRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // Auth / Login Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const logged = localStorage.getItem('user_logged_in') === 'true';
      setIsLoggedIn(logged);
      if (logged) {
        setUserName(localStorage.getItem('user_name') || 'Profil');
        setUserPhoto(localStorage.getItem('user_photo') || '');
        setImgError(false);
      } else {
        setUserName('');
        setUserPhoto('');
      }
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  // Mobil uchun dropdown pozitsiyasini hisoblash
  const calcDropdownStyle = () => {
    if (!searchBarRef.current) return {};
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
      const rect = searchBarRef.current.getBoundingClientRect();
      return {
        position: 'fixed',
        top: rect.bottom + 6,
        left: 8,
        right: 8,
        width: 'auto',
        zIndex: 99999,
      };
    }
    return {};
  };

  // Dropdown ochilganda pozitsiyani hisoblash
  useEffect(() => {
    if (isOpen) {
      setDropdownStyle(calcDropdownStyle());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (isOpen) setDropdownStyle(calcDropdownStyle());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Filter products in real time and sort by popularity (reviews descending)
  const queryStr = searchQuery.toLowerCase().trim();

  const savedProducts = (() => {
    const saved = localStorage.getItem('seller_products');
    return saved ? JSON.parse(saved) : products;
  })();

  const filteredProducts = queryStr
    ? savedProducts
        .filter(p =>
          p.name.toLowerCase().includes(queryStr) ||
          p.category.toLowerCase().includes(queryStr) ||
          (p.description && p.description.toLowerCase().includes(queryStr))
        )
        .sort((a, b) => b.reviews - a.reviews)
    : [];

  const displayProducts = filteredProducts.slice(0, 5);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleItemClick = (product) => {
    setIsOpen(false);
    setSearchQuery('');
    navigate(generateProductUrl(product.id, product.name));
  };

  const handleShowAll = () => {
    setIsOpen(false);
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || filteredProducts.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < displayProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : displayProducts.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < displayProducts.length) {
        e.preventDefault();
        handleItemClick(displayProducts[activeIndex]);
      }
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          Lumiere
        </Link>

        <div className="search-container-relative" ref={searchRef}>
          <form className="search-bar" ref={searchBarRef} onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Mahsulotlar va toifalarni qidirish"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setIsOpen(false);
                }}
              >
                <X size={18} />
              </button>
            )}
            <button type="submit" className="search-btn">
              <Search size={20} />
            </button>
          </form>

          {/* Real-time search dropdown results */}
          {isOpen && searchQuery.trim() && (
            <div
              className="search-dropdown"
              style={Object.keys(dropdownStyle).length > 0 ? dropdownStyle : undefined}
            >
              {displayProducts.length > 0 ? (
                <>
                  <div className="search-dropdown-header">Topilgan mahsulotlar</div>
                  <div className="search-dropdown-list">
                    {displayProducts.map((product, idx) => (
                      <div
                        key={product.id}
                        className={`search-dropdown-item ${idx === activeIndex ? 'active' : ''}`}
                        onClick={() => handleItemClick(product)}
                        onMouseEnter={() => setActiveIndex(idx)}
                      >
                        <div className="search-dropdown-img-wrapper">
                          <img src={product.image} alt={product.name} className="search-dropdown-img" />
                        </div>
                        <div className="search-dropdown-info">
                          <span className="search-dropdown-name">{product.name}</span>
                          <span className="search-dropdown-category">{product.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredProducts.length > 5 && (
                    <div className="search-dropdown-footer" onClick={handleShowAll}>
                      Barcha {filteredProducts.length} ta natijani ko'rish
                    </div>
                  )}
                </>
              ) : (
                <div className="search-dropdown-empty">
                  <Search size={28} className="empty-icon" />
                  <span className="empty-title">Hech narsa topilmadi</span>
                  <span className="empty-desc">Boshqa so'zlar bilan qidirib ko'ring</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/profile')}
              className="action-item"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', outline: 'none' }}
            >
              {userPhoto && !imgError ? (
                <img
                  src={userPhoto}
                  alt={userName}
                  onError={() => setImgError(true)}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#FF6B9D,#FF3366)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: '800', color: 'white'
                }}>
                  {(userName || 'U')[0].toUpperCase()}
                </div>
              )}
              <span style={{ maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                {userName || 'Profil'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="action-item"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', outline: 'none' }}
            >
              <User size={24} strokeWidth={1.5} />
              <span>Kirish</span>
            </button>
          )}
          <Link to="/cart" className="action-item">
            <div id="nav-cart-icon" className="nav-cart-wrapper" style={{ position: 'relative' }}>
              <ShoppingCart size={24} strokeWidth={1.5} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
            <span>Savat</span>
          </Link>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </header>
  );
};

export default Navbar;
