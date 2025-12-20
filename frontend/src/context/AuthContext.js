import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:8080/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode token to get user info
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        
        // Set user from token
        setUser({
          id: decoded.id,
          email: decoded.email,
          firstName: decoded.firstName || decoded.sub?.split('@')[0] || 'User',
          lastName: decoded.lastName || ''
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Register new user
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password
      });

      if (response.data.success) {
        const { token, user: userInfo } = response.data.data;
        localStorage.setItem('token', token);
        setUser(userInfo);
        setIsAuthenticated(true);
        return { success: true, user: userInfo };
      } else {
        return { success: false, error: response.data.message || 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { token, user: userInfo } = response.data.data;
        localStorage.setItem('token', token);
        setUser(userInfo);
        setIsAuthenticated(true);
        return { success: true, user: userInfo };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Google Sign-In (mock implementation - can be enhanced with actual Google OAuth)
  const googleSignIn = async () => {
    try {
      // For now, create a guest user or use the backend Google endpoint
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        email: `google-${Date.now()}@example.com`,
        firstName: 'Google',
        lastName: 'User',
        profilePicture: '',
        googleId: `google-${Date.now()}`
      });

      if (response.data.success) {
        const { token, user: userInfo } = response.data.data;
        localStorage.setItem('token', token);
        setUser(userInfo);
        setIsAuthenticated(true);
        return { success: true, user: userInfo };
      } else {
        return { success: false, error: response.data.message || 'Google Sign-In failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Google Sign-In failed';
      return { success: false, error: errorMessage };
    }
  };

  // Guest login with better error handling
  const guestLogin = async () => {
    try {
      console.log('🔵 Frontend: Attempting guest login...');
      console.log('🔵 Frontend: API URL:', `${API_BASE_URL}/auth/guest`);
      
      const response = await axios.post(`${API_BASE_URL}/auth/guest`, {}, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('🔵 Frontend: Response received:', response.data);

      if (response.data && response.data.success) {
        const { token, user: userInfo } = response.data.data;
        console.log('🔵 Frontend: Saving token and user info');
        localStorage.setItem('token', token);
        setUser(userInfo);
        setIsAuthenticated(true);
        console.log('✅ Frontend: Guest login successful');
        return { success: true, user: userInfo };
      } else {
        console.error('❌ Frontend: Response indicates failure:', response.data);
        return { success: false, error: response.data?.message || 'Guest login failed' };
      }
    } catch (error) {
      console.error('❌ Frontend: Guest login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Guest login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to server. Make sure the backend is running on port 8080.';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Request timed out. Please try again.';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Password reset request
  const resetPassword = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    }
  };

  // Update password (for authenticated users)
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/user/change-password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return { success: response.data.success, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Delete account
  const deleteAccount = async (password) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE_URL}/user/account`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { password }
        }
      );
      
      if (response.data.success) {
        logout();
        return { success: true, message: response.data.message };
      }
      return { success: false, error: response.data.message || 'Account deletion failed' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Account deletion failed';
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    googleSignIn,
    guestLogin,
    resetPassword,
    updatePassword,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

