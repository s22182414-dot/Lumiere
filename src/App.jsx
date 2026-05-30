import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import ProductReviews from './pages/ProductReviews';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Seller from './pages/Seller';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import BannerDetails from './pages/BannerDetails';
import Delivery from './pages/Delivery';
import Payments from './pages/Payments';
import Faq from './pages/Faq';
import './index.css';

// Global beautiful custom alert override
if (typeof window !== 'undefined') {
  window.alert = (message) => {
    // Remove any existing custom alert first
    const existing = document.getElementById('custom-global-alert');
    if (existing) existing.remove();

    // Create backdrop container
    const backdrop = document.createElement('div');
    backdrop.id = 'custom-global-alert';
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100vw';
    backdrop.style.height = '100vh';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    backdrop.style.backdropFilter = 'blur(6px)';
    backdrop.style.display = 'flex';
    backdrop.style.alignItems = 'center';
    backdrop.style.justifyContent = 'center';
    backdrop.style.zIndex = '9999999';
    backdrop.style.opacity = '0';
    backdrop.style.transition = 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)';

    // Determine custom icon and theme color based on message content
    let iconHtml = '🔔';
    let brandColor = '#FF3366'; // Lumiere brand-pink
    if (message.toLowerCase().includes('qabul qilindi') || message.toLowerCase().includes('muvaffaqiyatli') || message.toLowerCase().includes('kirildi')) {
      iconHtml = '🎉';
      brandColor = '#00B048'; // Success green
    } else if (message.toLowerCase().includes('xato') || message.toLowerCase().includes('bo\'lmadi') || message.toLowerCase().includes('shart') || message.toLowerCase().includes('kamida') || message.toLowerCase().includes('tanlang')) {
      iconHtml = '⚠️';
      brandColor = '#FFB800'; // Warning yellow
    }

    // Create modal card
    const card = document.createElement('div');
    card.style.backgroundColor = '#ffffff';
    card.style.borderRadius = '20px';
    card.style.padding = '2rem';
    card.style.width = '90%';
    card.style.maxWidth = '380px';
    card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
    card.style.textAlign = 'center';
    card.style.transform = 'scale(0.8) translateY(20px)';
    card.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    card.style.border = '1px solid #eef0f2';

    // Set inside content
    card.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.05));">${iconHtml}</div>
      <p style="font-size: 1rem; font-weight: 600; line-height: 1.6; color: #1f1f1f; margin: 0 0 1.5rem 0; font-family: system-ui, -apple-system, sans-serif;">
        ${message}
      </p>
      <button id="custom-alert-close-btn" style="
        background-color: ${brandColor};
        color: #ffffff;
        border: none;
        padding: 10px 32px;
        font-size: 0.95rem;
        font-weight: 700;
        border-radius: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px ${brandColor}3a;
        transition: all 0.2s ease;
        outline: none;
        width: 100%;
        max-width: 160px;
      ">OK</button>
    `;

    backdrop.appendChild(card);
    document.body.appendChild(backdrop);

    // Fade in
    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      card.style.transform = 'scale(1) translateY(0)';
    });

    // Close function
    const closeAlert = () => {
      backdrop.style.opacity = '0';
      card.style.transform = 'scale(0.8) translateY(20px)';
      setTimeout(() => {
        backdrop.remove();
      }, 250);
    };

    // Bind event listeners
    const closeBtn = card.querySelector('#custom-alert-close-btn');
    closeBtn.addEventListener('click', closeAlert);
    
    // Also close on hitting Enter or Escape keys
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        closeAlert();
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Add button hover effect
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.transform = 'translateY(-1px)';
      closeBtn.style.boxShadow = `0 6px 16px ${brandColor}55`;
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.transform = 'none';
      closeBtn.style.boxShadow = `0 4px 12px ${brandColor}3a`;
    });
  };
}

// Main Application Layout
function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/product/:id/reviews" element={<ProductReviews />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/seller" element={<Seller />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/banner/:id" element={<BannerDetails />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/faq" element={<Faq />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
