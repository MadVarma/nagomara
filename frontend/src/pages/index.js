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
          <span>✦</span>
          <span>WEEKLY DROPS — DON&apos;T SLEEP</span>
          <span>✦</span>
          <span>100% AUTHENTICATED — DEADSTOCK GUARANTEED</span>
          <span>✦</span>
          <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>
          <span>✦</span>
          <span>WEEKLY DROPS — DON&apos;T SLEEP</span>
          <span>✦</span>
          <span>100% AUTHENTICATED — DEADSTOCK GUARANTEED</span>
          <span>✦</span>
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
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section className="hero-section">
        <div className="hero-sakura-glow" />
        <div className="hero-sakura-glow hero-sakura-glow-2" />
        <div className="hero-split">
          {/* LEFT — IMAGE */}
          <div className="hero-img-col">
            <div className="hero-img-wrap">
              <img
                src="/af23d99f-8bef-4edb-ba43-8c90be4dcd1e.png"
                alt="Nagomara Hero"
                className="hero-img"
              />
              <div className="hero-img-fade" />
            </div>
          </div>
          {/* RIGHT — CONTENT */}
          <div className="hero-content">
            <div className="hero-eyebrow">NAGOMARA 二〇二六 COLLECTION</div>
            <h1 className="hero-title">
              LACE UP.<br />
              <span className="hero-title-accent">STAND OUT.</span>
            </h1>
            <p className="hero-subtitle">
              Street-forged. Sakura-blessed. Every pair dropped here is a piece of culture — not just a shoe.
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
              { name: 'Running', emoji: '🏃', desc: 'Track-tested, street-approved', color: '#f5e8ec' },
              { name: 'Casual', emoji: '👟', desc: 'Low-key drip for every day', color: '#f0e0e8' },
              { name: 'Basketball', emoji: '🏀', desc: 'Hoop culture on your feet', color: '#ede8df' },
              { name: 'Limited', emoji: '🔥', desc: 'Exclusive drops. Cop before they&apos;re gone.', color: '#f5e8ec' },
            ].map(cat => (
              <Link href="/shop" key={cat.name} className="category-card" style={{ background: cat.color }}>
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
          <div className="banner-sub">桜 — THE DROP IS CULTURE</div>
          <p className="banner-desc">
            In Japan, sakura blooms fast and fades faster — just like a heat drop. We carry that same urgency.
            Every pair here is chosen. Authenticated. Worth the cop.
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
              { icon: '✅', title: 'Deadstock Verified', desc: 'Every pair authenticated by our team. No replicas. No compromises.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Cop today, step out in 3–5 days. We move as fast as the culture does.' },
              { icon: '🔄', title: 'Easy Returns', desc: '7-day hassle-free returns. If it doesn\'t feel right, we fix it.' },
              { icon: '🌸', title: 'Sakura Promise', desc: 'Like every cherry blossom — rare, intentional, and worth every second.' },
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
          <div className="section-label" style={{ color: '#c9a96e' }}>DON&apos;T MISS THE DROP</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a18', margin: '0.3rem 0 0.7rem', fontFamily: "'Shippori Mincho', serif", letterSpacing: '2px' }}>GET DROP ALERTS</h2>
          <p style={{ color: '#7a7670', marginBottom: '1.5rem' }}>Be first in line when new pairs land. Exclusive access. No bots. Just culture.</p>
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
            <p style={{ color: '#888', fontSize: '0.88rem', lineHeight: 1.7 }}>
              Born from the streets of Tokyo. Built for those who move with purpose.
              Cop the culture. Wear the story.
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
          <span>桜 · DROP THE CULTURE · STEP INTO GREATNESS</span>
        </div>
      </footer>
    </div>
  );
}
