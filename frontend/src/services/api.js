const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to validate JWT token format
const isValidJWT = (token) => {
    if (!token || typeof token !== 'string') return false;
    if (token.trim() === '') return false;
    const parts = token.split('.');
    return parts.length === 3;
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
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

// Budget API
export const budgetAPI = {
    getBudgets: async (month = null) => {
        const params = month ? `?month=${month}` : '';
        return apiCall(`/budgets${params}`);
    },

    createBudget: async (budgetData) => {
        return apiCall('/budgets', {
            method: 'POST',
            body: JSON.stringify(budgetData),
        });
    },

    updateBudget: async (id, budgetData) => {
        return apiCall(`/budgets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(budgetData),
        });
    },

    deleteBudget: async (id) => {
        return apiCall(`/budgets/${id}`, {
            method: 'DELETE',
        });
    },

    getBudget: async (id) => {
        return apiCall(`/budgets/${id}`);
    },

    getBudgetTemplates: async () => {
        return apiCall('/budgets/templates');
    },

    createFromTemplate: async (templateName, targetMonth) => {
        return apiCall(`/budgets/templates/${templateName}/create?targetMonth=${targetMonth}`, {
            method: 'POST',
        });
    },

    copyToNextMonth: async (sourceMonth) => {
        return apiCall(`/budgets/copy-to-next-month?sourceMonth=${sourceMonth}`, {
            method: 'POST',
        });
    },

    getBudgetSummary: async (month) => {
        console.log('budgetAPI.getBudgetSummary called with month:', month);
        return apiCall(`/budgets/summary?month=${month}`);
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

// Analytics API
export const analyticsAPI = {
    getSpendingOverview: async (timeRange = 'month') => {
        return apiCall(`/analytics/spending-overview?timeRange=${timeRange}`);
    },

    getCategoryBreakdown: async (timeRange = 'month') => {
        return apiCall(`/analytics/category-breakdown?timeRange=${timeRange}`);
    },

    getMonthlyTrend: async (months = 12) => {
        return apiCall(`/analytics/monthly-trend?months=${months}`);
    },

    getTopExpenses: async (limit = 10, timeRange = 'month') => {
        return apiCall(`/analytics/top-expenses?limit=${limit}&timeRange=${timeRange}`);
    },

    getInsights: async () => {
        return apiCall('/analytics/insights');
    },
};

// Data Management API
export const dataAPI = {
    exportCSV: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/data/export/csv`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to export CSV');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-data-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true, message: 'CSV exported successfully' };
    },

    importCSV: async (csvData) => {
        return apiCall('/data/import/csv', {
            method: 'POST',
            body: JSON.stringify({ csvData }),
        });
    },

    exportPDF: async (startDate, endDate, category) => {
        const token = localStorage.getItem('token');
        let url = `${API_BASE_URL}/data/export/pdf`;
        const params = new URLSearchParams();

        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (category) params.append('category', category);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to export PDF');
        }

        const blob = await response.blob();
        const url2 = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url2;
        a.download = `expense-report-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url2);
        document.body.removeChild(a);

        return { success: true, message: 'Report exported successfully' };
    },

    backupData: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/data/backup`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to backup data');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true, message: 'Data backed up successfully' };
    },
};

// Recurring Expenses API
export const recurringAPI = {
    getRecurringExpenses: async () => {
        return apiCall('/recurring-expenses');
    },

    createRecurringExpense: async (expenseData) => {
        return apiCall('/recurring-expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData),
        });
    },

    updateRecurringExpense: async (id, expenseData) => {
        return apiCall(`/recurring-expenses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(expenseData),
        });
    },

    deleteRecurringExpense: async (id) => {
        return apiCall(`/recurring-expenses/${id}`, {
            method: 'DELETE',
        });
    },

    generateExpenses: async (upToDate) => {
        return apiCall('/recurring-expenses/generate', {
            method: 'POST',
            body: JSON.stringify({ upToDate }),
        });
    },
};
