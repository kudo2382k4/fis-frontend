import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fis_token');
      localStorage.removeItem('fis_user');
      // Redirect về login nếu chưa ở trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
