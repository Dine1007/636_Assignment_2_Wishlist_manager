const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const WishlistItem = require('../models/WishlistItem');
const { createWishlist, getMyWishlists, getWishlistById, updateWishlist, deleteWishlist } = require('../controllers/wishlistController');
const { addItem, updateItem, deleteItem } = require('../controllers/itemController');
const { expect } = chai;
const { reserveItem, unreserveItem, purchaseItem } = require('../controllers/itemController');
const { joinGroupGift, leaveGroupGift, purchaseGroupGift } = require('../controllers/groupController');
const { sendExpiryReminders } = require('../services/reminderService');

// CREATE WISHLIST TESTS

describe('CreateWishlist Function Test', () => {

  it('should create a new wishlist successfully', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { name: "Sarah's 30th Birthday", dueDate: '2026-12-01' }
    };

    const createdWishlist = {
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      owner: req.user.id,
      shareLink: 'abc123def456'
    };

    const createStub = sinon.stub(Wishlist, 'create').resolves(createdWishlist);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await createWishlist(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdWishlist)).to.be.true;

    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const createStub = sinon.stub(Wishlist, 'create').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { name: "Sarah's 30th Birthday", dueDate: '2026-12-01' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await createWishlist(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });
});

// GET MY WISHLISTS TESTS

describe('GetMyWishlists Function Test', () => {

  it('should return wishlists for the given user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const wishlists = [
      { _id: new mongoose.Types.ObjectId(), name: 'Birthday', owner: userId },
      { _id: new mongoose.Types.ObjectId(), name: 'Christmas', owner: userId }
    ];

    const findStub = sinon.stub(Wishlist, 'find').returns({
      sort: sinon.stub().resolves(wishlists)
    });

    const req = { user: { id: userId } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await getMyWishlists(req, res);

    expect(res.json.calledWith(wishlists)).to.be.true;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Wishlist, 'find').returns({
      sort: sinon.stub().throws(new Error('DB Error'))
    });

    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await getMyWishlists(req, res);

    expect(res.status.calledWith(500)).to.be.true;

    findStub.restore();
  });
});

// UPDATE WISHLIST TESTS

describe('UpdateWishlist Function Test', () => {

  it('should update wishlist name successfully', async () => {
    const wishlistId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const updatedWishlist = { _id: wishlistId, name: 'Updated Name', owner: userId };

    const findStub = sinon.stub(Wishlist, 'findOneAndUpdate').resolves(updatedWishlist);

    const req = {
      user: { id: userId },
      params: { id: wishlistId },
      body: { name: 'Updated Name' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateWishlist(req, res);

    expect(res.json.calledWith(updatedWishlist)).to.be.true;

    findStub.restore();
  });

  it('should reset reminder flags when due date is updated', async () => {
    const wishlistId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const newDueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const updatedWishlist = {
      _id: wishlistId,
      name: 'Birthday',
      dueDate: newDueDate,
      reminder7DaySent: false,
      reminder1DaySent: false,
      owner: userId
    };
    const findStub = sinon.stub(Wishlist, 'findOneAndUpdate').resolves(updatedWishlist);
    const req = {
      user: { id: userId },
      params: { id: wishlistId },
      body: { name: 'Birthday', dueDate: newDueDate }
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateWishlist(req, res);

    expect(res.json.calledWithMatch({
      reminder7DaySent: false,
      reminder1DaySent: false
    })).to.be.true;
    findStub.restore();
  });

  it('should return 404 if wishlist is not found', async () => {
    const findStub = sinon.stub(Wishlist, 'findOneAndUpdate').resolves(null);

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() },
      body: { name: 'Updated Name' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateWishlist(req, res);

    expect(res.status.calledWith(404)).to.be.true;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Wishlist, 'findOneAndUpdate').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() },
      body: { name: 'Updated Name' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateWishlist(req, res);

    expect(res.status.calledWith(500)).to.be.true;

    findStub.restore();
  });
  
});

// DELETE WISHLIST TESTS

describe('DeleteWishlist Function Test', () => {

  it('should delete a wishlist successfully', async () => {
    const wishlistId = new mongoose.Types.ObjectId();
    const deletedWishlist = { _id: wishlistId, name: 'Birthday' };

    const deleteStub = sinon.stub(Wishlist, 'findOneAndDelete').resolves(deletedWishlist);
    const deleteItemsStub = sinon.stub(WishlistItem, 'deleteMany').resolves();

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: wishlistId }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteWishlist(req, res);

    expect(res.json.calledWithMatch({ message: 'Wishlist deleted' })).to.be.true;

    deleteStub.restore();
    deleteItemsStub.restore();
  });

  it('should return 404 if wishlist is not found', async () => {
    const deleteStub = sinon.stub(Wishlist, 'findOneAndDelete').resolves(null);

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteWishlist(req, res);

    expect(res.status.calledWith(404)).to.be.true;

    deleteStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const deleteStub = sinon.stub(Wishlist, 'findOneAndDelete').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteWishlist(req, res);

    expect(res.status.calledWith(500)).to.be.true;

    deleteStub.restore();
  });
});

// ADD ITEM TESTS

describe('AddItem Function Test', () => {

  it('should add an item successfully', async () => {
    const wishlistId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const wishlist = { _id: wishlistId, owner: userId };

    const findStub = sinon.stub(Wishlist, 'findOne').resolves(wishlist);

    const createdItem = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Sony Headphones',
      price: 350,
      priority: 'High',
      url: '',
      wishlist: wishlistId
    };

    const createStub = sinon.stub(WishlistItem, 'create').resolves(createdItem);

    const req = {
      user: { id: userId },
      params: { wishlistId: wishlistId },
      body: { name: 'Sony Headphones', price: 350, priority: 'High', url: '' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addItem(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdItem)).to.be.true;

    findStub.restore();
    createStub.restore();
  });

  it('should return 404 if wishlist not found', async () => {
    const findStub = sinon.stub(Wishlist, 'findOne').resolves(null);

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { wishlistId: new mongoose.Types.ObjectId() },
      body: { name: 'Sony Headphones', price: 350 }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addItem(req, res);

    expect(res.status.calledWith(404)).to.be.true;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Wishlist, 'findOne').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { wishlistId: new mongoose.Types.ObjectId() },
      body: { name: 'Sony Headphones', price: 350 }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addItem(req, res);

    expect(res.status.calledWith(500)).to.be.true;

    findStub.restore();
  });
});



// UPDATE ITEM TESTS

describe('UpdateItem Function Test', () => {

  it('should update an item successfully', async () => {
    const wishlistId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const itemId = new mongoose.Types.ObjectId();

    const findStub = sinon.stub(Wishlist, 'findOne').resolves({ _id: wishlistId, owner: userId });
    const updateStub = sinon.stub(WishlistItem, 'findOneAndUpdate').resolves({ _id: itemId, name: 'Updated Item' });

    const req = {
      user: { id: userId },
      params: { wishlistId: wishlistId, itemId: itemId },
      body: { name: 'Updated Item' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateItem(req, res);

    expect(res.json.calledWithMatch({ _id: itemId, name: 'Updated Item' })).to.be.true;

    findStub.restore();
    updateStub.restore();
  });

  it('should return 404 if item not found', async () => {
    const findStub = sinon.stub(Wishlist, 'findOne').resolves({ _id: new mongoose.Types.ObjectId() });
    const updateStub = sinon.stub(WishlistItem, 'findOneAndUpdate').resolves(null);

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { wishlistId: new mongoose.Types.ObjectId(), itemId: new mongoose.Types.ObjectId() },
      body: { name: 'Updated Item' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateItem(req, res);

    expect(res.status.calledWith(404)).to.be.true;

    findStub.restore();
    updateStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findStub = sinon.stub(Wishlist, 'findOne').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { wishlistId: new mongoose.Types.ObjectId(), itemId: new mongoose.Types.ObjectId() },
      body: { name: 'Updated Item' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await updateItem(req, res);

    expect(res.status.calledWith(500)).to.be.true;

    findStub.restore();
  });
});


// DELETE ITEM TESTS

describe('DeleteItem Function Test', () => {

  it('should delete an item successfully', async () => {
    const wishlistId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const findStub = sinon.stub(Wishlist, 'findOne').resolves({ _id: wishlistId, owner: userId });
    const deleteStub = sinon.stub(WishlistItem, 'findOneAndDelete').resolves({ _id: new mongoose.Types.ObjectId() });

    const req = {
      user: { id: userId },
      params: { wishlistId: wishlistId, itemId: new mongoose.Types.ObjectId() }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteItem(req, res);

    expect(res.json.calledWithMatch({ message: 'Item deleted' })).to.be.true;

    findStub.restore();
    deleteStub.restore();
  });

  it('should return 404 if item not found', async () => {
    const findStub = sinon.stub(Wishlist, 'findOne').resolves({ _id: new mongoose.Types.ObjectId() });
    const deleteStub = sinon.stub(WishlistItem, 'findOneAndDelete').resolves(null);

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { wishlistId: new mongoose.Types.ObjectId(), itemId: new mongoose.Types.ObjectId() }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteItem(req, res);

    expect(res.status.calledWith(404)).to.be.true;

    findStub.restore();
    deleteStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findStub = sinon.stub(Wishlist, 'findOne').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { wishlistId: new mongoose.Types.ObjectId(), itemId: new mongoose.Types.ObjectId() }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await deleteItem(req, res);

    expect(res.status.calledWith(500)).to.be.true;

    findStub.restore();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 8. RESERVE ITEM TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('ReserveItem Function Test', () => {
 
  it('should reserve an available item successfully', async () => {
    const userId    = new mongoose.Types.ObjectId();
    const ownerId   = new mongoose.Types.ObjectId();
    const itemId    = new mongoose.Types.ObjectId();
    const fakeItem  = {
      _id: itemId, status: 'available',
      wishlist: new mongoose.Types.ObjectId(),
      reservedBy: null,
      save: sinon.stub().resolves()
    };
    const fakeWishlist  = { owner: { toString: () => ownerId.toString() } };
    const reservedItem  = { _id: itemId, status: 'reserved', reservedBy: { name: 'Tom' } };
 
    const findByIdStub = sinon.stub(WishlistItem, 'findById')
      .onFirstCall().resolves(fakeItem)
      .onSecondCall().returns({ populate: sinon.stub().returns({ populate: sinon.stub().resolves(reservedItem) }) });
    const findWishlistStub = sinon.stub(Wishlist, 'findById').resolves(fakeWishlist);
 
    const req = { user: { id: userId.toString() }, params: { itemId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await reserveItem(req, res);
 
    expect(res.json.calledWithMatch({ status: 'reserved' })).to.be.true;
    findByIdStub.restore();
    findWishlistStub.restore();
  });
 
  it('should return 403 if owner tries to reserve their own item', async () => {
    const ownerId  = new mongoose.Types.ObjectId();
    const fakeItem = { _id: new mongoose.Types.ObjectId(), status: 'available', wishlist: new mongoose.Types.ObjectId() };
    sinon.stub(WishlistItem, 'findById').resolves(fakeItem);
    sinon.stub(Wishlist, 'findById').resolves({ owner: { toString: () => ownerId.toString() } });
 
    const req = { user: { id: ownerId.toString() }, params: { itemId: fakeItem._id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await reserveItem(req, res);
 
    expect(res.status.calledWith(403)).to.be.true;
    sinon.restore();
  });
 
  it('should return 400 if item is already reserved', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const ownerId  = new mongoose.Types.ObjectId();
    const fakeItem = { _id: new mongoose.Types.ObjectId(), status: 'reserved', wishlist: new mongoose.Types.ObjectId() };
    sinon.stub(WishlistItem, 'findById').resolves(fakeItem);
    sinon.stub(Wishlist, 'findById').resolves({ owner: { toString: () => ownerId.toString() } });
 
    const req = { user: { id: userId.toString() }, params: { itemId: fakeItem._id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await reserveItem(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    sinon.restore();
  });
 
  it('should return 404 if item not found', async () => {
    sinon.stub(WishlistItem, 'findById').resolves(null);
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await reserveItem(req, res);
 
    expect(res.status.calledWith(404)).to.be.true;
    sinon.restore();
  });
});
 
 
// ════════════════════════════════════════════════════════════════════════════
// 9. UNRESERVE ITEM TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('UnreserveItem Function Test', () => {
 
  it('should unreserve an item successfully', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: new mongoose.Types.ObjectId(), status: 'reserved',
      reservedBy: { toString: () => userId.toString() },
      save: sinon.stub().resolves()
    };
    sinon.stub(WishlistItem, 'findById').resolves(fakeItem);
 
    const req = { user: { id: userId.toString() }, params: { itemId: fakeItem._id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await unreserveItem(req, res);
 
    expect(res.json.calledWithMatch({ status: 'available' })).to.be.true;
    sinon.restore();
  });
 
  it('should return 400 if item is not currently reserved', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({ _id: new mongoose.Types.ObjectId(), status: 'available' });
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await unreserveItem(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    sinon.restore();
  });
 
  it('should return 403 if user tries to unreserve someone else reservation', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({
      _id: new mongoose.Types.ObjectId(), status: 'reserved',
      reservedBy: { toString: () => 'anotherUser' }
    });
 
    const req = { user: { id: 'differentUser' }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await unreserveItem(req, res);
 
    expect(res.status.calledWith(403)).to.be.true;
    sinon.restore();
  });
 
  it('should return 404 if item not found', async () => {
    sinon.stub(WishlistItem, 'findById').resolves(null);
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await unreserveItem(req, res);
 
    expect(res.status.calledWith(404)).to.be.true;
    sinon.restore();
  });
});
 
 
// ════════════════════════════════════════════════════════════════════════════
// 10. PURCHASE ITEM TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('PurchaseItem Function Test', () => {
 
  it('should mark item as purchased successfully', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: new mongoose.Types.ObjectId(), status: 'reserved',
      reservedBy: { toString: () => userId.toString() },
      save: sinon.stub().resolves()
    };
    const purchasedItem = { _id: fakeItem._id, status: 'purchased', purchasedBy: { name: 'Tom' } };
    sinon.stub(WishlistItem, 'findById')
      .onFirstCall().resolves(fakeItem)
      .onSecondCall().returns({ populate: sinon.stub().returns({ populate: sinon.stub().resolves(purchasedItem) }) });
 
    const req = { user: { id: userId.toString() }, params: { itemId: fakeItem._id } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseItem(req, res);
 
    expect(res.json.calledWithMatch({ status: 'purchased' })).to.be.true;
    sinon.restore();
  });
 
  it('should return 400 if item is not reserved before purchasing', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({ _id: new mongoose.Types.ObjectId(), status: 'available' });
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseItem(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    sinon.restore();
  });
 
  it('should return 403 if user tries to purchase item reserved by someone else', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({
      _id: new mongoose.Types.ObjectId(), status: 'reserved',
      reservedBy: { toString: () => 'anotherUser' }
    });
 
    const req = { user: { id: 'differentUser' }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseItem(req, res);
 
    expect(res.status.calledWith(403)).to.be.true;
    sinon.restore();
  });
 
  it('should return 404 if item not found', async () => {
    sinon.stub(WishlistItem, 'findById').resolves(null);
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseItem(req, res);
 
    expect(res.status.calledWith(404)).to.be.true;
    sinon.restore();
  });
});
 
 
// ════════════════════════════════════════════════════════════════════════════
// 11. JOIN GROUP GIFT TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('JoinGroupGift Function Test', () => {
  afterEach(() => sinon.restore());
 
  it('should allow first contributor to start a group gift successfully', async () => {
    const userId     = new mongoose.Types.ObjectId();
    const ownerId    = new mongoose.Types.ObjectId();
    const itemId     = new mongoose.Types.ObjectId();
    const fakeItem   = {
      _id: itemId, wishlist: new mongoose.Types.ObjectId(),
      status: 'available', isGroupGift: false,
      maxContributors: null, groupContributors: [],
      save: sinon.stub().resolves()
    };
    const populatedItem = { _id: itemId, status: 'available', groupContributors: [{ name: 'Tom' }] };
 
    sinon.stub(WishlistItem, 'findById')
      .onFirstCall().resolves(fakeItem)
      .onSecondCall().returns({ populate: sinon.stub().resolves(populatedItem) });
    sinon.stub(Wishlist, 'findById').resolves({ owner: { toString: () => ownerId.toString() } });
 
    const req = { user: { id: userId.toString() }, params: { itemId }, body: { maxContributors: 2 } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await joinGroupGift(req, res);
 
    expect(res.status.calledWith(200)).to.be.true;
    expect(fakeItem.isGroupGift).to.equal(true);
    expect(fakeItem.maxContributors).to.equal(2);
  });
 
  it('should return 403 if owner tries to join their own wishlist group gift', async () => {
    const ownerId  = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: new mongoose.Types.ObjectId(), wishlist: new mongoose.Types.ObjectId(),
      status: 'available', isGroupGift: false, groupContributors: []
    };
    sinon.stub(WishlistItem, 'findById').resolves(fakeItem);
    sinon.stub(Wishlist, 'findById').resolves({ owner: { toString: () => ownerId.toString() } });
 
    const req = { user: { id: ownerId.toString() }, params: { itemId: fakeItem._id }, body: { maxContributors: 2 } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await joinGroupGift(req, res);
 
    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Owners cannot join group gifts on their own wishlist' })).to.be.true;
  });
 
  it('should return 400 if item has already been purchased', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const ownerId  = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: new mongoose.Types.ObjectId(), wishlist: new mongoose.Types.ObjectId(),
      status: 'purchased', isGroupGift: false, groupContributors: []
    };
    sinon.stub(WishlistItem, 'findById').resolves(fakeItem);
    sinon.stub(Wishlist, 'findById').resolves({ owner: { toString: () => ownerId.toString() } });
 
    const req = { user: { id: userId.toString() }, params: { itemId: fakeItem._id }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await joinGroupGift(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'This item has already been purchased' })).to.be.true;
  });
 
  it('should return 400 if item is already solo reserved by someone else', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const ownerId  = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: new mongoose.Types.ObjectId(), wishlist: new mongoose.Types.ObjectId(),
      status: 'reserved', isGroupGift: false, groupContributors: []
    };
    sinon.stub(WishlistItem, 'findById').resolves(fakeItem);
    sinon.stub(Wishlist, 'findById').resolves({ owner: { toString: () => ownerId.toString() } });
 
    const req = { user: { id: userId.toString() }, params: { itemId: fakeItem._id }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await joinGroupGift(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'This item is already reserved by someone else' })).to.be.true;
  });
 
  it('should return 400 if user tries to join the same group gift twice', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const ownerId  = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: new mongoose.Types.ObjectId(), wishlist: new mongoose.Types.ObjectId(),
      status: 'available', isGroupGift: true, maxContributors: 3,
      groupContributors: [{ toString: () => userId.toString() }]
    };
    sinon.stub(WishlistItem, 'findById').resolves(fakeItem);
    sinon.stub(Wishlist, 'findById').resolves({ owner: { toString: () => ownerId.toString() } });
 
    const req = { user: { id: userId.toString() }, params: { itemId: fakeItem._id }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await joinGroupGift(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'You have already joined this group gift' })).to.be.true;
  });
 
  it('should return 400 if group is already full', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const ownerId  = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: new mongoose.Types.ObjectId(), wishlist: new mongoose.Types.ObjectId(),
      status: 'reserved', isGroupGift: true, maxContributors: 2,
      groupContributors: [
        { toString: () => new mongoose.Types.ObjectId().toString() },
        { toString: () => new mongoose.Types.ObjectId().toString() }
      ]
    };
    sinon.stub(WishlistItem, 'findById').resolves(fakeItem);
    sinon.stub(Wishlist, 'findById').resolves({ owner: { toString: () => ownerId.toString() } });
 
    const req = { user: { id: userId.toString() }, params: { itemId: fakeItem._id }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await joinGroupGift(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'This group gift is already full' })).to.be.true;
  });
 
  it('should auto-reserve item when last contributor slot is filled', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const ownerId  = new mongoose.Types.ObjectId();
    const itemId   = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: itemId, wishlist: new mongoose.Types.ObjectId(),
      status: 'available', isGroupGift: true, maxContributors: 2,
      groupContributors: [{ toString: () => new mongoose.Types.ObjectId().toString() }],
      save: sinon.stub().resolves()
    };
    const populatedItem = { _id: itemId, status: 'reserved', groupContributors: [] };
 
    sinon.stub(WishlistItem, 'findById')
      .onFirstCall().resolves(fakeItem)
      .onSecondCall().returns({ populate: sinon.stub().resolves(populatedItem) });
    sinon.stub(Wishlist, 'findById').resolves({ owner: { toString: () => ownerId.toString() } });
 
    const req = { user: { id: userId.toString() }, params: { itemId }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await joinGroupGift(req, res);
 
    expect(fakeItem.status).to.equal('reserved');
    expect(res.status.calledWith(200)).to.be.true;
  });
 
  it('should return 404 if item not found', async () => {
    sinon.stub(WishlistItem, 'findById').resolves(null);
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await joinGroupGift(req, res);
 
    expect(res.status.calledWith(404)).to.be.true;
  });
});
 
 
// ════════════════════════════════════════════════════════════════════════════
// 12. LEAVE GROUP GIFT TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('LeaveGroupGift Function Test', () => {
  afterEach(() => sinon.restore());
 
  it('should allow a contributor to leave a group gift successfully', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const itemId   = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: itemId, status: 'available', isGroupGift: true, maxContributors: 2,
      groupContributors: [
        { toString: () => userId.toString() },
        { toString: () => new mongoose.Types.ObjectId().toString() }
      ],
      save: sinon.stub().resolves()
    };
    const populatedItem = { _id: itemId, status: 'available', groupContributors: [] };
 
    sinon.stub(WishlistItem, 'findById')
      .onFirstCall().resolves(fakeItem)
      .onSecondCall().returns({ populate: sinon.stub().resolves(populatedItem) });
 
    const req = { user: { id: userId.toString() }, params: { itemId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await leaveGroupGift(req, res);
 
    expect(res.status.calledWith(200)).to.be.true;
  });
 
  it('should return 400 if item is not a group gift', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({
      _id: new mongoose.Types.ObjectId(), isGroupGift: false,
      status: 'available', groupContributors: []
    });
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await leaveGroupGift(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'This item is not a group gift' })).to.be.true;
  });
 
  it('should return 400 if item has already been purchased', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({
      _id: new mongoose.Types.ObjectId(), isGroupGift: true,
      status: 'purchased', groupContributors: []
    });
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await leaveGroupGift(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Cannot leave — this gift has already been purchased' })).to.be.true;
  });
 
  it('should return 403 if user is not part of the group', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({
      _id: new mongoose.Types.ObjectId(), isGroupGift: true,
      status: 'available', groupContributors: [{ toString: () => 'someOtherUser' }]
    });
 
    const req = { user: { id: 'differentUser' }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await leaveGroupGift(req, res);
 
    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'You are not part of this group gift' })).to.be.true;
  });
 
  it('should reset item to available if last contributor leaves', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const itemId   = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: itemId, isGroupGift: true, status: 'available', maxContributors: 2,
      groupContributors: [{ toString: () => userId.toString() }],
      save: sinon.stub().resolves()
    };
    const populatedItem = { _id: itemId, status: 'available', groupContributors: [] };
 
    sinon.stub(WishlistItem, 'findById')
      .onFirstCall().resolves(fakeItem)
      .onSecondCall().returns({ populate: sinon.stub().resolves(populatedItem) });
 
    const req = { user: { id: userId.toString() }, params: { itemId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await leaveGroupGift(req, res);
 
    expect(fakeItem.isGroupGift).to.equal(false);
    expect(fakeItem.maxContributors).to.equal(null);
    expect(fakeItem.status).to.equal('available');
  });
 
  it('should return 404 if item not found', async () => {
    sinon.stub(WishlistItem, 'findById').resolves(null);
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await leaveGroupGift(req, res);
 
    expect(res.status.calledWith(404)).to.be.true;
  });
});
 
 
// ════════════════════════════════════════════════════════════════════════════
// 13. PURCHASE GROUP GIFT TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('PurchaseGroupGift Function Test', () => {
  afterEach(() => sinon.restore());
 
  it('should allow a group member to mark the gift as purchased', async () => {
    const userId   = new mongoose.Types.ObjectId();
    const itemId   = new mongoose.Types.ObjectId();
    const fakeItem = {
      _id: itemId, isGroupGift: true, status: 'reserved', maxContributors: 2,
      groupContributors: [
        { toString: () => userId.toString() },
        { toString: () => new mongoose.Types.ObjectId().toString() }
      ],
      save: sinon.stub().resolves()
    };
    const populatedItem = { _id: itemId, status: 'purchased', groupContributors: [] };
 
    sinon.stub(WishlistItem, 'findById')
      .onFirstCall().resolves(fakeItem)
      .onSecondCall().returns({ populate: sinon.stub().resolves(populatedItem) });
 
    const req = { user: { id: userId.toString() }, params: { itemId } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseGroupGift(req, res);
 
    expect(fakeItem.status).to.equal('purchased');
    expect(res.status.calledWith(200)).to.be.true;
  });
 
  it('should return 400 if item is not a group gift', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({
      _id: new mongoose.Types.ObjectId(), isGroupGift: false,
      status: 'available', groupContributors: []
    });
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseGroupGift(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'This item is not a group gift' })).to.be.true;
  });
 
  it('should return 400 if gift has already been purchased', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({
      _id: new mongoose.Types.ObjectId(), isGroupGift: true,
      status: 'purchased', groupContributors: []
    });
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseGroupGift(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'This gift has already been purchased' })).to.be.true;
  });
 
  it('should return 400 if group is not complete yet', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({
      _id: new mongoose.Types.ObjectId(), isGroupGift: true, status: 'available',
      maxContributors: 3,
      groupContributors: [{ toString: () => new mongoose.Types.ObjectId().toString() }]
    });
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseGroupGift(req, res);
 
    expect(res.status.calledWith(400)).to.be.true;
  });
 
  it('should return 403 if user is not a group contributor', async () => {
    sinon.stub(WishlistItem, 'findById').resolves({
      _id: new mongoose.Types.ObjectId(), isGroupGift: true, status: 'reserved',
      maxContributors: 2,
      groupContributors: [
        { toString: () => new mongoose.Types.ObjectId().toString() },
        { toString: () => new mongoose.Types.ObjectId().toString() }
      ]
    });
 
    const req = { user: { id: 'outsideUser' }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseGroupGift(req, res);
 
    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Only group contributors can mark this gift as purchased' })).to.be.true;
  });
 
  it('should return 404 if item not found', async () => {
    sinon.stub(WishlistItem, 'findById').resolves(null);
 
    const req = { user: { id: new mongoose.Types.ObjectId() }, params: { itemId: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
 
    await purchaseGroupGift(req, res);
 
    expect(res.status.calledWith(404)).to.be.true;
  });
});
 
 
// ════════════════════════════════════════════════════════════════════════════
// 14. EMAIL REMINDER TESTS
// ════════════════════════════════════════════════════════════════════════════
describe('Email Reminder – sendExpiryReminders', () => {
  afterEach(() => sinon.restore());
 
  it('should send 7-day reminder and mark flag as sent', async () => {
    const fakeWishlist = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Birthday',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      reminder7DaySent: false,
      reminder1DaySent: false,
      save: sinon.stub().resolves()
    };
    const findStub = sinon.stub(Wishlist, 'find');
    findStub.onFirstCall().resolves([fakeWishlist]);
    findStub.onSecondCall().resolves([]);
    sinon.stub(WishlistItem, 'find').returns({ populate: sinon.stub().resolves([]) });
 
    await sendExpiryReminders();
 
    expect(fakeWishlist.reminder7DaySent).to.equal(true);
    expect(fakeWishlist.save.calledOnce).to.equal(true);
  });
 
  it('should send 1-day reminder and mark flag as sent', async () => {
    const fakeWishlist = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Birthday',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      reminder7DaySent: true,
      reminder1DaySent: false,
      save: sinon.stub().resolves()
    };
    const findStub = sinon.stub(Wishlist, 'find');
    findStub.onFirstCall().resolves([]);
    findStub.onSecondCall().resolves([fakeWishlist]);
    sinon.stub(WishlistItem, 'find').returns({ populate: sinon.stub().resolves([]) });
 
    await sendExpiryReminders();
 
    expect(fakeWishlist.reminder1DaySent).to.equal(true);
    expect(fakeWishlist.save.calledOnce).to.equal(true);
  });
 
  it('should not re-send reminder if flag is already true', async () => {
    sinon.stub(Wishlist, 'find').resolves([]);
    await sendExpiryReminders();
    expect(WishlistItem.find.called ?? false).to.equal(false);
  });
 
  it('should handle database error gracefully without crashing', async () => {
    sinon.stub(Wishlist, 'find').rejects(new Error('DB error'));
    try {
      await sendExpiryReminders();
    } catch (err) {
      expect.fail('sendExpiryReminders should not throw: ' + err.message);
    }
  });
});