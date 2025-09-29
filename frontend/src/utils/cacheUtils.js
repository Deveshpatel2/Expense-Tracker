// Cache utility functions for the expense tracker

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    process.env.REACT_APP_CACHE_DISABLED === 'true';

// Cache configuration
const CACHE_CONFIG = {
    // API response cache durations (in milliseconds)
    EXPENSES: isDevelopment ? 30 * 1000 : 5 * 60 * 1000,        // 30 seconds in dev, 5 minutes in prod
    BUDGETS: isDevelopment ? 60 * 1000 : 10 * 60 * 1000,        // 1 minute in dev, 10 minutes in prod
    STATISTICS: isDevelopment ? 30 * 1000 : 2 * 60 * 1000,      // 30 seconds in dev, 2 minutes in prod
    USER_PREFERENCES: 24 * 60 * 60 * 1000, // 24 hours

    // Form cache durations
    FORM_STATE: isDevelopment ? 5 * 60 * 1000 : 30 * 60 * 1000,     // 5 minutes in dev, 30 minutes in prod

    // Static asset cache durations
    STATIC_ASSETS: isDevelopment ? 0 : 365 * 24 * 60 * 60 * 1000, // No cache in dev, 1 year in prod
};

// In-memory cache for API responses
const apiCache = new Map();

// Cache utility functions
export const cacheUtils = {
    // API response caching
    setApiCache: (key, data, duration = CACHE_CONFIG.EXPENSES) => {
        const cacheEntry = {
            data,
            timestamp: Date.now(),
            duration
        };
        apiCache.set(key, cacheEntry);
    },

    getApiCache: (key) => {
        const cached = apiCache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.duration) {
            return cached.data;
        }
        // Remove expired cache entry
        if (cached) {
            apiCache.delete(key);
        }
        return null;
    },

    clearApiCache: (pattern = null) => {
        if (pattern) {
            // Clear cache entries matching pattern
            for (const [key] of apiCache) {
                if (key.includes(pattern)) {
                    apiCache.delete(key);
                }
            }
        } else {
            // Clear all cache
            apiCache.clear();
        }
    },

    // Form state caching
    setFormCache: (formName, formData) => {
        const cacheKey = `form_${formName}`;
        const cacheEntry = {
            data: formData,
            timestamp: Date.now(),
            duration: CACHE_CONFIG.FORM_STATE
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    },

    getFormCache: (formName) => {
        const cacheKey = `form_${formName}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const cacheEntry = JSON.parse(cached);
                if (Date.now() - cacheEntry.timestamp < cacheEntry.duration) {
                    return cacheEntry.data;
                } else {
                    // Remove expired cache
                    localStorage.removeItem(cacheKey);
                }
            } catch (error) {
                console.error('Error parsing form cache:', error);
                localStorage.removeItem(cacheKey);
            }
        }
        return null;
    },

    clearFormCache: (formName = null) => {
        if (formName) {
            localStorage.removeItem(`form_${formName}`);
        } else {
            // Clear all form caches
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('form_')) {
                    localStorage.removeItem(key);
                }
            });
        }
    },

    // User preferences caching
    setUserPreference: (key, value) => {
        const cacheEntry = {
            data: value,
            timestamp: Date.now(),
            duration: CACHE_CONFIG.USER_PREFERENCES
        };
        localStorage.setItem(`pref_${key}`, JSON.stringify(cacheEntry));
    },

    getUserPreference: (key, defaultValue = null) => {
        const cacheKey = `pref_${key}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const cacheEntry = JSON.parse(cached);
                if (Date.now() - cacheEntry.timestamp < cacheEntry.duration) {
                    return cacheEntry.data;
                } else {
                    // Remove expired cache
                    localStorage.removeItem(cacheKey);
                }
            } catch (error) {
                console.error('Error parsing user preference cache:', error);
                localStorage.removeItem(cacheKey);
            }
        }
        return defaultValue;
    },

    // Cache statistics
    getCacheStats: () => {
        return {
            apiCacheSize: apiCache.size,
            localStorageKeys: Object.keys(localStorage).length,
            memoryUsage: JSON.stringify(localStorage).length
        };
    },

    // Clear all caches (useful for logout)
    clearAllCaches: () => {
        apiCache.clear();

        // Clear form and preference caches, but keep essential user preferences
        const keepKeys = ['darkMode', 'selectedCurrency', 'selectedTimezone'];
        Object.keys(localStorage).forEach(key => {
            if (!keepKeys.includes(key) && (key.startsWith('form_') || key.startsWith('pref_'))) {
                localStorage.removeItem(key);
            }
        });
    },

    // Development helper to force clear all caches
    forceClearAllCaches: () => {
        if (isDevelopment) {
            console.log('Development mode: Force clearing all caches');
            apiCache.clear();

            // Clear all localStorage except essential preferences
            const keepKeys = ['darkMode', 'selectedCurrency', 'selectedTimezone'];
            Object.keys(localStorage).forEach(key => {
                if (!keepKeys.includes(key)) {
                    localStorage.removeItem(key);
                }
            });

            // Clear service worker caches
            if ('caches' in window) {
                caches.keys().then(cacheNames => {
                    cacheNames.forEach(cacheName => {
                        caches.delete(cacheName);
                    });
                });
            }
        }
    }
};

// Cache key generators
export const cacheKeys = {
    expenses: (userId, filters = {}) => {
        const filterStr = Object.keys(filters)
            .sort()
            .map(key => `${key}:${filters[key]}`)
            .join('|');
        return `expenses_${userId}_${filterStr}`;
    },

    budgets: (userId) => `budgets_${userId}`,

    statistics: (userId, type) => `stats_${userId}_${type}`,

    userProfile: (userId) => `user_${userId}`,

    categories: (userId) => `categories_${userId}`
};

export default cacheUtils;
