import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid username or password');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-wrap">
      <div style={{ width: 340 }}>
        <div className="login-toggle">
          <span className="login-toggle-active">Warehouse Manager</span>
          <Link to="/request" className="login-toggle-inactive">Request Materials</Link>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <h1>Warehouse Manager</h1>
          <p>Sign in to continue</p>

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: -4, marginBottom: 14 }}>
              {error}
            </p>
          )}

          <button className="btn" type="submit" style={{ width: '100%' }}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
