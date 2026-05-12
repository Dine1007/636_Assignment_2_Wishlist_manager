// pages/ShareWishlist.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import wishListService from "../services/wishListService";

const ShareWishlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await wishListService.getWishlistById(id);
        setWishlist(data.wishlist);
        setIsShared(data.wishlist.isShared || false);
      } catch (error) {
        alert("Failed to load wishlist.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [id, navigate]);

  const shareUrl = wishlist
    ? `${window.location.origin}/shared/${wishlist.shareLink}`
    : "";

  const handleCopy = async () => {
    try {
      if (!isShared) {
        await wishListService.shareWishlist(id);
        setIsShared(true);
      }
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      alert("Failed to share wishlist.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!wishlist) return <div className="loading">Wishlist not found.</div>;

  return (
    <div className="container">
      <div className="card">
        <div className="share-section">
          <h1
            style={{
              color: "#6b3a3a",
              fontSize: "1.5rem",
              marginBottom: "8px",
            }}
          >
            🔗 Share Wishlist
          </h1>
          <p style={{ color: "#7a5c5c", marginBottom: "16px" }}>
            Share this link with your friends so they can view and reserve items
            from
            <strong> "{wishlist.name}"</strong>.
          </p>

          {isShared && (
            <div
              style={{
                background: "#fff8e1",
                border: "1px solid #f9a825",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "0.875rem",
                color: "#5d4037",
              }}
            >
              🔒 <strong>This wishlist is shared and locked.</strong> Existing
              items cannot be edited or deleted. You can still add new items.
            </div>
          )}

          <div className="share-link-box">{shareUrl}</div>

          <button
            onClick={handleCopy}
            className="btn btn-primary"
            style={{ padding: "12px 32px" }}
          >
            {copied
              ? "✅ Link Copied!"
              : isShared
                ? "📋 Copy Link Again"
                : "📋 Copy & Share Link"}
          </button>

          <p
            style={{ color: "#7a5c5c", marginTop: "20px", fontSize: "0.85rem" }}
          >
            Friends can view your wishlist without logging in. They only need to
            register and log in when they want to reserve an item.
          </p>
        </div>
      </div>

      <div className="text-center mt-3">
        <button
          onClick={() => navigate(`/wishlist/${id}`)}
          className="btn btn-outline"
        >
          ← Back to Wishlist
        </button>
      </div>
    </div>
  );
};

export default ShareWishlist;
