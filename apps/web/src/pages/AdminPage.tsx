import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminStats } from '../api/admin';
import { ApiError } from '../lib/api';

const STORAGE_KEY = 'ils_admin_key';

export function AdminPage() {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) ?? '',
  );
  const [stats, setStats] = useState<{
    users: number;
    courses: number;
    enrollments: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadStats() {
    setError(null);
    setLoading(true);
    setStats(null);
    sessionStorage.setItem(STORAGE_KEY, adminKey);
    try {
      const data = await fetchAdminStats(adminKey);
      setStats(data);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError('Network error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 440 }}>
        <h1>Admin</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Minimal dashboard: counts from the database. Set{' '}
          <code>ADMIN_API_KEY</code> on the API (see <code>.env.example</code>
          ). Send the same value in the header <code>X-Admin-Key</code>.
        </p>
        <div className="form">
          <label className="form-field">
            <span>Admin API key</span>
            <input
              id="admin-key"
              name="adminKey"
              type="password"
              autoComplete="off"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button
            type="button"
            className="btn btn--primary"
            disabled={loading || !adminKey.trim()}
            onClick={() => void loadStats()}
          >
            {loading ? 'Loading…' : 'Load stats'}
          </button>
        </div>
        {stats ? (
          <ul className="admin-stats" style={{ marginTop: '1rem' }}>
            <li>
              <strong>Users</strong>: {stats.users}
            </li>
            <li>
              <strong>Courses</strong>: {stats.courses}
            </li>
            <li>
              <strong>Enrollments</strong>: {stats.enrollments}
            </li>
          </ul>
        ) : null}
        <p className="auth-card__footer">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
