import { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Navbar from '../components/Navbar';

export default function CartPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { cart, removeFromCart, updateQty, checkout, total } = useContext(CartContext);
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  if (authLoading || !user) return <div className="loading">Loading...</div>;

  const handleCheckout = async () => {
    if (!address.trim()) return setMsg('Please enter your shipping address');
    setLoading(true);
    const res = await checkout(address);
    setLoading(false);
    if (res.success) {
      setMsg('');
      alert('Order placed successfully!');
      router.push('/orders');
    } else {
      setMsg(res.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="cart-container">
        <div className="page-title">Your Cart</div>
        <div className="page-subtitle" style={{ marginBottom: '1.5rem' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div style={{ fontSize: '3rem' }}>🛒</div>
            <div>Your cart is empty</div>
            <button className="btn-primary" style={{ width: 'auto', marginTop: '1rem', padding: '10px 24px' }} onClick={() => router.push('/')}>Continue Shopping</button>
          </div>
        ) : (
          <>
            {cart.map(item => (
              <div className="cart-item" key={item.cartKey}>
                <img src={item.image || 'https://via.placeholder.com/70x70?text=Shoe'} alt={item.name} onError={e => { e.target.src = 'https://via.placeholder.com/70x70?text=Shoe'; }} />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#9a9590' }}>{item.brand}</div>
                  {item.selectedSize && (
                    <div style={{ fontSize: '0.78rem', background: '#1a1a18', color: '#faf9f5', display: 'inline-block', padding: '2px 8px', marginTop: '4px', letterSpacing: '1px' }}>SIZE: {item.selectedSize}</div>
                  )}
                  <div className="cart-item-price">₹{Number(item.price).toLocaleString()}</div>
                </div>
                <div className="cart-qty">
                  <button onClick={() => updateQty(item.cartKey, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.cartKey, item.quantity + 1)}>+</button>
                </div>
                <div style={{ fontWeight: 700, minWidth: '70px', textAlign: 'right' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                <button className="cart-remove" onClick={() => removeFromCart(item.cartKey)} title="Remove">✕</button>
              </div>
            ))}

            <div className="cart-summary">
              <div className="form-group">
                <label>Shipping Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your full delivery address" style={{ width: '100%', padding: '10px', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '1rem' }} />
              </div>
              <div className="cart-total">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              {msg && <div className="error-msg" style={{ marginBottom: '0.8rem' }}>{msg}</div>}
              <button className="btn-checkout" onClick={handleCheckout} disabled={loading}>
                {loading ? 'Placing Order...' : '🛍 Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

