import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { cloudDb } from '../services/cloudDb';

const DEFAULT_BANNERS = [
  {
    _id: "default-0",
    title: "Go'zallik bayrami",
    desc: "Yuqori sifatli va eksklyuziv kosmetika to'plamlari",
    image: "/beauty_banner_one.png",
    bg: "linear-gradient(135deg, #FF3366, #FF8DA1)",
    linkedProductIds: []
  },
  {
    _id: "default-1",
    title: "Koreya kosmetikasi",
    desc: "Yangi brendlar va eksklyuziv mahsulotlar keldi",
    image: "/korean_beauty_two.png",
    bg: "linear-gradient(135deg, #00B533, #66E088)",
    linkedProductIds: []
  },
  {
    _id: "default-2",
    title: "Kuzgi parvarish",
    desc: "Teringiz uchun eng yaxshi namlantiruvchi vositalar",
    image: "/autumn_care_three.png",
    bg: "linear-gradient(135deg, #7000FF, #B366FF)",
    linkedProductIds: []
  }
];

const BannerDetails = () => {
  const { id } = useParams();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkedProducts, setLinkedProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load products
        const products = await cloudDb.getProducts();

        // Load banners from API
        let matchedBanner = null;
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/banners`);
          if (res.ok) {
            const data = await res.json();
            matchedBanner = data.find(b => String(b._id) === String(id));
          }
        } catch (e) {
          console.error("API error, checking default fallback", e);
        }

        // If not found in API, check default fallback
        if (!matchedBanner) {
          matchedBanner = DEFAULT_BANNERS.find(b => String(b._id) === String(id));
        }

        if (matchedBanner) {
          setBanner(matchedBanner);
          const linkedIds = matchedBanner.linkedProductIds || [];
          const matchedProducts = products.filter(p => 
            linkedIds.map(String).includes(String(p.id))
          );
          setLinkedProducts(matchedProducts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(255, 51, 102, 0.1)', 
            borderTopColor: 'var(--color-primary)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ fontWeight: '700', marginBottom: '1rem' }}>Banner topilmadi</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Qidirilayotgan kolleksiya yoki slayd topilmadi.</p>
        <Link to="/" className="btn-primary" style={{ padding: '0.75rem 2rem', textDecoration: 'none', display: 'inline-block' }}>
          Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="page-banner-details container" style={{ padding: '2rem 1rem' }}>
      {/* Back Button */}
      <Link 
        to="/" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: 'var(--color-text-muted)', 
          textDecoration: 'none', 
          fontSize: '0.9rem', 
          fontWeight: '600', 
          marginBottom: '1.5rem',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
      >
        <ChevronLeft size={16} /> Bosh sahifaga
      </Link>

      {/* Banner Title Header (Clean and Minimalist) */}
      <div style={{ 
        marginBottom: '2.5rem', 
        borderBottom: '1px solid var(--color-border)', 
        paddingBottom: '1.5rem',
        marginTop: '0.5rem'
      }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--color-text)', margin: '0 0 0.5rem 0' }}>
          {banner.title}
        </h1>
        {banner.desc && (
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', margin: 0, fontWeight: '500', lineHeight: '1.5' }}>
            {banner.desc}
          </p>
        )}
      </div>

      {/* Products Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--color-text)' }}>
          Mahsulotlar
        </h2>

        {linkedProducts.length > 0 ? (
          <div className="products-grid">
            {linkedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ 
            background: 'var(--color-surface)', 
            borderRadius: '16px', 
            padding: '4rem 2rem', 
            textAlign: 'center',
            border: '1px dashed var(--color-border)'
          }}>
            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>
              Ushbu kolleksiyaga hozircha mahsulotlar biriktirilmagan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerDetails;
