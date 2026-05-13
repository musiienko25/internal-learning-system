import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/courses';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../lib/api';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/courses" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      login({ token: data.token, user: data.user });
      navigate('/courses', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Немає зв’язку з сервером');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Вхід</h1>
        <form onSubmit={onSubmit} className="form">
          {error ? <p className="form-error">{error}</p> : null}
          <label className="form-field">
            <span>Email</span>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>Пароль</span>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Зачекайте…' : 'Увійти'}
          </button>
        </form>
        <p className="auth-card__footer">
          Немає акаунта? <Link to="/register">Зареєструватись</Link>
          {' · '}
          <Link to="/admin">Admin</Link>
        </p>
      </div>
    </div>
  );
}
