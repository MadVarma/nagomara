import { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const closeMenu = () => setMenuOpen(false);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <Link href="/" className="navbar-brand">NAGOMARA</Link>
        <div className="navbar-links">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <>
                  <Link href="/admin">Dashboard</Link>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>
                    {user.name}<span className="admin-badge">ADMIN</span>
                  </span>
                </>
              ) : (
                <>
                  <Link href="/shop">Shop</Link>
                  <Link href="/orders">My Orders</Link>
                  <Link href="/cart" className="cart-btn">
                    🛒 Cart{cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                  </Link>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>{user.name}</span>
                </>
              )}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/shop">Shop</Link>
              <Link href="/login">Login</Link>
            </>
          )}
        </div>
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>
      {menuOpen && (
        <div className="mobile-nav-menu">
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link href="/admin" onClick={closeMenu}>Dashboard</Link>
              ) : (
                <>
                  <Link href="/shop" onClick={closeMenu}>Shop</Link>
                  <Link href="/orders" onClick={closeMenu}>My Orders</Link>
                  <Link href="/cart" onClick={closeMenu}>
                    🛒 Cart{cartCount > 0 && ` (${cartCount})`}
                  </Link>
                </>
              )}
              <button onClick={() => { closeMenu(); handleLogout(); }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/shop" onClick={closeMenu}>Shop</Link>
              <Link href="/login" onClick={closeMenu}>Login</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

