import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore the session from a stored token on mount.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = decodeToken(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
        } else {
          setUser({
            id: decoded.id,
            email: decoded.email,
            firstName: decoded.firstName || decoded.email?.split('@')[0] || 'User'
          });
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // The API returns { success, token, user } at the top level.
  const completeSignIn = useCallback((body) => {
    localStorage.setItem('token', body.token);
    setUser(body.user);
    setIsAuthenticated(true);
    return { success: true, user: body.user };
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const body = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password
        })
      });
      return completeSignIn(body);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [completeSignIn]);

  const login = useCallback(async (email, password) => {
    try {
      const body = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      return completeSignIn(body);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [completeSignIn]);

  const guestLogin = useCallback(async () => {
    try {
      const body = await apiFetch('/auth/guest', { method: 'POST', body: '{}' });
      return completeSignIn(body);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [completeSignIn]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = { user, loading, isAuthenticated, register, login, logout, guestLogin };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
