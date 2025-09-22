import React, { createContext, useContext, useState, useCallback } from 'react';

// Spinner component
export const Spinner = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    return (
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 ${sizeClasses[size]} ${className}`}></div>
    );
};

// Loading overlay component
export const LoadingOverlay = ({ isLoading, children, message = 'Loading...' }) => {
    if (!isLoading) return children;

    return (
        <div className="relative">
            {children}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center space-y-3">
                    <Spinner size="lg" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
                </div>
            </div>
        </div>
    );
};

// Loading button component
export const LoadingButton = ({ 
    isLoading, 
    loadingText = 'Loading...', 
    children, 
    className = '', 
    disabled = false,
    ...props 
}) => {
    return (
        <button
            className={`relative ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Spinner size="sm" className="text-white" />
                </div>
            )}
            <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                {isLoading ? loadingText : children}
            </span>
        </button>
    );
};

// Loading card component
export const LoadingCard = ({ message = 'Loading...' }) => {
    return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Spinner size="lg" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
        </div>
    );
};

// Loading skeleton components
export const SkeletonText = ({ lines = 1, className = '' }) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
                <div
                    key={index}
                    className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                ></div>
            ))}
        </div>
    );
};

export const SkeletonCard = ({ className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 ${className}`}>
            <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                <SkeletonText lines={3} />
                <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
                </div>
            </div>
        </div>
    );
};

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden ${className}`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, index) => (
                        <div key={index} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div key={colIndex} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Loading states hook
export const useLoadingState = (initialState = false) => {
    const [isLoading, setIsLoading] = React.useState(initialState);
    const [loadingMessage, setLoadingMessage] = React.useState('Loading...');

    const startLoading = React.useCallback((message = 'Loading...') => {
        setLoadingMessage(message);
        setIsLoading(true);
    }, []);

    const stopLoading = React.useCallback(() => {
        setIsLoading(false);
        setLoadingMessage('Loading...');
    }, []);

    const withLoading = React.useCallback(async (asyncFunction, message = 'Loading...') => {
        try {
            startLoading(message);
            const result = await asyncFunction();
            return result;
        } finally {
            stopLoading();
        }
    }, [startLoading, stopLoading]);

    return {
        isLoading,
        loadingMessage,
        startLoading,
        stopLoading,
        withLoading
    };
};

// Loading context for global loading states
const LoadingContext = createContext();

export const useGlobalLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useGlobalLoading must be used within a LoadingProvider');
    }
    return context;
};

export const LoadingProvider = ({ children }) => {
    const [globalLoading, setGlobalLoading] = useState(false);
    const [globalLoadingMessage, setGlobalLoadingMessage] = useState('Loading...');

    const startGlobalLoading = useCallback((message = 'Loading...') => {
        setGlobalLoadingMessage(message);
        setGlobalLoading(true);
    }, []);

    const stopGlobalLoading = useCallback(() => {
        setGlobalLoading(false);
        setGlobalLoadingMessage('Loading...');
    }, []);

    const value = {
        globalLoading,
        globalLoadingMessage,
        startGlobalLoading,
        stopGlobalLoading
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
            {globalLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                        <div className="flex flex-col items-center space-y-4">
                            <Spinner size="xl" />
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {globalLoadingMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export default LoadingProvider;
