import { writable } from 'svelte/store';

export const currencies = {
    'EUR': { symbol: '€', name: 'Euro' },
    'USD': { symbol: '$', name: 'US Dollar' },
    'GBP': { symbol: '£', name: 'British Pound' },
    'DKK': { symbol: 'kr', name: 'Danish Krone' },
    'NOK': { symbol: 'kr', name: 'Norwegian Krone' },
    'SEK': { symbol: 'kr', name: 'Swedish Krona' },
    'CHF': { symbol: 'CHF', name: 'Swiss Franc' },
};

export const currencyList = Object.entries(currencies).map(([code, data]) => ({
    code,
    ...data
}));

export const baseCurrency = writable('EUR');

export const getCurrencySymbol = (code) => {
    return currencies[code]?.symbol || code;
};
