import { Link } from 'react-router-dom';
import { Send, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="container custom-footer-container">
        
        {/* Main Info Section */}
        <div className="footer-main-info">
          <div className="footer-brand-area">
            <h2 className="footer-brand-logo">Lumiere</h2>
            <p className="footer-brand-desc">Tabiiy go'zallik va yuqori sifatli parvarish kosmetikasi.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="Telegram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-area">
            <div className="footer-link-group">
              <h4>Do'kon</h4>
              <Link to="#">Katalog</Link>
            </div>
            <div className="footer-link-group">
              <h4>Mijozlar uchun</h4>
              <Link to="#">Yetkazib berish</Link>
              <Link to="#">To'lov usullari</Link>
              <Link to="#">FAQ</Link>
            </div>
            <div className="footer-link-group">
              <h4>Bog'lanish</h4>
              <a href="mailto:hello@lumiere.uz" className="contact-link"><Mail size={16}/> hello@lumiere.uz</a>
              <a href="tel:+998901234567" className="contact-link">+998 90 123 45 67</a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="footer-bottom-bar">
          <p>&copy; {new Date().getFullYear()} Lumiere Cosmetics. Barcha huquqlar himoyalangan.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy" target="_blank">Maxfiylik siyosati</Link>
            <Link to="/terms" target="_blank">Foydalanish shartlari</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
