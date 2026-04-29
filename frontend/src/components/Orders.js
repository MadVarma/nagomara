import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function Orders() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (token) {
      axios.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setOrders(res.data));
    }
  }, [token]);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Your Orders</h2>
      {orders.length === 0 ? <p>No orders found.</p> : (
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              Order #{order.id} - ${order.totalAmount} - {order.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
