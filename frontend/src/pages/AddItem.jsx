// pages/AddItem.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import itemService from "../services/itemService";

const AddItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    priority: "Medium",
    url: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim() || !formData.price) {
      setError("Item name and price are required.");
      return;
    }
    try {
      await itemService.addItem(id, formData);
      navigate(`/wishlist/${id}`);
    } catch (err) {
      setError("Failed to add item. Please try again.");
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
              name="name"
              placeholder="e.g. Sony Headphones"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              name="price"
              placeholder="e.g. 350"
              value={formData.price}
              onChange={handleChange}
              className="form-input"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
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
              name="url"
              placeholder="e.g. https://amazon.com/..."
              value={formData.url}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Add Item
          </button>
        </form>
        <div className="text-center mt-3">
          <button
            onClick={() => navigate(`/wishlist/${id}`)}
            className="btn btn-outline w-full"
          >
            ← Back to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
