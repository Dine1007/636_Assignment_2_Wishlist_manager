import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const GuestView = () => {
  const { user } = useAuth();
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

				   
						  
				  

  const fetchSharedWishlist = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/wishlists/share/${shareLink}`);
      setWishlist(response.data.wishlist);
      setItems(response.data.items);
    } catch (err) {
      setError('Wishlist not found or the link is invalid.');
    } finally {
      setLoading(false);
    }
  }, [shareLink]);

  useEffect(() => {
    fetchSharedWishlist();
  }, [fetchSharedWishlist]);

  const handleReserve = async (itemId) => {
    if (!user) {
      // Redirect to register, then come back
      navigate('/register', { state: { redirectTo: `/shared/${shareLink}` } });
      return;
    }
    setActionLoading(itemId);
    try {
      const response = await axiosInstance.put(
        `/api/wishlists/items/${itemId}/reserve`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setItems(items.map((item) => (item._id === itemId ? response.data : item)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reserve item.');
    } finally {
      setActionLoading('');
    }
  };

  const handleUnreserve = async (itemId) => {
    setActionLoading(itemId);
    try {
      await axiosInstance.put(
        `/api/wishlists/items/${itemId}/unreserve`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Response won't have populated fields, refetch to get updated data
      await fetchSharedWishlist();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to un-reserve item.');
    } finally {
      setActionLoading('');
    }
  };

  const handlePurchase = async (itemId) => {
    if (!window.confirm('Mark this item as purchased? This action is permanent.')) return;
    setActionLoading(itemId);
    try {
      const response = await axiosInstance.put(
        `/api/wishlists/items/${itemId}/purchase`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setItems(items.map((item) => (item._id === itemId ? response.data : item)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as purchased.');
    } finally {
      setActionLoading('');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="badge badge-available">Available</span>;
      case 'reserved':
        return <span className="badge badge-reserved">Reserved</span>;
      case 'purchased':
        return <span className="badge badge-purchased">Purchased</span>;
      default:
        return null;
    }
  };

  const renderItemActions = (item) => {
    // Purchased items are permanently closed - no actions
    if (item.status === 'purchased') {
      return <p style={{ color: '#922b21', fontSize: '0.85rem', margin: 0 }}>✅ This item has been purchased</p>;
    }

    // If not logged in, show reserve button that redirects to register
    if (!user) {
      if (item.status === 'available') {
        return (
          <button
            onClick={() => handleReserve(item._id)}
            className="btn btn-reserve btn-sm"
          >
            Reserve
          </button>
        );
      }
      return <p style={{ color: '#6b5b95', fontSize: '0.85rem', margin: 0 }}>🔒 This item has been reserved</p>;
    }

    // If logged in
    if (item.status === 'available') {
      return (
        <button
          onClick={() => handleReserve(item._id)}
          className="btn btn-reserve btn-sm"
          disabled={actionLoading === item._id}
        >
          {actionLoading === item._id ? 'Reserving...' : 'Reserve'}
        </button>
      );
    }

    if (item.status === 'reserved') {
      // Check if current user reserved this item
      const isMyReservation = item.reservedBy && item.reservedBy._id === user.id;

      if (isMyReservation) {
        return (
          <div className="flex-gap">
            <button
              onClick={() => handleUnreserve(item._id)}
              className="btn btn-unreserve btn-sm"
              disabled={actionLoading === item._id}
            >
              {actionLoading === item._id ? '...' : 'Un-reserve'}
            </button>
            <button
              onClick={() => handlePurchase(item._id)}
              className="btn btn-purchased btn-sm"
              disabled={actionLoading === item._id}
            >
              {actionLoading === item._id ? '...' : 'Mark as Purchased'}
            </button>
          </div>
        );
      }

      // Someone else reserved it
      return (
        <p style={{ color: '#6b5b95', fontSize: '0.85rem', margin: 0 }}>
          🔒 This item has been reserved
        </p>
      );
    }

    return null;
  };

  if (loading) return <div className="loading">Loading wishlist...</div>;
  if (error) return <div className="container"><div className="alert-error">{error}</div></div>;
  if (!wishlist) return <div className="loading">Wishlist not found.</div>;

  return (
    <div className="container">
      {/* Wishlist Header */}
      <div className="guest-header">
        <h1>🎁 {wishlist.name}</h1>
        <p>by {wishlist.owner?.name || 'Unknown'}</p>
      </div>

      {/* Login prompt for guests */}
      {!user && (
        <div className="guest-login-prompt">
          <p>Want to reserve an item? You'll need to create an account first.</p>
          <div className="flex-gap" style={{ justifyContent: 'center' }}>
            <Link
              to="/login"
              state={{ redirectTo: `/shared/${shareLink}` }}
              className="btn btn-dark btn-sm"
            >
              Login
            </Link>
            <Link
              to="/register"
              state={{ redirectTo: `/shared/${shareLink}` }}
              className="btn btn-primary btn-sm"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Items List */}
      {items.length === 0 ? (
        <div className="empty-state">
          <p>This wishlist has no items yet.</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item._id} className="item-card">
            <div className="item-header">
              <div>
                <span className="item-name">{item.name}</span>
                <div className="mt-2">{getStatusBadge(item.status)}</div>
              </div>
              <span className="item-price">${item.price}</span>
            </div>
            <div className="item-details">
              <span className={`priority-${item.priority.toLowerCase()}`}>
                {item.priority} Priority
              </span>
              {item.url && (
                <span>
                  {' · '}
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-link">
                    View Link
                  </a>
                </span>
              )}
            </div>
            <div className="item-actions">{renderItemActions(item)}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default GuestView;
