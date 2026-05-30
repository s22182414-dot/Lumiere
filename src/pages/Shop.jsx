import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { cloudDb } from '../services/cloudDb';

const Shop = () => {
  const [filter, setFilter] = useState('Barchasi');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [localProducts, setLocalProducts] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await cloudDb.getProducts();
      setLocalProducts(data);
    };
    loadData();
  }, []);

  const categories = ['Barchasi', ...new Set(localProducts.map(p => p.category))];

  // First filter by search query
  let filteredProducts = localProducts;
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  // Then filter by category
  if (filter !== 'Barchasi') {
    filteredProducts = filteredProducts.filter(p => p.category === filter);
  }

  return (
    <div className="page-shop container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem' }}>
          {searchQuery ? `Qidiruv natijalari: "${searchQuery}"` : 'Barcha mahsulotlar'}
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                backgroundColor: filter === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                color: filter === cat ? 'white' : 'var(--color-text)',
                border: 'none',
                fontWeight: '500',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Shop;
