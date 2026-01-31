import { writable, get } from 'svelte/store';
import { Currency } from '$lib/const/currency';

export const exchangeRates = writable({});
export const exchangeRatesLoading = writable(false);
export const exchangeRatesError = writable(null);

/**
 * Fetch exchange rates from frankfurter.app API
 * The API uses EUR as the base currency
 */
export const fetchExchangeRates = async () => {
    // Don't fetch if we already have rates
    const currentRates = get(exchangeRates);
    if (Object.keys(currentRates).length > 0) {
        return currentRates;
    }

    exchangeRatesLoading.set(true);
    exchangeRatesError.set(null);
    
    try {
        const response = await fetch('https://api.frankfurter.app/latest');
        const data = await response.json();
        
        if (data.rates) {
            exchangeRates.set(data.rates);
            return data.rates;
        } else {
            throw new Error('Failed to fetch exchange rates');
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        exchangeRatesError.set(error.message);
        return {};
    } finally {
        exchangeRatesLoading.set(false);
    }
};

/**
 * Convert an amount from one currency to another
 * @param {number} amount - The amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {object} rates - Exchange rates object (EUR-based)
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, rates) => {
    if (fromCurrency === toCurrency) return amount;
    if (!rates || Object.keys(rates).length === 0) return amount;
    
    // API uses EUR as base currency
    // To convert: first convert to EUR, then to target
    
    let amountInEUR;
    
    if (fromCurrency === Currency.EURO) {
        amountInEUR = amount;
    } else {
        const rateFromEUR = rates[fromCurrency];
        if (!rateFromEUR) {
            console.warn(`Exchange rate not available for ${fromCurrency}`);
            return amount;
        }
        amountInEUR = amount / rateFromEUR;
    }
    
    if (toCurrency === Currency.EURO) {
        return amountInEUR;
    }
    
    const rateToTarget = rates[toCurrency];
    if (!rateToTarget) {
        console.warn(`Exchange rate not available for ${toCurrency}`);
        return amount;
    }
    
    return amountInEUR * rateToTarget;
};
