import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
    const [selectedCurrency, setSelectedCurrency] = useState(() => {
        const savedCurrency = localStorage.getItem('selectedCurrency');
        return savedCurrency || 'USD';
    });

    const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
        { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
        { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
        { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
        { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
        { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
        { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
        { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
        { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
        { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
        { code: 'THB', symbol: '฿', name: 'Thai Baht' },
        { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
        { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
        { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' }
    ];

    useEffect(() => {
        localStorage.setItem('selectedCurrency', selectedCurrency);
    }, [selectedCurrency]);

    const updateCurrency = (currencyCode) => {
        setSelectedCurrency(currencyCode);
    };

    const getCurrentCurrency = () => {
        return currencies.find(currency => currency.code === selectedCurrency) || currencies[0];
    };

    return (
        <CurrencyContext.Provider value={{
            selectedCurrency,
            currencies,
            updateCurrency,
            getCurrentCurrency
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};
