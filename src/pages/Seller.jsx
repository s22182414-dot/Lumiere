import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Star, 
  Users, 
  ArrowLeft,
  Search,
  Check,
  Clock,
  Truck,
  Trash2,
  Edit3,
  Key,
  X,
  Image,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { products as initialProducts } from '../data';
import { cloudDb } from '../services/cloudDb';

// ─── Live Carousel Preview Component ─────────────────────────────────────────
const BannerPreview = ({ banners, allProducts }) => {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setSlide(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;
  const current = banners[slide];

  // Get linked products for current slide
  const linkedIds = current.linkedProductIds || [];
  const linkedProducts = (allProducts || []).filter(p =>
    linkedIds.map(id => String(id)).includes(String(p.id))
  );

  const formatPrice = (price) =>
    price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🔍 Bosh sahifadagi ko'rinish (preview)
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          {slide + 1} / {banners.length}
        </span>
      </div>

      <div style={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '2px solid var(--color-border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
        position: 'relative',
        height: linkedProducts.length > 0 ? '280px' : '220px',
        background: current.bg || '#eee',
        display: 'grid',
        gridTemplateColumns: '60% 40%',
        transition: 'height 0.35s ease'
      }}>
        {/* Left: Text content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2rem',
          background: current.bg || 'linear-gradient(135deg, #FF3366, #FF8DA1)',
          zIndex: 1
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.3rem',
            fontWeight: '800',
            margin: '0 0 0.5rem 0',
            lineHeight: '1.2',
            textShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>{current.title}</h3>
          <p style={{
            color: 'rgba(255,255,255,0.88)',
            fontSize: '0.82rem',
            margin: 0,
            lineHeight: '1.5'
          }}>{current.desc || ''}</p>
          <div style={{
            marginTop: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: '700',
            width: 'fit-content',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            Ko'rish →
          </div>
        </div>

        {/* Right: Image */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {current.image ? (
            <img
              src={current.image}
              alt={current.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem'
            }}>Rasm yo'q</div>
          )}
        </div>

        {/* ── Linked Products Overlay ── */}
        {linkedProducts.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            padding: '10px 14px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}>
            {linkedProducts.map(prod => (
              <div key={prod.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.13)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '12px',
                padding: '7px 12px 7px 7px',
                minWidth: '140px',
                flexShrink: 0,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)'
              }}>
                <img
                  src={prod.image}
                  alt={prod.name}
                  style={{
                    width: '38px', height: '38px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    flexShrink: 0
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '90px',
                    textShadow: '0 1px 4px rgba(0,0,0,0.4)'
                  }}>{prod.name}</div>
                  <div style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    marginTop: '2px'
                  }}>{formatPrice(prod.price)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prev / Next arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setSlide(p => (p - 1 + banners.length) % banners.length)}
              style={{
                position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.35)', border: 'none', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)'
              }}
            ><ChevronLeft size={16} /></button>
            <button
              onClick={() => setSlide(p => (p + 1) % banners.length)}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                zIndex: 10, width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.35)', border: 'none', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)'
              }}
            ><ChevronRight size={16} /></button>
          </>
        )}

        {/* Dot indicators */}
        {banners.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: linkedProducts.length > 0 ? '72px' : '12px',
            left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '6px', zIndex: 10,
            transition: 'bottom 0.35s ease'
          }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{
                  width: i === slide ? '20px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: i === slide ? 'white' : 'rgba(255,255,255,0.45)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const Seller = () => {

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('seller_active_tab');
    return saved ? saved : 'dashboard';
  });
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dbOrders, setDbOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Banner (Carousel) State
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isBannerSaving, setIsBannerSaving] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: '', desc: '', image: '', bg: 'linear-gradient(135deg, #FF3366, #FF8DA1)', linkedProductIds: []
  });
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');

  // Password Protection
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return sessionStorage.getItem('seller_authorized') === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [pwError, setPwError] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isVerifying) return;
    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'seller', password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthorized(true);
        sessionStorage.setItem('seller_authorized', 'true');
      } else {
        setError(data.error || "Kiritilgan parol noto'g'ri!");
      }
    } catch (err) {
      console.error(err);
      setError("API serverga ulanishda xatolik yuz berdi!");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (isChangingPw) return;
    setPwError('');

    if (!newPw || newPw.length < 4) {
      setPwError("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak!");
      return;
    }
    if (newPw !== confirmNewPw) {
      setPwError("Yangi parollar bir-biriga mos kelmadi!");
      return;
    }

    setIsChangingPw(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'seller', currentPassword: currentPw, newPassword: newPw })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Parol muvaffaqiyatli o'zgartirildi!");
        setShowPasswordModal(false);
        // Reset fields
        setCurrentPw('');
        setNewPw('');
        setConfirmNewPw('');
        setPwError('');
      } else {
        setPwError(data.error || "Joriy parol noto'g'ri!");
      }
    } catch (err) {
      console.error(err);
      setPwError("API serverga ulanishda xatolik yuz berdi!");
    } finally {
      setIsChangingPw(false);
    }
  };

  // Sync active tab to localStorage on change
  useEffect(() => {
    localStorage.setItem('seller_active_tab', activeTab);
  }, [activeTab]);
  
  // New Product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  // Custom Characteristics state
  const [newProdManufacturer, setNewProdManufacturer] = useState('');
  const [newProdWarranty, setNewProdWarranty] = useState('');
  const [newProdWeightVolume, setNewProdWeightVolume] = useState('');
  const [newProdSkinType, setNewProdSkinType] = useState('');

  // Stats dynamically calculated
  const totalSales = dbOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // Load products & orders from DB
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const data = await cloudDb.getProducts();
      setProducts(data);
      setLoading(false);
    };

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await fetch('http://localhost:5000/api/seller/orders');
        if (res.ok) {
          const data = await res.json();
          setDbOrders(data);
        }
      } catch (err) {
        console.error("Error loading seller orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadProducts();
    loadOrders();
    loadBanners();
    window.scrollTo(0, 0);
  }, []);

  // ─── Banner Handlers ────────────────────────────────────────────────
  const notifyBannerChange = () => {
    localStorage.setItem('banner_updated_at', Date.now().toString());
    window.dispatchEvent(new Event('banner_updated'));
  };

  const loadBanners = async () => {
    try {
      setLoadingBanners(true);
      const res = await fetch('http://localhost:5000/api/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (err) {
      console.error('Banner load error:', err);
    } finally {
      setLoadingBanners(false);
    }
  };

  const openBannerModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({ title: banner.title, desc: banner.desc || '', image: banner.image || '', bg: banner.bg || 'linear-gradient(135deg, #FF3366, #FF8DA1)', linkedProductIds: banner.linkedProductIds || [] });
      setBannerImagePreview(banner.image || '');
    } else {
      setEditingBanner(null);
      setBannerForm({ title: '', desc: '', image: '', bg: 'linear-gradient(135deg, #FF3366, #FF8DA1)', linkedProductIds: [] });
      setBannerImagePreview('');
    }
    setBannerImageFile(null);
    setShowBannerModal(true);
  };

  const closeBannerModal = () => {
    setShowBannerModal(false);
    setEditingBanner(null);
    setBannerImageFile(null);
    setBannerImagePreview('');
  };

  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setBannerImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.title) { alert('Sarlavha majburiy!'); return; }
    setIsBannerSaving(true);
    try {
      let imageUrl = bannerForm.image;
      if (bannerImageFile) {
        imageUrl = await cloudDb.uploadImage(bannerImageFile);
      }
      const payload = { ...bannerForm, image: imageUrl };
      let res;
      if (editingBanner) {
        res = await fetch(`http://localhost:5000/api/banners/${editingBanner._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('http://localhost:5000/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      if (res.ok) {
        await loadBanners();
        notifyBannerChange();
        closeBannerModal();
        alert(editingBanner ? "Banner muvaffaqiyatli yangilandi!" : "Yangi banner qo'shildi!");
      } else {
        const err = await res.json();
        alert(err.error || 'Xatolik yuz berdi!');
      }
    } catch (err) {
      alert('Serverga ulanishda xato!');
    } finally {
      setIsBannerSaving(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('Bu bannerni o\'chirmoqchimisiz?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) { await loadBanners(); notifyBannerChange(); }
    } catch { alert('Xatolik!'); }
  };

  const handleToggleBannerActive = async (banner) => {
    try {
      const res = await fetch(`http://localhost:5000/api/banners/${banner._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !banner.active })
      });
      if (res.ok) { await loadBanners(); notifyBannerChange(); }
    } catch { alert('Xatolik!'); }
  };

  const handleMoveBanner = async (index, direction) => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBanners.length) return;
    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];
    const orders = newBanners.map((b, i) => ({ id: b._id, order: i }));
    try {
      const res = await fetch('http://localhost:5000/api/banners/reorder/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      });
      if (res.ok) { const data = await res.json(); setBanners(data); notifyBannerChange(); }
    } catch { alert('Xatolik!'); }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setDbOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
        alert("Buyurtma holati muvaffaqiyatli yangilandi!");
      } else {
        alert("Buyurtma holatini yangilashda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error(err);
      alert("API serverga ulanishda xato yuz berdi.");
    }
  };

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showAddModal) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  // Format Price helper
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
  };

  // Edit & Close Handlers
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setNewProdName(product.name);
    setNewProdCategory(product.category || 'Terini parvarishlash');
    setNewProdPrice(product.price);
    setSelectedFiles([]);
    
    // Fill custom fields
    setNewProdManufacturer(product.manufacturer || '');
    setNewProdWarranty(product.warranty || '');
    setNewProdWeightVolume(product.weightVolume || '');
    setNewProdSkinType(product.skinType || '');
    
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setNewProdName('');
    setNewProdCategory('');
    setNewProdPrice('');
    setSelectedFiles([]);
    
    // Reset custom fields
    setNewProdManufacturer('');
    setNewProdWarranty('');
    setNewProdWeightVolume('');
    setNewProdSkinType('');
    
    setEditingProduct(null);
    setShowAddModal(false);
  };

  // Save Product Handler (Add & Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;

    if (!newProdCategory) {
      alert("Iltimos, mahsulot kategoriyasini tanlang!");
      return;
    }
    
    // Check image validation
    if (!editingProduct && selectedFiles.length < 3) {
      alert("Iltimos, mahsulot uchun kamida 3 ta rasm yuklang!");
      return;
    }
    if (editingProduct && selectedFiles.length > 0 && selectedFiles.length < 3) {
      alert("Yangi rasmlar yuklanganda kamida 3 ta rasm bo'lishi kerak!");
      return;
    }

    setIsSaving(true);
    const uploadedUrls = [];

    // Upload all selected files to Cloudinary
    for (const file of selectedFiles) {
      try {
        const url = await cloudDb.uploadImage(file);
        uploadedUrls.push(url);
      } catch (err) {
        console.error("Image upload failed for file:", file.name, err);
      }
    }

    if (editingProduct) {
      // Edit mode
      const finalImages = uploadedUrls.length >= 3 
        ? uploadedUrls 
        : (editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [editingProduct.image]);
      const finalMainImage = finalImages[0] || editingProduct.image;

      const updatedProduct = {
        ...editingProduct,
        name: newProdName,
        category: newProdCategory,
        price: Number(newProdPrice),
        image: finalMainImage,
        images: finalImages,
        manufacturer: newProdManufacturer,
        warranty: newProdWarranty,
        weightVolume: newProdWeightVolume,
        skinType: newProdSkinType
      };

      const updated = products.map(p => p.id === editingProduct.id ? updatedProduct : p);
      setProducts(updated);
      await cloudDb.saveProducts(updated);
    } else {
      // Add mode
      const mainImageUrl = uploadedUrls[0] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop";

      const newProduct = {
        id: Date.now(),
        name: newProdName,
        category: newProdCategory,
        price: Number(newProdPrice),
        originalPrice: null,
        rating: 5.0,
        reviews: 0,
        image: mainImageUrl,
        images: uploadedUrls.length >= 3 ? uploadedUrls : [mainImageUrl, mainImageUrl, mainImageUrl],
        featured: false,
        manufacturer: newProdManufacturer,
        warranty: newProdWarranty,
        weightVolume: newProdWeightVolume,
        skinType: newProdSkinType
      };

      const updated = [newProduct, ...products];
      setProducts(updated);
      await cloudDb.saveProducts(updated);
    }

    setIsSaving(false);
    handleCloseModal();
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    await cloudDb.saveProducts(updated);
  };



  if (!isAuthorized) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
        padding: '2rem 1rem'
      }}>
        <style>{`
          .pw-card {
            background: var(--color-surface);
            border-radius: 24px;
            border: 1px solid var(--color-border);
            box-shadow: var(--shadow-sm);
            padding: 3rem 2.5rem;
            width: 100%;
            max-width: 400px;
            text-align: center;
            animation: pwFadeIn 0.4s ease-out;
          }
          @keyframes pwFadeIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .pw-input {
            width: 100%;
            padding: 0.85rem 1rem;
            border: 1.5px solid var(--color-border);
            border-radius: 12px;
            font-size: 0.95rem;
            outline: none;
            text-align: center;
            background-color: #fafbfc;
            color: var(--color-text);
            transition: all 0.2s ease;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          .pw-input:focus {
            border-color: var(--color-primary);
            background-color: var(--color-surface);
            box-shadow: 0 0 0 4px rgba(255, 51, 102, 0.08);
          }
          .pw-submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #FF3366, #ff5c8a);
            color: white;
            border: none;
            padding: 0.9rem;
            border-radius: 24px;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(255, 51, 102, 0.2);
            transition: all 0.2s ease;
          }
          .pw-submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(255, 51, 102, 0.3);
          }
          .pw-back-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: var(--color-text-muted);
            font-weight: 600;
            font-size: 0.88rem;
            text-decoration: none;
            margin-top: 1.5rem;
            transition: all 0.2s ease;
          }
          .pw-back-btn:hover {
            color: var(--color-text);
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
          }
        `}</style>
        <div className="pw-card">
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 51, 102, 0.06)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <ShoppingBag size={28} />
          </div>
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '6px', color: 'var(--color-text)' }}>
            Sotuvchi kabinetiga kirish
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
            Ushbu bo'lim himoyalangan. Iltimos, davom etish uchun parolni kiriting.
          </p>

          <form onSubmit={handlePasswordSubmit}>
            <input 
              type="password" 
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="pw-input"
              autoFocus
            />
            {error && (
              <div style={{
                color: '#e53e3e',
                fontSize: '0.82rem',
                fontWeight: '700',
                marginBottom: '1rem',
                animation: 'shake 0.3s ease'
              }}>
                ❌ {error}
              </div>
            )}
            <button type="submit" className="pw-submit-btn" disabled={isVerifying}>
              {isVerifying ? "Tekshirilmoqda..." : "Tasdiqlash"}
            </button>
          </form>

          <Link to="/" className="pw-back-btn">
            <ArrowLeft size={16} /> Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: 'calc(100vh - 100px)' }}>
      {/* Top Breadcrumb & Return button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: '600' }} className="back-link">
          <ArrowLeft size={18} />
          Do'konga qaytish
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#00B048' }}></span>
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Sotuvchi kabineti: <strong>Lumiere Cosmetics</strong></span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
        
        {/* SIDEBAR */}
        <aside style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '1.5rem 1rem',
          height: 'fit-content',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Seller profile brief */}
          <div style={{ textAlign: 'center', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 51, 102, 0.1)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: '0 auto 0.75rem auto'
            }}>
              LC
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Lumiere Store</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ID: 104928</span>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: activeTab === 'dashboard' ? 'white' : 'var(--color-text)',
                backgroundColor: activeTab === 'dashboard' ? 'var(--color-primary)' : 'transparent',
                fontWeight: '600',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <LayoutDashboard size={20} />
              Boshqaruv paneli
            </button>

            <button 
              onClick={() => setActiveTab('products')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: activeTab === 'products' ? 'white' : 'var(--color-text)',
                backgroundColor: activeTab === 'products' ? 'var(--color-primary)' : 'transparent',
                fontWeight: '600',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Package size={20} />
              Mahsulotlarim ({products.length})
            </button>

            <button 
              onClick={() => setActiveTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: activeTab === 'orders' ? 'white' : 'var(--color-text)',
                backgroundColor: activeTab === 'orders' ? 'var(--color-primary)' : 'transparent',
                fontWeight: '600',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <ShoppingBag size={20} />
              Buyurtmalar ({dbOrders.length})
            </button>

            <button 
              onClick={() => setActiveTab('banners')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: activeTab === 'banners' ? 'white' : 'var(--color-text)',
                backgroundColor: activeTab === 'banners' ? 'var(--color-primary)' : 'transparent',
                fontWeight: '600',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Image size={20} />
              Karusel ({banners.length})
            </button>

            <button 
              onClick={() => {
                setPwError('');
                setCurrentPw('');
                setNewPw('');
                setConfirmNewPw('');
                setShowPasswordModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                backgroundColor: 'transparent',
                border: '1px dashed var(--color-border)',
                fontWeight: '600',
                transition: 'all 0.2s',
                textAlign: 'left',
                marginTop: '1.5rem',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 51, 102, 0.05)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <Key size={20} />
              Parolni o'zgartirish
            </button>
          </div>
        </aside>


        {/* MAIN PANEL CONTENT */}
        <main style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          minHeight: '500px'
        }}>
          
          {/* TAB 4: BANNER/CAROUSEL MANAGEMENT */}
          {activeTab === 'banners' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Karusel bannerlari ({banners.filter(b => b.active).length} faol)</h2>
                <button 
                  onClick={() => openBannerModal()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '0.6rem 1.2rem',
                    backgroundColor: 'var(--color-primary)', color: 'white',
                    borderRadius: 'var(--radius-md)', fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(255, 51, 102, 0.2)'
                  }}
                >
                  <Plus size={18} />
                  Yangi banner
                </button>
              </div>

              {loadingBanners ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Yuklanmoqda...</div>
              ) : banners.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Image size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem', display: 'block' }} />
                  <p style={{ color: 'var(--color-text-muted)' }}>Hali banner yo'q. Birinchi bannerni qo'shing!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {banners.map((banner, index) => (
                    <div key={banner._id} style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 120px 1fr auto',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${banner.active ? 'var(--color-border)' : 'var(--color-border)'}`,
                      backgroundColor: banner.active ? 'var(--color-bg)' : 'rgba(0,0,0,0.02)',
                      opacity: banner.active ? 1 : 0.55,
                      transition: 'all 0.2s'
                    }}>
                      {/* Reorder Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          onClick={() => handleMoveBanner(index, 'up')}
                          disabled={index === 0}
                          style={{ padding: '3px', borderRadius: '4px', border: '1px solid var(--color-border)', color: index === 0 ? 'var(--color-border)' : 'var(--color-text-muted)', cursor: index === 0 ? 'not-allowed' : 'pointer', background: 'var(--color-surface)' }}
                        ><ChevronUp size={14} /></button>
                        <button
                          onClick={() => handleMoveBanner(index, 'down')}
                          disabled={index === banners.length - 1}
                          style={{ padding: '3px', borderRadius: '4px', border: '1px solid var(--color-border)', color: index === banners.length - 1 ? 'var(--color-border)' : 'var(--color-text-muted)', cursor: index === banners.length - 1 ? 'not-allowed' : 'pointer', background: 'var(--color-surface)' }}
                        ><ChevronDown size={14} /></button>
                      </div>

                      {/* Preview */}
                      <div style={{
                        width: '120px', height: '68px', borderRadius: '10px', overflow: 'hidden',
                        background: banner.bg || '#eee',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', flexShrink: 0
                      }}>
                        {banner.image ? (
                          <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Image size={28} style={{ color: 'rgba(255,255,255,0.7)' }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.title}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.desc || '—'}</div>
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: banner.bg, border: '1px solid rgba(0,0,0,0.1)' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>#{index + 1} tartib</span>
                        </div>
                        {/* Linked product thumbnails */}
                        {banner.linkedProductIds && banner.linkedProductIds.length > 0 && (
                          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            {products
                              .filter(p => (banner.linkedProductIds || []).map(id => String(id)).includes(String(p.id)))
                              .slice(0, 4)
                              .map(prod => (
                                <img
                                  key={prod.id}
                                  src={prod.image}
                                  alt={prod.name}
                                  title={prod.name}
                                  style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'cover', border: '1.5px solid var(--color-border)' }}
                                />
                              ))
                            }
                            {banner.linkedProductIds.length > 4 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>+{banner.linkedProductIds.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                        <button
                          onClick={() => handleToggleBannerActive(banner)}
                          title={banner.active ? "Yashirish" : "Ko'rsatish"}
                          style={{ padding: '7px', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'pointer', backgroundColor: banner.active ? '#E6F9F0' : 'var(--color-bg)', color: banner.active ? '#00B048' : 'var(--color-text-muted)' }}
                        >{banner.active ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                        <button
                          onClick={() => openBannerModal(banner)}
                          style={{ padding: '7px', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}
                        ><Edit3 size={16} /></button>
                        <button
                          onClick={() => handleDeleteBanner(banner._id)}
                          style={{ padding: '7px', borderRadius: '8px', border: '1px solid #FFD2D9', cursor: 'pointer', color: '#D61C4E', backgroundColor: '#FFECEF' }}
                        ><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── LIVE CAROUSEL PREVIEW ─────────────────────────────── */}
              {banners.filter(b => b.active !== false).length > 0 && (
                <BannerPreview banners={banners.filter(b => b.active !== false)} allProducts={products} />
              )}

              {/* Info note */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(255, 51, 102, 0.04)', border: '1px solid rgba(255, 51, 102, 0.12)', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                💡 Bannerlar bosh sahifada karusel ko'rinishida chiqadi. Tartibni o'zgartirish uchun ⬆⬇ tugmalardan foydalaning. Ko'z ikonasi orqali bannerni vaqtincha yashirishingiz mumkin.
              </div>
            </div>
          )}

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Boshqaruv paneli</h2>
              
              {/* Stat Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                {/* Stat 1 */}
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>Jami sotuvlar</span>
                    <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(0, 176, 72, 0.1)', color: '#00B048' }}><DollarSign size={18} /></div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px 0' }}>{formatPrice(totalSales)}</h3>
                  <span style={{ fontSize: '0.75rem', color: '#00B048', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} /> +12.4% o'sish</span>
                </div>
                {/* Stat 2 */}
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>Buyurtmalar</span>
                    <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(255, 51, 102, 0.1)', color: 'var(--color-primary)' }}><ShoppingBag size={18} /></div>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 4px 0' }}>{dbOrders.length} ta</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Jami kelib tushgan</span>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Oxirgi buyurtmalar</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                        <th style={{ padding: '10px 8px' }}>ID</th>
                        <th style={{ padding: '10px 8px' }}>Xaridor</th>
                        <th style={{ padding: '10px 8px' }}>Mahsulotlar</th>
                        <th style={{ padding: '10px 8px' }}>Summa</th>
                        <th style={{ padding: '10px 8px' }}>Sana</th>
                        <th style={{ padding: '10px 8px' }}>Holati</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingOrders ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                            Buyurtmalar yuklanmoqda...
                          </td>
                        </tr>
                      ) : dbOrders.length > 0 ? (
                        dbOrders.slice(0, 5).map((order) => {
                          const orderShortId = order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase();
                          const customerName = order.customerDetails?.firstName 
                            ? `${order.customerDetails.firstName} ${order.customerDetails.lastName || ''}` 
                            : `Foydalanuvchi (${order.telegramId})`;
                          const itemsSummary = order.items.map(it => `${it.name} (${it.quantity} ta)`).join(', ');
                          
                          return (
                            <tr key={order._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--color-primary)' }}>#{orderShortId}</td>
                              <td style={{ padding: '12px 8px' }}>{customerName}</td>
                              <td style={{ padding: '12px 8px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={itemsSummary}>{itemsSummary}</td>
                              <td style={{ padding: '12px 8px', fontWeight: '600' }}>{formatPrice(order.totalPrice)}</td>
                              <td style={{ padding: '12px 8px', color: 'var(--color-text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('uz-UZ')}</td>
                              <td style={{ padding: '12px 8px' }}>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  backgroundColor: order.status === 'Yetkazildi' ? '#E6F9F0' : order.status === 'Yo\'lda' ? '#EBF6FC' : '#FFF9EC',
                                  color: order.status === 'Yetkazildi' ? '#00B048' : order.status === 'Yo\'lda' ? '#229ED9' : '#FFB800'
                                }}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                            Hali buyurtmalar kelib tushmadi.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Mahsulotlarim ({products.length})</h2>
                <button 
                  onClick={() => {
                    handleCloseModal();
                    setShowAddModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.6rem 1.2rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(255, 51, 102, 0.2)'
                  }}
                >
                  <Plus size={18} />
                  Yangi qo'shish
                </button>
              </div>

              {/* Products Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: '600' }}>
                      <th style={{ padding: '10px 8px' }}>Mahsulot</th>
                      <th style={{ padding: '10px 8px' }}>Kategoriya</th>
                      <th style={{ padding: '10px 8px' }}>Narxi</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '3rem' }}>
                          <span className="spinner-loader" style={{ borderColor: 'rgba(255, 51, 102, 0.3)', borderTopColor: 'var(--color-primary)' }}></span>
                          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Mahsulotlar bulutli bazadan yuklanmoqda...</p>
                        </td>
                      </tr>
                    ) : products.length > 0 ? (
                      products.map((product) => (
                        <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                            <span style={{ fontWeight: '500', maxWidth: '200px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</span>
                          </td>
                          <td style={{ padding: '12px 8px' }}>{product.category}</td>
                          <td style={{ padding: '12px 8px', fontWeight: '600' }}>{formatPrice(product.price)}</td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleEditClick(product)}
                                style={{ padding: '6px', borderRadius: '6px', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                style={{ padding: '6px', borderRadius: '6px', border: '1px solid #FFD2D9', color: '#D61C4E', backgroundColor: '#FFECEF' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                          Mahsulotlar topilmadi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Buyurtmalar boshqaruvi ({dbOrders.length})</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingOrders ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    <span className="spinner-loader" style={{ borderColor: 'rgba(255, 51, 102, 0.3)', borderTopColor: 'var(--color-primary)' }}></span>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Buyurtmalar yuklanmoqda...</p>
                  </div>
                ) : dbOrders.length > 0 ? (
                  dbOrders.map((order) => {
                    const orderShortId = order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase();
                    const customerName = order.customerDetails?.firstName 
                      ? `${order.customerDetails.firstName} ${order.customerDetails.lastName || ''}` 
                      : `Foydalanuvchi (${order.telegramId})`;
                    const customerPhone = order.customerDetails?.phone || "Kiritilmagan";
                    const deliveryAddress = order.customerDetails?.address || "Kiritilmagan";
                    const paymentInfo = order.customerDetails?.paymentMethod === 'online' ? 'Click / Payme' : 'Naqd pul';
                    
                    return (
                      <div key={order._id} style={{
                        padding: '1.25rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        gap: '1.5rem',
                        backgroundColor: '#ffffff'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>#{orderShortId}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>| {new Date(order.createdAt).toLocaleString('uz-UZ')}</span>
                          </div>
                          
                          {/* Items summary */}
                          <div style={{ margin: '8px 0', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ margin: '0 0 6px 0', fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text)' }}>Xarid qilingan mahsulotlar:</h5>
                            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.85rem', color: '#334155' }}>
                              {order.items.map((it, idx) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>
                                  <Link to={`/product/${it.id}`} style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>
                                    <strong>{it.name}</strong>
                                  </Link> — {it.quantity} ta × {formatPrice(it.price)}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                            <strong>Xaridor:</strong> {customerName} • <strong>Tel:</strong> {customerPhone}<br />
                            <strong>Manzil:</strong> {deliveryAddress} • <strong>To'lov:</strong> {paymentInfo}
                          </p>
                          
                          <span style={{ display: 'inline-block', marginTop: '10px', fontWeight: '800', fontSize: '1rem', color: 'var(--color-primary)' }}>
                            Jami summa: {formatPrice(order.totalPrice)}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: order.status === 'Yetkazildi' ? '#E6F9F0' : order.status === 'Yo\'lda' ? '#EBF6FC' : '#FFF9EC',
                            color: order.status === 'Yetkazildi' ? '#00B048' : order.status === 'Yo\'lda' ? '#229ED9' : '#FFB800'
                          }}>
                            {order.status}
                          </span>
                          
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {order.status === 'Kutilmoqda' && (
                              <button 
                                onClick={() => handleUpdateStatus(order._id, 'Yo\'lda')}
                                style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fafbfc' }}
                              >
                                <Truck size={14} /> Yo'lga chiqarish
                              </button>
                            )}
                            {order.status === 'Yo\'lda' && (
                              <button 
                                onClick={() => handleUpdateStatus(order._id, 'Yetkazildi')}
                                style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid #00B048', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#E6F9F0', color: '#00B048' }}
                              >
                                <Check size={14} /> Yetkazildi
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: '16px' }}>
                    Hali buyurtmalar kelib tushmadi.
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ADD NEW PRODUCT MODAL */}
      {showAddModal && (
        <div 
          onClick={handleCloseModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              width: '100%',
              maxWidth: '500px',
              boxShadow: 'var(--shadow-md)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>
              {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
            </h3>
            
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Nomi</label>
                <input 
                  type="text" 
                  placeholder="Masalan: Garnier tozalovchi suvi..." 
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required 
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Kategoriya</label>
                <select 
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  required
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none' }}
                >
                  <option value="" disabled>Kategoriyani tanlang</option>
                  <option value="Terini parvarishlash">Terini parvarishlash</option>
                  <option value="Yuz uchun">Yuz uchun</option>
                  <option value="Lab uchun">Lab uchun</option>
                  <option value="Soch parvarishi">Soch parvarishi</option>
                  <option value="Ko'z uchun">Ko'z uchun</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                  Mahsulot rasmlari (Kamida 3 ta rasm)
                </label>
                
                {/* Selected/existing images list */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px', marginBottom: '4px' }}>
                  {selectedFiles.length > 0 ? (
                    selectedFiles.map((file, idx) => {
                      const previewUrl = URL.createObjectURL(file);
                      return (
                        <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                          <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button"
                            onClick={() => {
                              setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
                            }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              backgroundColor: 'rgba(214, 28, 78, 0.9)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: '700'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  ) : editingProduct ? (
                    (editingProduct.images || [editingProduct.image]).map((imgUrl, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                        <img src={imgUrl} alt="existing" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
                        <span style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          color: 'white',
                          fontSize: '0.6rem',
                          textAlign: 'center',
                          padding: '2px 0'
                        }}>
                          Mavjud
                        </span>
                      </div>
                    ))
                  ) : null}

                  {/* Dynamic plus-card adder */}
                  <label style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '8px',
                    border: '2px dashed var(--color-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--color-primary)',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    backgroundColor: 'rgba(255, 51, 102, 0.02)',
                    gap: '2px'
                  }} className="add-img-label-hover">
                    <Plus size={18} />
                    <span>{selectedFiles.length > 0 ? "Yana" : "Yuklash"}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFiles(prev => [...prev, e.target.files[0]]);
                        }
                      }}
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                {editingProduct ? (
                  selectedFiles.length > 0 ? (
                    <span style={{ fontSize: '0.75rem', color: selectedFiles.length >= 3 ? '#00B048' : '#D61C4E', fontWeight: '600' }}>
                      {selectedFiles.length >= 3 
                        ? `To'g'ri! Yangi ${selectedFiles.length} ta rasm yuklanadi.` 
                        : `Yangi rasmlar yuklansa, kamida 3 ta bo'lishi shart! (Hozir: ${selectedFiles.length} ta)`}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                      Yangilamoqchi bo'lsangiz, kamida 3 ta rasm yuklash kerak. Aks holda hozirgi mavjud rasmlar saqlanib qolinadi.
                    </span>
                  )
                ) : (
                  <span style={{ fontSize: '0.75rem', color: selectedFiles.length >= 3 ? '#00B048' : '#D61C4E', fontWeight: '600' }}>
                    {selectedFiles.length >= 3 
                      ? `To'g'ri! ${selectedFiles.length} ta rasm tanlandi.` 
                      : `Kamida 3 ta rasm yuklang (Hozir: ${selectedFiles.length} ta)`}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Narxi (so'm)</label>
                <input 
                  type="number" 
                  placeholder="85000" 
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  required 
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none' }} 
                />
              </div>

              {/* Tavsif olib tashlandi */}

              {/* Characteristics Section */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text)' }}>Mahsulot xususiyatlari</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Ishlab chiqaruvchi mamlakat</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: Janubiy Koreya" 
                      value={newProdManufacturer}
                      onChange={(e) => setNewProdManufacturer(e.target.value)}
                      style={{ padding: '0.5rem 0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.85rem' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Kafolat muddati</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: 12 oy" 
                      value={newProdWarranty}
                      onChange={(e) => setNewProdWarranty(e.target.value)}
                      style={{ padding: '0.5rem 0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.85rem' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Og'irligi / Hajmi</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: 50 ml" 
                      value={newProdWeightVolume}
                      onChange={(e) => setNewProdWeightVolume(e.target.value)}
                      style={{ padding: '0.5rem 0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.85rem' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>Teri turi</label>
                    <input 
                      type="text" 
                      placeholder="Masalan: Barcha turdagi terilar" 
                      value={newProdSkinType}
                      onChange={(e) => setNewProdSkinType(e.target.value)}
                      style={{ padding: '0.5rem 0.6rem', borderRadius: '6px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.85rem' }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600', cursor: 'pointer' }}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    backgroundColor: 'var(--color-primary)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    fontWeight: '600', 
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving ? "Bulutga yuklanmoqda..." : (editingProduct ? "Saqlash" : "Qo'shish")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setShowPasswordModal(false)}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            padding: '2.5rem 2rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowPasswordModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 51, 102, 0.08)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Key size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--color-text)' }}>
                Parolni o'zgartirish
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Tizim xavfsizligini ta'minlash uchun parolni yangilang.
              </p>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Joriy parol
                </label>
                <input 
                  type="password"
                  value={currentPw}
                  onChange={(e) => { setCurrentPw(e.target.value); setPwError(''); }}
                  placeholder="Amaldagi parolni kiriting"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Yangi parol
                </label>
                <input 
                  type="password"
                  value={newPw}
                  onChange={(e) => { setNewPw(e.target.value); setPwError(''); }}
                  placeholder="Yangi parol (kamida 4 ta belgi)"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Yangi parolni tasdiqlang
                </label>
                <input 
                  type="password"
                  value={confirmNewPw}
                  onChange={(e) => { setConfirmNewPw(e.target.value); setPwError(''); }}
                  placeholder="Yangi parolni qaytadan kiriting"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-border)',
                    outline: 'none',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  required
                />
              </div>

              {pwError && (
                <div style={{
                  color: '#e53e3e',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  padding: '6px 10px',
                  backgroundColor: '#FFF5F5',
                  border: '1px solid #FED7D7',
                  borderRadius: '8px',
                  animation: 'shake 0.3s ease'
                }}>
                  ⚠️ {pwError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '24px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'white',
                    color: 'var(--color-text)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={isChangingPw}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '24px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #FF3366, #ff5c8a)',
                    color: 'white',
                    fontWeight: '700',
                    cursor: isChangingPw ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(255, 51, 102, 0.2)',
                    transition: 'all 0.2s',
                    opacity: isChangingPw ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => { if (!isChangingPw) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { if (!isChangingPw) e.currentTarget.style.transform = 'none'; }}
                >
                  {isChangingPw ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── BANNER ADD/EDIT MODAL ─────────────────────────────────── */}
      {showBannerModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }} onClick={(e) => { if (e.target === e.currentTarget) closeBannerModal(); }}>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '20px',
            border: '1px solid var(--color-border)',
            padding: '2rem',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            animation: 'pwFadeIn 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                {editingBanner ? "Bannerni tahrirlash" : "Yangi banner qo'shish"}
              </h3>
              <button onClick={closeBannerModal} style={{ padding: '6px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Image Upload */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                  Banner rasmi
                </label>
                <div style={{
                  width: '100%', height: '160px', borderRadius: '12px',
                  border: '2px dashed var(--color-border)', overflow: 'hidden',
                  position: 'relative', cursor: 'pointer',
                  background: bannerForm.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => document.getElementById('bannerImgInput').click()}>
                  {bannerImagePreview ? (
                    <img src={bannerImagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', position: 'relative', zIndex: 1 }}>
                      <Image size={36} style={{ display: 'block', margin: '0 auto 8px' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Rasm yuklash uchun bosing</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', zIndex: 2 }}>
                    O'zgartirish
                  </div>
                </div>
                <input id="bannerImgInput" type="file" accept="image/*" onChange={handleBannerImageChange} style={{ display: 'none' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '6px', marginBottom: '4px' }}>Yoki URL manzilini kiriting:</p>
                <input
                  type="text"
                  value={bannerForm.image}
                  onChange={(e) => { setBannerForm(f => ({ ...f, image: e.target.value })); if (!bannerImageFile) setBannerImagePreview(e.target.value); }}
                  placeholder="https://... rasm URL manzili"
                  style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.85rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Title */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Sarlavha <span style={{ color: 'var(--color-primary)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="masalan: Yozgi chegirma"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.9rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                  Tavsif
                </label>
                <input
                  type="text"
                  value={bannerForm.desc}
                  onChange={(e) => setBannerForm(f => ({ ...f, desc: e.target.value }))}
                  placeholder="masalan: Barcha mahsulotlarda 30% chegirma"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1.5px solid var(--color-border)', outline: 'none', fontSize: '0.9rem', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              {/* Background Gradient Picker */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                  Fon rangi (gradient)
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Pushti', bg: 'linear-gradient(135deg, #FF3366, #FF8DA1)' },
                    { label: 'Yashil', bg: 'linear-gradient(135deg, #00B533, #66E088)' },
                    { label: 'Binafsha', bg: 'linear-gradient(135deg, #7000FF, #B366FF)' },
                    { label: "Ko'k", bg: 'linear-gradient(135deg, #0062FF, #66A8FF)' },
                    { label: "To'q sariq", bg: 'linear-gradient(135deg, #FF8C00, #FFD166)' },
                    { label: 'Qora', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
                  ].map(({ label, bg }) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBannerForm(f => ({ ...f, bg }))}
                      title={label}
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%', background: bg,
                        border: bannerForm.bg === bg ? '3px solid var(--color-primary)' : '2px solid transparent',
                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        outline: bannerForm.bg === bg ? '2px solid rgba(255,51,102,0.3)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ── Linked Products Selector ── */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                  Biriktirish uchun mahsulotlar tanlang
                  {bannerForm.linkedProductIds.length > 0 && (
                    <span style={{ marginLeft: '8px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '10px', padding: '1px 8px', fontSize: '0.72rem', fontWeight: '700' }}>
                      {bannerForm.linkedProductIds.length} ta
                    </span>
                  )}
                </label>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: 'var(--color-bg)'
                }}>
                  {products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Mahsulotlar yuklanmoqda...</div>
                  ) : products.map(prod => {
                    const isSelected = (bannerForm.linkedProductIds || []).map(id => String(id)).includes(String(prod.id));
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setBannerForm(f => {
                            const ids = (f.linkedProductIds || []).map(id => String(id));
                            const prodId = String(prod.id);
                            return {
                              ...f,
                              linkedProductIds: ids.includes(prodId)
                                ? ids.filter(id => id !== prodId)
                                : [...ids, prodId]
                            };
                          });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(255, 51, 102, 0.06)' : 'var(--color-surface)',
                          border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'transparent'}`,
                          transition: 'all 0.15s',
                          userSelect: 'none'
                        }}
                      >
                        {/* Checkbox */}
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                          border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s'
                        }}>
                          {isSelected && <span style={{ color: 'white', fontSize: '11px', fontWeight: '800', lineHeight: 1 }}>✓</span>}
                        </div>
                        {/* Image */}
                        <img src={prod.image} alt={prod.name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '7px', flexShrink: 0 }} />
                        {/* Info */}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.name}</div>
                          <div style={{ fontSize: '0.75rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: '600' }}>
                            {prod.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {bannerForm.linkedProductIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setBannerForm(f => ({ ...f, linkedProductIds: [] }))}
                    style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    × Barcha tanlovni bekor qilish
                  </button>
                )}
              </div>

              {/* Action Buttons */}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={closeBannerModal}
                  style={{ padding: '0.75rem', borderRadius: '24px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isBannerSaving}
                  style={{ padding: '0.75rem', borderRadius: '24px', border: 'none', background: 'linear-gradient(135deg, #FF3366, #ff5c8a)', color: 'white', fontWeight: '700', cursor: isBannerSaving ? 'not-allowed' : 'pointer', opacity: isBannerSaving ? 0.7 : 1, boxShadow: '0 4px 12px rgba(255, 51, 102, 0.25)', transition: 'all 0.2s' }}
                >
                  {isBannerSaving ? 'Saqlanmoqda...' : (editingBanner ? 'Saqlash' : "Qo'shish")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seller;

