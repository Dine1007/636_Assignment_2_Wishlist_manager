// services/authService.js
import axiosInstance from '../axiosConfig';

const login = async (formData) => {
  const response = await axiosInstance.post('/api/auth/login', formData);
  return response.data;
};
const register = async (formData) => {
  const response = await axiosInstance.post('/api/auth/register', formData);
  return response.data;
};

const getProfile = async () => {
  const response = await axiosInstance.get('/api/auth/profile');
  return response.data;
};

const updateProfile = async (formData) => {
  const response = await axiosInstance.put('/api/auth/profile', formData);
  return response.data;
};

const authService = { login, register, getProfile, updateProfile };

export default authService;
