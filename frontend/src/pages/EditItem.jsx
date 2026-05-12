// pages/EditItem.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import wishListService from "../services/wishListService";
import itemService from "../services/itemService";

const EditItem = () => {
  const { wishlistId, itemId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    priority: "Medium",
    url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await wishListService.getWishlistById(wishlistId);
        const item = data.items.find((i) => i._id === itemId);
        if (item) {
          setFormData({
            name: item.name,
            price: item.price,
            priority: item.priority,
            url: item.url || "",
          });
        } else {
          setError("Item not found.");
        }
      } catch (err) {
        setError("Failed to load item.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [wishlistId, itemId]);

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
      await itemService.updateItem(wishlistId, itemId, formData);
      navigate(`/wishlist/${wishlistId}`);
    } catch (err) {
      setError("Failed to update item. Please try again.");
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
              name="name"
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
              value={formData.url}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Update Item
          </button>
        </form>
        <div className="text-center mt-3">
          <button
            onClick={() => navigate(`/wishlist/${wishlistId}`)}
            className="btn btn-outline w-full"
          >
            ← Back to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
