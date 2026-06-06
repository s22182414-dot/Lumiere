import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ShoppingCart } from 'lucide-react';
import { cloudDb } from '../services/cloudDb';
import { useCart } from '../context/CartContext';

const DEFAULT_BANNERS = [
  {
    title: "Go'zallik bayrami",
    desc: "Yuqori sifatli va eksklyuziv kosmetika to'plamlari",
    image: "/beauty_banner_one.png",
    bg: "linear-gradient(135deg, #FF3366, #FF8DA1)"
  },
  {
    title: "Koreya kosmetikasi",
    desc: "Yangi brendlar va eksklyuziv mahsulotlar keldi",
    image: "/korean_beauty_two.png",
    bg: "linear-gradient(135deg, #00B533, #66E088)"
  },
  {
    title: "Kuzgi parvarish",
    desc: "Teringiz uchun eng yaxshi namlantiruvchi vositalar",
    image: "/autumn_care_three.png",
    bg: "linear-gradient(135deg, #7000FF, #B366FF)"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [localProducts, setLocalProducts] = useState([]);
  const [banners, setBanners] = useState(DEFAULT_BANNERS);

  // Touch/swipe support
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const isSwiping = useRef(false);

  // Auto-play pause on user interaction
  const userInteractedAt = useRef(null);
  const PAUSE_DURATION = 7000; // foydalanuvchi to'xtatgandan keyin 7s kutadi

  const handleBannerClick = (banner) => {
    // Faqat swipe bo'lmagan holatda navigate qilamiz
    if (!isSwiping.current) {
      navigate(`/banner/${banner._id}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await cloudDb.getProducts();
      setLocalProducts(data);
    };
    loadData();
  }, []);

  const loadBanners = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`);
      if (res.ok) {
        const data = await res.json();
        const activeBanners = data.filter(b => b.active !== false);
        if (activeBanners && activeBanners.length > 0) {
          setBanners(activeBanners);
        } else {
          setBanners(DEFAULT_BANNERS);
        }
      } else {
        setBanners(DEFAULT_BANNERS);
      }
    } catch {
      setBanners(DEFAULT_BANNERS);
    }
  };

  useEffect(() => {
    loadBanners();

    const handleStorageChange = (e) => {
      if (e.key === 'banner_updated_at') {
        loadBanners();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('banner_updated', loadBanners);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('banner_updated', loadBanners);
    };
  }, []);

  const resetInteraction = () => {
    userInteractedAt.current = Date.now();
  };

  const nextSlide = () => {
    resetInteraction();
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    resetInteraction();
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto-play: foydalanuvchi oxirgi marta o'zgartirganidan PAUSE_DURATION o'tsa davom etadi
  useEffect(() => {
    const timer = setInterval(() => {
      const sinceInteraction = Date.now() - (userInteractedAt.current || 0);
      if (sinceInteraction >= PAUSE_DURATION) {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Touch handlers — surish orqali karusel
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
    isSwiping.current = false;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    if (Math.abs(touchStartX.current - touchEndX.current) > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const SWIPE_THRESHOLD = 50;
    if (diff > SWIPE_THRESHOLD) {
      nextSlide(); // Chapga surish → keyingi slayd
    } else if (diff < -SWIPE_THRESHOLD) {
      prevSlide(); // O'ngga surish → oldingi slayd
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => { isSwiping.current = false; }, 300);
  };

  return (
    <div className="page-home">
      <section className="banner-section container">
        <div
          className="carousel-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button className="carousel-arrow left-arrow" onClick={prevSlide} aria-label="Oldingi slayd">
            <ChevronLeft size={24} />
          </button>

          <div
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((banner, index) => (
              <div
                className="banner carousel-slide clickable-banner"
                key={index}
                onClick={() => handleBannerClick(banner)}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="banner-bg-img"
                />
                <div className="banner-overlay" />
                <div className="banner-text-content">
                  <h1>{banner.title}</h1>
                  <p>{banner.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="carousel-arrow right-arrow" onClick={nextSlide} aria-label="Keyingi slayd">
            <ChevronRight size={24} />
          </button>

          <div className="carousel-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => { resetInteraction(); setCurrentSlide(index); }}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="products-section container">
        <h2 className="section-title">Ommabop mahsulotlar</h2>
        <div className="products-grid">
          {localProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
