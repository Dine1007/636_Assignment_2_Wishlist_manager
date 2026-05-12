import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CreateWishlist from './pages/CreateWishlist';
import WishlistDetail from './pages/WishlistDetail';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import ShareWishlist from './pages/ShareWishlist';
import GuestView from './pages/GuestView';
import './App.css';

function App() {
  console.log({ 
  Landing, 
  Login, 
  Register, 
  Profile, 
  Dashboard, 
  CreateWishlist, 
  WishlistDetail, 
  AddItem, 
  EditItem, 
  ShareWishlist, 
  GuestView 
});
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-wishlist" element={<CreateWishlist />} />
        <Route path="/wishlist/:id" element={<WishlistDetail />} />
        <Route path="/wishlist/:id/add-item" element={<AddItem />} />
        <Route path="/wishlist/:wishlistId/edit-item/:itemId" element={<EditItem />} />
        <Route path="/wishlist/:id/share" element={<ShareWishlist />} />
        <Route path="/shared/:shareLink" element={<GuestView />} />
      </Routes>
    </Router>
  );
}

export default App;
