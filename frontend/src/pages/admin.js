import { useState, useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const CATEGORIES = ['Running', 'Casual', 'Basketball', 'Limited', 'Formal', 'Sports', 'Outdoor'];
const ADMIN_CODES = ['#ADM1', '#ADM2', '#ADM3', '#ADM4', '#ADM5'];
const DEFAULT_FORM = { name: '', description: '', price: '', brand: '', category: '', stock: '', sizes: [], images: [] };

export default function AdminPage() {
  const { user, token, loading, login } = useContext(AuthContext);
  const router = useRouter();

  // --- CODE GATE STATE ---
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  // --- ADMIN LOGIN STATE (shown after code verified) ---
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  // --- DASHBOARD STATE ---
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [sizeInput, setSizeInput] = useState({ size: '', stock: '' });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [catFilter, setCatFilter] = useState('all');

  // --- IMAGE UPLOAD STATE ---
  const [imageFiles, setImageFiles] = useState([]);          // File[] pending upload
  const [imagePreviews, setImagePreviews] = useState([]);    // blob URLs for preview
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  // Check if already logged in as admin — skip gate
  useEffect(() => {
    if (!loading && user && user.role === 'admin') {
      setCodeVerified(true);
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && user.role === 'admin' && !loading) {
      fetchProducts(); fetchOrders(); fetchUsers();
    }
  }, [user, loading]);

  const getToken = () => token || (typeof window !== 'undefined' ? localStorage.getItem('token') : '');
  const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

  // --- VERIFY CODE ---
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (ADMIN_CODES.includes(codeInput.trim().toUpperCase())) {
      setCodeVerified(true);
      setCodeError('');
    } else {
      setCodeError('Invalid admin code. Please try again.');
    }
  };

  // --- ADMIN LOGIN (after code gate) ---
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    setAdminLoginLoading(true);
    const res = await login(adminEmail, adminPassword);
    setAdminLoginLoading(false);
    if (res.success) {
      if (res.user.role !== 'admin') {
        setAdminLoginError('This account does not have admin access.');
        // log them back out
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      setAdminLoginError(res.message || 'Login failed');
    }
  };

  // --- FETCH ---
  const fetchProducts = async () => {
    try { const res = await axios.get('/api/products'); setProducts(res.data || []); } catch {}
  };
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get('/api/orders/all', authHeader());
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch {}
    setOrdersLoading(false);
  };
  const fetchUsers = async () => {
    try { const res = await axios.get('/api/orders/users', authHeader()); setUsers(res.data || []); } catch {}
  };

  // --- IMAGE HANDLING ---
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewImage = (idx) => {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (url) => {
    setForm(f => ({ ...f, images: f.images.filter(u => u !== url) }));
  };

  const uploadImages = async () => {
    if (!imageFiles.length) return [];
    setUploadingImages(true);
    const data = new FormData();
    imageFiles.forEach(f => data.append('images', f));
    try {
      const res = await axios.post('/api/products/upload', data, {
        headers: { ...authHeader().headers, 'Content-Type': 'multipart/form-data' }
      });
      return res.data.urls || [];
    } catch (err) {
      setError('Image upload failed: ' + (err.response?.data?.message || err.message));
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  // --- SIZES ---
  const addSize = () => {
    if (!sizeInput.size || !sizeInput.stock) return;
    const existing = form.sizes.find(s => s.size === sizeInput.size);
    if (existing) {
      setForm(f => ({ ...f, sizes: f.sizes.map(s => s.size === sizeInput.size ? { ...s, stock: Number(sizeInput.stock) } : s) }));
    } else {
      setForm(f => ({ ...f, sizes: [...f.sizes, { size: sizeInput.size, stock: Number(sizeInput.stock) }] }));
    }
    setSizeInput({ size: '', stock: '' });
  };
  const removeSize = (sz) => setForm(f => ({ ...f, sizes: f.sizes.filter(s => s.size !== sz) }));

  // --- PRODUCT FORM ---
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    // Upload any newly selected images first
    const newUrls = await uploadImages();
    const allImages = [...(form.images || []), ...newUrls];
    const totalSizeStock = form.sizes.reduce((sum, s) => sum + Number(s.stock), 0);
    const payload = {
      ...form,
      images: allImages,
      image: allImages[0] || '',
      stock: totalSizeStock > 0 ? totalSizeStock : Number(form.stock)
    };
    try {
      if (editId) {
        await axios.put(`/api/products/${editId}`, payload, authHeader());
        setMsg('Product updated!');
        setEditId(null);
      } else {
        await axios.post('/api/products', payload, authHeader());
        setMsg('Product added!');
      }
      setForm(DEFAULT_FORM);
      setImageFiles([]);
      setImagePreviews([]);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    setForm({
      name: p.name || '', description: p.description || '', price: p.price || '',
      brand: p.brand || '', category: p.category || '', stock: p.stock || '',
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      images: imgs
    });
    setImageFiles([]);
    setImagePreviews([]);
    setTab('products');
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/products/${id}`, authHeader());
      setMsg('Product deleted.');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(DEFAULT_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setMsg(''); setError('');
  };

  // --- ORDER ACTIONS ---
  const acceptOrder = async (id) => {
    try { await axios.put(`/api/orders/${id}/status`, { status: 'shipped' }, authHeader()); fetchOrders(); } catch {}
  };
  const declineOrder = async (id) => {
    if (!confirm('Decline and remove this order?')) return;
    try { await axios.delete(`/api/orders/${id}`, authHeader()); fetchOrders(); } catch {}
  };
  const updateStatus = async (id, status) => {
    try { await axios.put(`/api/orders/${id}/status`, { status }, authHeader()); fetchOrders(); } catch {}
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['shipped', 'completed'].includes(o.status));
  const filteredProducts = catFilter === 'all' ? products : products.filter(p => p.category === catFilter);

  // ========== RENDER GATES ==========

  // 1. Still loading auth
  if (loading) return <div className="loading">Loading...</div>;

  // 2. Code not yet verified — show code entry screen
  if (!codeVerified) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="brand" style={{ fontSize: '1.6rem', letterSpacing: '6px' }}>NAGOMARA</div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '4px', color: '#c9a96e', marginTop: '6px' }}>ADMIN ACCESS</div>
          </div>
          <div style={{ background: '#f5f2eb', border: '1px solid #e5e1d8', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#7a7672', lineHeight: 1.6 }}>
            This area is restricted to authorised administrators only. Enter your admin access code to continue.
          </div>
          <form onSubmit={handleCodeSubmit}>
            <div className="form-group">
              <label>Admin Code</label>
              <input
                type="text"
                placeholder="#ADM1"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                style={{ letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase' }}
                required
              />
            </div>
            {codeError && <div className="error-msg">{codeError}</div>}
            <button className="btn-primary" type="submit" style={{ marginTop: '0.5rem' }}>Verify Code</button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: '#bbb8b2' }}>
            Not an admin? <span style={{ cursor: 'pointer', color: '#c9a96e' }} onClick={() => router.push('/login')}>Go to login</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Code verified but not logged in — show admin login form
  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="brand" style={{ fontSize: '1.6rem', letterSpacing: '6px' }}>NAGOMARA</div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '4px', color: '#c9a96e', marginTop: '6px' }}>ADMIN LOGIN</div>
          </div>
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Admin Email</label>
              <input type="email" placeholder="admin@nagomara.com" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required />
            </div>
            {adminLoginError && <div className="error-msg">{adminLoginError}</div>}
            <button className="btn-primary" type="submit" disabled={adminLoginLoading}>
              {adminLoginLoading ? 'Logging in...' : 'Login to Dashboard'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: '#bbb8b2' }}>
            Wrong code? <span style={{ cursor: 'pointer', color: '#c9a96e' }} onClick={() => { setCodeVerified(false); setCodeInput(''); }}>Re-enter code</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Logged in but not admin
  if (user.role !== 'admin') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div style={{ textAlign: 'center', color: '#8b2635', fontWeight: 700 }}>Access Denied</div>
          <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.88rem', color: '#7a7672' }}>This account does not have admin privileges.</div>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => router.push('/shop')}>Go to Shop</button>
        </div>
      </div>
    );
  }

  // ========== DASHBOARD ==========
  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="section-header" style={{ marginBottom: '1.5rem' }}>
          <div>
            <div className="page-title">Admin Dashboard</div>
            <div className="page-subtitle">Manage your Nagomara store</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { label: 'PRODUCTS', value: products.length, color: '#1a1a18' },
              { label: 'PENDING', value: pendingOrders.length, color: '#c9a96e' },
              { label: 'USERS', value: users.length, color: '#2e6b45' },
            ].map(s => (
              <div key={s.label} style={{ background: '#f5f2eb', padding: '12px 20px', border: '1px solid #e5e1d8', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: '#9a9590' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-tabs">
          {[['products', `Products (${products.length})`], ['pending', `Pending (${pendingOrders.length})`], ['active', `Active Orders (${activeOrders.length})`], ['users', `Users (${users.length})`]].map(([key, label]) => (
            <button key={key} className={`admin-tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {/* ---- PRODUCTS TAB ---- */}
        {tab === 'products' && (
          <div>
            <div className="admin-form" style={{ marginBottom: '2rem' }}>
              <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Nike Air Max" required />
                  </div>
                  <div className="form-group">
                    <label>Brand</label>
                    <input name="brand" value={form.brand} onChange={handleChange} placeholder="Nike" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input name="description" value={form.description} onChange={handleChange} placeholder="Product description..." />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="2999" required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* ---- MULTI-IMAGE UPLOAD ---- */}
                <div style={{ margin: '1rem 0', background: '#faf9f5', border: '1px solid #e5e1d8', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.8rem', fontSize: '0.88rem', letterSpacing: '1px' }}>PRODUCT IMAGES</div>

                  {/* Existing images */}
                  {form.images.length > 0 && (
                    <div style={{ marginBottom: '0.8rem' }}>
                      <div style={{ fontSize: '0.72rem', letterSpacing: '1px', color: '#9a9590', marginBottom: '0.4rem' }}>CURRENT IMAGES</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {form.images.map((url, i) => (
                          <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                            <img src={url} alt={`img-${i}`} style={{ width: '80px', height: '80px', objectFit: 'cover', border: i === 0 ? '2px solid #c9a96e' : '1px solid #e5e1d8' }}
                              onError={e => { e.target.style.display = 'none'; }} />
                            {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(201,169,110,0.9)', fontSize: '0.5rem', textAlign: 'center', color: '#fff', fontWeight: 700, padding: '2px' }}>MAIN</div>}
                            <button type="button" onClick={() => removeExistingImage(url)}
                              style={{ position: 'absolute', top: 2, right: 2, background: '#8b2635', border: 'none', color: '#fff', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.7rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#9a9590', marginTop: '4px' }}>Gold border = main/display image</div>
                    </div>
                  )}

                  {/* New image previews */}
                  {imagePreviews.length > 0 && (
                    <div style={{ marginBottom: '0.8rem' }}>
                      <div style={{ fontSize: '0.72rem', letterSpacing: '1px', color: '#9a9590', marginBottom: '0.4rem' }}>NEW IMAGES (will upload on save)</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {imagePreviews.map((url, i) => (
                          <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                            <img src={url} alt={`new-${i}`} style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px dashed #c9a96e' }} />
                            <button type="button" onClick={() => removeNewImage(i)}
                              style={{ position: 'absolute', top: 2, right: 2, background: '#8b2635', border: 'none', color: '#fff', width: '18px', height: '18px', cursor: 'pointer', fontSize: '0.7rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload button */}
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageSelect} />
                  <button type="button" onClick={() => fileInputRef.current.click()}
                    style={{ padding: '10px 20px', border: '1.5px dashed #c9a96e', background: '#fff', color: '#7a7672', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem', letterSpacing: '1px' }}>
                    + Upload Images
                  </button>
                  <span style={{ fontSize: '0.72rem', color: '#9a9590', marginLeft: '0.8rem' }}>JPG, PNG, WEBP — max 8MB each — up to 10 images</span>
                </div>

                {/* SIZES */}
                <div style={{ margin: '1rem 0', background: '#faf9f5', border: '1px solid #e5e1d8', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.8rem', fontSize: '0.88rem', letterSpacing: '1px' }}>SIZES & AVAILABILITY</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                    <input placeholder="Size (e.g. UK7)" value={sizeInput.size}
                      onChange={e => setSizeInput(s => ({ ...s, size: e.target.value }))}
                      style={{ padding: '8px 12px', border: '1px solid #d5d1c8', background: '#fff', width: '120px', fontFamily: 'inherit' }} />
                    <input placeholder="Stock qty" type="number" value={sizeInput.stock}
                      onChange={e => setSizeInput(s => ({ ...s, stock: e.target.value }))}
                      style={{ padding: '8px 12px', border: '1px solid #d5d1c8', background: '#fff', width: '100px', fontFamily: 'inherit' }} />
                    <button type="button" className="btn-submit" style={{ marginTop: 0 }} onClick={addSize}>Add Size</button>
                  </div>
                  {form.sizes.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {form.sizes.map(s => (
                        <div key={s.size} style={{ background: '#1a1a18', color: '#faf9f5', padding: '4px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{s.size}</span><span style={{ color: '#c9a96e' }}>{s.stock} pcs</span>
                          <button type="button" onClick={() => removeSize(s.size)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.sizes.length === 0 && (
                    <div className="form-group" style={{ marginBottom: 0, marginTop: '0.5rem' }}>
                      <label>Total Stock (if no sizes)</label>
                      <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="50" style={{ width: '160px' }} />
                    </div>
                  )}
                </div>

                {msg && <div className="success-msg">{msg}</div>}
                {error && <div className="error-msg">{error}</div>}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-submit" type="submit" disabled={uploadingImages}>
                    {uploadingImages ? 'Uploading images...' : editId ? 'Update Product' : 'Add Product'}
                  </button>
                  {editId && <button className="btn-submit" type="button" style={{ background: '#9a9590' }} onClick={cancelEdit}>Cancel</button>}
                </div>
              </form>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {['all', ...CATEGORIES].map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  style={{ padding: '6px 14px', border: '1px solid #e5e1d8', background: catFilter === c ? '#1a1a18' : '#fff', color: catFilter === c ? '#faf9f5' : '#7a7672', fontSize: '0.78rem', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Images</th><th>Name</th><th>Category</th><th>Price</th><th>Sizes / Stock</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#bbb', padding: '2rem' }}>No products.</td></tr>
                  ) : filteredProducts.map(p => {
                    const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {imgs.slice(0, 3).map((img, i) => (
                              <img key={i} className="product-img-preview" src={img} alt={p.name}
                                style={{ width: '50px', height: '40px', objectFit: 'cover', border: i === 0 ? '1.5px solid #c9a96e' : '1px solid #e5e1d8' }}
                                onError={e => { e.target.style.display = 'none'; }} />
                            ))}
                            {imgs.length > 3 && <div style={{ width: '50px', height: '40px', background: '#f5f2eb', border: '1px solid #e5e1d8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#9a9590' }}>+{imgs.length - 3}</div>}
                          </div>
                        </td>
                        <td><strong>{p.name}</strong><br /><span style={{ color: '#bbb', fontSize: '0.78rem' }}>{p.brand}</span></td>
                        <td>{p.category}</td>
                        <td>₹{Number(p.price).toLocaleString()}</td>
                        <td>
                          {Array.isArray(p.sizes) && p.sizes.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {p.sizes.map(s => (
                                <span key={s.size} style={{ background: '#f5f2eb', border: '1px solid #e5e1d8', padding: '2px 6px', fontSize: '0.72rem' }}>{s.size}: {s.stock}</span>
                              ))}
                            </div>
                          ) : <span style={{ color: p.stock > 0 ? '#2e6b45' : '#8b2635', fontWeight: 700 }}>{p.stock}</span>}
                        </td>
                        <td style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn-submit" style={{ padding: '5px 12px', fontSize: '0.78rem', marginTop: 0 }} onClick={() => handleEdit(p)}>Edit</button>
                          <button className="btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---- PENDING ORDERS TAB ---- */}
        {tab === 'pending' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '1px' }}>PENDING ORDERS</div>
              <button className="btn-submit" style={{ marginTop: 0 }} onClick={fetchOrders}>Refresh</button>
            </div>
            {ordersLoading ? <div className="loading">Loading...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingOrders.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#bbb', border: '1px solid #e5e1d8' }}>No pending orders.</div>
                ) : pendingOrders.map(o => (
                  <div key={o.id} style={{ background: '#fff', border: '1px solid #e5e1d8', padding: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '1px' }}>ORDER #{o.id?.substring(0, 8).toUpperCase()}</div>
                        <div style={{ fontSize: '0.78rem', color: '#9a9590', marginTop: '2px' }}>{new Date(o.created_at).toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c9a96e' }}>₹{Number(o.total_amount).toLocaleString()}</div>
                        <span className="status-badge status-pending">PENDING</span>
                      </div>
                    </div>
                    {o.user && (
                      <div style={{ background: '#faf9f5', border: '1px solid #e5e1d8', padding: '0.8rem', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
                        <strong>{o.user.name}</strong> · {o.user.email} {o.user.phone && `· ${o.user.phone}`}
                        {o.shipping_address && <div style={{ color: '#7a7672', marginTop: '2px' }}>📍 {o.shipping_address}</div>}
                      </div>
                    )}
                    {o.order_items?.length > 0 && (
                      <div style={{ fontSize: '0.82rem', color: '#7a7672', marginBottom: '0.8rem' }}>
                        {o.order_items.map((item, i) => <span key={i} style={{ marginRight: '8px' }}>• {item.product_id?.substring(0, 6)} × {item.quantity}{item.size ? ` (${item.size})` : ''}</span>)}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button onClick={() => acceptOrder(o.id)} style={{ padding: '8px 24px', background: '#2e6b45', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'inherit' }}>✓ ACCEPT</button>
                      <button onClick={() => declineOrder(o.id)} style={{ padding: '8px 24px', background: '#8b2635', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '1px', cursor: 'pointer', fontFamily: 'inherit' }}>✕ DECLINE</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- ACTIVE ORDERS TAB ---- */}
        {tab === 'active' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '1px' }}>ACTIVE ORDERS — Shipped & Completed</div>
              <button className="btn-submit" style={{ marginTop: 0 }} onClick={fetchOrders}>Refresh</button>
            </div>
            {ordersLoading ? <div className="loading">Loading...</div> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Order</th><th>Customer</th><th>Address</th><th>Total</th><th>Status</th><th>Date</th><th>Update</th></tr>
                  </thead>
                  <tbody>
                    {activeOrders.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: '#bbb', padding: '2rem' }}>No active orders.</td></tr>
                    ) : activeOrders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontSize: '0.78rem', color: '#9a9590' }}>#{o.id?.substring(0, 8).toUpperCase()}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{o.user?.name || '—'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#9a9590' }}>{o.user?.email}</div>
                          {o.user?.phone && <div style={{ fontSize: '0.75rem', color: '#9a9590' }}>{o.user.phone}</div>}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: '#7a7672', maxWidth: '160px' }}>{o.shipping_address}</td>
                        <td style={{ fontWeight: 700, color: '#c9a96e' }}>₹{Number(o.total_amount).toLocaleString()}</td>
                        <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                        <td style={{ fontSize: '0.78rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                        <td>
                          <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                            style={{ padding: '4px 8px', border: '1px solid #d5d1c8', fontSize: '0.82rem', background: '#faf9f5', fontFamily: 'inherit' }}>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---- USERS TAB ---- */}
        {tab === 'users' && (
          <div>
            <div style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1rem', letterSpacing: '1px' }}>REGISTERED USERS</div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Role</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', color: '#bbb', padding: '2rem' }}>No users.</td></tr>
                  ) : users.map((u, i) => (
                    <tr key={u.id}>
                      <td style={{ color: '#9a9590', fontSize: '0.78rem' }}>{i + 1}</td>
                      <td><strong>{u.name}</strong></td>
                      <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                      <td style={{ fontSize: '0.85rem', color: '#7a7672' }}>{u.phone || '—'}</td>
                      <td style={{ fontSize: '0.78rem', color: '#7a7672', maxWidth: '180px' }}>{u.address || '—'}</td>
                      <td><span className={`status-badge ${u.role === 'admin' ? 'status-shipped' : 'status-completed'}`}>{u.role}</span></td>
                      <td style={{ fontSize: '0.78rem', color: '#9a9590' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
