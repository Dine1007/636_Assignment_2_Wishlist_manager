import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎁 Gift Wishlist
      </Link>
      <div className="navbar-links">
        {user ? (
          <>
            <span style={{ color: '#6b3a3a', fontWeight: '600' }}>Welcome, {user.name}</span>
            <Link to="/dashboard">My Wishlists</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
