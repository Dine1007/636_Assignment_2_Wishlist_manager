import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const ShareWishlist = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await axiosInstance.get(`/api/wishlists/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setWishlist(response.data.wishlist);
      } catch (error) {
        alert('Failed to load wishlist.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user, id, navigate]);

  const shareUrl = wishlist
    ? `${window.location.origin}/shared/${wishlist.shareLink}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!wishlist) return <div className="loading">Wishlist not found.</div>;

  return (
    <div className="container">
      <div className="card">
        <div className="share-section">
          <h1 style={{ color: '#6b3a3a', fontSize: '1.5rem', marginBottom: '8px' }}>
            🔗 Share Wishlist
          </h1>
          <p style={{ color: '#7a5c5c', marginBottom: '16px' }}>
            Share this link with your friends so they can view and reserve items from
            <strong> "{wishlist.name}"</strong>.
          </p>

          <div className="share-link-box">{shareUrl}</div>

          <button onClick={handleCopy} className="btn btn-primary" style={{ padding: '12px 32px' }}>
            {copied ? '✅ Link Copied!' : '📋 Copy Link'}
          </button>

          <p style={{ color: '#7a5c5c', marginTop: '20px', fontSize: '0.85rem' }}>
            Friends can view your wishlist without logging in. They only need to register
            and log in when they want to reserve an item.
          </p>
        </div>
      </div>

      <div className="text-center mt-3">
        <button onClick={() => navigate(`/wishlist/${id}`)} className="btn btn-outline">
          ← Back to Wishlist
        </button>
      </div>
    </div>
  );
};

export default ShareWishlist;
