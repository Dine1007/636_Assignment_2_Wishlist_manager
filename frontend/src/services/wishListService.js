// services/wishListService.js
import axiosInstance from '../axiosConfig';

const createWishlist = async (name, dueDate) => {
  const response = await axiosInstance.post('/api/wishlists', { name, dueDate });
  return response.data;
};


const getWishlists = async () => {
  const response = await axiosInstance.get('/api/wishlists');
  return response.data;
};

const deleteWishlist = async (id) => {
  await axiosInstance.delete(`/api/wishlists/${id}`);
};


const getWishlistById = async (wishlistId) => {
  const response = await axiosInstance.get(`/api/wishlists/${wishlistId}`);
  return response.data;
};


const getSharedWishlist = async (shareLink) => {
  const response = await axiosInstance.get(`/api/wishlists/share/${shareLink}`);
  return response.data;
};


const updateWishlist = async (wishlistId, name, dueDate) => {
  const response = await axiosInstance.put(`/api/wishlists/${wishlistId}`, { name, dueDate });
  return response.data;
};

const shareWishlist = async (wishlistId) => {
  await axiosInstance.put(`/api/wishlists/${wishlistId}/share`, {});
};

const wishListService = {
  createWishlist,
  getSharedWishlist,
  getWishlists,
  getWishlistById,
  updateWishlist,
  shareWishlist,
  deleteWishlist,
};

export default wishListService;



