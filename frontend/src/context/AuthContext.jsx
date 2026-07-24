import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Use sessionStorage instead of localStorage so the admin session
  // is automatically cleared when the browser tab/window is closed.
  // This means: if you close the browser and reopen it, you must log in again.
  const storedToken = sessionStorage.getItem('adminToken');
  const storedUser = sessionStorage.getItem('adminUser');

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [token, setToken] = useState(storedToken || null);
  // Only show a loading state if there is actually a stored session to verify
  const [loading, setLoading] = useState(!!storedToken);

  useEffect(() => {
    // Only hit the network if we actually have a stored token to verify
    if (!storedToken) return;

    api.get('/auth/profile')
      .then((res) => {
        setUser(res.data);
        sessionStorage.setItem('adminUser', JSON.stringify(res.data));
      })
      .catch(() => {
        // Token is expired or invalid — clean up silently
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
      // sessionStorage: cleared automatically when browser/tab is closed
      sessionStorage.setItem('adminToken', newToken);
      sessionStorage.setItem('adminUser', JSON.stringify(loggedUser));

      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    // Also clean up any old localStorage tokens from previous versions
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
