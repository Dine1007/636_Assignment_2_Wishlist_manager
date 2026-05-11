import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const WishlistDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);					 
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/wishlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setWishlist(response.data.wishlist);						
      setNewName(response.data.wishlist.name);
      setItems(response.data.items);
    } catch (error) {
      alert('Failed to load wishlist.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user, id, navigate, fetchWishlist]); 

  const handleUpdateName = async () => {
    try {
      const response = await axiosInstance.put(
        `/api/wishlists/${id}`,
        { name: newName },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setWishlist(response.data);
      setEditingName(false);
    } catch (error) {
      alert('Failed to update wishlist name.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await axiosInstance.delete(`/api/wishlists/${id}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setItems(items.filter((item) => item._id !== itemId));
    } catch (error) {
      alert('Failed to delete item.');
    }
  };

  if (loading) return <div className="loading">Loading wishlist...</div>;
  if (!wishlist) return <div className="loading">Wishlist not found.</div>;

  return (
    <div className="container">
      {/* Wishlist Header with Edit Name */}
      <div className="card mb-4">
        {editingName ? (
          <div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="form-input mb-2"
            />
            <div className="flex-gap mt-2">
              <button onClick={handleUpdateName} className="btn btn-primary btn-sm">
                Save
              </button>
              <button onClick={() => { setEditingName(false); setNewName(wishlist.name); }} className="btn btn-outline btn-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-between">
            <h1 style={{ color: '#6b3a3a', fontSize: '1.4rem', margin: 0 }}>📋 {wishlist.name}</h1>
            <button onClick={() => setEditingName(true)} className="btn btn-outline btn-sm">
              Edit Name
            </button>
          </div>
        )}
      </div>

	  {/* Action Buttons */}
          <div className="flex-between mb-4">
            <Link to={`/wishlist/${id}/add-item`} className="btn btn-primary">
              + Add Item
            </Link>
            <Link to={`/wishlist/${id}/share`} className="btn btn-dark">
              Share Wishlist
            </Link>
            
          </div>
        
          {/* Items List */}
      {items.length === 0 ? (
        <div className="empty-state">
          <p>No items in this wishlist yet.</p>
          <Link to={`/wishlist/${id}/add-item`} className="btn btn-primary">
            Add Your First Item
          </Link>
          
        </div>
      ) : (
        items.map((item) => (
          <div key={item._id} className="item-card">
            <div className="item-header">
              <span className="item-name">{item.name}</span>
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
            <div className="item-actions">
              {wishlist.isShared ? (
                <span style={{ fontSize: '0.8rem', color: '#888' }}>
                  🔒 Locked - list is shared
                </span>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/wishlist/${id}/edit-item/${item._id}`)}
                    className="btn btn-primary btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
	  
      <div className="text-center mt-4">
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default WishlistDetail;