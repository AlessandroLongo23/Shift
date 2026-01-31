import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'shift_settings';

const defaultSettings = {
    // Calendar settings
    weekStartsOnMonday: true, // true = Monday, false = Sunday
    
    // Payslip period settings
    // If useCustomPeriod is true, the period goes from periodStartDay of previous month 
    // to periodEndDay of current month
    useCustomPeriod: false,
    periodStartDay: 16, // Day of previous month when period starts
    periodEndDay: 15,   // Day of current month when period ends
    
    // Display preferences
    defaultCurrency: 'EUR'
};

function loadSettings() {
    if (!browser) return defaultSettings;
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Error loading settings:', e);
    }
    return defaultSettings;
}

function saveSettings(settings) {
    if (!browser) return;
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving settings:', e);
    }
}

function createSettingsStore() {
    const { subscribe, set, update } = writable(defaultSettings);
    
    // Load from localStorage on init (client-side only)
    if (browser) {
        set(loadSettings());
    }

    return {
        subscribe,
        
        /**
         * Update a single setting
         */
        setSetting(key, value) {
            update(settings => {
                const newSettings = { ...settings, [key]: value };
                saveSettings(newSettings);
                return newSettings;
            });
        },
        
        /**
         * Update multiple settings at once
         */
        updateSettings(newSettings) {
            update(settings => {
                const updated = { ...settings, ...newSettings };
                saveSettings(updated);
                return updated;
            });
        },
        
        /**
         * Reset to default settings
         */
        reset() {
            set(defaultSettings);
            saveSettings(defaultSettings);
        },
        
        /**
         * Get current settings synchronously
         */
        get() {
            return get({ subscribe });
        },

        /**
         * Calculate the date range for a given month based on settings
         * @param {number} year - The year
         * @param {number} month - The month (0-indexed)
         * @returns {{ startDate: Date, endDate: Date }}
         */
        getPayPeriod(year, month) {
            const settings = get({ subscribe });
            
            if (!settings.useCustomPeriod) {
                // Standard: 1st to last day of month
                const startDate = new Date(year, month, 1);
                const endDate = new Date(year, month + 1, 0); // Last day of month
                return { startDate, endDate };
            }
            
            // Custom period: e.g., 16th of prev month to 15th of current month
            const startDate = new Date(year, month - 1, settings.periodStartDay);
            const endDate = new Date(year, month, settings.periodEndDay);
            return { startDate, endDate };
        },

        /**
         * Check if a date falls within the pay period for a given month
         * @param {Date} date - The date to check
         * @param {number} year - The reference year
         * @param {number} month - The reference month (0-indexed)
         * @returns {boolean}
         */
        isInPayPeriod(date, year, month) {
            const { startDate, endDate } = this.getPayPeriod(year, month);
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            return checkDate >= startDate && checkDate <= endDate;
        },

        /**
         * Get weekday names in the correct order based on settings
         * @returns {string[]}
         */
        getWeekdays(short = true) {
            const settings = get({ subscribe });
            const weekdays = short 
                ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            if (settings.weekStartsOnMonday) {
                // Move Sunday to the end
                return [...weekdays.slice(1), weekdays[0]];
            }
            return weekdays;
        }
    };
}

export const settingsStore = createSettingsStore();
