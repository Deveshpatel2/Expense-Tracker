
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authMethod, setAuthMethod] = useState(null); // 'google', 'manual', 'guest'

    useEffect(() => {
        // Check if user is logged in on app start
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const savedAuthMethod = localStorage.getItem('authMethod');

        if (token && userData) {
            try {
                const parsedUserData = JSON.parse(userData);

                // Validate token by checking if it's expired
                // Check if token has the correct JWT format (3 parts separated by dots)
                if (token.split('.').length !== 3) {
                    console.log('Invalid token format, logging out');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('authMethod');
                    return;
                }

                // Additional validation - check if token is not just whitespace
                if (token.trim() === '') {
                    console.log('Empty token, logging out');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('authMethod');
                    return;
                }

                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000;

                if (tokenPayload.exp > currentTime) {
                    // Token is still valid
                    setUser(parsedUserData);
                    setIsAuthenticated(true);
                    setAuthMethod(savedAuthMethod || 'manual');
                } else {
                    // Token is expired, clear storage
                    console.log('Token expired, logging out');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('authMethod');
                }
            } catch (error) {
                console.error('Error parsing user data or token:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('authMethod');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token, method = 'manual') => {
        setUser(userData);
        setIsAuthenticated(true);
        setAuthMethod(method);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authMethod', method);
    };

    const loginAsGuest = async () => {
        try {
            const response = await authAPI.createGuest();
            if (response.success) {
                login(response.data.user, response.data.token, 'guest');
                return { success: true, user: response.data.user };
            } else {
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Guest login failed:', error);
            return { success: false, error: 'Guest login failed' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            if (response.success) {
                login(response.data.user, response.data.token, 'manual');
                return { success: true, user: response.data.user };
            } else {
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error: error.message || 'Registration failed' };
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            console.log('AuthContext: loginWithEmail called with:', { email, password: password ? '***' : 'empty' });
            const response = await authAPI.login(email, password);
            console.log('AuthContext: API response:', response);
            if (response.success) {
                console.log('AuthContext: Login successful, calling login function');
                login(response.data.user, response.data.token, 'manual');
                return { success: true, user: response.data.user };
            } else {
                console.log('AuthContext: Login failed:', response.message);
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('AuthContext: Login failed:', error);
            return { success: false, error: error.message || 'Login failed' };
        }
    };

    const googleSignIn = async () => {
        try {
            // Mock Google Sign-In for demo purposes
            // In a real app, you would integrate with Google OAuth
            const mockGoogleData = {
                email: 'googleuser@gmail.com',
                firstName: 'Google',
                lastName: 'User',
                profilePicture: 'https://via.placeholder.com/40x40/4285f4/ffffff?text=G'
            };

            const response = await authAPI.googleSignIn(mockGoogleData);
            if (response.success) {
                login(response.data.user, response.data.token, 'google');
                return { success: true, user: response.data.user };
            } else {
                return { success: false, error: response.message };
            }
        } catch (error) {
            console.error('Google Sign-In failed:', error);
            return { success: false, error: error.message || 'Google Sign-In failed' };
        }
    };

    const resetPassword = async (email) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                return { success: true, message: data.message };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            console.error('Password reset failed:', error);
            return { success: false, error: 'Password reset failed' };
        }
    };

    const updatePassword = async (currentPassword, newPassword) => {
        try {
            // Mock password update - simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if user is logged in and current password is correct
            if (!user || !user.email) {
                return { success: false, error: 'User not authenticated' };
            }

            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIndex = registeredUsers.findIndex(u => u.email === user.email);

            if (userIndex === -1) {
                return { success: false, error: 'User not found' };
            }

            // Verify current password
            if (registeredUsers[userIndex].password !== currentPassword) {
                return { success: false, error: 'Current password is incorrect' };
            }

            // Update password
            registeredUsers[userIndex].password = newPassword;
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

            return { success: true, message: 'Password updated successfully' };
        } catch (error) {
            console.error('Password update failed:', error);
            return { success: false, error: 'Password update failed' };
        }
    };

    const deleteAccount = async (password) => {
        try {
            // Mock account deletion - simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if user is logged in and password is correct
            if (!user || !user.email) {
                return { success: false, error: 'User not authenticated' };
            }

            const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userIndex = registeredUsers.findIndex(u => u.email === user.email);

            if (userIndex === -1) {
                return { success: false, error: 'User not found' };
            }

            // Verify password
            if (registeredUsers[userIndex].password !== password) {
                return { success: false, error: 'Incorrect password' };
            }

            // Remove user from registered users
            registeredUsers.splice(userIndex, 1);
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

            // Logout the user
            logout();

            return { success: true, message: 'Account deleted successfully' };
        } catch (error) {
            console.error('Account deletion failed:', error);
            return { success: false, error: 'Account deletion failed' };
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setAuthMethod(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authMethod');
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        authMethod,
        login,
        logout,
        loginAsGuest,
        register,
        loginWithEmail,
        googleSignIn,
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
