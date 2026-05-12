// services/itemService.js
import axiosInstance from '../axiosConfig';

const addItem = async (wishlistId, itemData) => {
  const response = await axiosInstance.post(
    `/api/wishlists/${wishlistId}/items`,
    { ...itemData, price: Number(itemData.price) }
  );
  return response.data;
};

const updateItem = async (wishlistId, itemId, itemData) => {
  const response = await axiosInstance.put(
    `/api/wishlists/${wishlistId}/items/${itemId}`,
    { ...itemData, price: Number(itemData.price) }
  );
  return response.data;
};

const deleteItem = async (wishlistId, itemId) => {
  await axiosInstance.delete(`/api/wishlists/${wishlistId}/items/${itemId}`);
};

const reserveItem = async (itemId) => {
  const response = await axiosInstance.put(`/api/wishlists/items/${itemId}/reserve`, {});
  return response.data;
};

const unreserveItem = async (itemId) => {
  await axiosInstance.put(`/api/wishlists/items/${itemId}/unreserve`, {});
};

const purchaseItem = async (itemId) => {
  const response = await axiosInstance.put(`/api/wishlists/items/${itemId}/purchase`, {});
  return response.data;
};

const itemService = { addItem, updateItem, deleteItem, reserveItem, unreserveItem, purchaseItem };

export default itemService;