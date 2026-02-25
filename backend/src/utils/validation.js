const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/\d/.test(password)) errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Password must contain at least one special character');

    return { isValid: errors.length === 0, errors };
};

const validateAmount = (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 999999.99;
};

const validateDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

const validateCurrency = (currency) => {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'];
    return validCurrencies.includes(currency);
};

const validateCategory = (category) => {
    const validCategories = [
        'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
        'Healthcare', 'Utilities', 'Housing', 'Education', 'Travel', 'Other'
    ];
    return validCategories.includes(category);
};

module.exports = {
    validateEmail,
    validatePassword,
    validateAmount,
    validateDate,
    validateCurrency,
    validateCategory
};
