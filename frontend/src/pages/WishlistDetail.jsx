// pages/WishlistDetail.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import wishListService from "../services/wishListService";
import itemService from "../services/itemService";

// Factory — produces correct item actions based on wishlist lock state
const ItemActions = ({ item, wishlistId, isShared, onDelete, navigate }) => {
  if (isShared) {
    return (
      <span style={{ fontSize: "0.8rem", color: "#888" }}>
        🔒 Locked - list is shared
      </span>
    );
  }
  return (
    <>
      <button
        onClick={() =>
          navigate(`/wishlist/${wishlistId}/edit-item/${item._id}`)
        }
        className="btn btn-primary btn-sm"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(item._id)}
        className="btn btn-danger btn-sm"
      >
        Delete
      </button>
    </>
  );
};

const WishlistDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchWishlist = useCallback(async () => {
    try {
      const data = await wishListService.getWishlistById(id);
      setWishlist(data.wishlist);
      setNewName(data.wishlist.name);
      setItems(data.items);
    } catch (error) {
      alert("Failed to load wishlist.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [user, fetchWishlist, navigate]);

  const handleUpdateName = async () => {
    try {
      const updated = await wishListService.updateWishlist(id, newName);
      setWishlist(updated);
      setEditingName(false);
    } catch (error) {
      alert("Failed to update wishlist name.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await itemService.deleteItem(id, itemId);
      setItems(items.filter((item) => item._id !== itemId));
    } catch (error) {
      alert("Failed to delete item.");
    }
  };

  if (loading) return <div className="loading">Loading wishlist...</div>;
  if (!wishlist) return <div className="loading">Wishlist not found.</div>;

  return (
    <div className="container">
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
              <button
                onClick={handleUpdateName}
                className="btn btn-primary btn-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNewName(wishlist.name);
                }}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-between">
            <div>
              <h1 style={{ color: "#6b3a3a", fontSize: "1.4rem", margin: 0 }}>
                📋 {wishlist.name}
              </h1>
              {wishlist.dueDate && (
                <p style={{ margin: "0.35rem 0 0", color: "#7a5c5c", fontSize: "0.95rem" }}>
                  Due: {new Date(wishlist.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={() => setEditingName(true)}
              className="btn btn-outline btn-sm"
            >
              Edit Name
            </button>
          </div>
        )}
      </div>

      <div className="flex-between mb-4">
        <Link to={`/wishlist/${id}/add-item`} className="btn btn-primary">
          + Add Item
        </Link>
        <Link to={`/wishlist/${id}/share`} className="btn btn-dark">
          Share Wishlist
        </Link>
      </div>

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
                  {" · "}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link"
                  >
                    View Link
                  </a>
                </span>
              )}
            </div>
            <div className="item-actions">
              {/* Factory — renders correct actions based on lock state */}
              <ItemActions
                item={item}
                wishlistId={id}
                isShared={wishlist.isShared}
                onDelete={handleDeleteItem}
                navigate={navigate}
              />
            </div>
          </div>
        ))
      )}

      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-outline"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default WishlistDetail;
