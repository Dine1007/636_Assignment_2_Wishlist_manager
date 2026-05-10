import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const CreateWishlist = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter a wishlist name.');
      return;
    }
    try {
      const response = await axiosInstance.post(
        '/api/wishlists',
        { name },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate(`/wishlist/${response.data._id}`);
      
    } catch (err) {
      setError('Failed to create wishlist. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Create Wishlist</h1>
        {error && <div className="alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Wishlist Name</label>
            <input
              type="text"
              placeholder="e.g. Sarah's 30th Birthday"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Create Wishlist
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWishlist;
