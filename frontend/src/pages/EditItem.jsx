import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const EditItem = () => {
  const { user } = useAuth();
  const { wishlistId, itemId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    priority: 'Medium',
    url: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axiosInstance.get(`/api/wishlists/${wishlistId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const item = response.data.items.find((i) => i._id === itemId);
        if (item) {
          setFormData({
            name: item.name,
            price: item.price,
            priority: item.priority,
            url: item.url || '',
          });
        } else {
          setError('Item not found.');
        }
      } catch (err) {
        setError('Failed to load item.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [user, wishlistId, itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim() || !formData.price) {
      setError('Item name and price are required.');
      return;
    }
    try {
      await axiosInstance.put(
        `/api/wishlists/${wishlistId}/items/${itemId}`,
        { ...formData, price: Number(formData.price) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate(`/wishlist/${wishlistId}`);
    } catch (err) {
      setError('Failed to update item. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading item...</div>;

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Edit Item</h1>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="form-input"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="form-select"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>URL (optional)</label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Update Item
          </button>
        </form>
        <div className="text-center mt-3">
          <button onClick={() => navigate(`/wishlist/${wishlistId}`)} className="btn btn-outline w-full">
            ← Back to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
