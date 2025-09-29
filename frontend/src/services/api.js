// Import cache utilities
import { cacheUtils, cacheKeys } from '../utils/cacheUtils';

// Dynamic API URL that works for both desktop and mobile
const getApiBaseUrl = () => {
    // If we're on localhost (desktop), use localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8080/api';
    }
    // If we're on mobile/network, use the same hostname but port 8080
    return `http://${window.location.hostname}:8080/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to validate JWT token format
const isValidJWT = (token) => {
    if (!token || typeof token !== 'string') return false;
    if (token.trim() === '') return false;
    const parts = token.split('.');
    return parts.length === 3;
};

// Helper function to make API calls with caching
const apiCall = async (endpoint, options = {}, cacheKey = null, cacheDuration = null) => {
    const token = localStorage.getItem('token');

    // Validate token format before sending
    if (token && !isValidJWT(token)) {
        console.warn('Invalid token format detected, clearing token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('authMethod');
        // Don't send the request if token is invalid
        throw new Error('Invalid token format');
    }

    // Check cache for GET requests
    if (options.method === 'GET' || !options.method) {
        const key = cacheKey || `api_${endpoint}`;
        const cachedData = cacheUtils.getApiCache(key);
        if (cachedData) {
            console.log('Returning cached data for:', endpoint);
            return cachedData;
        }
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
    };

    try {
        console.log('Making API call to:', `${API_BASE_URL}${endpoint}`, 'with config:', config);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        console.log('API response:', response.status, data);

        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
        }

        // Cache successful GET responses
        if (response.ok && (options.method === 'GET' || !options.method)) {
            const key = cacheKey || `api_${endpoint}`;
            cacheUtils.setApiCache(key, data, cacheDuration);
        }

        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Authentication API
export const authAPI = {
    register: async (userData) => {
        return apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    login: async (email, password) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    createGuest: async () => {
        return apiCall('/auth/guest', {
            method: 'POST',
        });
    },

    googleSignIn: async (googleData) => {
        return apiCall('/auth/google', {
            method: 'POST',
            body: JSON.stringify(googleData),
        });
    },
};

// Expenses API
export const expenseAPI = {
    getExpenses: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const queryString = params.toString();
        const endpoint = `/expenses${queryString ? `?${queryString}` : ''}`;

        // Generate cache key based on filters
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const cacheKey = cacheKeys.expenses(user.id, filters);

        return apiCall(endpoint, {}, cacheKey);
    },

    createExpense: async (expenseData) => {
        const result = await apiCall('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData),
        });

        // Clear expenses cache after creating new expense
        cacheUtils.clearApiCache('expenses_');
        return result;
    },

    updateExpense: async (id, expenseData) => {
        const result = await apiCall(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(expenseData),
        });

        // Clear expenses cache after updating expense
        cacheUtils.clearApiCache('expenses_');
        return result;
    },

    deleteExpense: async (id) => {
        const result = await apiCall(`/expenses/${id}`, {
            method: 'DELETE',
        });

        // Clear expenses cache after deleting expense
        cacheUtils.clearApiCache('expenses_');
        return result;
    },

    getExpense: async (id) => {
        return apiCall(`/expenses/${id}`);
    },

    getStatistics: async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const totalsCacheKey = cacheKeys.statistics(user.id, 'totals');
        const categoriesCacheKey = cacheKeys.statistics(user.id, 'categories');

        const [totals, categories] = await Promise.all([
            apiCall('/expenses/statistics/totals', {}, totalsCacheKey),
            apiCall('/expenses/statistics/categories', {}, categoriesCacheKey),
        ]);

        return {
            totals: totals.data,
            categories: categories.data,
        };
    },
};


// File upload API
export const uploadAPI = {
    uploadReceipt: async (file) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('receipt', file);

        const response = await fetch(`${API_BASE_URL}/upload/receipt`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }

        return data;
    },
};



