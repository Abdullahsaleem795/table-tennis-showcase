import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize token synchronously from localStorage — no flicker
  const storedToken = localStorage.getItem('adminToken');
  const storedUser = localStorage.getItem('adminUser');

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [token, setToken] = useState(storedToken || null);
  // If no token exists, skip the verify call entirely — set loading=false immediately
  const [loading, setLoading] = useState(!!storedToken);

  useEffect(() => {
    // Only hit the network if we actually have a stored token
    if (!storedToken) return;

    api.get('/auth/profile')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('adminUser', JSON.stringify(res.data));
      })
      .catch(() => {
        // Token is expired/invalid — clean up silently
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const { token: newToken, user: loggedUser } = res.data;

      setToken(newToken);
      setUser(loggedUser);
      localStorage.setItem('adminToken', newToken);
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
