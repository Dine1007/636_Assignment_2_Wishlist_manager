const WishlistItem = require('../models/WishlistItem');
const Wishlist     = require('../models/Wishlist');

// Helper — always return populated item so frontend gets names
const populateItem = (item) =>
  WishlistItem.findById(item._id)
    .populate('groupContributors', 'name');

// POST /api/wishlists/items/:itemId/group/join
const joinGroupGift = async (req, res) => {
  try {
    const item = await WishlistItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Guard 1 — owner cannot join their own wishlist item
    const wishlist = await Wishlist.findById(item.wishlist);
    if (wishlist.owner.toString() === req.user.id) {
      return res.status(403).json({
        message: 'Owners cannot join group gifts on their own wishlist'
      });
    }

    // Guard 2 — cannot join a purchased item
    if (item.status === 'purchased') {
      return res.status(400).json({ message: 'This item has already been purchased' });
    }

    // Guard 3 — cannot join if solo reserved by someone else
    if (item.status === 'reserved' && !item.isGroupGift) {
      return res.status(400).json({
        message: 'This item is already reserved by someone else'
      });
    }

    // Guard 4 — cannot join twice
    const alreadyIn = item.groupContributors.some(
      (c) => c.toString() === req.user.id
    );
    if (alreadyIn) {
      return res.status(400).json({
        message: 'You have already joined this group gift'
      });
    }

    // First contributor — must send maxContributors: 2 or 3
    if (!item.isGroupGift) {
      const { maxContributors } = req.body;
      if (!maxContributors || ![2, 3].includes(Number(maxContributors))) {
        return res.status(400).json({
          message: 'Please choose 2 or 3 contributors to start the group'
        });
      }
      item.isGroupGift     = true;
      item.maxContributors = Number(maxContributors);
    }

    // Guard 5 — group already full
    if (item.groupContributors.length >= item.maxContributors) {
      return res.status(400).json({ message: 'This group gift is already full' });
    }

    // All guards passed — add contributor
    item.groupContributors.push(req.user.id);

    // KEY LOGIC — when last slot filled → auto reserve
    if (item.groupContributors.length >= item.maxContributors) {
      item.status = 'reserved';
    }

    await item.save();
    const populated = await populateItem(item);
    res.status(200).json(populated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/wishlists/items/:itemId/group/leave
const leaveGroupGift = async (req, res) => {
  try {
    const item = await WishlistItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Guard 1 — must be a group gift
    if (!item.isGroupGift) {
      return res.status(400).json({ message: 'This item is not a group gift' });
    }

    // Guard 2 — cannot leave after purchased
    if (item.status === 'purchased') {
      return res.status(400).json({
        message: 'Cannot leave — this gift has already been purchased'
      });
    }

    // Guard 3 — must actually be in the group
    const memberIndex = item.groupContributors.findIndex(
      (c) => c.toString() === req.user.id
    );
    if (memberIndex === -1) {
      return res.status(403).json({
        message: 'You are not part of this group gift'
      });
    }

    // Remove this person from the array
    item.groupContributors.splice(memberIndex, 1);

    // Outcome 1 — last person left → full reset
    if (item.groupContributors.length === 0) {
      item.isGroupGift     = false;
      item.maxContributors = null;
      item.status          = 'available';
    } else {
      // Outcome 2 — others still in group → reopen slot
      // Group was full (reserved) but now has an empty slot
      item.status = 'available';
    }

    await item.save();
    const populated = await populateItem(item);
    res.status(200).json(populated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/wishlists/items/:itemId/group/purchase
const purchaseGroupGift = async (req, res) => {
  try {
    const item = await WishlistItem.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Guard 1 — must be a group gift
    if (!item.isGroupGift) {
      return res.status(400).json({
        message: 'This item is not a group gift'
      });
    }

    // Guard 2 — already purchased
    if (item.status === 'purchased') {
      return res.status(400).json({
        message: 'This gift has already been purchased'
      });
    }

    // Guard 3 — group must be full before anyone can purchase
    // status === 'reserved' means all slots were filled (set by joinGroupGift)
    if (item.status !== 'reserved') {
      return res.status(400).json({
        message: `Group is not complete yet — 
          ${item.groupContributors.length} of 
          ${item.maxContributors} slots filled. 
          All contributors must join before purchasing.`
      });
    }

    // Guard 4 — must be a group member to purchase
    const isMember = item.groupContributors.some(
      (c) => c.toString() === req.user.id
    );
    if (!isMember) {
      return res.status(403).json({
        message: 'Only group contributors can mark this gift as purchased'
      });
    }

    // All guards passed — mark as purchased permanently
    item.status      = 'purchased';
    item.purchasedBy = req.user.id;
    await item.save();

    const populated = await populateItem(item);
    res.status(200).json(populated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { joinGroupGift, leaveGroupGift, purchaseGroupGift };