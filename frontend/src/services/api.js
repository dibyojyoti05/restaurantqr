import axios from 'axios';

// Determine API URL based on environment
const getApiBaseUrl = () => {
  // If explicitly set in environment, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Auto-detect based on hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    } else {
      return 'https://res-qr-2.onrender.com/api';
    }
  }
  
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu API
export const menuAPI = {
  getAll: () => api.get('/menu'),
  getById: (id) => api.get(`/menu/${id}`),
  getCategories: () => api.get('/menu/categories/all'),
  getByCategory: (category) => api.get(`/menu?category=${category}`)
};

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getById: (id) => api.get(`/orders/${id}`),
  trackByNumber: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  getLatestForTable: (tableId) => api.get(`/orders/table/${tableId}/latest`)
};

// Tables API
export const tablesAPI = {
  getByQR: (qrCode) => api.get(`/tables/qr/${qrCode}`),
  getById: (id) => api.get(`/tables/${id}`),
  getAll: () => api.get('/tables')
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  addMenuItem: (item) => api.post('/admin/menu', item),
  updateMenuItem: (id, item) => api.put(`/admin/menu/${id}`, item),
  deleteMenuItem: (id) => api.delete(`/admin/menu/${id}`),
  getTables: () => api.get('/admin/tables'),
  addTable: (table) => api.post('/admin/tables', table),
  updateTable: (id, table) => api.put(`/admin/tables/${id}`, table),
  deleteTable: (id) => api.delete(`/admin/tables/${id}`)
};

// Rewards API
export const rewardsAPI = {
  getRewards: (tableId) => api.get(`/rewards/${tableId}`),
  saveRewards: (tableId, data) => api.post(`/rewards/${tableId}`, data),
  applyRewards: (tableId, orderNumber) => api.post(`/rewards/${tableId}/apply/${orderNumber}`)
};

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  verify: () => api.get('/auth/verify'),
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;