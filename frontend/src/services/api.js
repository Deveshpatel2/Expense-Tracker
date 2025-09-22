const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
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
        return apiCall(`/expenses${queryString ? `?${queryString}` : ''}`);
    },

    createExpense: async (expenseData) => {
        return apiCall('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData),
        });
    },

    updateExpense: async (id, expenseData) => {
        return apiCall(`/expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(expenseData),
        });
    },

    deleteExpense: async (id) => {
        return apiCall(`/expenses/${id}`, {
            method: 'DELETE',
        });
    },

    getExpense: async (id) => {
        return apiCall(`/expenses/${id}`);
    },

    getStatistics: async () => {
        const [totals, categories] = await Promise.all([
            apiCall('/expenses/statistics/totals'),
            apiCall('/expenses/statistics/categories'),
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
