// services/taskService.js
import axiosInstance from '../axiosConfig';

const createTask = async (formData) => {
  const response = await axiosInstance.post('/api/tasks', formData);
  return response.data;
};

const updateTask = async (taskId, formData) => {
  const response = await axiosInstance.put(`/api/tasks/${taskId}`, formData);
  return response.data;
};


const deleteTask = async (taskId) => {
  await axiosInstance.delete(`/api/tasks/${taskId}`);
};

// services/taskService.js
const getTasks = async () => {
  const response = await axiosInstance.get('/api/tasks');
  return response.data;
};

export default { getTasks, createTask, updateTask, deleteTask };

