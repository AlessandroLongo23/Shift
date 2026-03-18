import { browser } from '$app/environment';
import { Currency } from '$lib/const/currency';

const STORAGE_KEY = 'shift_settings';

const defaults = {
    weekStartsOnMonday: true,
    useCustomPeriod: false,
    periodStartDay: 16,
    periodEndDay: 15,
    defaultCurrency: Currency.EURO
};

function loadSettings() {
    if (!browser) return defaults;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return { ...defaults, ...JSON.parse(stored) };
    } catch (e) {
        console.error('Error loading settings:', e);
    }
    return defaults;
}

function createSettingsStore() {
    const initial = loadSettings();

    let weekStartsOnMonday = $state(initial.weekStartsOnMonday);
    let useCustomPeriod = $state(initial.useCustomPeriod);
    let periodStartDay = $state(initial.periodStartDay);
    let periodEndDay = $state(initial.periodEndDay);
    let defaultCurrency = $state(initial.defaultCurrency);

    function persist() {
        if (!browser) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                weekStartsOnMonday,
                useCustomPeriod,
                periodStartDay,
                periodEndDay,
                defaultCurrency
            }));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    }

    return {
        get weekStartsOnMonday() { return weekStartsOnMonday; },
        get useCustomPeriod() { return useCustomPeriod; },
        get periodStartDay() { return periodStartDay; },
        get periodEndDay() { return periodEndDay; },
        get defaultCurrency() { return defaultCurrency; },

        setSetting(key, value) {
            if (key === 'weekStartsOnMonday') weekStartsOnMonday = value;
            else if (key === 'useCustomPeriod') useCustomPeriod = value;
            else if (key === 'periodStartDay') periodStartDay = value;
            else if (key === 'periodEndDay') periodEndDay = value;
            else if (key === 'defaultCurrency') defaultCurrency = value;
            persist();
        },

        updateSettings(newSettings) {
            if ('weekStartsOnMonday' in newSettings) weekStartsOnMonday = newSettings.weekStartsOnMonday;
            if ('useCustomPeriod' in newSettings) useCustomPeriod = newSettings.useCustomPeriod;
            if ('periodStartDay' in newSettings) periodStartDay = newSettings.periodStartDay;
            if ('periodEndDay' in newSettings) periodEndDay = newSettings.periodEndDay;
            if ('defaultCurrency' in newSettings) defaultCurrency = newSettings.defaultCurrency;
            persist();
        },

        reset() {
            weekStartsOnMonday = defaults.weekStartsOnMonday;
            useCustomPeriod = defaults.useCustomPeriod;
            periodStartDay = defaults.periodStartDay;
            periodEndDay = defaults.periodEndDay;
            defaultCurrency = defaults.defaultCurrency;
            persist();
        },

        getPayPeriod(year, month) {
            if (!useCustomPeriod) {
                return {
                    startDate: new Date(year, month, 1),
                    endDate: new Date(year, month + 1, 0)
                };
            }
            return {
                startDate: new Date(year, month - 1, periodStartDay),
                endDate: new Date(year, month, periodEndDay)
            };
        },

        isInPayPeriod(date, year, month) {
            const { startDate, endDate } = this.getPayPeriod(year, month);
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            return checkDate >= startDate && checkDate <= endDate;
        },

        getWeekdays(short = true) {
            const days = short
                ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return weekStartsOnMonday ? [...days.slice(1), days[0]] : days;
        }
    };
}

export const settingsStore = createSettingsStore();
