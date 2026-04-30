import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Landing() {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const router = useRouter();
  const [featured, setFeatured] = useState([]);
  const [added, setAdded] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    axios.get('/api/products').then(res => setFeatured((res.data || []).slice(0, 4))).catch(() => {});
  }, []);

  const handleAddToCart = (product) => {
    if (!user) { router.push('/login'); return; }
    addToCart(product);
    setAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded(prev => ({ ...prev, [product.id]: false })), 1200);
  };

  return (
    <div className="landing-page">

      {/* ---- ANNOUNCEMENT BAR ---- */}
      <div className="announcement-bar">
        <div className="announcement-track">
          <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>
          <span>刀</span>
          <span>WEEKLY DROPS — STRIKE BEFORE THEY VANISH</span>
          <span>刀</span>
          <span>100% AUTHENTICATED — WARRIOR STANDARDS ONLY</span>
          <span>刀</span>
          <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>
          <span>刀</span>
          <span>WEEKLY DROPS — STRIKE BEFORE THEY VANISH</span>
          <span>刀</span>
          <span>100% AUTHENTICATED — WARRIOR STANDARDS ONLY</span>
          <span>刀</span>
        </div>
      </div>

      {/* ---- NAVBAR ---- */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link href="/" className="nagomara-brand">NAGOMARA</Link>
          <div className="landing-nav-links">
            <Link href="/shop">Shop</Link>
            <Link href="/login">Login</Link>
            {user && <Link href={user.role === 'admin' ? '/admin' : '/shop'} className="nav-cta-btn">Dashboard →</Link>}
            {!user && <Link href="/login" className="nav-cta-btn">Cop Now →</Link>}
          </div>
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-nav-menu">
            <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            {user && <Link href={user.role === 'admin' ? '/admin' : '/shop'} onClick={() => setMenuOpen(false)}>Dashboard</Link>}
            {!user && <Link href="/login" onClick={() => setMenuOpen(false)}>Cop Now</Link>}
          </div>
        )}
      </nav>

      {/* ---- HERO ---- */}
      <section className="hero-section">
        <div className="hero-sakura-glow" />
        <div className="hero-sakura-glow hero-sakura-glow-2" />
        <div className="hero-split">
          <div className="hero-content">
            <div className="hero-mon">⚔ 刀 ⚔</div>
            <div className="hero-eyebrow">NAGOMARA 二〇二六 · 武士の道</div>
            <h1 className="hero-title">
              WALK WITH<br />
              <span className="hero-title-accent">HONOR.</span>
            </h1>
            <p className="hero-subtitle">
              Forged in the spirit of the samurai. Every pair is a statement of discipline, power, and the relentless pursuit of mastery.
            </p>
            <div className="hero-btns">
              <Link href="/shop" className="hero-btn-primary">SHOP THE DROP</Link>
              <Link href="/login" className="hero-btn-secondary">JOIN THE CULTURE</Link>
            </div>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>SCROLL</span>
          <div className="hero-scroll-line" />
        </div>
      </section>

      {/* ---- BRANDS MARQUEE ---- */}
      <div className="brands-marquee">
        <div className="brands-track">
          {['NIKE', 'ADIDAS', 'PUMA', 'NEW BALANCE', 'JORDAN', 'ASICS', 'REEBOK', 'VANS', 'CONVERSE', 'SKECHERS',
            'NIKE', 'ADIDAS', 'PUMA', 'NEW BALANCE', 'JORDAN', 'ASICS', 'REEBOK', 'VANS', 'CONVERSE', 'SKECHERS']
            .map((b, i) => (
              <span key={i} className="brand-pill">{b}</span>
            ))}
        </div>
      </div>

      {/* ---- CATEGORIES ---- */}
      <section className="categories-section">
        <div className="section-container">
          <div className="section-label">BROWSE THE LINEUP</div>
          <h2 className="section-title">PICK YOUR LANE</h2>
          <div className="categories-grid">
            {[
              { name: 'Running', emoji: '⚔️', desc: 'Precision-engineered for every stride', color: null },
              { name: 'Casual', emoji: '🀄', desc: 'Understated power. Everyday mastery', color: null },
              { name: 'Basketball', emoji: '🏯', desc: 'Court-forged. Battle-ready grip', color: null },
              { name: 'Limited', emoji: '🎌', desc: 'Rare drops. Cop before they vanish.', color: null },
            ].map(cat => (
              <Link href="/shop" key={cat.name} className="category-card">
                <div className="category-emoji">{cat.emoji}</div>
                <div className="category-name">{cat.name}</div>
                <div className="category-desc">{cat.desc}</div>
                <div className="category-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURED PRODUCTS ---- */}
      {featured.length > 0 && (
        <section className="featured-section">
          <div className="section-container">
            <div className="section-header-row">
              <div>
                <div className="section-label">JUST DROPPED</div>
                <h2 className="section-title">LATEST HEAT</h2>
              </div>
              <Link href="/shop" className="view-all-btn">VIEW ALL →</Link>
            </div>
            <div className="featured-grid">
              {featured.map(product => (
                <div className="featured-card" key={product.id}>
                  <div className="featured-card-img-wrap">
                    <img
                      src={product.image || 'https://via.placeholder.com/400x300?text=NAGOMARA'}
                      alt={product.name}
                      onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=NAGOMARA'; }}
                    />
                    {product.stock <= 5 && product.stock > 0 && <div className="featured-tag">LOW STOCK</div>}
                    {product.stock === 0 && <div className="featured-tag sold-out-tag">SOLD OUT</div>}
                  </div>
                  <div className="featured-card-body">
                    <div className="featured-brand">{product.brand || 'NAGOMARA'}</div>
                    <div className="featured-name">{product.name}</div>
                    <div className="featured-footer">
                      <div className="featured-price">₹{Number(product.price).toLocaleString()}</div>
                      <button
                        className="featured-add-btn"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        {added[product.id] ? '✓' : product.stock === 0 ? '—' : '+'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- BANNER STRIP ---- */}
      <section className="banner-strip">
        <div className="banner-strip-content">
          <div className="banner-big-text">NAGOMARA</div>
          <div className="banner-sub">刀 — THE WAY OF THE WARRIOR</div>
          <p className="banner-desc">
            In bushido, the samurai lived by a code of honor, discipline, and relentless dedication — just like every pair we carry. Chosen. Authenticated. Worth the cop.
          </p>
          <Link href="/shop" className="hero-btn-primary">EXPLORE THE DROP</Link>
        </div>
      </section>

      {/* ---- WHY NAGOMARA ---- */}
      <section className="why-section">
        <div className="section-container">
          <div className="section-label">WHY WE&apos;RE DIFFERENT</div>
          <h2 className="section-title">THE NAGOMARA CODE</h2>
          <div className="why-grid">
            {[
              { icon: '⚔️', title: 'Battle-Tested Quality', desc: 'Every pair authenticated by our team. No replicas. No compromises. Warrior standards only.' },
              { icon: '🎌', title: 'Swift Delivery', desc: 'Cop today, step out in 3–5 days. We move with the precision and speed of a samurai.' },
              { icon: '⛩️', title: 'Honor Code Returns', desc: '7-day hassle-free returns. Our code of honor means we stand behind every pair.' },
              { icon: '🌸', title: 'Sakura Promise', desc: 'Like the cherry blossom — rare, intentional, and worth every second of the wait.' },
            ].map(item => (
              <div className="why-card" key={item.title}>
                <div className="why-icon">{item.icon}</div>
                <div className="why-title">{item.title}</div>
                <div className="why-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- NEWSLETTER ---- */}
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <div className="section-label" style={{ color: '#c9a96e' }}>HONOR THE DROP</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#f0ead8', margin: '0.3rem 0 0.7rem', fontFamily: "'Shippori Mincho', serif", letterSpacing: '2px' }}>FIRST WARRIOR IN LINE</h2>
          <p style={{ color: '#8a8478', marginBottom: '1.5rem' }}>Be first when new pairs land. Exclusive access. No bots. Warrior code only.</p>
          <form className="newsletter-form" onSubmit={e => { e.preventDefault(); alert('You\'re in. We\'ll hit you when it drops.'); }}>
            <input type="email" placeholder="your@email.com" required />
            <button type="submit">NOTIFY ME</button>
          </form>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="nagomara-brand" style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>NAGOMARA</div>
            <p style={{ color: '#8a8478', fontSize: '0.88rem', lineHeight: 1.7 }}>
              Born from the ancient spirit of the samurai. Built for those who move with purpose and precision.
              Cop the culture. Wear the honor.
            </p>
            <div className="footer-socials">
              <span>IG</span><span>TW</span><span>YT</span>
            </div>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">SHOP</div>
            <Link href="/shop">All Drops</Link>
            <Link href="/shop">New Arrivals</Link>
            <Link href="/shop">Best Sellers</Link>
            <Link href="/shop">Limited</Link>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">SUPPORT</div>
            <span>FAQs</span>
            <span>Shipping & Delivery</span>
            <span>Returns & Exchanges</span>
            <span>Contact Us</span>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-title">ACCOUNT</div>
            <Link href="/login">Login</Link>
            <Link href="/login">Register</Link>
            <Link href="/orders">My Orders</Link>
            <Link href="/cart">Cart</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 NAGOMARA. ALL RIGHTS RESERVED.</span>
          <span>刀 · HONOR THE CRAFT · WALK WITH PURPOSE</span>
        </div>
      </footer>
    </div>
  );
}
