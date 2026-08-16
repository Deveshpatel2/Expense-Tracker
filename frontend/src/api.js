export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Thin fetch wrapper: attaches auth, parses JSON, and throws on non-2xx.
export const apiFetch = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
            ...(options.headers || {})
        }
    });

    let body = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    if (!response.ok) {
        throw new Error((body && body.message) || `Request failed (${response.status})`);
    }
    return body;
};

export const listExpenses = () => apiFetch('/expenses').then((r) => r.data || []);

export const createExpense = (expense) =>
    apiFetch('/expenses', { method: 'POST', body: JSON.stringify(expense) });

export const updateExpense = (id, expense) =>
    apiFetch(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expense) });

export const deleteExpense = (id) => apiFetch(`/expenses/${id}`, { method: 'DELETE' });

// CSV export returns a file, not JSON, so it bypasses apiFetch.
export const downloadCsvUrl = () => `${API_BASE_URL}/data/export/csv`;
