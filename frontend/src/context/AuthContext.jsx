import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token and user data exists in local storage
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // Verify token with backend
      api.get('/auth/profile')
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('adminUser', JSON.stringify(res.data));
        })
        .catch(() => {
          // Token is expired/invalid
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token, user: loggedUser } = res.data;
      
      setToken(token);
      setUser(loggedUser);
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(loggedUser));
      
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const res = await api.post('/auth/change-password', { oldPassword, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to change password.';
      return { success: false, error: errMsg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
