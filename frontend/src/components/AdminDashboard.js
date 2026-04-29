import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function AdminDashboard() {
  const { token, user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', image: '', brand: '', category: '', stock: 0 });

  useEffect(() => {
    if (user?.role === 'admin') {
      axios.get('/api/products').then(res => setProducts(res.data));
    }
  }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post('/api/products', form, { headers: { Authorization: `Bearer ${token}` } });
    const res = await axios.get('/api/products');
    setProducts(res.data);
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <h2>Admin Dashboard</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} />
        <button type="submit">Add Product</button>
      </form>
      <h3>Products</h3>
      <ul>
        {products.map(p => (
          <li key={p.id}>{p.name} (${p.price})</li>
        ))}
      </ul>
    </div>
  );
}
