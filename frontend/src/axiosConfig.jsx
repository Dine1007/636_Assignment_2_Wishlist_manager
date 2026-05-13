import axios from "axios";

// Singleton — one shared axios instance for the entire app
const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001', // local
    //baseURL: 'http://3.106.249.235:5001', // live
    headers: { 'Content-Type': 'application/json' },

});

// Adapter — intercepts every request and attaches the token
// so no individual API call needs to handle auth manually
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
