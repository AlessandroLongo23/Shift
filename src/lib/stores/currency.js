import { writable } from 'svelte/store';
import { Currency } from '$lib/const/currency';

export const currencies = {
    [Currency.EURO]: { symbol: '€', name: 'Euro' },
    [Currency.DOLLAR]: { symbol: '$', name: 'US Dollar' },
    [Currency.POUND]: { symbol: '£', name: 'British Pound' },
    [Currency.DKK]: { symbol: 'kr', name: 'Danish Krone' },
};

export const currencyList = Object.entries(currencies).map(([code, data]) => ({
    code,
    ...data
}));

export const baseCurrency = writable(Currency.EURO);

export const getCurrencySymbol = (code) => {
    return currencies[code]?.symbol || code;
};
