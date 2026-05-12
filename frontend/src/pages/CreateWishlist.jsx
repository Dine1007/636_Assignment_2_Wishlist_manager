// pages/CreateWishlist.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import wishListService from "../services/wishListService";

const CreateWishlist = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Please enter a wishlist name.");
      return;
    }
    try {
      const wishlist = await wishListService.createWishlist(name);
      navigate(`/wishlist/${wishlist._id}`);
    } catch (err) {
      setError("Failed to create wishlist. Please try again.");
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
