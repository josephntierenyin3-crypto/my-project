import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export const AuthContext = createContext();

const STORAGE_KEY = 'goodday_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const userData = JSON.parse(saved);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Restore auth:', e);
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const register = async (username, email, password, role = 'user') => {
    try {
      const data = await api.auth.register({ username, email, password, role });
      if (data.user) {
        setUser({ ...data.user, name: data.user.username });
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (e) {
      return { success: false, error: e.message || 'Registration failed' };
    }
  };

  const login = async (email, password, role) => {
    try {
      const data = await api.auth.login({ email, password, role });
      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Invalid credentials' };
    } catch (e) {
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, authLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
