import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function OrdersPage() {
  const { user, token, loading } = useContext(AuthContext);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user, token]);

  const fetchOrders = async () => {
    setFetching(true);
    try {
      const t = token || localStorage.getItem('token');
      const res = await axios.get('/api/orders', { headers: { Authorization: `Bearer ${t}` } });
      setOrders(res.data);
    } catch (err) {
      console.error('Orders error:', err?.response?.data || err.message);
    }
    setFetching(false);
  };

  if (loading || !user) return <div className="loading">Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <div className="page-title">My Orders</div>
        <div className="page-subtitle" style={{ marginBottom: '1.5rem' }}>Your order history</div>

        {fetching ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-cart">
            <div style={{ fontSize: '3rem' }}>📦</div>
            <div>No orders yet</div>
            <button className="btn-primary" style={{ width: 'auto', marginTop: '1rem', padding: '10px 24px' }} onClick={() => router.push('/')}>Shop Now</button>
          </div>
        ) : (
          orders.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-card-header">
                <div>
                  <div className="order-id">Order #{order.id?.substring(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.82rem', color: '#aaa' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
                <div className="order-total">₹{Number(order.total_amount).toLocaleString()}</div>
              </div>
              {order.shipping_address && (
                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>📍 {order.shipping_address}</div>
              )}
              {order.order_items && order.order_items.length > 0 && (
                <ul className="order-items-list">
                  {order.order_items.map((item, idx) => (
                    <li key={idx}>• {item.quantity}x item — ₹{Number(item.price).toLocaleString()} each</li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

