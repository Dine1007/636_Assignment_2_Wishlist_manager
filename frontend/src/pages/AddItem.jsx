import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const AddItem = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    priority: 'Medium',
    url: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim() || !formData.price) {
      setError('Item name and price are required.');
      return;
    }
    try {
      await axiosInstance.post(
        `/api/wishlists/${id}/items`,
        { ...formData, price: Number(formData.price) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate(`/wishlist/${id}`);
    } catch (err) {
      setError('Failed to add item. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Add Item</h1>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              placeholder="e.g. Sony Headphones"
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
              placeholder="e.g. 350"
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
              placeholder="e.g. https://amazon.com/..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Add Item
          </button>
        </form>
        <div className="text-center mt-3">
          <button onClick={() => navigate(`/wishlist/${id}`)} className="btn btn-outline w-full">
            ← Back to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
