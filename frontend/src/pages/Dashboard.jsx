// pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import wishListService from "../services/wishListService";
const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [wishlists, setWishlists] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchWishlists = async () => {
      try {
        const data = await wishListService.getWishlists();
        setWishlists(data);
      } catch (error) {
        alert("Failed to fetch wishlists.");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlists();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this wishlist?"))
      return;
    try {
      await wishListService.deleteWishlist(id);
      setWishlists(wishlists.filter((w) => w._id !== id));
    } catch (error) {
      alert("Failed to delete wishlist.");
    }
  };

  if (loading) return <div className="loading">Loading your wishlists...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>🎁 My Wishlists</h1>
        <Link to="/create-wishlist" className="btn btn-primary">
          + Create Wishlist
        </Link>
      </div>

      {wishlists.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any wishlists yet.</p>
          <Link to="/create-wishlist" className="btn btn-primary">
            Create Your First Wishlist
          </Link>
        </div>
      ) : (
        wishlists.map((wishlist) => (
          <div key={wishlist._id} className="wishlist-card">
            <div className="flex-between">
              <div
                onClick={() => navigate(`/wishlist/${wishlist._id}`)}
                style={{ cursor: "pointer", flex: 1 }}
              >
                <h2>📋 {wishlist.name}</h2>
                <p>
                  Created: {new Date(wishlist.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex-gap">
                <button
                  onClick={() => navigate(`/wishlist/${wishlist._id}/share`)}
                  className="btn btn-primary btn-sm"
                >
                  Share
                </button>
                <button
                  onClick={() => handleDelete(wishlist._id)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
