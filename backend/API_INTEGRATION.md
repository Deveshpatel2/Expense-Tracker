# API Integration Guide

## Current Status
✅ **Backend**: Running on `http://localhost:8080`
✅ **Frontend**: Running on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/guest` - Create guest user
- `POST /api/auth/google` - Google sign-in

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Statistics
- `GET /api/expenses/statistics/totals` - Get totals by currency
- `GET /api/expenses/statistics/categories` - Get totals by category

### File Upload
- `POST /api/upload/receipt` - Upload receipt image

## Frontend Integration Steps

### 1. Update AuthContext.js
Replace the mock authentication with real API calls:

```javascript
// Example for login
const loginWithEmail = async (email, password) => {
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { success: true };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Login failed' };
  }
};
```

### 2. Add API Service
Create `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return response.json();
};

export const expenseAPI = {
  getExpenses: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/expenses?${params}`);
  },
  
  createExpense: (expenseData) => {
    return apiCall('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },
  
  updateExpense: (id, expenseData) => {
    return apiCall(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData),
    });
  },
  
  deleteExpense: (id) => {
    return apiCall(`/expenses/${id}`, {
      method: 'DELETE',
    });
  },
  
  getStatistics: () => {
    return Promise.all([
      apiCall('/expenses/statistics/totals'),
      apiCall('/expenses/statistics/categories'),
    ]);
  },
};
```

### 3. Update Components
Replace localStorage operations with API calls in:
- `Dashboard.jsx` - Expense management
- `ExpenseManager.jsx` - Add/edit expenses
- `Report.jsx` - Statistics and reports

## Testing the API

### Test Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Test Create Expense (with token)
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Grocery Shopping",
    "amount": 85.50,
    "category": "Food & Dining",
    "expenseDate": "2024-01-15",
    "notes": "Weekly groceries",
    "currency": "USD"
  }'
```

## Database
The backend uses SQLite database (`expense_tracker.db`) which is automatically created when the server starts.

## Next Steps
1. Update frontend components to use real API calls
2. Add error handling and loading states
3. Implement proper file upload for receipts
4. Add data validation and sanitization
5. Deploy to production environment
