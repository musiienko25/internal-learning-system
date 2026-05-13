import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <Link to="/courses">Навчання</Link>
      </div>
      <nav className="app-header__nav">
        <NavLink to="/courses" end>
          Каталог
        </NavLink>
        <NavLink to="/my-courses">Мої курси</NavLink>
      </nav>
      <div className="app-header__user">
        <span className="app-header__name">{user?.name}</span>
        <button type="button" className="btn btn--ghost" onClick={handleLogout}>
          Вийти
        </button>
      </div>
    </header>
  );
}
