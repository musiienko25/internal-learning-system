import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/courses';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../lib/api';

export function RegisterPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      const data = await registerUser({ name, email, password });
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
        <h1>Реєстрація</h1>
        <form onSubmit={onSubmit} className="form">
          {error ? <p className="form-error">{error}</p> : null}
          <label className="form-field">
            <span>Ім’я</span>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>Пароль (мін. 6 символів)</span>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Зачекайте…' : 'Створити акаунт'}
          </button>
        </form>
        <p className="auth-card__footer">
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
}
