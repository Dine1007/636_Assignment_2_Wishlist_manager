import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import './GuestView.css';

const GuestView = () => {
  const { user } = useAuth();
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const [wishlist, setWishlist]   = useState(null);
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [groupModal, setGroupModal]       = useState(null);
  const [selectedContributors, setSelectedContributors] = useState(3);
  const [groupLoading, setGroupLoading]   = useState('');

  useEffect(() => { fetchSharedWishlist(); }, [shareLink]);

  /* ── Fetch wishlist ── */
  const fetchSharedWishlist = async () => {
    try {
      const res = await axiosInstance.get(`/api/wishlists/share/${shareLink}`);
      setWishlist(res.data.wishlist);
      setItems(res.data.items);
    } catch (err) {
      setError("Wishlist not found or the link is invalid.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Helpers ── */
  const shareAmt = (price, n) => Math.ceil(price / n);

  const isInGroup = (item) => {
    if (!user || !item.groupContributors) return false;
    return item.groupContributors.some(c =>
      (c._id?.toString() ?? c.toString()) === user.id.toString()
    );
  };

  /* ── Solo reserve / unreserve / purchase ── */
  const handleReserve = async (itemId) => {
    if (!user) { navigate('/register', { state: { redirectTo: `/shared/${shareLink}` } }); return; }
    setActionLoading(itemId);
    try {
      const res = await axiosInstance.put(`/api/wishlists/items/${itemId}/reserve`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      setItems(prev => prev.map(i => i._id === itemId ? res.data : i));
    } catch (err) { alert(err.response?.data?.message || 'Failed to reserve item.'); }
    finally { setActionLoading(''); }
  };

  const handleUnreserve = async (itemId) => {
    setActionLoading(itemId);
    try {
      await axiosInstance.put(`/api/wishlists/items/${itemId}/unreserve`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      await fetchSharedWishlist();
    } catch (err) { alert(err.response?.data?.message || 'Failed to un-reserve.'); }
    finally { setActionLoading(''); }
  };

  const handlePurchase = async (itemId) => {
    if (
      !window.confirm("Mark this item as purchased? This action is permanent.")
    )
      return;
    setActionLoading(itemId);
    try {
      const res = await axiosInstance.put(`/api/wishlists/items/${itemId}/purchase`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      setItems(prev => prev.map(i => i._id === itemId ? res.data : i));
    } catch (err) { alert(err.response?.data?.message || 'Failed to mark as purchased.'); }
    finally { setActionLoading(''); }
  };

  /* ── Group gifting ── */
  const openGroupModal = (item) => {
    if (!user) { navigate('/register', { state: { redirectTo: `/shared/${shareLink}` } }); return; }
    setSelectedContributors(3);
    setGroupModal({ itemId: item._id, itemName: item.name, itemPrice: item.price });
  };

  const handleStartGroupGift = async () => {
    if (!groupModal) return;
    setGroupLoading(groupModal.itemId);
    try {
      await axiosInstance.post(
        `/api/wishlists/items/${groupModal.itemId}/group/join`,
        { maxContributors: selectedContributors },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setGroupModal(null);
      await fetchSharedWishlist();
    } catch (err) { alert(err.response?.data?.message || 'Failed to start group gift.'); }
    finally { setGroupLoading(''); }
  };

  const handleJoinGroup = async (itemId) => {
    if (!user) { navigate('/register', { state: { redirectTo: `/shared/${shareLink}` } }); return; }
    setGroupLoading(itemId);
    try {
      await axiosInstance.post(`/api/wishlists/items/${itemId}/group/join`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      await fetchSharedWishlist();
    } catch (err) { alert(err.response?.data?.message || 'Failed to join.'); }
    finally { setGroupLoading(''); }
  };

  const handleGroupPurchase = async (itemId) => {
    if (!window.confirm('Mark this gift as purchased? This will close the item for everyone.')) return;
    setGroupLoading(itemId);
    try {
      await axiosInstance.put(`/api/wishlists/items/${itemId}/group/purchase`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      await fetchSharedWishlist();
    } catch (err) { alert(err.response?.data?.message || 'Failed to mark as purchased.'); }
    finally { setGroupLoading(''); }
  };

  const handleLeaveGroup = async (itemId) => {
    if (!window.confirm('Leave this group gift? Your slot will be freed for others.')) return;
    setGroupLoading(itemId);
    try {
      await axiosInstance.delete(`/api/wishlists/items/${itemId}/group/leave`, { headers: { Authorization: `Bearer ${user.token}` } });
      await fetchSharedWishlist();
    } catch (err) { alert(err.response?.data?.message || 'Failed to leave group.'); }
    finally { setGroupLoading(''); }
  };

  /* ── Status badge ── */
  const getStatusBadge = (item) => {
    if (item.isGroupGift) {
      if (item.status === 'purchased') return <span className="badge badge-purchased">Purchased</span>;
      if (item.status === 'reserved')  return <span className="badge badge-reserved">Group reserved ({item.maxContributors}/{item.maxContributors})</span>;
      const filled = item.groupContributors?.length || 0;
      return <span className="badge badge-group">Group gift - {filled}/{item.maxContributors} joined</span>;
    }
    switch (item.status) {
      case 'available': return <span className="badge badge-available">Available</span>;
      case 'reserved':  return <span className="badge badge-reserved">Reserved</span>;
      case 'purchased': return <span className="badge badge-purchased">Purchased</span>;
      default: return null;
    }
  };

  /* ── Group section ── */
  const renderGroupSection = (item) => {
    const filled    = item.groupContributors?.length || 0;
    const max       = item.maxContributors || 3;
    const share     = shareAmt(item.price, max);
    const isMember  = isInGroup(item);
    const isFull    = filled >= max;
    const isPurchased = item.status === 'purchased';

    return (
      <div className="group-section">
        <div className="group-progress-header">
          <span>{filled} of {max} contributors joined</span>
          <span>${share} each</span>
        </div>
        <div className="group-progress-track">
          <div className="group-progress-fill" style={{ width: `${(filled / max) * 100}%` }} />
        </div>
        <div className="group-avatars">
          {Array.from({ length: max }).map((_, i) => {
            const c    = item.groupContributors?.[i];
            const name = c?.name || (c ? 'G' : null);
            return (
              <div key={i} className={`group-avatar ${name ? 'group-avatar-filled' : 'group-avatar-empty'}`}>
                {name ? name[0].toUpperCase() : '+'}
              </div>
            );
          })}
          <span className="group-slots-label">
            {isPurchased ? 'Gift purchased' : isFull ? 'Group full - waiting for purchase' : `${max - filled} slot${max - filled !== 1 ? 's' : ''} open`}
          </span>
        </div>
        {!isPurchased && (
          <div className="group-actions">
            {!isMember && !isFull && user && (
              <button onClick={() => handleJoinGroup(item._id)} className="btn btn-sm btn-group-join" disabled={groupLoading === item._id}>
                {groupLoading === item._id ? 'Joining...' : `Join group - $${share}`}
              </button>
            )}
            {!isMember && !isFull && !user && (
              <Link to="/register" state={{ redirectTo: `/shared/${shareLink}` }} className="btn btn-sm btn-group-join">
                Register to join - ${share}
              </Link>
              
            )}
            {isMember && (
              <>
                
                <button onClick={() => handleLeaveGroup(item._id)} className="btn-group-leave" disabled={groupLoading === item._id}>
                  Leave group
                </button>
              </>
            )}
            {isMember && isFull && user &&(
              <>
                <button onClick={() => handleGroupPurchase(item._id)} className="btn btn-purchased btn-sm" disabled={groupLoading === item._id}>
                  {groupLoading === item._id ? '...' : 'Mark gift as purchased'}
                </button>
                
              </>
            )}
          </div>
        )}
        {isPurchased && <span className="share-purchased-badge">Gift has been purchased</span>}
      </div>
    );
  };

  /* ── Item actions ── */
  const renderItemActions = (item) => {
    if (item.status === 'purchased' && !item.isGroupGift) {
      return <p className="status-msg status-purchased">This item has been purchased</p>;
    }
    if (item.isGroupGift && item.groupContributors?.length > 0) {
      return renderGroupSection(item);
    }
    if (!user) {
      if (item.status === 'available') return (
        <div className="flex-gap">
          <button onClick={() => handleReserve(item._id)} className="btn btn-reserve btn-sm">Reserve alone</button>
          <button onClick={() => openGroupModal(item)} className="btn-group-start">Start group gift</button>
        </div>
      );
      return <p className="status-msg status-reserved">This item has been reserved</p>;
    }
    if (item.status === 'available') return (
      <div className="flex-gap">
        <button onClick={() => handleReserve(item._id)} className="btn btn-reserve btn-sm" disabled={actionLoading === item._id}>
          {actionLoading === item._id ? 'Reserving...' : 'Reserve alone'}
        </button>
        <button onClick={() => openGroupModal(item)} className="btn-group-start">Start group gift</button>
      </div>
    );
    if (item.status === 'reserved') {
      const mine = item.reservedBy && (
        (item.reservedBy._id?.toString() ?? item.reservedBy.toString()) === user.id.toString()
      );
      if (mine) return (
        <div className="flex-gap">
          <button onClick={() => handleUnreserve(item._id)} className="btn btn-unreserve btn-sm" disabled={actionLoading === item._id}>
            {actionLoading === item._id ? '...' : 'Un-reserve'}
          </button>
          <button onClick={() => handlePurchase(item._id)} className="btn btn-purchased btn-sm" disabled={actionLoading === item._id}>
            {actionLoading === item._id ? '...' : 'Mark as Purchased'}
          </button>
        </div>
      );
      return <p className="status-msg status-reserved">This item has been reserved</p>;
    }
    return null;
  };

  if (loading)    return <div className="loading">Loading wishlist...</div>;
  if (error)      return <div className="container"><div className="alert-error">{error}</div></div>;
  if (!wishlist)  return <div className="loading">Wishlist not found.</div>;

  return (
    <div className="container">

      {/* Group gift modal */}
      {groupModal && (
        <div className="group-modal-overlay">
          <div className="group-modal">
            <h3>Start group gift</h3>
            <p className="group-modal-subtitle">{groupModal.itemName} - ${groupModal.itemPrice}</p>
            <p className="group-modal-desc">
              You are the first contributor. How many people including you will split this gift?
            </p>
            <div className="contributor-grid">
              {[2, 3].map(num => (
                <div key={num} onClick={() => setSelectedContributors(num)}
                  className={`contributor-option ${selectedContributors === num ? 'selected' : ''}`}>
                  <div className={`contributor-option-num ${selectedContributors === num ? 'selected' : ''}`}>{num}</div>
                  <div className="contributor-option-label">people</div>
                  <div className={`contributor-option-price ${selectedContributors === num ? 'selected' : ''}`}>
                    ${shareAmt(groupModal.itemPrice, num)} each
                  </div>
                </div>
              ))}
            </div>
            <div className="group-summary">
              <div className="group-summary-row">
                <span className="group-summary-label">Item price</span>
                <span className="group-summary-value">${groupModal.itemPrice}</span>
              </div>
              <div className="group-summary-row">
                <span className="group-summary-label">Contributors</span>
                <span className="group-summary-value">{selectedContributors} people</span>
              </div>
              <div className="group-summary-row">
                <span className="group-summary-label">Open slots after you</span>
                <span className="group-summary-value">{selectedContributors - 1}</span>
              </div>
              <div className="group-summary-divider" />
              <div className="group-summary-row">
                <span className="group-summary-label" style={{ fontWeight: 500 }}>Your share</span>
                <span className="group-summary-total-value">${shareAmt(groupModal.itemPrice, selectedContributors)}</span>
              </div>
            </div>
            <p className="group-modal-note">
              When all {selectedContributors} contributors join the item will be marked as reserved automatically.
              Any one contributor can then mark the gift as purchased.
            </p>
            <div className="modal-actions">
              <button onClick={handleStartGroupGift} className="btn-group-confirm" disabled={groupLoading !== ''}>
                {groupLoading ? 'Starting...' : `Confirm - join for $${shareAmt(groupModal.itemPrice, selectedContributors)}`}
              </button>
              <button onClick={() => setGroupModal(null)} className="btn btn-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="guest-header">
        <h1>🎁 {wishlist.name}</h1>
        <p>by {wishlist.owner?.name || "Unknown"}</p>
      </div>

      {/* Login prompt */}
      {!user && (
        <div className="guest-login-prompt">
          <p>Want to reserve an item? You'll need to create an account first.</p>
          <div className="flex-gap" style={{ justifyContent: 'center' }}>
            <Link to="/login" state={{ redirectTo: `/shared/${shareLink}` }} className="btn btn-dark btn-sm">Login</Link>
            <Link to="/register" state={{ redirectTo: `/shared/${shareLink}` }} className="btn btn-primary btn-sm">Register</Link>
          </div>
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="empty-state"><p>This wishlist has no items yet.</p></div>
      ) : (
        items.map(item => (
          <div key={item._id} className="item-card">
            <div className="item-header">
              <div>
                <span className="item-name">{item.name}</span>
                <div className="mt-2">{getStatusBadge(item)}</div>
              </div>
              <span className="item-price">${item.price}</span>
            </div>
            <div className="item-details">
              <span className={`priority-${item.priority?.toLowerCase()}`}>{item.priority} Priority</span>
              {item.url && <span> · <a href={item.url} target="_blank" rel="noreferrer" className="text-link">View Link</a></span>}
            </div>
            <div className="item-actions">
              {/* Factory — renders correct actions based on status + user */}
              <ItemActions
                item={item}
                user={user}
                actionLoading={actionLoading}
                shareLink={shareLink}
                onReserve={handleReserve}
                onUnreserve={handleUnreserve}
                onPurchase={handlePurchase}
                navigate={navigate}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GuestView;
