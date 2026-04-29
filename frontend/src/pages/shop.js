import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Navbar from '../components/Navbar';

const CATEGORIES = ['All', 'Running', 'Casual', 'Basketball', 'Limited', 'Formal', 'Sports', 'Outdoor'];

export default function Shop() {
  const { user, loading } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [fetching, setFetching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState({});

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchProducts('', category);
  }, [user, category]);

  const fetchProducts = async (q = '', cat = 'All') => {
    setFetching(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (cat && cat !== 'All') params.set('category', cat);
      const res = await axios.get('/api/products' + (params.toString() ? '?' + params.toString() : ''));
      setProducts(res.data || []);
    } catch {}
    setFetching(false);
  };

  const handleSearch = (e) => { e.preventDefault(); fetchProducts(search, category); };

  // Safely parse sizes — Supabase may return JSONB as string or array
  const parseSizes = (sizes) => {
    if (!sizes) return [];
    if (Array.isArray(sizes)) return sizes;
    try { const p = JSON.parse(sizes); return Array.isArray(p) ? p : []; } catch { return []; }
  };

  const openProduct = (product) => {
    const sizes = parseSizes(product.sizes);
    setSelected({ ...product, sizes });
    setSelectedSize('');
    // Build images array from images[] or fall back to image field
    const imgs = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image ? [product.image] : [];
    setActiveImg(0);
    setSelected({ ...product, sizes, _imgs: imgs });
  };
  const closeModal = () => { setSelected(null); setSelectedSize(''); setActiveImg(0); };

  const handleAddToCart = (product, size) => {
    addToCart({ ...product, selectedSize: size || null });
    const key = product.id + (size || '');
    setAdded(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [key]: false })), 1400);
    closeModal();
  };

  if (loading || !user) return <div className="loading">Loading...</div>;

  const featured = products.filter(p => Number(p.stock) > 0).slice(0, 3);

  return (
    <>
      <Navbar />

      {/* HERO BANNER */}
      <div className="shop-hero">
        <div className="shop-hero-inner">
          <div className="shop-hero-label">NAGOMARA COLLECTION</div>
          <h1 className="shop-hero-title">Find Your Perfect Pair</h1>
          <p className="shop-hero-sub">Every step tells a story — discover footwear crafted for those who seek balance.</p>
        </div>
      </div>

      <div className="shop-container">

        {/* SEARCH + FILTER */}
        <div className="shop-controls">
          <form className="shop-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search styles, brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">Search</button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); fetchProducts('', category); }}>✕</button>
            )}
          </form>
          <div className="shop-cats">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={'shop-cat-btn' + (category === c ? ' active' : '')}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* FEATURED ROW */}
        {featured.length > 0 && (
          <div className="shop-featured-row">
            {featured.map(p => (
              <div className="shop-featured-card" key={p.id} onClick={() => openProduct(p)}>
                <div className="shop-featured-img">
                  <img
                    src={p.image || 'https://via.placeholder.com/400x300?text=NAGOMARA'}
                    alt={p.name}
                    onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=NAGOMARA'; }}
                  />
                  <div className="shop-featured-overlay"><span>VIEW DETAILS</span></div>
                </div>
                <div className="shop-featured-info">
                  <div className="shop-featured-cat">{p.category}</div>
                  <div className="shop-featured-name">{p.name}</div>
                  <div className="shop-featured-price">₹{Number(p.price).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIVIDER */}
        <div className="shop-divider"><span>ALL PRODUCTS</span></div>

        {/* PRODUCTS GRID */}
        {fetching ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found.</div>
        ) : (
          <div className="shop-grid">
            {products.map(p => (
              <div className="shop-card" key={p.id} onClick={() => openProduct(p)}>
                <div className="shop-card-img">
                  <img
                    src={p.image || 'https://via.placeholder.com/300x260?text=NAGOMARA'}
                    alt={p.name}
                    onError={e => { e.target.src = 'https://via.placeholder.com/300x260?text=NAGOMARA'; }}
                  />
                  {Number(p.stock) === 0 && <div className="shop-card-badge sold-out">SOLD OUT</div>}
                  {Number(p.stock) > 0 && Number(p.stock) <= 5 && <div className="shop-card-badge low-stock">LOW STOCK</div>}
                  <div className="shop-card-overlay"><span>QUICK VIEW</span></div>
                </div>
                <div className="shop-card-body">
                  <div className="shop-card-cat">{p.category}</div>
                  <div className="shop-card-name">{p.name}</div>
                  <div className="shop-card-brand">{p.brand}</div>
                  {/* Size chips preview */}
                  {parseSizes(p.sizes).length > 0 && (
                    <div className="shop-card-sizes">
                      {parseSizes(p.sizes).filter(s => Number(s.stock) > 0).map(s => (
                        <span key={s.size} className="shop-card-size-chip">{s.size}</span>
                      ))}
                    </div>
                  )}
                  <div className="shop-card-footer">
                    <div className="shop-card-price">₹{Number(p.price).toLocaleString()}</div>
                    <button
                      className="shop-card-btn"
                      onClick={e => {
                        e.stopPropagation();
                        const sizes = parseSizes(p.sizes);
                        if (sizes.length > 0) {
                          openProduct(p);
                        } else {
                          // No sizes defined — add directly
                          handleAddToCart(p, null);
                        }
                      }}
                      disabled={Number(p.stock) === 0}
                    >
                      {Number(p.stock) === 0 ? 'Sold Out' : parseSizes(p.sizes).length > 0 ? 'Select Size' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT DETAIL MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="modal-grid">
              <div className="modal-img">
                {/* Main image */}
                <img
                  src={(selected._imgs && selected._imgs[activeImg]) || selected.image || 'https://via.placeholder.com/480x400?text=NAGOMARA'}
                  alt={selected.name}
                  onError={e => { e.target.src = 'https://via.placeholder.com/480x400?text=NAGOMARA'; }}
                />
                {/* Thumbnail strip */}
                {selected._imgs && selected._imgs.length > 1 && (
                  <div className="modal-thumbs">
                    {selected._imgs.map((img, i) => (
                      <div
                        key={i}
                        className={'modal-thumb' + (activeImg === i ? ' active' : '')}
                        onClick={() => setActiveImg(i)}
                      >
                        <img src={img} alt={`view-${i}`} onError={e => { e.target.style.display = 'none'; }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-info">
                {selected.category && <div className="modal-cat">{selected.category}</div>}
                <h2 className="modal-name">{selected.name}</h2>
                {selected.brand && <div className="modal-brand">{selected.brand}</div>}
                <div className="modal-price">₹{Number(selected.price).toLocaleString()}</div>
                {selected.description && <p className="modal-desc">{selected.description}</p>}

                {/* SIZES */}
                {Array.isArray(selected.sizes) && selected.sizes.length > 0 ? (
                  <div className="modal-sizes">
                    <div className="modal-sizes-label">SELECT SIZE</div>
                    <div className="modal-sizes-grid">
                      {selected.sizes.map(s => (
                        <button
                          key={s.size}
                          className={'modal-size-btn' + (selectedSize === s.size ? ' active' : '') + (Number(s.stock) === 0 ? ' out' : '')}
                          onClick={() => Number(s.stock) > 0 && setSelectedSize(s.size)}
                          disabled={Number(s.stock) === 0}
                        >
                          <span className="sz-label">{s.size}</span>
                          <span className="sz-stock">{Number(s.stock) > 0 ? s.stock + ' left' : 'Out'}</span>
                        </button>
                      ))}
                    </div>
                    {selectedSize && (
                      <div className="modal-size-selected">Selected: <strong>{selectedSize}</strong></div>
                    )}
                  </div>
                ) : (
                  <div className="modal-no-sizes">
                    {Number(selected.stock) > 0 ? `${selected.stock} in stock` : 'Out of stock'}
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    className="modal-add-btn"
                    onClick={() => handleAddToCart(selected, selectedSize)}
                    disabled={
                      Number(selected.stock) === 0 ||
                      (Array.isArray(selected.sizes) && selected.sizes.length > 0 && !selectedSize)
                    }
                  >
                    {Number(selected.stock) === 0
                      ? 'SOLD OUT'
                      : (Array.isArray(selected.sizes) && selected.sizes.length > 0 && !selectedSize)
                      ? 'SELECT A SIZE FIRST'
                      : 'ADD TO CART'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
