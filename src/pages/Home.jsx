import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useState, useEffect, useRef } from 'react';
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
  const [localProducts, setLocalProducts] = useState([]);
  const [banners, setBanners] = useState(DEFAULT_BANNERS);

  // Infinite carousel state
  // Haqiqiy index: 0..banners.length-1
  // Track index: 1..banners.length (chunki [klon_oxirgi, ...banners, klon_birinchi])
  const [trackIndex, setTrackIndex] = useState(1);
  const [animated, setAnimated] = useState(true);
  const isTransitioning = useRef(false);
  const trackRef = useRef(null);

  // Haqiqiy slayd indeksi (nuqtalar uchun)
  const realIndex = trackIndex === 0
    ? banners.length - 1
    : trackIndex === banners.length + 1
    ? 0
    : trackIndex - 1;

  // Klon slaydlar: [oxirgi, ...barchasi, birinchi]
  const slides = banners.length > 0
    ? [banners[banners.length - 1], ...banners, banners[0]]
    : [];

  // Touch/swipe & Mouse drag
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const isSwiping = useRef(false);
  const isDragging = useRef(false);

  // Auto-play pause
  const userInteractedAt = useRef(null);
  const PAUSE_DURATION = 7000;

  // Animatsiya tugagandan keyin klon slayddan haqiqiy slaydga sakrash
  useEffect(() => {
    if (!animated) return;

    const handleTransitionEnd = () => {
      if (trackIndex === 0) {
        // Oxirgi klon → haqiqiy oxirgi slayd
        setAnimated(false);
        setTrackIndex(banners.length);
      } else if (trackIndex === banners.length + 1) {
        // Birinchi klon → haqiqiy birinchi slayd
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
  }, [trackIndex, animated, banners.length]);

  // animated false bo'lganda, bir tick o'tib qayta yoqamiz
  useEffect(() => {
    if (!animated) {
      const t = setTimeout(() => setAnimated(true), 20);
      return () => clearTimeout(t);
    }
  }, [animated]);

  const resetInteraction = () => {
    userInteractedAt.current = Date.now();
  };

  const goNext = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    resetInteraction();
    setAnimated(true);
    setTrackIndex(prev => prev + 1);
  };

  const goPrev = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    resetInteraction();
    setAnimated(true);
    setTrackIndex(prev => prev - 1);
  };

  const goTo = (realIdx) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    resetInteraction();
    setAnimated(true);
    setTrackIndex(realIdx + 1);
  };

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      const sinceInteraction = Date.now() - (userInteractedAt.current || 0);
      if (sinceInteraction >= PAUSE_DURATION) {
        goNext();
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleBannerClick = (banner) => {
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
      if (e.key === 'banner_updated_at') loadBanners();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('banner_updated', loadBanners);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('banner_updated', loadBanners);
    };
  }, []);

  // Touch handlers
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
      goNext();
    } else if (diff < -SWIPE_THRESHOLD) {
      goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
    setTimeout(() => { isSwiping.current = false; }, 300);
  };

  // Mouse drag handlers (desktop) — document darajasida ishlaydi
  const handleMouseDown = (e) => {
    // Strelka tugmasiga bosilganda drag boshlanmasin
    if (e.target.closest('.carousel-arrow')) return;
    e.preventDefault();
    touchStartX.current = e.clientX;
    touchEndX.current = null;
    isSwiping.current = false;
    isDragging.current = true;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      touchEndX.current = e.clientX;
      if (Math.abs(touchStartX.current - touchEndX.current) > 8) {
        isSwiping.current = true;
      }
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      if (touchStartX.current === null || touchEndX.current === null) {
        touchStartX.current = null;
        return;
      }
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 50) goNext();
      else if (diff < -50) goPrev();
      touchStartX.current = null;
      touchEndX.current = null;
      setTimeout(() => { isSwiping.current = false; }, 300);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [banners.length]);

  return (
    <div className="page-home">
      <section className="banner-section container">
        <div
          className="carousel-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{ cursor: 'grab', userSelect: 'none' }}
        >
          {/* Track: klon + haqiqiy + klon */}
          <div
            ref={trackRef}
            className="carousel-track"
            style={{
              transform: `translateX(-${trackIndex * 100}%)`,
              transition: animated ? 'transform 0.5s ease-in-out' : 'none',
            }}
          >
            {slides.map((banner, index) => (
              <div
                className="banner carousel-slide clickable-banner"
                key={index}
                onClick={() => handleBannerClick(banner)}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="banner-bg-img"
                  draggable={false}
                />
                <div className="banner-overlay" />
                <div className="banner-text-content">
                  <h1>{banner.title}</h1>
                  <p>{banner.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="carousel-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${realIndex === index ? 'active' : ''}`}
                onClick={() => goTo(index)}
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
