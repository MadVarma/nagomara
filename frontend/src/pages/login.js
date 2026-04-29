import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../context/AuthContext';

export default function AuthPage() {
  const { login, register } = useContext(AuthContext);
  const router = useRouter();

  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success) {
      router.push(res.user.role === 'admin' ? '/admin' : '/shop');
    } else {
      setError(res.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required');
    setLoading(true);
    const res = await register(form.email, form.password, form.name, 'user', '');
    setLoading(false);
    if (res.success) {
      router.push('/shop');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1><span className="brand">NAGOMARA</span></h1>
        <p style={{ textAlign: 'center', color: '#9a9590', marginTop: '4px', marginBottom: '12px', fontSize: '0.85rem', letterSpacing: '1px' }}>
          Premium Footwear
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Login</button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setError(''); }}>Sign Up</button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            <div className="auth-switch">No account? <span onClick={() => setTab('signup')}>Sign up</span></div>
          </form>
        )}

        {tab === 'signup' && (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Create Account'}</button>
            <div className="auth-switch">Already have an account? <span onClick={() => setTab('login')}>Login</span></div>
          </form>
        )}
      </div>
    </div>
  );
}
