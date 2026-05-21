const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const WishlistItem = require('../models/WishlistItem');
const { createWishlist, getMyWishlists, getWishlistById, updateWishlist, deleteWishlist } = require('../controllers/wishlistController');
const { addItem, updateItem, deleteItem } = require('../controllers/itemController');
const { expect } = chai;


// CREATE WISHLIST TESTS

describe('CreateWishlist Function Test', () => {

  it('should create a new wishlist successfully', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { name: "Sarah's 30th Birthday" }
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
      body: { name: "Sarah's 30th Birthday" }
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