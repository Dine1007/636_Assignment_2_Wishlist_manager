import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="landing">
      <div className="landing-emoji">🎁</div>
      <h1>Gift Wishlist Manager</h1>
      <p>
        Create wishlists, share them with friends, and get the gifts you actually
        want no duplicates, no surprises spoiled. 
      </p>
      {user ? (
        <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
          Go to My Wishlists
        </Link>
      ) : (
        <div className="landing-buttons">
          <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1.05rem' }}>
            Get Started
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '12px 28px', fontSize: '1.05rem' }}>
            Login
          </Link>
        </div>
      )}
    </div>
  );
};

export default Landing;
