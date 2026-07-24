import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Bypass-Tunnel-Reminder': 'true'
  }
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
